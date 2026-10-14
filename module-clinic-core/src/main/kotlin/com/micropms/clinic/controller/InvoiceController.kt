package com.micropms.clinic.controller

import com.micropms.common.controller.BaseController
import com.micropms.common.dto.ApiResponse
import com.micropms.common.exception.ResourceNotFoundException
import com.micropms.clinic.entity.Invoice
import com.micropms.clinic.entity.InvoiceStatus
import com.micropms.clinic.entity.PaymentMethod
import com.micropms.clinic.repository.InvoiceRepository
import jakarta.validation.Valid
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.util.UUID

data class InvoiceForm(
    @field:NotBlank(message = "Invoice number is required")
    val invoiceNumber: String,

    @field:NotNull(message = "Patient ID is required")
    val patientId: UUID,

    val encounterId: UUID? = null,
    val status: InvoiceStatus = InvoiceStatus.DRAFT,

    @field:Min(value = 0, message = "Total amount must be non-negative")
    val totalAmountCents: Long = 0L,

    val currency: String = "USD",
    val issueDate: Instant = Instant.now(),
    val dueDate: Instant = Instant.now().plusSeconds(86400 * 30),
    val notes: String? = null
)

data class PaymentForm(
    @field:Min(value = 1, message = "Payment amount must be at least 1 cent")
    val amountCents: Long,

    @field:NotNull(message = "Payment method is required")
    val paymentMethod: PaymentMethod
)

data class InvoiceResponseDto(
    val id: UUID,
    val invoiceNumber: String,
    val patientId: UUID,
    val encounterId: UUID?,
    val status: InvoiceStatus,
    val totalAmountCents: Long,
    val paidAmountCents: Long,
    val balanceDueCents: Long,
    val currency: String,
    val issueDate: Instant,
    val dueDate: Instant,
    val paymentMethod: PaymentMethod?,
    val notes: String?,
    val createdAt: Instant,
    val updatedAt: Instant
)

/**
 * Financial billing and payment ledger controller.
 * Accessible to receptionist and billing authorities.
 * All payment mutations enforce strict @Transactional ACID semantics.
 */
@RestController
@RequestMapping("/api/v1/clinic/invoices")
@PreAuthorize("hasAuthority('BILLING_READ') or hasAuthority('ROLE_RECEPTIONIST') or hasAuthority('ROLE_ADMIN')")
class InvoiceController(
    private val invoiceRepository: InvoiceRepository
) : BaseController<Invoice, UUID, InvoiceForm, InvoiceResponseDto>(
    repository = invoiceRepository,
    resourceName = "Invoice"
) {

    @PreAuthorize("hasAuthority('BILLING_WRITE') or hasAuthority('ROLE_RECEPTIONIST') or hasAuthority('ROLE_ADMIN')")
    @Transactional
    override fun create(form: InvoiceForm) = super.create(form)

    @PreAuthorize("hasAuthority('BILLING_WRITE') or hasAuthority('ROLE_ADMIN')")
    @Transactional
    override fun update(id: UUID, form: InvoiceForm) = super.update(id, form)

    @PreAuthorize("hasAuthority('BILLING_ADMIN')")
    @Transactional
    override fun delete(id: UUID) = super.delete(id)

    /**
     * Executes payment processing with strict ACID transaction guarantees.
     * Updates paid amount, outstanding balance, and transitions status (PARTIALLY_PAID -> PAID).
     */
    @PostMapping("/{id}/payments")
    @PreAuthorize("hasAuthority('BILLING_WRITE') or hasAuthority('ROLE_RECEPTIONIST') or hasAuthority('ROLE_ADMIN')")
    @Transactional
    fun recordPayment(
        @PathVariable id: UUID,
        @Valid @RequestBody payment: PaymentForm
    ): ResponseEntity<ApiResponse<InvoiceResponseDto>> {
        val invoice = invoiceRepository.findById(id).orElseThrow {
            ResourceNotFoundException("Invoice", "id", id)
        }

        invoice.applyPayment(payment.amountCents, payment.paymentMethod)
        val updated = invoiceRepository.save(invoice)

        return ResponseEntity.ok(
            ApiResponse.ok(
                toResponseDto(updated),
                "Payment of ${payment.amountCents} cents processed successfully via ${payment.paymentMethod}"
            )
        )
    }

    override fun toEntity(form: InvoiceForm): Invoice {
        return Invoice(
            invoiceNumber = form.invoiceNumber.trim(),
            patientId = form.patientId,
            encounterId = form.encounterId,
            status = form.status,
            totalAmountCents = form.totalAmountCents,
            paidAmountCents = 0L,
            currency = form.currency.trim().uppercase(),
            issueDate = form.issueDate,
            dueDate = form.dueDate,
            paymentMethod = null,
            notes = form.notes?.trim()
        )
    }

    override fun toResponseDto(entity: Invoice): InvoiceResponseDto {
        return InvoiceResponseDto(
            id = entity.id ?: throw IllegalStateException("Invoice ID unassigned"),
            invoiceNumber = entity.invoiceNumber,
            patientId = entity.patientId,
            encounterId = entity.encounterId,
            status = entity.status,
            totalAmountCents = entity.totalAmountCents,
            paidAmountCents = entity.paidAmountCents,
            balanceDueCents = entity.balanceDueCents,
            currency = entity.currency,
            issueDate = entity.issueDate,
            dueDate = entity.dueDate,
            paymentMethod = entity.paymentMethod,
            notes = entity.notes,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    override fun updateEntityFromForm(entity: Invoice, form: InvoiceForm): Invoice {
        entity.invoiceNumber = form.invoiceNumber.trim()
        entity.totalAmountCents = form.totalAmountCents
        entity.currency = form.currency.trim().uppercase()
        entity.dueDate = form.dueDate
        entity.notes = form.notes?.trim()
        return entity
    }
}
