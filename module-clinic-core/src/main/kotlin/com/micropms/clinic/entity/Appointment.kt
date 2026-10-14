package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

enum class AppointmentStatus {
    SCHEDULED,
    CONFIRMED,
    CHECKED_IN,
    IN_CONSULTATION,
    COMPLETED,
    CANCELLED,
    NO_SHOW
}

/**
 * Application Plane entity representing an appointment scheduled with a practitioner.
 * Extends BaseTenantEntity to enforce tenant scoping and PostgreSQL RLS.
 * Accessible to administrative and reception staff as well as clinicians.
 */
@Entity
@Table(name = "clinic_appointments")
class Appointment(
    @Column(name = "patient_id", nullable = false)
    var patientId: UUID,

    @Column(name = "practitioner_id", nullable = false)
    var practitionerId: UUID,

    @Column(name = "scheduled_start", nullable = false)
    var scheduledStart: Instant,

    @Column(name = "scheduled_end", nullable = false)
    var scheduledEnd: Instant,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: AppointmentStatus = AppointmentStatus.SCHEDULED,

    @Column(name = "reason")
    var reason: String? = null,

    @Column(name = "room_number")
    var roomNumber: String? = null,

    @Column(name = "notes")
    var notes: String? = null
) : BaseTenantEntity()
