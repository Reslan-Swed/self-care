package com.micropms.clinic.repository

import com.micropms.clinic.entity.InvoicePayment
import com.micropms.common.repository.BaseRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

@Repository
interface InvoicePaymentRepository : BaseRepository<InvoicePayment, UUID> {
    fun findByInvoiceId(invoiceId: UUID): List<InvoicePayment>

    @Query("""
        SELECT p FROM InvoicePayment p
        WHERE p.receivedBy.id = :receivedById
          AND p.paymentDate >= :start
          AND p.paymentDate <= :end
    """)
    fun findByReceivedByIdAndPaymentDateBetween(
        @Param("receivedById") receivedById: UUID,
        @Param("start") start: Instant,
        @Param("end") end: Instant
    ): List<InvoicePayment>
}
