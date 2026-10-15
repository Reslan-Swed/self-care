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

    @Column(name = "doctor_id", nullable = false)
    var doctorId: UUID,

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

    // Compatibility properties
    var patientId: UUID
        get() = patient.id
        set(_) {}

    var practitionerId: UUID
        get() = doctorId
        set(value) { doctorId = value }

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
