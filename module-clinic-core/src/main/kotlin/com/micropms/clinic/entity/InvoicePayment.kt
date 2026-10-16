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

/**
 * Application Plane entity recording individual payment transactions collected for an invoice.
 * Extends BaseTenantEntity to enforce tenant scoping with PostgreSQL RLS.
 */
@Entity
@Table(name = "clinic_invoice_payments")
class InvoicePayment(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    var invoice: Invoice,

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    var amount: BigDecimal,

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    var paymentMethod: PaymentMethod,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "received_by", nullable = false)
    var receivedBy: User,

    @Column(name = "notes")
    var notes: String? = null,

    @Column(name = "payment_date", nullable = false)
    var paymentDate: Instant = Instant.now()
) : BaseTenantEntity()
