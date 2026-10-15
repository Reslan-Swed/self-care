package com.micropms.clinic.service

import com.micropms.clinic.dto.QuickBookAppointmentCommand
import com.micropms.clinic.entity.Appointment
import com.micropms.clinic.entity.AppointmentStatus
import com.micropms.clinic.entity.Patient
import com.micropms.clinic.repository.AppointmentRepository
import com.micropms.clinic.repository.PatientRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.Optional
import java.util.UUID

class ReceptionServiceTest {

    private val patientRepository: PatientRepository = mockk()
    private val appointmentRepository: AppointmentRepository = mockk()

    private lateinit var receptionService: ReceptionService

    @BeforeEach
    fun setUp() {
        receptionService = ReceptionService(patientRepository, appointmentRepository)
    }

    @Test
    fun `quickBookAppointment creates new patient when phone does not exist and books appointment`() {
        val phone = "+15551234567"
        val doctorId = UUID.randomUUID()
        val scheduledAt = Instant.now()

        val command = QuickBookAppointmentCommand(
            patientName = "Jane Doe",
            phone = phone,
            doctorId = doctorId,
            scheduledAt = scheduledAt,
            reasonForVisit = "Annual Checkup"
        )

        every { patientRepository.findByPhone(phone) } returns Optional.empty()

        val patientSlot = slot<Patient>()
        every { patientRepository.save(capture(patientSlot)) } answers {
            val p = patientSlot.captured
            p.id = UUID.randomUUID()
            p
        }

        val apptSlot = slot<Appointment>()
        every { appointmentRepository.save(capture(apptSlot)) } answers {
            val a = apptSlot.captured
            a.id = UUID.randomUUID()
            a
        }

        val result = receptionService.quickBookAppointment(command)

        assertNotNull(result.appointmentId)
        assertEquals("Jane Doe", result.patientName)
        assertEquals(phone, result.phone)
        assertEquals(AppointmentStatus.WAITING, result.status)
        assertEquals("Annual Checkup", result.reasonForVisit)

        verify(exactly = 1) { patientRepository.save(any()) }
        verify(exactly = 1) { appointmentRepository.save(any()) }
    }

    @Test
    fun `quickBookAppointment reuses existing patient when phone is already registered`() {
        val phone = "+15559876543"
        val existingPatient = Patient(fullName = "Existing Patient", phone = phone)
        existingPatient.id = UUID.randomUUID()

        val command = QuickBookAppointmentCommand(
            patientName = "Existing Patient",
            phone = phone,
            doctorId = UUID.randomUUID(),
            scheduledAt = Instant.now()
        )

        every { patientRepository.findByPhone(phone) } returns Optional.of(existingPatient)

        val apptSlot = slot<Appointment>()
        every { appointmentRepository.save(capture(apptSlot)) } answers {
            val a = apptSlot.captured
            a.id = UUID.randomUUID()
            a
        }

        val result = receptionService.quickBookAppointment(command)

        assertEquals(existingPatient.id, result.patientId)
        verify(exactly = 0) { patientRepository.save(any()) }
        verify(exactly = 1) { appointmentRepository.save(any()) }
    }

    @Test
    fun `updateQueueStatus updates appointment status successfully`() {
        val apptId = UUID.randomUUID()
        val patient = Patient(fullName = "John Smith", phone = "+15550001111")
        patient.id = UUID.randomUUID()

        val appointment = Appointment(
            patient = patient,
            doctorId = UUID.randomUUID(),
            scheduledAt = Instant.now(),
            status = AppointmentStatus.WAITING
        )
        appointment.id = apptId

        every { appointmentRepository.findById(apptId) } returns Optional.of(appointment)
        every { appointmentRepository.save(any()) } answers { firstArg() }

        val result = receptionService.updateQueueStatus(apptId, AppointmentStatus.IN_CONSULTATION)

        assertEquals(AppointmentStatus.IN_CONSULTATION, result.status)
        verify(exactly = 1) { appointmentRepository.save(appointment) }
    }

    @Test
    fun `updateQueueStatus throws exception when attempting to revert COMPLETED appointment to WAITING`() {
        val apptId = UUID.randomUUID()
        val patient = Patient(fullName = "John Smith", phone = "+15550001111")
        patient.id = UUID.randomUUID()

        val completedAppt = Appointment(
            patient = patient,
            doctorId = UUID.randomUUID(),
            scheduledAt = Instant.now(),
            status = AppointmentStatus.COMPLETED
        )
        completedAppt.id = apptId

        every { appointmentRepository.findById(apptId) } returns Optional.of(completedAppt)

        assertThrows(IllegalStateException::class.java) {
            receptionService.updateQueueStatus(apptId, AppointmentStatus.WAITING)
        }
    }
}
