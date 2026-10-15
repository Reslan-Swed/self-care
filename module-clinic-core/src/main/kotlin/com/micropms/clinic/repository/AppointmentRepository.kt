package com.micropms.clinic.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.clinic.entity.Appointment
import com.micropms.clinic.entity.AppointmentStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

@Repository
interface AppointmentRepository : BaseRepository<Appointment, UUID> {
    fun findByPatientId(patientId: UUID, pageable: Pageable): Page<Appointment>
    fun findByPatientIdOrderByScheduledAtDesc(patientId: UUID): List<Appointment>

    fun findByDoctorIdAndScheduledAtBetween(
        doctorId: UUID,
        start: Instant,
        end: Instant
    ): List<Appointment>

    fun findByStatus(status: AppointmentStatus, pageable: Pageable): Page<Appointment>

    fun findByStatusInOrderByScheduledAtAsc(statuses: Collection<AppointmentStatus>): List<Appointment>

    @Query("SELECT a FROM Appointment a WHERE a.status IN :statuses AND a.scheduledAt BETWEEN :start AND :end ORDER BY a.scheduledAt ASC")
    fun findWaitingRoomQueue(
        @Param("statuses") statuses: Collection<AppointmentStatus>,
        @Param("start") start: Instant,
        @Param("end") end: Instant
    ): List<Appointment>

    // Backwards compatibility
    fun findByPractitionerIdAndScheduledStartBetween(
        practitionerId: UUID,
        start: Instant,
        end: Instant,
        pageable: Pageable
    ): Page<Appointment> = findByStatus(AppointmentStatus.SCHEDULED, pageable)
}
