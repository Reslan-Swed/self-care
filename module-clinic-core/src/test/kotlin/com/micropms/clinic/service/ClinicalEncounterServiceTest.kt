package com.micropms.clinic.service

import com.micropms.clinic.dto.CreateEncounterCommand
import com.micropms.clinic.dto.DynamicFieldInputDto
import com.micropms.clinic.dto.DynamicFieldValueDto
import com.micropms.clinic.entity.Appointment
import com.micropms.clinic.entity.AppointmentStatus
import com.micropms.clinic.entity.Encounter
import com.micropms.clinic.entity.EncounterStatus
import com.micropms.clinic.entity.FieldDataType
import com.micropms.clinic.entity.Patient
import com.micropms.clinic.repository.AppointmentRepository
import com.micropms.clinic.repository.EncounterRepository
import com.micropms.clinic.repository.PatientRepository
import io.mockk.every
import io.mockk.justRun
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.Optional
import java.util.UUID

class ClinicalEncounterServiceTest {

    private val encounterRepository: EncounterRepository = mockk()
    private val patientRepository: PatientRepository = mockk()
    private val appointmentRepository: AppointmentRepository = mockk()
    private val customFieldService: CustomFieldService = mockk()

    private lateinit var encounterService: ClinicalEncounterService

    @BeforeEach
    fun setUp() {
        encounterService = ClinicalEncounterService(
            encounterRepository,
            patientRepository,
            appointmentRepository,
            customFieldService
        )
    }

    @Test
    fun `createEncounter links appointment, marks appointment COMPLETED, and saves custom fields`() {
        val patientId = UUID.randomUUID()
        val appointmentId = UUID.randomUUID()
        val doctorId = UUID.randomUUID()

        val patient = Patient(fullName = "Alice Cooper", phone = "+15552345678")
        patient.id = patientId

        val appointment = Appointment(
            patient = patient,
            doctorId = doctorId,
            scheduledAt = Instant.now(),
            status = AppointmentStatus.IN_CONSULTATION
        )
        appointment.id = appointmentId

        val customFieldInputs = listOf(
            DynamicFieldInputDto(fieldKey = "blood_pressure_systolic", rawValue = "120"),
            DynamicFieldInputDto(fieldKey = "blood_pressure_diastolic", rawValue = "80")
        )

        val command = CreateEncounterCommand(
            patientId = patientId,
            appointmentId = appointmentId,
            doctorId = doctorId,
            chiefComplaint = "Persistent migraine with aura",
            subjectiveNotes = "Headache started 3 days ago, sensitive to bright light.",
            objectiveExam = "Neurological examination normal. BP 120/80 mmHg.",
            diagnosis = "Migraine without aura, episodic",
            prescription = "Sumatriptan 50mg PO at onset of migraine",
            customFields = customFieldInputs
        )

        every { patientRepository.findById(patientId) } returns Optional.of(patient)
        every { appointmentRepository.findById(appointmentId) } returns Optional.of(appointment)
        every { appointmentRepository.save(appointment) } answers { firstArg() }

        val encounterSlot = slot<Encounter>()
        every { encounterRepository.save(capture(encounterSlot)) } answers {
            val enc = encounterSlot.captured
            enc.id = UUID.randomUUID()
            enc
        }

        justRun { customFieldService.saveValuesForEncounter(any(), customFieldInputs) }

        val mockResolvedFields = listOf(
            DynamicFieldValueDto("blood_pressure_systolic", "Systolic BP", FieldDataType.NUMBER, 120),
            DynamicFieldValueDto("blood_pressure_diastolic", "Diastolic BP", FieldDataType.NUMBER, 80)
        )
        every { customFieldService.getRenderableFieldsForEncounter(any()) } returns mockResolvedFields

        val result = encounterService.createEncounter(command)

        assertNotNull(result.id)
        assertEquals(appointmentId, result.appointmentId)
        assertEquals("Alice Cooper", result.patientName)
        assertEquals("Migraine without aura, episodic", result.diagnosis)
        assertEquals(EncounterStatus.COMPLETED, result.status)
        assertEquals(2, result.customFields.size)

        // Verify appointment was set to COMPLETED
        assertEquals(AppointmentStatus.COMPLETED, appointment.status)
        verify(exactly = 1) { appointmentRepository.save(appointment) }
        verify(exactly = 1) { encounterRepository.save(any()) }
        verify(exactly = 1) { customFieldService.saveValuesForEncounter(any(), customFieldInputs) }
    }

    @Test
    fun `getPatientTimeline returns list of clinical encounters`() {
        val patientId = UUID.randomUUID()
        val patient = Patient(fullName = "Bob Dylan", phone = "+15553456789")
        patient.id = patientId

        val enc1 = Encounter(
            patient = patient,
            doctorId = UUID.randomUUID(),
            chiefComplaint = "Fever and sore throat",
            diagnosis = "Acute pharyngitis"
        )
        enc1.id = UUID.randomUUID()

        every { patientRepository.existsById(patientId) } returns true
        every { encounterRepository.findByPatientIdOrderByEncounterDateDesc(patientId) } returns listOf(enc1)
        every { customFieldService.getRenderableFieldsForEncounter(enc1.id) } returns emptyList()

        val timeline = encounterService.getPatientTimeline(patientId)

        assertEquals(1, timeline.size)
        assertEquals("Acute pharyngitis", timeline.first().diagnosis)
        verify(exactly = 1) { encounterRepository.findByPatientIdOrderByEncounterDateDesc(patientId) }
    }
}
