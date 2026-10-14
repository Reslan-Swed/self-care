package com.micropms.clinic.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.clinic.entity.Invoice
import com.micropms.clinic.entity.InvoiceStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface InvoiceRepository : BaseRepository<Invoice, UUID> {
    fun findByInvoiceNumber(invoiceNumber: String): Optional<Invoice>
    fun findByPatientId(patientId: UUID, pageable: Pageable): Page<Invoice>
    fun findByStatus(status: InvoiceStatus, pageable: Pageable): Page<Invoice>
}
