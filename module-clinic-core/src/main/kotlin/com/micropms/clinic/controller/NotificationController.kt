package com.micropms.clinic.controller

import com.micropms.clinic.dto.NotificationResultDto
import com.micropms.clinic.service.NotificationService
import com.micropms.common.dto.ApiResponse
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Controller managing automated patient WhatsApp notifications and one-click browser messaging links.
 */
@RestController
@RequestMapping("/api/notifications")
class NotificationController(
    private val notificationService: NotificationService
) {

    /**
     * Generates a zero-cost browser Click-to-Chat URL (https://wa.me/...)
     * enabling receptionists to dispatch reminders directly from the browser without third-party API fees.
     */
    @PostMapping("/appointments/{id}/whatsapp-link")
    @PreAuthorize("hasAnyAuthority('notification:dispatch', 'appointment:create', 'appointment:read')")
    fun getWhatsAppLink(
        @PathVariable id: UUID
    ): ResponseEntity<ApiResponse<Map<String, String>>> {
        val linkDetails = notificationService.getWhatsAppClickToChatLink(id)
        return ResponseEntity.ok(
            ApiResponse(
                code = 200,
                message = "WhatsApp Click-to-Chat URL generated successfully",
                data = linkDetails
            )
        )
    }

    /**
     * Triggers automated WhatsApp notification dispatch if subscription credits allow.
     */
    @PostMapping("/appointments/{id}/dispatch")
    @PreAuthorize("hasAuthority('notification:dispatch')")
    fun dispatchAutomatedNotification(
        @PathVariable id: UUID
    ): ResponseEntity<ApiResponse<NotificationResultDto>> {
        val result = notificationService.sendAppointmentConfirmation(id, forceLinkOnly = false)
        return ResponseEntity.ok(
            ApiResponse(
                code = 200,
                message = if (result.mode == "AUTOMATED_DISPATCH") {
                    "Automated WhatsApp message dispatched successfully"
                } else {
                    "Subscription credits exhausted: fallback Click-to-Chat URL provided"
                },
                data = result
            )
        )
    }
}
