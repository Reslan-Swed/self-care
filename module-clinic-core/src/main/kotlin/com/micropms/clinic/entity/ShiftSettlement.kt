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
import java.math.BigDecimal
import java.time.Instant

enum class ShiftStatus {
    OPEN,
    CLOSED
}

/**
 * Application Plane entity tracking receptionist cash drawers and end-of-shift reconciliation.
 * Extends BaseTenantEntity to enforce tenant scoping with PostgreSQL RLS.
 */
@Entity
@Table(name = "clinic_shift_settlements")
class ShiftSettlement(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receptionist_id", nullable = false)
    var receptionist: User,

    @Column(name = "opened_at", nullable = false)
    var openedAt: Instant = Instant.now(),

    @Column(name = "closed_at")
    var closedAt: Instant? = null,

    @Column(name = "expected_cash_amount", nullable = false, precision = 12, scale = 2)
    var expectedCashAmount: BigDecimal = BigDecimal.ZERO.setScale(2),

    @Column(name = "actual_cash_amount", precision = 12, scale = 2)
    var actualCashAmount: BigDecimal? = null,

    @Column(name = "card_amount", nullable = false, precision = 12, scale = 2)
    var cardAmount: BigDecimal = BigDecimal.ZERO.setScale(2),

    @Column(name = "transfer_amount", nullable = false, precision = 12, scale = 2)
    var transferAmount: BigDecimal = BigDecimal.ZERO.setScale(2),

    @Column(name = "discrepancy", precision = 12, scale = 2)
    var discrepancy: BigDecimal? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: ShiftStatus = ShiftStatus.OPEN,

    @Column(name = "closure_notes")
    var closureNotes: String? = null
) : BaseTenantEntity()
