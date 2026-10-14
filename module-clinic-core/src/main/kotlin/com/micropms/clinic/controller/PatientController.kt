package com.micropms.clinic.controller

import com.micropms.common.controller.BaseController
import com.micropms.clinic.entity.Patient
import com.micropms.clinic.repository.PatientRepository
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Past
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

data class PatientForm(
    @field:NotBlank(message = "Medical record number (MRN) is required")
    val medicalRecordNumber: String,

    @field:NotBlank(message = "First name is required")
    val firstName: String,

    @field:NotBlank(message = "Last name is required")
    val lastName: String,

    @field:NotNull(message = "Date of birth is required")
    @field:Past(message = "Date of birth must be in the past")
    val dateOfBirth: LocalDate,

    @field:NotBlank(message = "Gender is required")
    val gender: String,

    val phoneNumber: String? = null,

    @field:Email(message = "Invalid email format")
    val email: String? = null
)

data class PatientResponseDto(
    val id: UUID,
    val medicalRecordNumber: String,
    val firstName: String,
    val lastName: String,
    val dateOfBirth: LocalDate,
    val gender: String,
    val phoneNumber: String?,
    val email: String?,
    val createdAt: Instant,
    val updatedAt: Instant
)

/**
 * Patient demographics controller accessible to both administrative/reception staff
 * and clinical staff. Clinical history and diagnosis are strictly isolated into Encounters.
 */
@RestController
@RequestMapping("/api/v1/clinic/patients")
@PreAuthorize("hasAuthority('PATIENT_READ') or hasAuthority('ROLE_RECEPTIONIST') or hasAuthority('ROLE_DOCTOR')")
class PatientController(
    patientRepository: PatientRepository
) : BaseController<Patient, UUID, PatientForm, PatientResponseDto>(
    repository = patientRepository,
    resourceName = "Patient"
) {

    @PreAuthorize("hasAuthority('PATIENT_WRITE') or hasAuthority('ROLE_RECEPTIONIST') or hasAuthority('ROLE_DOCTOR')")
    @Transactional
    override fun create(form: PatientForm) = super.create(form)

    @PreAuthorize("hasAuthority('PATIENT_WRITE') or hasAuthority('ROLE_RECEPTIONIST') or hasAuthority('ROLE_DOCTOR')")
    @Transactional
    override fun update(id: UUID, form: PatientForm) = super.update(id, form)

    @PreAuthorize("hasAuthority('PATIENT_ADMIN')")
    @Transactional
    override fun delete(id: UUID) = super.delete(id)

    override fun toEntity(form: PatientForm): Patient {
        return Patient(
            medicalRecordNumber = form.medicalRecordNumber.trim(),
            firstName = form.firstName.trim(),
            lastName = form.lastName.trim(),
            dateOfBirth = form.dateOfBirth,
            gender = form.gender.trim(),
            phoneNumber = form.phoneNumber?.trim(),
            email = form.email?.trim()?.lowercase()
        )
    }

    override fun toResponseDto(entity: Patient): PatientResponseDto {
        return PatientResponseDto(
            id = entity.id ?: throw IllegalStateException("Patient ID unassigned"),
            medicalRecordNumber = entity.medicalRecordNumber,
            firstName = entity.firstName,
            lastName = entity.lastName,
            dateOfBirth = entity.dateOfBirth,
            gender = entity.gender,
            phoneNumber = entity.phoneNumber,
            email = entity.email,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    override fun updateEntityFromForm(entity: Patient, form: PatientForm): Patient {
        entity.medicalRecordNumber = form.medicalRecordNumber.trim()
        entity.firstName = form.firstName.trim()
        entity.lastName = form.lastName.trim()
        entity.dateOfBirth = form.dateOfBirth
        entity.gender = form.gender.trim()
        entity.phoneNumber = form.phoneNumber?.trim()
        entity.email = form.email?.trim()?.lowercase()
        return entity
    }
}
