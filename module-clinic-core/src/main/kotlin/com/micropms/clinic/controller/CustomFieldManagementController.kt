package com.micropms.clinic.controller

import com.micropms.clinic.dto.BatchSaveEncounterFieldsRequest
import com.micropms.clinic.dto.CreateCustomFieldDefinitionRequest
import com.micropms.clinic.dto.DynamicFieldDefinitionDto
import com.micropms.clinic.dto.DynamicFieldValueDto
import com.micropms.clinic.entity.TargetEntity
import com.micropms.clinic.service.CustomFieldService
import com.micropms.common.dto.ApiResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/clinic")
class CustomFieldManagementController(
    private val customFieldService: CustomFieldService
) {

    /**
     * Define a new specialty custom field for the clinic.
     * Replaces unstructured JSONB columns with typed relational definitions.
     */
    @PostMapping("/custom-fields")
    @PreAuthorize("hasAuthority('clinic:eav_fields:manage')")
    fun createCustomField(
        @Valid @RequestBody request: CreateCustomFieldDefinitionRequest
    ): ResponseEntity<ApiResponse<DynamicFieldDefinitionDto>> {
        val created = customFieldService.createCustomField(request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(code = 201, message = "Custom field definition created", data = created))
    }

    /**
     * Fetch dynamic schema for reception/clinical forms to build UI fields dynamically.
     */
    @GetMapping("/custom-fields/schema")
    @PreAuthorize("hasAnyAuthority('encounter:clinical:read', 'patient:basic:read')")
    fun getClinicFieldSchema(
        @RequestParam(defaultValue = "ENCOUNTER") targetEntity: TargetEntity
    ): ResponseEntity<ApiResponse<List<DynamicFieldDefinitionDto>>> {
        val schema = customFieldService.getClinicFieldSchema(targetEntity)
        return ResponseEntity.ok(ApiResponse(code = 200, message = "Dynamic field schema retrieved", data = schema))
    }

    /**
     * Save dynamic specialty values for a specific clinical encounter into type-safe relational columns.
     */
    @PostMapping("/encounters/{encounterId}/custom-values")
    @PreAuthorize("hasAuthority('encounter:clinical:write')")
    fun saveEncounterCustomValues(
        @PathVariable encounterId: UUID,
        @Valid @RequestBody request: BatchSaveEncounterFieldsRequest
    ): ResponseEntity<ApiResponse<Map<String, String>>> {
        customFieldService.saveValuesForEncounter(encounterId, request.fields)
        return ResponseEntity.ok(
            ApiResponse(code = 200, message = "Custom encounter field values saved successfully", data = mapOf("encounterId" to encounterId.toString()))
        )
    }

    /**
     * Fetch rendered clinical values for encounter history display.
     */
    @GetMapping("/encounters/{encounterId}/custom-values")
    @PreAuthorize("hasAuthority('encounter:clinical:read')")
    fun getEncounterCustomValues(
        @PathVariable encounterId: UUID
    ): ResponseEntity<ApiResponse<List<DynamicFieldValueDto>>> {
        val values = customFieldService.getRenderableFieldsForEncounter(encounterId)
        return ResponseEntity.ok(
            ApiResponse(code = 200, message = "Renderable encounter field values retrieved", data = values)
        )
    }
}
