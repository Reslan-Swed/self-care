package com.micropms.clinic.service

import com.micropms.clinic.dto.DailyShiftSummaryDto
import com.micropms.clinic.dto.DateRangeDto
import com.micropms.clinic.entity.PaymentMethod
import com.micropms.clinic.entity.ShiftSettlement
import com.micropms.clinic.entity.ShiftStatus
import com.micropms.clinic.entity.User
import com.micropms.clinic.repository.InvoicePaymentRepository
import com.micropms.clinic.repository.ShiftSettlementRepository
import com.micropms.clinic.repository.UserRepository
import com.micropms.common.exception.ResourceNotFoundException
import com.micropms.multitenancy.security.TenantAuthenticationToken
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

/**
 * Service managing receptionist cash drawer shifts, end-of-day settlement reconciliation,
 * discrepancy computation, and administrative financial auditing.
 */
@Service
@Transactional(readOnly = true)
class ShiftSettlementService(
    private val shiftSettlementRepository: ShiftSettlementRepository,
    private val invoicePaymentRepository: InvoicePaymentRepository,
    private val userRepository: UserRepository
) {

    private val log = LoggerFactory.getLogger(ShiftSettlementService::class.java)

    /**
     * Retrieves the current receptionist's active OPEN shift, or initializes a new one
     * if no open shift exists for today.
     */
    @Transactional
    fun getActiveShift(): DailyShiftSummaryDto {
        val receptionist = resolveCurrentStaffUser()

        val shift = shiftSettlementRepository.findFirstByReceptionistIdAndStatusOrderByOpenedAtDesc(
            receptionist.id,
            ShiftStatus.OPEN
        ).orElseGet {
            log.info("Opening new shift drawer for receptionist {} ({})", receptionist.fullName, receptionist.id)
            val newShift = ShiftSettlement(
                receptionist = receptionist,
                openedAt = Instant.now(),
                status = ShiftStatus.OPEN
            )
            shiftSettlementRepository.save(newShift)
        }

        return computeLiveShiftSummary(shift)
    }

    /**
     * Closes the active shift, aggregates payments collected since openedAt,
     * computes cash drawer discrepancies, marks status as CLOSED, and returns the final settlement summary.
     */
    @Transactional
    fun closeShift(actualCashAmount: BigDecimal, notes: String?): DailyShiftSummaryDto {
        val receptionist = resolveCurrentStaffUser()
        val now = Instant.now()

        val shift = shiftSettlementRepository.findFirstByReceptionistIdAndStatusOrderByOpenedAtDesc(
            receptionist.id,
            ShiftStatus.OPEN
        ).orElseThrow {
            IllegalStateException("No active OPEN shift found for receptionist ${receptionist.fullName}. Please open a shift first.")
        }

        // 1. Query all payments collected by this receptionist during this shift window
        val payments = invoicePaymentRepository.findByReceivedByIdAndPaymentDateBetween(
            receptionist.id,
            shift.openedAt,
            now
        )

        // 2. Aggregate by payment method
        val expectedCash = payments.filter { it.paymentMethod == PaymentMethod.CASH }
            .map { it.amount }
            .fold(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2)

        val cardAmount = payments.filter { it.paymentMethod == PaymentMethod.CARD }
            .map { it.amount }
            .fold(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2)

        val transferAmount = payments.filter { it.paymentMethod == PaymentMethod.TRANSFER }
            .map { it.amount }
            .fold(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2)

        // 3. Compute discrepancy = actualCash - expectedCash
        val discrepancy = actualCashAmount.setScale(2).subtract(expectedCash)

        // 4. Update shift record
        shift.closedAt = now
        shift.expectedCashAmount = expectedCash
        shift.actualCashAmount = actualCashAmount.setScale(2)
        shift.cardAmount = cardAmount
        shift.transferAmount = transferAmount
        shift.discrepancy = discrepancy
        shift.status = ShiftStatus.CLOSED
        shift.closureNotes = notes?.trim()

        val saved = shiftSettlementRepository.save(shift)

        log.info("CLOSED SHIFT {} for {}: Expected Cash={}, Actual Cash={}, Discrepancy={}",
            saved.id, receptionist.fullName, expectedCash, actualCashAmount, discrepancy)

        val totalCollected = actualCashAmount.add(cardAmount).add(transferAmount).setScale(2)

        return DailyShiftSummaryDto(
            id = saved.id,
            receptionistId = receptionist.id,
            receptionistName = receptionist.fullName,
            openedAt = saved.openedAt,
            closedAt = saved.closedAt,
            expectedCashAmount = expectedCash,
            actualCashAmount = actualCashAmount.setScale(2),
            cardAmount = cardAmount,
            transferAmount = transferAmount,
            totalCollected = totalCollected,
            discrepancy = discrepancy,
            status = saved.status,
            transactionCount = payments.size,
            closureNotes = saved.closureNotes
        )
    }

    /**
     * Auditing endpoint for CLINIC_ADMIN to inspect historical shift reconciliations.
     */
    fun getShiftReports(dateRange: DateRangeDto): List<DailyShiftSummaryDto> {
        val end = dateRange.endDate ?: Instant.now()
        val start = dateRange.startDate ?: end.minus(30, ChronoUnit.DAYS)

        val shifts = shiftSettlementRepository.findByOpenedAtBetweenOrderByOpenedAtDesc(start, end)
        return shifts.map { computeLiveShiftSummary(it) }
    }

    private fun computeLiveShiftSummary(shift: ShiftSettlement): DailyShiftSummaryDto {
        val windowEnd = shift.closedAt ?: Instant.now()
        val payments = invoicePaymentRepository.findByReceivedByIdAndPaymentDateBetween(
            shift.receptionist.id,
            shift.openedAt,
            windowEnd
        )

        val expectedCash = payments.filter { it.paymentMethod == PaymentMethod.CASH }
            .map { it.amount }
            .fold(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2)

        val cardAmount = payments.filter { it.paymentMethod == PaymentMethod.CARD }
            .map { it.amount }
            .fold(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2)

        val transferAmount = payments.filter { it.paymentMethod == PaymentMethod.TRANSFER }
            .map { it.amount }
            .fold(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2)

        val actualCash = shift.actualCashAmount
        val discrepancy = shift.discrepancy ?: actualCash?.let { it.subtract(expectedCash) }
        val totalCollected = (actualCash ?: expectedCash).add(cardAmount).add(transferAmount).setScale(2)

        return DailyShiftSummaryDto(
            id = shift.id,
            receptionistId = shift.receptionist.id,
            receptionistName = shift.receptionist.fullName,
            openedAt = shift.openedAt,
            closedAt = shift.closedAt,
            expectedCashAmount = expectedCash,
            actualCashAmount = actualCash,
            cardAmount = cardAmount,
            transferAmount = transferAmount,
            totalCollected = totalCollected,
            discrepancy = discrepancy,
            status = shift.status,
            transactionCount = payments.size,
            closureNotes = shift.closureNotes
        )
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
        } ?: throw IllegalStateException("Cannot resolve authenticated receptionist for shift operations")

        return userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("Staff user not found with ID: $userId") }
    }
}
