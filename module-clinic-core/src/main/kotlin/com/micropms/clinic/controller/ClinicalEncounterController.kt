package com.micropms.clinic.controller

import com.micropms.clinic.dto.ClinicalEncounterDetailsDto
import com.micropms.clinic.dto.ClinicalPatientProfileDto
import com.micropms.clinic.dto.CreateEncounterCommand
import com.micropms.clinic.service.ClinicalEncounterService
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
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Confidential clinical encounter controller strictly isolated from receptionists.
 * Requires encounter:clinical:read or encounter:clinical:write authority.
 * Receptionists attempting access receive 403 Forbidden.
 */
@RestController
@RequestMapping("/api/encounters")
class ClinicalEncounterController(
    private val clinicalEncounterService: ClinicalEncounterService
) {

    /**
     * Creates a new clinical encounter, SOAP notes, diagnosis, prescriptions, and EAV custom fields.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('encounter:clinical:write')")
    fun createEncounter(
        @Valid @RequestBody command: CreateEncounterCommand
    ): ResponseEntity<ApiResponse<ClinicalEncounterDetailsDto>> {
        val result = clinicalEncounterService.createEncounter(command)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(code = 201, message = "Clinical encounter created successfully", data = result))
    }

    /**
     * Retrieves confidential clinical notes, SOAP details, and specialty EAV values.
     */
    @GetMapping("/{id}/clinical-notes")
    @PreAuthorize("hasAuthority('encounter:clinical:read')")
    fun getClinicalNotes(
        @PathVariable id: UUID
    ): ResponseEntity<ApiResponse<ClinicalEncounterDetailsDto>> {
        val notes = clinicalEncounterService.getEncounterNotes(id)
        return ResponseEntity.ok(ApiResponse(code = 200, message = "Clinical notes retrieved", data = notes))
    }

    /**
     * Retrieves chronological encounter timeline for a patient.
     */
    @GetMapping("/patient/{patientId}/timeline")
    @PreAuthorize("hasAuthority('encounter:clinical:read')")
    fun getPatientTimeline(
        @PathVariable patientId: UUID
    ): ResponseEntity<ApiResponse<List<ClinicalEncounterDetailsDto>>> {
        val timeline = clinicalEncounterService.getPatientTimeline(patientId)
        return ResponseEntity.ok(ApiResponse(code = 200, message = "Clinical timeline retrieved", data = timeline))
    }

    /**
     * Retrieves full clinical profile for a patient (blood group, medical alerts, allergies).
     */
    @GetMapping("/patient/{patientId}/profile")
    @PreAuthorize("hasAuthority('encounter:clinical:read')")
    fun getPatientClinicalProfile(
        @PathVariable patientId: UUID
    ): ResponseEntity<ApiResponse<ClinicalPatientProfileDto>> {
        val profile = clinicalEncounterService.getPatientClinicalProfile(patientId)
        return ResponseEntity.ok(ApiResponse(code = 200, message = "Clinical profile retrieved", data = profile))
    }
}
