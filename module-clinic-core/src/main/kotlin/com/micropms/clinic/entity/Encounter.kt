package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
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
 * Highly confidential clinical encounter entity holding SOAP notes and diagnostic data.
 * Isolated strictly from reception staff; requires CLINICAL_READ or CLINICAL_WRITE authorities.
 */
@Entity
@Table(name = "clinic_encounters")
class Encounter(
    @Column(name = "patient_id", nullable = false)
    var patientId: UUID,

    @Column(name = "practitioner_id", nullable = false)
    var practitionerId: UUID,

    @Column(name = "encounter_date", nullable = false)
    var encounterDate: Instant = Instant.now(),

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: EncounterStatus = EncounterStatus.IN_PROGRESS,

    @Column(name = "subjective_notes", columnDefinition = "TEXT")
    var subjectiveNotes: String? = null,

    @Column(name = "objective_notes", columnDefinition = "TEXT")
    var objectiveNotes: String? = null,

    @Column(name = "assessment", columnDefinition = "TEXT")
    var assessment: String? = null,

    @Column(name = "plan", columnDefinition = "TEXT")
    var plan: String? = null,

    @Column(name = "icd10_codes")
    var icd10Codes: String? = null
) : BaseTenantEntity()
