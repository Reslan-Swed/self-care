package com.micropms.clinic.dto

import com.micropms.clinic.entity.ClinicalSpecialty
import com.micropms.clinic.entity.FieldDataType
import com.micropms.clinic.entity.TargetEntity
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.util.UUID

data class DynamicFieldInputDto(
    @field:NotBlank(message = "Field key is required")
    val fieldKey: String,
    val rawValue: String? = null
)

data class FieldOptionDto(
    val label: String,
    val value: String
)

data class DynamicFieldDefinitionDto(
    val id: UUID? = null,
    val fieldKey: String,
    val label: String,
    val dataType: FieldDataType,
    val targetEntity: TargetEntity = TargetEntity.ENCOUNTER,
    val isRequired: Boolean = false,
    val displayOrder: Int = 0,
    val options: List<FieldOptionDto> = emptyList()
)

data class DynamicFieldValueDto(
    val fieldKey: String,
    val label: String,
    val dataType: FieldDataType,
    val resolvedValue: Any?
)

data class CreateCustomFieldDefinitionRequest(
    @field:NotBlank(message = "Field key is required")
    val fieldKey: String,

    @field:NotBlank(message = "Field label is required")
    val label: String,

    @field:NotNull(message = "Data type is required")
    val dataType: FieldDataType,

    val targetEntity: TargetEntity = TargetEntity.ENCOUNTER,
    val specialty: ClinicalSpecialty = ClinicalSpecialty.GENERAL_PRACTICE,
    val isRequired: Boolean = false,
    val displayOrder: Int = 0,
    val options: List<FieldOptionDto> = emptyList()
)

data class BatchSaveEncounterFieldsRequest(
    val fields: List<DynamicFieldInputDto> = emptyList()
)
