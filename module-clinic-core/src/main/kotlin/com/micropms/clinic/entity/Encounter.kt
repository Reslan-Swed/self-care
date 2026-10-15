package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

enum class EncounterStatus {
    IN_PROGRESS,
    COMPLETED,
    AMENDED,
    CANCELLED
}

/**
 * Confidential clinical encounter entity holding SOAP notes and diagnostic data.
 * Isolated strictly from reception staff; requires encounter:clinical:read or encounter:clinical:write authorities.
 * Links to attending doctor via explicit JPA relationship @ManyToOne doctor: User.
 */
@Entity
@Table(name = "clinic_encounters")
class Encounter(
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    var appointment: Appointment? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    var patient: Patient,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    var doctor: User,

    @Column(name = "chief_complaint", nullable = false, columnDefinition = "TEXT")
    var chiefComplaint: String,

    @Column(name = "subjective_notes", columnDefinition = "TEXT")
    var subjectiveNotes: String? = null,

    @Column(name = "objective_exam", columnDefinition = "TEXT")
    var objectiveExam: String? = null,

    @Column(name = "diagnosis", nullable = false, columnDefinition = "TEXT")
    var diagnosis: String,

    @Column(name = "prescription", columnDefinition = "TEXT")
    var prescription: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: EncounterStatus = EncounterStatus.COMPLETED,

    @Column(name = "encounter_date", nullable = false)
    var encounterDate: Instant = Instant.now()
) : BaseTenantEntity() {

    // Overloaded secondary constructor for convenience and backwards-compatibility
    constructor(
        patient: Patient,
        doctorId: UUID,
        chiefComplaint: String,
        subjectiveNotes: String? = null,
        objectiveExam: String? = null,
        diagnosis: String,
        prescription: String? = null,
        status: EncounterStatus = EncounterStatus.COMPLETED,
        encounterDate: Instant = Instant.now(),
        appointment: Appointment? = null
    ) : this(
        appointment = appointment,
        patient = patient,
        doctor = User(
            email = "doctor-$doctorId@clinic.internal",
            passwordHash = "{noop}stub",
            fullName = "Doctor",
            role = UserRole.DOCTOR
        ).apply { id = doctorId },
        chiefComplaint = chiefComplaint,
        subjectiveNotes = subjectiveNotes,
        objectiveExam = objectiveExam,
        diagnosis = diagnosis,
        prescription = prescription,
        status = status,
        encounterDate = encounterDate
    )

    // Doctor ID accessor matching doctor relationship
    var doctorId: UUID
        get() = doctor.id
        set(_) {}

    // Compatibility properties
    var patientId: UUID
        get() = patient.id
        set(_) {}

    var practitionerId: UUID
        get() = doctor.id
        set(_) {}

    var assessment: String?
        get() = diagnosis
        set(value) { if (value != null) diagnosis = value }

    var plan: String?
        get() = prescription
        set(value) { prescription = value }

    var objectiveNotes: String?
        get() = objectiveExam
        set(value) { objectiveExam = value }

    var icd10Codes: String? = null
}
