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
import java.time.Instant
import java.util.UUID

enum class InvoiceStatus {
    UNPAID,
    PARTIAL,
    PAID,
    CANCELLED
}

enum class PaymentMethod {
    CASH,
    CARD,
    TRANSFER
}

/**
 * Application Plane entity representing a clinical billing invoice and payment ledger.
 * Extends BaseTenantEntity to enforce tenant scoping with PostgreSQL RLS.
 */
@Entity
@Table(name = "clinic_invoices")
class Invoice(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    var patient: Patient,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_id")
    var encounter: Encounter? = null,

    @Column(name = "invoice_number", nullable = false)
    var invoiceNumber: String,

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    var totalAmount: BigDecimal,

    @Column(name = "paid_amount", nullable = false, precision = 12, scale = 2)
    var paidAmount: BigDecimal = BigDecimal.ZERO.setScale(2),

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: InvoiceStatus = InvoiceStatus.UNPAID,

    @Column(name = "notes")
    var notes: String? = null,

    @OneToMany(mappedBy = "invoice", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var payments: MutableList<InvoicePayment> = mutableListOf()
) : BaseTenantEntity() {

    val balanceDue: BigDecimal
        get() = (totalAmount - paidAmount).max(BigDecimal.ZERO).setScale(2)

    /**
     * Atomically adds payment record and updates paidAmount and status.
     */
    fun addPayment(payment: InvoicePayment) {
        require(payment.amount > BigDecimal.ZERO) { "Payment amount must be greater than 0" }
        require(status != InvoiceStatus.PAID && status != InvoiceStatus.CANCELLED) {
            "Cannot record payment for an invoice with status $status"
        }

        payments.add(payment)
        payment.invoice = this

        val newPaid = paidAmount.add(payment.amount).setScale(2)
        paidAmount = newPaid

        status = if (paidAmount >= totalAmount) {
            InvoiceStatus.PAID
        } else {
            InvoiceStatus.PARTIAL
        }
    }

    // Compatibility accessors
    val patientId: UUID get() = patient.id
    val encounterId: UUID? get() = encounter?.id
    val totalAmountCents: Long get() = totalAmount.multiply(BigDecimal(100)).toLong()
    val paidAmountCents: Long get() = paidAmount.multiply(BigDecimal(100)).toLong()
    val balanceDueCents: Long get() = balanceDue.multiply(BigDecimal(100)).toLong()
}
