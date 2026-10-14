package com.micropms.clinic.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.clinic.entity.Appointment
import com.micropms.clinic.entity.AppointmentStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

@Repository
interface AppointmentRepository : BaseRepository<Appointment, UUID> {
    fun findByPatientId(patientId: UUID, pageable: Pageable): Page<Appointment>
    fun findByPractitionerIdAndScheduledStartBetween(
        practitionerId: UUID,
        start: Instant,
        end: Instant,
        pageable: Pageable
    ): Page<Appointment>
    fun findByStatus(status: AppointmentStatus, pageable: Pageable): Page<Appointment>
}
