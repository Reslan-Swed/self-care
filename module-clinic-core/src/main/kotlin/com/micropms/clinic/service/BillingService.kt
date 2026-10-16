package com.micropms.clinic.service

import com.micropms.clinic.dto.CreateInvoiceCommand
import com.micropms.clinic.dto.InvoiceResponseDto
import com.micropms.clinic.dto.PaymentResponseDto
import com.micropms.clinic.entity.Invoice
import com.micropms.clinic.entity.InvoicePayment
import com.micropms.clinic.entity.InvoiceStatus
import com.micropms.clinic.entity.PaymentMethod
import com.micropms.clinic.entity.User
import com.micropms.clinic.repository.EncounterRepository
import com.micropms.clinic.repository.InvoicePaymentRepository
import com.micropms.clinic.repository.InvoiceRepository
import com.micropms.clinic.repository.PatientRepository
import com.micropms.clinic.repository.UserRepository
import com.micropms.common.exception.ResourceNotFoundException
import com.micropms.multitenancy.security.TenantAuthenticationToken
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.Instant
import java.time.format.DateTimeFormatter
import java.util.UUID

/**
 * Service managing billing invoices, ledger charges, and atomic payment recordings
 * with pessimistic locking guarantees.
 */
@Service
@Transactional(readOnly = true)
class BillingService(
    private val invoiceRepository: InvoiceRepository,
    private val invoicePaymentRepository: InvoicePaymentRepository,
    private val patientRepository: PatientRepository,
    private val encounterRepository: EncounterRepository,
    private val userRepository: UserRepository
) {

    private val log = LoggerFactory.getLogger(BillingService::class.java)

    /**
     * Initializes a new billing invoice for a patient visit or clinical encounter.
     */
    @Transactional
    fun createInvoice(command: CreateInvoiceCommand): InvoiceResponseDto {
        val patient = patientRepository.findById(command.patientId)
            .orElseThrow { ResourceNotFoundException("Patient not found with ID: ${command.patientId}") }

        val encounter = command.encounterId?.let { encId ->
            encounterRepository.findById(encId)
                .orElseThrow { ResourceNotFoundException("Encounter not found with ID: $encId") }
        }

        val invoiceNumber = generateInvoiceNumber()

        val invoice = Invoice(
            patient = patient,
            encounter = encounter,
            invoiceNumber = invoiceNumber,
            totalAmount = command.totalAmount.setScale(2),
            paidAmount = BigDecimal.ZERO.setScale(2),
            status = InvoiceStatus.UNPAID,
            notes = command.notes?.trim()
        )

        val saved = invoiceRepository.save(invoice)
        log.info("Created invoice {} ({}) for patient {} - Total: {}", saved.id, saved.invoiceNumber, patient.id, saved.totalAmount)
        return toDto(saved)
    }

    /**
     * Records a payment against an invoice under an exclusive pessimistic write lock.
     * Prevents race conditions and double-payment bugs.
     */
    @Transactional
    fun recordPayment(
        invoiceId: UUID,
        amount: BigDecimal,
        method: PaymentMethod,
        notes: String?
    ): InvoiceResponseDto {
        // 1. Acquire exclusive PESSIMISTIC_WRITE lock on the target invoice
        val invoice = invoiceRepository.findByIdWithLock(invoiceId)
            .orElseThrow { ResourceNotFoundException("Invoice not found with ID: $invoiceId") }

        // 2. Resolve the receptionist/staff member recording the transaction
        val receivedBy = resolveCurrentStaffUser()

        // 3. Instantiate and apply payment
        val payment = InvoicePayment(
            invoice = invoice,
            amount = amount.setScale(2),
            paymentMethod = method,
            receivedBy = receivedBy,
            notes = notes?.trim(),
            paymentDate = Instant.now()
        )

        invoice.addPayment(payment)
        val updated = invoiceRepository.save(invoice)

        log.info("Recorded payment {} of {} via {} on invoice {} by user {}",
            payment.id, amount, method, invoice.id, receivedBy.id)

        return toDto(updated)
    }

    /**
     * Retrieves an invoice by ID along with its historical payment transactions.
     */
    fun getInvoiceById(id: UUID): InvoiceResponseDto {
        val invoice = invoiceRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Invoice not found with ID: $id") }
        return toDto(invoice)
    }

    private fun resolveCurrentStaffUser(): User {
        val auth = SecurityContextHolder.getContext()?.authentication
        val userId = when (auth) {
            is TenantAuthenticationToken -> auth.userId
            else -> try {
                UUID.fromString(auth?.name ?: "")
            } catch (_: Exception) {
                null
            }
        } ?: throw IllegalStateException("Cannot resolve authenticated staff user recording the payment")

        return userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("Staff user not found with ID: $userId") }
    }

    private fun generateInvoiceNumber(): String {
        val timestamp = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(java.time.ZoneOffset.UTC).format(Instant.now())
        val randomSuffix = UUID.randomUUID().toString().substring(0, 6).uppercase()
        return "INV-$timestamp-$randomSuffix"
    }

    private fun toDto(invoice: Invoice): InvoiceResponseDto {
        val payments = invoice.payments.map { p ->
            PaymentResponseDto(
                id = p.id,
                amount = p.amount,
                paymentMethod = p.paymentMethod,
                receivedById = p.receivedBy.id,
                receivedByName = p.receivedBy.fullName,
                notes = p.notes,
                paymentDate = p.paymentDate
            )
        }

        return InvoiceResponseDto(
            id = invoice.id,
            invoiceNumber = invoice.invoiceNumber,
            patientId = invoice.patient.id,
            patientName = invoice.patient.fullName,
            encounterId = invoice.encounter?.id,
            totalAmount = invoice.totalAmount,
            paidAmount = invoice.paidAmount,
            balanceDue = invoice.balanceDue,
            status = invoice.status,
            notes = invoice.notes,
            payments = payments,
            createdAt = invoice.createdAt,
            updatedAt = invoice.updatedAt
        )
    }
}
