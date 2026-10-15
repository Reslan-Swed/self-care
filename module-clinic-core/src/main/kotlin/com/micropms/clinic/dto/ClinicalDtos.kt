package com.micropms.clinic.dto

import com.micropms.clinic.entity.AppointmentStatus
import com.micropms.clinic.entity.EncounterStatus
import com.micropms.clinic.entity.Gender
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

/**
 * Command for reception desk to quickly book an appointment.
 * If patient does not exist, a minimal patient record is atomically provisioned.
 */
data class QuickBookAppointmentCommand(
    @field:NotBlank(message = "Patient name is required")
    val patientName: String,

    @field:NotBlank(message = "Phone number is required")
    val phone: String,

    @field:NotNull(message = "Doctor ID is required")
    val doctorId: UUID,

    @field:NotNull(message = "Scheduled time is required")
    val scheduledAt: Instant,

    val durationMinutes: Int = 15,
    val reasonForVisit: String? = null
)

/**
 * Lightweight projection for reception search and list views.
 */
data class PatientSummaryDto(
    val id: UUID,
    val fullName: String,
    val phone: String,
    val fileNumber: String? = null
)

/**
 * Full clinical overview accessible only to clinicians with encounter:clinical:read authority.
 */
data class ClinicalPatientProfileDto(
    val id: UUID,
    val fullName: String,
    val phone: String,
    val gender: Gender? = null,
    val birthDate: LocalDate? = null,
    val bloodGroup: String? = null,
    val medicalAlerts: String? = null,
    val fileNumber: String? = null
)

/**
 * Command to create a clinical encounter, link optional appointment, and save dynamic EAV specialty fields.
 */
data class CreateEncounterCommand(
    @field:NotNull(message = "Patient ID is required")
    val patientId: UUID,

    val appointmentId: UUID? = null,

    @field:NotNull(message = "Doctor ID is required")
    val doctorId: UUID,

    @field:NotBlank(message = "Chief complaint is required")
    val chiefComplaint: String,

    val subjectiveNotes: String? = null,
    val objectiveExam: String? = null,

    @field:NotBlank(message = "Diagnosis is required")
    val diagnosis: String,

    val prescription: String? = null,
    val customFields: List<DynamicFieldInputDto> = emptyList()
)

/**
 * Comprehensive encounter response including typed EAV resolved values.
 */
data class ClinicalEncounterDetailsDto(
    val id: UUID,
    val appointmentId: UUID? = null,
    val patientId: UUID,
    val patientName: String,
    val doctorId: UUID,
    val chiefComplaint: String,
    val subjectiveNotes: String? = null,
    val objectiveExam: String? = null,
    val diagnosis: String,
    val prescription: String? = null,
    val encounterDate: Instant,
    val status: EncounterStatus,
    val customFields: List<DynamicFieldValueDto> = emptyList()
)

data class UpdateQueueStatusCommand(
    @field:NotNull(message = "Appointment status is required")
    val status: AppointmentStatus
)

data class QueueItemDto(
    val appointmentId: UUID,
    val patientId: UUID,
    val patientName: String,
    val phone: String,
    val fileNumber: String? = null,
    val doctorId: UUID,
    val scheduledAt: Instant,
    val durationMinutes: Int = 15,
    val status: AppointmentStatus,
    val reasonForVisit: String? = null
)
