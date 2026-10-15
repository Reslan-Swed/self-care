package com.micropms.clinic.service

import com.micropms.clinic.dto.ClinicalEncounterDetailsDto
import com.micropms.clinic.dto.ClinicalPatientProfileDto
import com.micropms.clinic.dto.CreateEncounterCommand
import com.micropms.clinic.entity.AppointmentStatus
import com.micropms.clinic.entity.Encounter
import com.micropms.clinic.entity.EncounterStatus
import com.micropms.clinic.entity.User
import com.micropms.clinic.entity.UserRole
import com.micropms.clinic.repository.AppointmentRepository
import com.micropms.clinic.repository.EncounterRepository
import com.micropms.clinic.repository.PatientRepository
import com.micropms.clinic.repository.UserRepository
import com.micropms.common.exception.ResourceNotFoundException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class ClinicalEncounterService(
    private val encounterRepository: EncounterRepository,
    private val patientRepository: PatientRepository,
    private val appointmentRepository: AppointmentRepository,
    private val customFieldService: CustomFieldService,
    @Autowired(required = false)
    private val userRepository: UserRepository? = null
) {

    /**
     * Atomically creates clinical encounter, links optional appointment (marking it COMPLETED),
     * resolves doctor User relationship, and saves specialty typed EAV field values within a single transaction.
     */
    @Transactional
    fun createEncounter(command: CreateEncounterCommand): ClinicalEncounterDetailsDto {
        val patient = patientRepository.findById(command.patientId)
            .orElseThrow { ResourceNotFoundException("Patient not found with ID: ${command.patientId}") }

        val appointment = command.appointmentId?.let { apptId ->
            val appt = appointmentRepository.findById(apptId)
                .orElseThrow { ResourceNotFoundException("Appointment not found with ID: $apptId") }
            appt.status = AppointmentStatus.COMPLETED
            appointmentRepository.save(appt)
        }

        val doctor = userRepository?.findById(command.doctorId)?.orElseGet {
            User(
                email = "doctor-${command.doctorId}@clinic.internal",
                passwordHash = "{noop}stub",
                fullName = "Attending Physician",
                role = UserRole.DOCTOR
            ).apply { id = command.doctorId }
        } ?: User(
            email = "doctor-${command.doctorId}@clinic.internal",
            passwordHash = "{noop}stub",
            fullName = "Attending Physician",
            role = UserRole.DOCTOR
        ).apply { id = command.doctorId }

        val encounter = Encounter(
            appointment = appointment,
            patient = patient,
            doctor = doctor,
            chiefComplaint = command.chiefComplaint.trim(),
            subjectiveNotes = command.subjectiveNotes?.trim(),
            objectiveExam = command.objectiveExam?.trim(),
            diagnosis = command.diagnosis.trim(),
            prescription = command.prescription?.trim(),
            status = EncounterStatus.COMPLETED
        )

        val savedEncounter = encounterRepository.save(encounter)

        // Save specialty typed EAV values if supplied
        if (command.customFields.isNotEmpty()) {
            customFieldService.saveValuesForEncounter(savedEncounter.id, command.customFields)
        }

        val resolvedFields = customFieldService.getRenderableFieldsForEncounter(savedEncounter.id)

        return ClinicalEncounterDetailsDto(
            id = savedEncounter.id,
            appointmentId = appointment?.id,
            patientId = patient.id,
            patientName = patient.fullName,
            doctorId = savedEncounter.doctorId,
            chiefComplaint = savedEncounter.chiefComplaint,
            subjectiveNotes = savedEncounter.subjectiveNotes,
            objectiveExam = savedEncounter.objectiveExam,
            diagnosis = savedEncounter.diagnosis,
            prescription = savedEncounter.prescription,
            encounterDate = savedEncounter.encounterDate,
            status = savedEncounter.status,
            customFields = resolvedFields
        )
    }

    /**
     * Fetches clinical encounter details with rendered custom EAV values.
     */
    fun getEncounterNotes(encounterId: UUID): ClinicalEncounterDetailsDto {
        val encounter = encounterRepository.findById(encounterId)
            .orElseThrow { ResourceNotFoundException("Clinical encounter not found with ID: $encounterId") }

        val resolvedFields = customFieldService.getRenderableFieldsForEncounter(encounter.id)

        return ClinicalEncounterDetailsDto(
            id = encounter.id,
            appointmentId = encounter.appointment?.id,
            patientId = encounter.patient.id,
            patientName = encounter.patient.fullName,
            doctorId = encounter.doctorId,
            chiefComplaint = encounter.chiefComplaint,
            subjectiveNotes = encounter.subjectiveNotes,
            objectiveExam = encounter.objectiveExam,
            diagnosis = encounter.diagnosis,
            prescription = encounter.prescription,
            encounterDate = encounter.encounterDate,
            status = encounter.status,
            customFields = resolvedFields
        )
    }

    /**
     * Returns chronological clinical timeline of encounters for a patient.
     */
    fun getPatientTimeline(patientId: UUID): List<ClinicalEncounterDetailsDto> {
        if (!patientRepository.existsById(patientId)) {
            throw ResourceNotFoundException("Patient not found with ID: $patientId")
        }

        val encounters = encounterRepository.findByPatientIdOrderByEncounterDateDesc(patientId)

        return encounters.map { encounter ->
            val resolvedFields = customFieldService.getRenderableFieldsForEncounter(encounter.id)
            ClinicalEncounterDetailsDto(
                id = encounter.id,
                appointmentId = encounter.appointment?.id,
                patientId = encounter.patient.id,
                patientName = encounter.patient.fullName,
                doctorId = encounter.doctorId,
                chiefComplaint = encounter.chiefComplaint,
                subjectiveNotes = encounter.subjectiveNotes,
                objectiveExam = encounter.objectiveExam,
                diagnosis = encounter.diagnosis,
                prescription = encounter.prescription,
                encounterDate = encounter.encounterDate,
                status = encounter.status,
                customFields = resolvedFields
            )
        }
    }

    /**
     * Retrieves full clinical profile for a patient.
     */
    fun getPatientClinicalProfile(patientId: UUID): ClinicalPatientProfileDto {
        val patient = patientRepository.findById(patientId)
            .orElseThrow { ResourceNotFoundException("Patient not found with ID: $patientId") }

        return ClinicalPatientProfileDto(
            id = patient.id,
            fullName = patient.fullName,
            phone = patient.phone,
            gender = patient.gender,
            birthDate = patient.birthDate,
            bloodGroup = patient.bloodGroup,
            medicalAlerts = patient.medicalAlerts,
            fileNumber = patient.fileNumber
        )
    }
}
