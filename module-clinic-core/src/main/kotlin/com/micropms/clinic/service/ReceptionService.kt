package com.micropms.clinic.service

import com.micropms.clinic.dto.PatientSummaryDto
import com.micropms.clinic.dto.QueueItemDto
import com.micropms.clinic.dto.QuickBookAppointmentCommand
import com.micropms.clinic.entity.Appointment
import com.micropms.clinic.entity.AppointmentStatus
import com.micropms.clinic.entity.Patient
import com.micropms.clinic.repository.AppointmentRepository
import com.micropms.clinic.repository.PatientRepository
import com.micropms.common.exception.ResourceNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
@Transactional(readOnly = true)
class ReceptionService(
    private val patientRepository: PatientRepository,
    private val appointmentRepository: AppointmentRepository
) {

    /**
     * Atomically creates or fetches a patient by phone, then schedules an appointment.
     */
    @Transactional
    fun quickBookAppointment(command: QuickBookAppointmentCommand): QueueItemDto {
        val normalizedPhone = command.phone.trim()

        val patient = patientRepository.findByPhone(normalizedPhone).orElseGet {
            val newPatient = Patient(
                fullName = command.patientName.trim(),
                phone = normalizedPhone
            )
            patientRepository.save(newPatient)
        }

        val appointment = Appointment(
            patient = patient,
            doctorId = command.doctorId,
            scheduledAt = command.scheduledAt,
            durationMinutes = command.durationMinutes,
            status = AppointmentStatus.WAITING,
            reasonForVisit = command.reasonForVisit?.trim()
        )

        val savedAppointment = appointmentRepository.save(appointment)

        return toQueueItemDto(savedAppointment, patient)
    }

    /**
     * Updates an appointment's status in the queue with optimistic locking validation.
     */
    @Transactional
    fun updateQueueStatus(appointmentId: UUID, newStatus: AppointmentStatus): QueueItemDto {
        val appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow { ResourceNotFoundException("Appointment not found with ID: $appointmentId") }

        // Transition validation: Completed appointments cannot be reverted back to scheduled
        if (appointment.status == AppointmentStatus.COMPLETED && newStatus == AppointmentStatus.WAITING) {
            throw IllegalStateException("Cannot revert COMPLETED consultation back to WAITING status.")
        }

        appointment.status = newStatus
        val updated = appointmentRepository.save(appointment)

        return toQueueItemDto(updated, updated.patient)
    }

    /**
     * Retrieves today's active waiting room queue (status in WAITING or IN_CONSULTATION).
     */
    fun getTodayQueue(): List<QueueItemDto> {
        val now = Instant.now()
        val startOfDay = now.truncatedTo(ChronoUnit.DAYS)
        val endOfDay = startOfDay.plus(1, ChronoUnit.DAYS)

        val activeStatuses = listOf(AppointmentStatus.WAITING, AppointmentStatus.IN_CONSULTATION)
        val appointments = appointmentRepository.findWaitingRoomQueue(activeStatuses, startOfDay, endOfDay)

        return appointments.map { toQueueItemDto(it, it.patient) }
    }

    /**
     * Search patients by name or phone for reception registration desk.
     */
    fun searchPatients(query: String): List<PatientSummaryDto> {
        if (query.isBlank()) {
            return emptyList()
        }
        return patientRepository.searchByNameOrPhone(query.trim()).map { p ->
            PatientSummaryDto(
                id = p.id,
                fullName = p.fullName,
                phone = p.phone,
                fileNumber = p.fileNumber
            )
        }
    }

    private fun toQueueItemDto(appointment: Appointment, patient: Patient): QueueItemDto {
        return QueueItemDto(
            appointmentId = appointment.id,
            patientId = patient.id,
            patientName = patient.fullName,
            phone = patient.phone,
            fileNumber = patient.fileNumber,
            doctorId = appointment.doctorId,
            scheduledAt = appointment.scheduledAt,
            durationMinutes = appointment.durationMinutes,
            status = appointment.status,
            reasonForVisit = appointment.reasonForVisit
        )
    }
}
