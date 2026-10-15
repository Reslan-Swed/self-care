package com.micropms.clinic.controller

import com.micropms.clinic.dto.PatientSummaryDto
import com.micropms.clinic.dto.QueueItemDto
import com.micropms.clinic.dto.QuickBookAppointmentCommand
import com.micropms.clinic.dto.UpdateQueueStatusCommand
import com.micropms.clinic.service.ReceptionService
import com.micropms.common.dto.ApiResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/reception")
class ReceptionDeskController(
    private val receptionService: ReceptionService
) {

    /**
     * Quick-book appointment with atomic patient registration.
     * Accessible to reception staff and clinic administrators.
     */
    @PostMapping("/appointments/quick-book")
    @PreAuthorize("hasAuthority('appointment:create')")
    fun quickBook(
        @Valid @RequestBody command: QuickBookAppointmentCommand
    ): ResponseEntity<ApiResponse<QueueItemDto>> {
        val result = receptionService.quickBookAppointment(command)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(code = 201, message = "Appointment booked and added to queue", data = result))
    }

    /**
     * Updates an appointment's waiting room status (e.g. WAITING -> IN_CONSULTATION -> COMPLETED).
     */
    @PatchMapping("/queue/{appointmentId}/status")
    @PreAuthorize("hasAuthority('queue:status:update')")
    fun updateQueueStatus(
        @PathVariable appointmentId: UUID,
        @Valid @RequestBody command: UpdateQueueStatusCommand
    ): ResponseEntity<ApiResponse<QueueItemDto>> {
        val result = receptionService.updateQueueStatus(appointmentId, command.status)
        return ResponseEntity.ok(ApiResponse(code = 200, message = "Queue status updated successfully", data = result))
    }

    /**
     * Retrieves today's active waiting room queue for reception and consultation boards.
     */
    @GetMapping("/queue")
    @PreAuthorize("hasAuthority('appointment:read')")
    fun getTodayQueue(): ResponseEntity<ApiResponse<List<QueueItemDto>>> {
        val queue = receptionService.getTodayQueue()
        return ResponseEntity.ok(ApiResponse(code = 200, message = "Today's queue retrieved", data = queue))
    }

    /**
     * Searches patients by name or phone for reception quick lookup.
     */
    @GetMapping("/patients/search")
    @PreAuthorize("hasAuthority('patient:basic:read')")
    fun searchPatients(
        @RequestParam query: String
    ): ResponseEntity<ApiResponse<List<PatientSummaryDto>>> {
        val patients = receptionService.searchPatients(query)
        return ResponseEntity.ok(ApiResponse(code = 200, message = "Patients found", data = patients))
    }
}
