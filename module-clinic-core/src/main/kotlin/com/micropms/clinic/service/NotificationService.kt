package com.micropms.clinic.service

import com.micropms.clinic.dto.NotificationResultDto
import com.micropms.clinic.entity.Appointment
import com.micropms.clinic.repository.AppointmentRepository
import com.micropms.common.exception.ResourceNotFoundException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.UUID

/**
 * Service orchestrating patient appointment notifications and reminder messaging.
 */
@Service
@Transactional(readOnly = true)
class NotificationService(
    private val appointmentRepository: AppointmentRepository,
    private val whatsAppDispatcher: WhatsAppDispatcher
) {

    private val log = LoggerFactory.getLogger(NotificationService::class.java)
    private val timeFormatter = DateTimeFormatter.ofPattern("EEEE, MMM d, yyyy 'at' h:mm a")
        .withZone(ZoneId.of("UTC"))

    /**
     * Dispatches or generates a WhatsApp confirmation message upon booking.
     */
    fun sendAppointmentConfirmation(appointmentId: UUID, forceLinkOnly: Boolean = false): NotificationResultDto {
        val appointment = getAppointment(appointmentId)
        val formattedTime = timeFormatter.format(appointment.scheduledAt)

        val message = "Hello ${appointment.patient.fullName}, your appointment with ${appointment.doctor.fullName} " +
                "is confirmed for $formattedTime. Please arrive 10 minutes early. Reply STOP to unsubscribe."

        return whatsAppDispatcher.dispatchOrGenerateLink(
            appointmentId = appointmentId,
            patientName = appointment.patient.fullName,
            patientPhone = appointment.patient.phone,
            message = message,
            forceLinkOnly = forceLinkOnly
        )
    }

    /**
     * Dispatches or generates a 24-hour automated reminder message.
     */
    fun send24HourReminder(appointmentId: UUID, forceLinkOnly: Boolean = false): NotificationResultDto {
        val appointment = getAppointment(appointmentId)
        val formattedTime = timeFormatter.format(appointment.scheduledAt)

        val message = "Reminder: ${appointment.patient.fullName}, you have an upcoming medical consultation with " +
                "${appointment.doctor.fullName} tomorrow ($formattedTime). Reply YES to confirm or call us to reschedule."

        return whatsAppDispatcher.dispatchOrGenerateLink(
            appointmentId = appointmentId,
            patientName = appointment.patient.fullName,
            patientPhone = appointment.patient.phone,
            message = message,
            forceLinkOnly = forceLinkOnly
        )
    }

    /**
     * Returns Click-to-Chat URL for one-click browser messaging by receptionists.
     */
    fun getWhatsAppClickToChatLink(appointmentId: UUID): Map<String, String> {
        val result = sendAppointmentConfirmation(appointmentId, forceLinkOnly = true)
        return mapOf(
            "url" to (result.whatsappUrl ?: ""),
            "phone" to result.patientPhone,
            "patientName" to result.patientName,
            "message" to result.message
        )
    }

    private fun getAppointment(appointmentId: UUID): Appointment {
        return appointmentRepository.findById(appointmentId).orElseThrow {
            ResourceNotFoundException("Appointment not found with ID: $appointmentId")
        }
    }
}
