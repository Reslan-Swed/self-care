package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

enum class AppointmentStatus {
    SCHEDULED,
    CONFIRMED,
    WAITING,
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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    var patient: Patient,

    @Column(name = "doctor_id", nullable = false)
    var doctorId: UUID,

    @Column(name = "scheduled_at", nullable = false)
    var scheduledAt: Instant,

    @Column(name = "duration_minutes", nullable = false)
    var durationMinutes: Int = 15,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: AppointmentStatus = AppointmentStatus.SCHEDULED,

    @Column(name = "reason_for_visit")
    var reasonForVisit: String? = null
) : BaseTenantEntity() {

    // Compatibility properties
    var patientId: UUID
        get() = patient.id
        set(_) {}

    var practitionerId: UUID
        get() = doctorId
        set(value) { doctorId = value }

    var scheduledStart: Instant
        get() = scheduledAt
        set(value) { scheduledAt = value }

    var scheduledEnd: Instant
        get() = scheduledAt.plusSeconds((durationMinutes * 60).toLong())
        set(_) {}

    var reason: String?
        get() = reasonForVisit
        set(value) { reasonForVisit = value }

    var roomNumber: String? = null
    var notes: String? = null
}
