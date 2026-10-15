package com.micropms.clinic.controller

import com.micropms.clinic.entity.Appointment
import com.micropms.clinic.entity.AppointmentStatus
import com.micropms.clinic.entity.User
import com.micropms.clinic.entity.UserRole
import com.micropms.clinic.repository.AppointmentRepository
import com.micropms.clinic.repository.PatientRepository
import com.micropms.clinic.repository.UserRepository
import com.micropms.common.controller.BaseController
import jakarta.validation.constraints.NotNull
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Duration
import java.time.Instant
import java.util.UUID

data class AppointmentForm(
    @field:NotNull(message = "Patient ID is required")
    val patientId: UUID,

    @field:NotNull(message = "Practitioner ID is required")
    val practitionerId: UUID,

    @field:NotNull(message = "Scheduled start time is required")
    val scheduledStart: Instant,

    @field:NotNull(message = "Scheduled end time is required")
    val scheduledEnd: Instant,

    val status: AppointmentStatus = AppointmentStatus.SCHEDULED,
    val reason: String? = null,
    val roomNumber: String? = null,
    val notes: String? = null
)

data class AppointmentResponseDto(
    val id: UUID,
    val patientId: UUID,
    val practitionerId: UUID,
    val scheduledStart: Instant,
    val scheduledEnd: Instant,
    val status: AppointmentStatus,
    val reason: String?,
    val roomNumber: String?,
    val notes: String?,
    val createdAt: Instant,
    val updatedAt: Instant
)

/**
 * Appointment scheduling controller managed by receptionists and visible to doctors.
 */
@RestController
@RequestMapping("/api/v1/clinic/appointments")
@PreAuthorize("hasAuthority('APPOINTMENT_READ') or hasAuthority('ROLE_RECEPTIONIST') or hasAuthority('ROLE_DOCTOR')")
class AppointmentController(
    appointmentRepository: AppointmentRepository,
    private val patientRepository: PatientRepository,
    @Autowired(required = false)
    private val userRepository: UserRepository? = null
) : BaseController<Appointment, UUID, AppointmentForm, AppointmentResponseDto>(
    repository = appointmentRepository,
    resourceName = "Appointment"
) {

    @PreAuthorize("hasAuthority('APPOINTMENT_WRITE') or hasAuthority('ROLE_RECEPTIONIST') or hasAuthority('ROLE_DOCTOR')")
    @Transactional
    override fun create(form: AppointmentForm) = super.create(form)

    @PreAuthorize("hasAuthority('APPOINTMENT_WRITE') or hasAuthority('ROLE_RECEPTIONIST') or hasAuthority('ROLE_DOCTOR')")
    @Transactional
    override fun update(id: UUID, form: AppointmentForm) = super.update(id, form)

    @PreAuthorize("hasAuthority('APPOINTMENT_ADMIN') or hasAuthority('ROLE_RECEPTIONIST')")
    @Transactional
    override fun delete(id: UUID) = super.delete(id)

    override fun toEntity(form: AppointmentForm): Appointment {
        require(form.scheduledEnd.isAfter(form.scheduledStart)) {
            "Appointment end time must be after start time"
        }
        val patient = patientRepository.findById(form.patientId)
            .orElseThrow { IllegalArgumentException("Patient not found with ID: ${form.patientId}") }

        val duration = Duration.between(form.scheduledStart, form.scheduledEnd).toMinutes().toInt().coerceAtLeast(5)

        val doctor = userRepository?.findById(form.practitionerId)?.orElseGet {
            User(
                email = "doctor-${form.practitionerId}@clinic.internal",
                passwordHash = "{noop}stub",
                fullName = "Practitioner",
                role = UserRole.DOCTOR
            ).apply { id = form.practitionerId }
        } ?: User(
            email = "doctor-${form.practitionerId}@clinic.internal",
            passwordHash = "{noop}stub",
            fullName = "Practitioner",
            role = UserRole.DOCTOR
        ).apply { id = form.practitionerId }

        val appt = Appointment(
            patient = patient,
            doctor = doctor,
            scheduledAt = form.scheduledStart,
            durationMinutes = duration,
            status = form.status,
            reasonForVisit = form.reason?.trim()
        )
        appt.roomNumber = form.roomNumber?.trim()
        appt.notes = form.notes?.trim()
        return appt
    }

    override fun toResponseDto(entity: Appointment): AppointmentResponseDto {
        return AppointmentResponseDto(
            id = entity.id ?: throw IllegalStateException("Appointment ID unassigned"),
            patientId = entity.patientId,
            practitionerId = entity.practitionerId,
            scheduledStart = entity.scheduledStart,
            scheduledEnd = entity.scheduledEnd,
            status = entity.status,
            reason = entity.reason,
            roomNumber = entity.roomNumber,
            notes = entity.notes,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    override fun updateEntityFromForm(entity: Appointment, form: AppointmentForm): Appointment {
        require(form.scheduledEnd.isAfter(form.scheduledStart)) {
            "Appointment end time must be after start time"
        }
        entity.scheduledStart = form.scheduledStart
        entity.durationMinutes = Duration.between(form.scheduledStart, form.scheduledEnd).toMinutes().toInt().coerceAtLeast(5)
        entity.status = form.status
        entity.reason = form.reason?.trim()
        entity.roomNumber = form.roomNumber?.trim()
        entity.notes = form.notes?.trim()
        return entity
    }
}
