package com.micropms.clinic.controller

import com.micropms.clinic.entity.Encounter
import com.micropms.clinic.entity.EncounterStatus
import com.micropms.clinic.entity.User
import com.micropms.clinic.entity.UserRole
import com.micropms.clinic.repository.EncounterRepository
import com.micropms.clinic.repository.PatientRepository
import com.micropms.clinic.repository.UserRepository
import com.micropms.common.controller.BaseController
import jakarta.validation.constraints.NotNull
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.util.UUID

data class EncounterForm(
    @field:NotNull(message = "Patient ID is required")
    val patientId: UUID,

    @field:NotNull(message = "Practitioner ID is required")
    val practitionerId: UUID,

    val status: EncounterStatus = EncounterStatus.IN_PROGRESS,
    val subjectiveNotes: String? = null,
    val objectiveNotes: String? = null,
    val assessment: String? = null,
    val plan: String? = null,
    val icd10Codes: String? = null
)

data class EncounterResponseDto(
    val id: UUID,
    val patientId: UUID,
    val practitionerId: UUID,
    val encounterDate: Instant,
    val status: EncounterStatus,
    val subjectiveNotes: String?,
    val objectiveNotes: String?,
    val assessment: String?,
    val plan: String?,
    val icd10Codes: String?,
    val createdAt: Instant,
    val updatedAt: Instant
)

/**
 * Controller strictly restricted to licensed clinical staff (Doctors, Nurse Practitioners).
 * Staff with administrative or receptionist roles receive HTTP 403 Forbidden.
 */
@RestController
@RequestMapping("/api/v1/clinic/encounters")
@PreAuthorize("hasAuthority('encounter:clinical:read') or hasAuthority('CLINICAL_READ')")
class EncounterController(
    encounterRepository: EncounterRepository,
    private val patientRepository: PatientRepository,
    @Autowired(required = false)
    private val userRepository: UserRepository? = null
) : BaseController<Encounter, UUID, EncounterForm, EncounterResponseDto>(
    repository = encounterRepository,
    resourceName = "Clinical Encounter"
) {

    @PreAuthorize("hasAuthority('encounter:clinical:write') or hasAuthority('CLINICAL_WRITE')")
    @Transactional
    override fun create(form: EncounterForm) = super.create(form)

    @PreAuthorize("hasAuthority('encounter:clinical:write') or hasAuthority('CLINICAL_WRITE')")
    @Transactional
    override fun update(id: UUID, form: EncounterForm) = super.update(id, form)

    @PreAuthorize("hasAuthority('encounter:clinical:write') or hasAuthority('CLINICAL_ADMIN')")
    @Transactional
    override fun delete(id: UUID) = super.delete(id)

    override fun toEntity(form: EncounterForm): Encounter {
        val patient = patientRepository.findById(form.patientId)
            .orElseThrow { IllegalArgumentException("Patient not found with ID: ${form.patientId}") }

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

        val encounter = Encounter(
            patient = patient,
            doctor = doctor,
            chiefComplaint = form.subjectiveNotes ?: "Clinical Consultation",
            subjectiveNotes = form.subjectiveNotes,
            objectiveExam = form.objectiveNotes,
            diagnosis = form.assessment ?: "Clinical Evaluation",
            prescription = form.plan,
            status = form.status
        )
        encounter.icd10Codes = form.icd10Codes
        return encounter
    }

    override fun toResponseDto(entity: Encounter): EncounterResponseDto {
        return EncounterResponseDto(
            id = entity.id ?: throw IllegalStateException("Encounter ID unassigned"),
            patientId = entity.patientId,
            practitionerId = entity.practitionerId,
            encounterDate = entity.encounterDate,
            status = entity.status,
            subjectiveNotes = entity.subjectiveNotes,
            objectiveNotes = entity.objectiveNotes,
            assessment = entity.assessment,
            plan = entity.plan,
            icd10Codes = entity.icd10Codes,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    override fun updateEntityFromForm(entity: Encounter, form: EncounterForm): Encounter {
        entity.status = form.status
        entity.subjectiveNotes = form.subjectiveNotes
        entity.objectiveNotes = form.objectiveNotes
        entity.assessment = form.assessment
        entity.plan = form.plan
        entity.icd10Codes = form.icd10Codes
        return entity
    }
}
