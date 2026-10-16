package com.micropms.clinic.dto

import com.micropms.clinic.entity.InvoiceStatus
import com.micropms.clinic.entity.PaymentMethod
import com.micropms.clinic.entity.ShiftStatus
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

data class CreateInvoiceCommand(
    @field:NotNull(message = "Patient ID is required")
    val patientId: UUID,

    val encounterId: UUID? = null,

    @field:NotNull(message = "Total amount is required")
    @field:DecimalMin(value = "0.01", message = "Total amount must be greater than zero")
    val totalAmount: BigDecimal,

    val notes: String? = null
)

data class RecordPaymentCommand(
    @field:NotNull(message = "Payment amount is required")
    @field:DecimalMin(value = "0.01", message = "Payment amount must be greater than zero")
    val amount: BigDecimal,

    @field:NotNull(message = "Payment method is required")
    val paymentMethod: PaymentMethod,

    val notes: String? = null
)

data class CloseShiftCommand(
    @field:NotNull(message = "Actual cash counted is required")
    @field:DecimalMin(value = "0.00", message = "Actual cash amount cannot be negative")
    val actualCashAmount: BigDecimal,

    val notes: String? = null
)

data class DateRangeDto(
    val startDate: Instant? = null,
    val endDate: Instant? = null
)

data class PaymentResponseDto(
    val id: UUID,
    val amount: BigDecimal,
    val paymentMethod: PaymentMethod,
    val receivedById: UUID,
    val receivedByName: String,
    val notes: String?,
    val paymentDate: Instant
)

data class InvoiceResponseDto(
    val id: UUID,
    val invoiceNumber: String,
    val patientId: UUID,
    val patientName: String,
    val encounterId: UUID?,
    val totalAmount: BigDecimal,
    val paidAmount: BigDecimal,
    val balanceDue: BigDecimal,
    val status: InvoiceStatus,
    val notes: String?,
    val payments: List<PaymentResponseDto>,
    val createdAt: Instant,
    val updatedAt: Instant
)

data class DailyShiftSummaryDto(
    val id: UUID,
    val receptionistId: UUID,
    val receptionistName: String,
    val openedAt: Instant,
    val closedAt: Instant?,
    val expectedCashAmount: BigDecimal,
    val actualCashAmount: BigDecimal?,
    val cardAmount: BigDecimal,
    val transferAmount: BigDecimal,
    val totalCollected: BigDecimal,
    val discrepancy: BigDecimal?,
    val status: ShiftStatus,
    val transactionCount: Int,
    val closureNotes: String?
)

data class NotificationResultDto(
    val appointmentId: UUID,
    val patientName: String,
    val patientPhone: String,
    val mode: String,
    val message: String,
    val whatsappUrl: String? = null,
    val creditsRemaining: Int? = null,
    val dispatchedAt: Instant = Instant.now()
)
