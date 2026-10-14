package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

enum class InvoiceStatus {
    DRAFT,
    ISSUED,
    PARTIALLY_PAID,
    PAID,
    VOID,
    OVERDUE
}

enum class PaymentMethod {
    CASH,
    CREDIT_CARD,
    DEBIT_CARD,
    INSURANCE,
    BANK_TRANSFER
}

/**
 * Application Plane entity representing a billing invoice and payment ledger.
 * Extends BaseTenantEntity to enforce tenant scoping and PostgreSQL RLS.
 * Accessible to receptionists, billing officers, and practice administrators.
 */
@Entity
@Table(name = "clinic_invoices")
class Invoice(
    @Column(name = "invoice_number", nullable = false)
    var invoiceNumber: String,

    @Column(name = "patient_id", nullable = false)
    var patientId: UUID,

    @Column(name = "encounter_id")
    var encounterId: UUID? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: InvoiceStatus = InvoiceStatus.DRAFT,

    @Column(name = "total_amount_cents", nullable = false)
    var totalAmountCents: Long = 0L,

    @Column(name = "paid_amount_cents", nullable = false)
    var paidAmountCents: Long = 0L,

    @Column(name = "currency", nullable = false)
    var currency: String = "USD",

    @Column(name = "issue_date", nullable = false)
    var issueDate: Instant = Instant.now(),

    @Column(name = "due_date", nullable = false)
    var dueDate: Instant = Instant.now().plusSeconds(86400 * 30),

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    var paymentMethod: PaymentMethod? = null,

    @Column(name = "notes")
    var notes: String? = null
) : BaseTenantEntity() {

    val balanceDueCents: Long
        get() = maxOf(0L, totalAmountCents - paidAmountCents)

    /**
     * Applies a payment transaction, updating balance and state atomically.
     */
    fun applyPayment(amountCents: Long, method: PaymentMethod) {
        require(amountCents > 0) { "Payment amount must be greater than zero cents" }
        require(balanceDueCents > 0) { "Invoice has already been settled in full" }

        val newPaid = paidAmountCents + amountCents
        require(newPaid <= totalAmountCents) {
            "Payment amount ($amountCents cents) exceeds outstanding balance ($balanceDueCents cents)"
        }

        paidAmountCents = newPaid
        paymentMethod = method
        status = if (paidAmountCents == totalAmountCents) {
            InvoiceStatus.PAID
        } else {
            InvoiceStatus.PARTIALLY_PAID
        }
    }
}
