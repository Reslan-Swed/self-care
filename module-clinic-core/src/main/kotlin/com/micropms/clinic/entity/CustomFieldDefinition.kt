package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

enum class CustomFieldDataType {
    TEXT,
    NUMERIC,
    DATE,
    BOOLEAN,
    SELECT
}

enum class ClinicalSpecialty {
    GENERAL_PRACTICE,
    PEDIATRICS,
    CARDIOLOGY,
    DERMATOLOGY,
    DENTISTRY,
    OPHTHALMOLOGY
}

/**
 * Relational Typed EAV Schema Definition: Defines tenant-scoped custom fields per clinical specialty.
 * No unstructured JSONB or raw JSON columns are allowed.
 */
@Entity
@Table(name = "custom_field_definitions")
class CustomFieldDefinition(
    @Column(name = "field_key", nullable = false)
    var fieldKey: String,

    @Column(name = "display_name", nullable = false)
    var displayName: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false)
    var dataType: CustomFieldDataType,

    @Enumerated(EnumType.STRING)
    @Column(name = "specialty", nullable = false)
    var specialty: ClinicalSpecialty,

    @Column(name = "is_required", nullable = false)
    var isRequired: Boolean = false,

    @OneToMany(mappedBy = "fieldDefinition", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var options: MutableList<CustomFieldOption> = mutableListOf()
) : BaseTenantEntity()

@Entity
@Table(name = "custom_field_options")
class CustomFieldOption(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "definition_id", nullable = false)
    var fieldDefinition: CustomFieldDefinition,

    @Column(name = "option_label", nullable = false)
    var optionLabel: String,

    @Column(name = "option_value", nullable = false)
    var optionValue: String,

    @Column(name = "display_order", nullable = false)
    var displayOrder: Int = 0
) : BaseTenantEntity()

/**
 * Relational Typed EAV Value Store: Maps custom specialty fields to clinical encounters.
 * Values are stored strictly in typed columns (value_text, value_numeric, value_date, value_boolean)
 * to maintain relational indexing, ACID integrity, and type safety without JSONB.
 */
@Entity
@Table(name = "encounter_field_values")
class EncounterFieldValue(
    @Column(name = "encounter_id", nullable = false)
    var encounterId: UUID,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "definition_id", nullable = false)
    var fieldDefinition: CustomFieldDefinition,

    @Column(name = "value_text", columnDefinition = "TEXT")
    var valueText: String? = null,

    @Column(name = "value_numeric", precision = 12, scale = 4)
    var valueNumeric: BigDecimal? = null,

    @Column(name = "value_date")
    var valueDate: LocalDate? = null,

    @Column(name = "value_boolean")
    var valueBoolean: Boolean? = null
) : BaseTenantEntity()
