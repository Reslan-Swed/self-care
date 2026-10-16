package com.micropms.clinic.controller

import com.micropms.clinic.dto.CloseShiftCommand
import com.micropms.clinic.dto.DailyShiftSummaryDto
import com.micropms.clinic.dto.DateRangeDto
import com.micropms.clinic.service.ShiftSettlementService
import com.micropms.common.dto.ApiResponse
import jakarta.validation.Valid
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.Instant

/**
 * Controller managing daily cash drawer shifts and end-of-day financial settlements.
 */
@RestController
@RequestMapping("/api/billing/shifts")
class ShiftSettlementController(
    private val shiftSettlementService: ShiftSettlementService
) {

    /**
     * Retrieves the active shift balance and live collection totals for the current receptionist.
     */
    @GetMapping("/current")
    @PreAuthorize("hasAuthority('billing:payment:collect')")
    fun getCurrentShift(): ResponseEntity<ApiResponse<DailyShiftSummaryDto>> {
        val shift = shiftSettlementService.getActiveShift()
        return ResponseEntity.ok(
            ApiResponse(
                code = 200,
                message = "Active shift balance retrieved",
                data = shift
            )
        )
    }

    /**
     * Closes the active shift, reconciles cash drawer discrepancy, and generates the final settlement report.
     */
    @PostMapping("/close")
    @PreAuthorize("hasAuthority('billing:shift:close')")
    fun closeShift(
        @Valid @RequestBody command: CloseShiftCommand
    ): ResponseEntity<ApiResponse<DailyShiftSummaryDto>> {
        val settlement = shiftSettlementService.closeShift(
            actualCashAmount = command.actualCashAmount,
            notes = command.notes
        )
        return ResponseEntity.ok(
            ApiResponse(
                code = 200,
                message = "Daily shift closed and reconciled successfully",
                data = settlement
            )
        )
    }

    /**
     * Auditing endpoint strictly restricted to CLINIC_ADMINs to view historical shift reports.
     */
    @GetMapping("/reports")
    @PreAuthorize("hasAuthority('billing:reports:financial')")
    fun getShiftReports(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) startDate: Instant?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) endDate: Instant?
    ): ResponseEntity<ApiResponse<List<DailyShiftSummaryDto>>> {
        val reports = shiftSettlementService.getShiftReports(
            DateRangeDto(startDate = startDate, endDate = endDate)
        )
        return ResponseEntity.ok(
            ApiResponse(
                code = 200,
                message = "Historical shift reports retrieved successfully",
                data = reports
            )
        )
    }
}
