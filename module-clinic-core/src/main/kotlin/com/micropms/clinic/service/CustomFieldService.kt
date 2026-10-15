package com.micropms.clinic.service

import com.micropms.clinic.dto.CreateCustomFieldDefinitionRequest
import com.micropms.clinic.dto.DynamicFieldDefinitionDto
import com.micropms.clinic.dto.DynamicFieldInputDto
import com.micropms.clinic.dto.DynamicFieldValueDto
import com.micropms.clinic.dto.FieldOptionDto
import com.micropms.clinic.entity.CustomFieldDefinition
import com.micropms.clinic.entity.CustomFieldOption
import com.micropms.clinic.entity.EncounterFieldValue
import com.micropms.clinic.entity.FieldDataType
import com.micropms.clinic.entity.TargetEntity
import com.micropms.clinic.repository.CustomFieldDefinitionRepository
import com.micropms.clinic.repository.EncounterFieldValueRepository
import com.micropms.clinic.repository.EncounterRepository
import com.micropms.common.exception.ResourceNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeParseException
import java.util.UUID

@Service
@Transactional(readOnly = true)
class CustomFieldService(
    private val definitionRepository: CustomFieldDefinitionRepository,
    private val valueRepository: EncounterFieldValueRepository,
    private val encounterRepository: EncounterRepository
) {

    /**
     * Fetches all active field definitions for the current tenant ordered by displayOrder.
     */
    fun getClinicFieldSchema(targetEntity: TargetEntity = TargetEntity.ENCOUNTER): List<DynamicFieldDefinitionDto> {
        return definitionRepository.findByTargetEntityOrderByDisplayOrderAsc(targetEntity).map { def ->
            DynamicFieldDefinitionDto(
                id = def.id,
                fieldKey = def.fieldKey,
                label = def.fieldLabel,
                dataType = def.dataType,
                targetEntity = def.targetEntity,
                isRequired = def.isRequired,
                displayOrder = def.displayOrder,
                options = def.options.sortedBy { it.displayOrder }.map { opt ->
                    FieldOptionDto(label = opt.optionLabel, value = opt.optionValue)
                }
            )
        }
    }

    /**
     * Defines a new custom field for the clinic with optional predefined options.
     */
    @Transactional
    fun createCustomField(request: CreateCustomFieldDefinitionRequest): DynamicFieldDefinitionDto {
        if (definitionRepository.existsByFieldKey(request.fieldKey)) {
            throw IllegalArgumentException("A custom field with key '${request.fieldKey}' already exists for this clinic.")
        }

        val definition = CustomFieldDefinition(
            fieldKey = request.fieldKey.trim().lowercase(),
            fieldLabel = request.label.trim(),
            dataType = request.dataType,
            targetEntity = request.targetEntity,
            specialty = request.specialty,
            displayOrder = request.displayOrder,
            isRequired = request.isRequired
        )

        request.options.forEachIndexed { index, opt ->
            val optionEntity = CustomFieldOption(
                fieldDefinition = definition,
                optionLabel = opt.label.trim(),
                optionValue = opt.value.trim(),
                displayOrder = index
            )
            definition.options.add(optionEntity)
        }

        val saved = definitionRepository.save(definition)

        return DynamicFieldDefinitionDto(
            id = saved.id,
            fieldKey = saved.fieldKey,
            label = saved.fieldLabel,
            dataType = saved.dataType,
            targetEntity = saved.targetEntity,
            isRequired = saved.isRequired,
            displayOrder = saved.displayOrder,
            options = saved.options.map { FieldOptionDto(it.optionLabel, it.optionValue) }
        )
    }

    /**
     * Validates input values against definitions, parses into typed columns, and upserts values for the encounter.
     * Enforces transactional integrity and zero raw JSON / JSONB.
     */
    @Transactional
    fun saveValuesForEncounter(encounterId: UUID, inputs: List<DynamicFieldInputDto>) {
        if (!encounterRepository.existsById(encounterId)) {
            throw ResourceNotFoundException("Encounter not found with ID: $encounterId")
        }

        val inputMap = inputs.associateBy { it.fieldKey }
        val definitions = definitionRepository.findByTargetEntityOrderByDisplayOrderAsc(TargetEntity.ENCOUNTER)

        for (def in definitions) {
            val input = inputMap[def.fieldKey]
            val rawValue = input?.rawValue?.trim()

            // 1. Enforce required fields
            if (def.isRequired && (rawValue.isNullOrBlank())) {
                throw IllegalArgumentException("Required field '${def.fieldLabel}' (${def.fieldKey}) is missing or empty.")
            }

            if (rawValue.isNullOrBlank()) {
                continue
            }

            // 2. Fetch or create value record
            val existingValue = valueRepository.findByEncounterIdAndFieldDefinition(encounterId, def)
                ?: EncounterFieldValue(
                    encounterId = encounterId,
                    fieldDefinition = def
                )

            // 3. Clear all typed columns first to ensure exclusivity
            existingValue.valueText = null
            existingValue.valueNumeric = null
            existingValue.valueDate = null
            existingValue.valueBoolean = null

            // 4. Type conversions with relational typed storage
            when (def.dataType) {
                FieldDataType.TEXT -> {
                    existingValue.valueText = rawValue
                }
                FieldDataType.NUMBER -> {
                    try {
                        existingValue.valueNumeric = BigDecimal(rawValue)
                    } catch (e: NumberFormatException) {
                        throw IllegalArgumentException("Field '${def.fieldLabel}' must be a valid numeric value, received: '$rawValue'")
                    }
                }
                FieldDataType.DATE -> {
                    try {
                        existingValue.valueDate = LocalDate.parse(rawValue)
                    } catch (e: DateTimeParseException) {
                        throw IllegalArgumentException("Field '${def.fieldLabel}' must be an ISO-8601 date (YYYY-MM-DD), received: '$rawValue'")
                    }
                }
                FieldDataType.BOOLEAN -> {
                    val normalized = rawValue.lowercase()
                    if (normalized != "true" && normalized != "false" && normalized != "1" && normalized != "0") {
                        throw IllegalArgumentException("Field '${def.fieldLabel}' must be true or false, received: '$rawValue'")
                    }
                    existingValue.valueBoolean = normalized == "true" || normalized == "1"
                }
                FieldDataType.SELECT -> {
                    val validOption = def.options.any { it.optionValue.equals(rawValue, ignoreCase = true) }
                    if (!validOption) {
                        val validValues = def.options.joinToString(", ") { it.optionValue }
                        throw IllegalArgumentException("Value '$rawValue' is invalid for field '${def.fieldLabel}'. Allowed values: [$validValues]")
                    }
                    existingValue.valueText = rawValue
                }
            }

            valueRepository.save(existingValue)
        }
    }

    /**
     * Joins field definitions with saved values and returns a typed payload for clinical history.
     */
    fun getRenderableFieldsForEncounter(encounterId: UUID): List<DynamicFieldValueDto> {
        val definitions = definitionRepository.findByTargetEntityOrderByDisplayOrderAsc(TargetEntity.ENCOUNTER)
        val savedValues = valueRepository.findByEncounterId(encounterId).associateBy { it.fieldDefinition.id }

        return definitions.map { def ->
            val valueRecord = savedValues[def.id]
            val resolvedValue: Any? = when (def.dataType) {
                FieldDataType.TEXT, FieldDataType.SELECT -> valueRecord?.valueText
                FieldDataType.NUMBER -> valueRecord?.valueNumeric
                FieldDataType.DATE -> valueRecord?.valueDate?.toString()
                FieldDataType.BOOLEAN -> valueRecord?.valueBoolean
            }

            DynamicFieldValueDto(
                fieldKey = def.fieldKey,
                label = def.fieldLabel,
                dataType = def.dataType,
                resolvedValue = resolvedValue
            )
        }
    }
}
