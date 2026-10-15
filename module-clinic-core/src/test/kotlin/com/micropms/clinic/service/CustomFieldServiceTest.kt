package com.micropms.clinic.service

import com.micropms.clinic.dto.CreateCustomFieldDefinitionRequest
import com.micropms.clinic.dto.DynamicFieldInputDto
import com.micropms.clinic.dto.FieldOptionDto
import com.micropms.clinic.entity.ClinicalSpecialty
import com.micropms.clinic.entity.CustomFieldDefinition
import com.micropms.clinic.entity.CustomFieldOption
import com.micropms.clinic.entity.EncounterFieldValue
import com.micropms.clinic.entity.FieldDataType
import com.micropms.clinic.entity.TargetEntity
import com.micropms.clinic.repository.CustomFieldDefinitionRepository
import com.micropms.clinic.repository.EncounterFieldValueRepository
import com.micropms.clinic.repository.EncounterRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

class CustomFieldServiceTest {

    private val definitionRepository: CustomFieldDefinitionRepository = mockk()
    private val valueRepository: EncounterFieldValueRepository = mockk()
    private val encounterRepository: EncounterRepository = mockk()

    private lateinit var service: CustomFieldService

    @BeforeEach
    fun setUp() {
        service = CustomFieldService(definitionRepository, valueRepository, encounterRepository)
    }

    @Test
    fun `createCustomField creates definition with options and saves properly`() {
        val request = CreateCustomFieldDefinitionRequest(
            fieldKey = "tooth_number",
            label = "Tooth Number (FDI)",
            dataType = FieldDataType.SELECT,
            targetEntity = TargetEntity.ENCOUNTER,
            specialty = ClinicalSpecialty.DENTISTRY,
            isRequired = true,
            displayOrder = 1,
            options = listOf(
                FieldOptionDto(label = "Tooth #11", value = "11"),
                FieldOptionDto(label = "Tooth #21", value = "21")
            )
        )

        every { definitionRepository.existsByFieldKey("tooth_number") } returns false

        val defSlot = slot<CustomFieldDefinition>()
        every { definitionRepository.save(capture(defSlot)) } answers {
            val entity = defSlot.captured
            entity.id = UUID.randomUUID()
            entity
        }

        val result = service.createCustomField(request)

        assertEquals("tooth_number", result.fieldKey)
        assertEquals("Tooth Number (FDI)", result.label)
        assertEquals(FieldDataType.SELECT, result.dataType)
        assertEquals(2, result.options.size)
        verify(exactly = 1) { definitionRepository.save(any()) }
    }

    @Test
    fun `saveValuesForEncounter stores strictly typed numeric and date columns`() {
        val encounterId = UUID.randomUUID()
        every { encounterRepository.existsById(encounterId) } returns true

        val numericDef = CustomFieldDefinition(
            fieldKey = "botox_units",
            fieldLabel = "Botox Units Administered",
            dataType = FieldDataType.NUMBER,
            targetEntity = TargetEntity.ENCOUNTER,
            specialty = ClinicalSpecialty.DERMATOLOGY,
            isRequired = true
        )
        numericDef.id = UUID.randomUUID()

        val dateDef = CustomFieldDefinition(
            fieldKey = "next_biopsy_date",
            fieldLabel = "Next Biopsy Follow-up",
            dataType = FieldDataType.DATE,
            targetEntity = TargetEntity.ENCOUNTER,
            specialty = ClinicalSpecialty.DERMATOLOGY,
            isRequired = false
        )
        dateDef.id = UUID.randomUUID()

        every { definitionRepository.findByTargetEntityOrderByDisplayOrderAsc(TargetEntity.ENCOUNTER) } returns listOf(numericDef, dateDef)
        every { valueRepository.findByEncounterIdAndFieldDefinition(encounterId, any()) } returns null

        val savedValues = mutableListOf<EncounterFieldValue>()
        every { valueRepository.save(capture(savedValues)) } answers { savedValues.last() }

        val inputs = listOf(
            DynamicFieldInputDto(fieldKey = "botox_units", rawValue = "24.5"),
            DynamicFieldInputDto(fieldKey = "next_biopsy_date", rawValue = "2026-11-15")
        )

        service.saveValuesForEncounter(encounterId, inputs)

        assertEquals(2, savedValues.size)

        val numericVal = savedValues.first { it.fieldDefinition.fieldKey == "botox_units" }
        assertEquals(BigDecimal("24.5"), numericVal.valueNumeric)
        assertNull(numericVal.valueText)
        assertNull(numericVal.valueDate)
        assertNull(numericVal.valueBoolean)

        val dateVal = savedValues.first { it.fieldDefinition.fieldKey == "next_biopsy_date" }
        assertEquals(LocalDate.of(2026, 11, 15), dateVal.valueDate)
        assertNull(dateVal.valueNumeric)
        assertNull(dateVal.valueText)
    }

    @Test
    fun `saveValuesForEncounter throws IllegalArgumentException when required field is missing`() {
        val encounterId = UUID.randomUUID()
        every { encounterRepository.existsById(encounterId) } returns true

        val requiredDef = CustomFieldDefinition(
            fieldKey = "gestational_age_weeks",
            fieldLabel = "Gestational Age (Weeks)",
            dataType = FieldDataType.NUMBER,
            targetEntity = TargetEntity.ENCOUNTER,
            specialty = ClinicalSpecialty.GENERAL_PRACTICE,
            isRequired = true
        )
        requiredDef.id = UUID.randomUUID()

        every { definitionRepository.findByTargetEntityOrderByDisplayOrderAsc(TargetEntity.ENCOUNTER) } returns listOf(requiredDef)

        assertThrows(IllegalArgumentException::class.java) {
            service.saveValuesForEncounter(encounterId, emptyList())
        }
    }
}
