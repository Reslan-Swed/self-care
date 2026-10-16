package com.micropms.clinic.repository

import com.micropms.clinic.entity.Invoice
import com.micropms.clinic.entity.InvoiceStatus
import com.micropms.common.repository.BaseRepository
import jakarta.persistence.LockModeType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface InvoiceRepository : BaseRepository<Invoice, UUID> {
    fun findByInvoiceNumber(invoiceNumber: String): Optional<Invoice>
    fun findByPatientId(patientId: UUID, pageable: Pageable): Page<Invoice>
    fun findByPatientId(patientId: UUID): List<Invoice>
    fun findByStatus(status: InvoiceStatus, pageable: Pageable): Page<Invoice>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Invoice i WHERE i.id = :id")
    fun findByIdWithLock(@Param("id") id: UUID): Optional<Invoice>
}
