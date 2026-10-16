package com.micropms.clinic.controller

import com.micropms.clinic.dto.CreateInvoiceCommand
import com.micropms.clinic.dto.InvoiceResponseDto
import com.micropms.clinic.dto.RecordPaymentCommand
import com.micropms.clinic.service.BillingService
import com.micropms.common.dto.ApiResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Controller managing clinical invoices and payment collections.
 * Enforces method-level fine-grained RBAC security.
 */
@RestController
@RequestMapping("/api/billing")
class BillingController(
    private val billingService: BillingService
) {

    /**
     * Creates a new clinical billing invoice for a patient.
     */
    @PostMapping("/invoices")
    @PreAuthorize("hasAuthority('billing:invoice:create')")
    fun createInvoice(
        @Valid @RequestBody command: CreateInvoiceCommand
    ): ResponseEntity<ApiResponse<InvoiceResponseDto>> {
        val invoice = billingService.createInvoice(command)
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse(
                code = 201,
                message = "Invoice created successfully",
                data = invoice
            )
        )
    }

    /**
     * Records a payment against an invoice under an exclusive pessimistic lock.
     */
    @PostMapping("/invoices/{id}/payments")
    @PreAuthorize("hasAuthority('billing:payment:collect')")
    fun recordPayment(
        @PathVariable id: UUID,
        @Valid @RequestBody command: RecordPaymentCommand
    ): ResponseEntity<ApiResponse<InvoiceResponseDto>> {
        val invoice = billingService.recordPayment(
            invoiceId = id,
            amount = command.amount,
            method = command.paymentMethod,
            notes = command.notes
        )
        return ResponseEntity.ok(
            ApiResponse(
                code = 200,
                message = "Payment of ${command.amount} recorded successfully via ${command.paymentMethod}",
                data = invoice
            )
        )
    }

    /**
     * Retrieves invoice details and transaction ledger history.
     */
    @GetMapping("/invoices/{id}")
    @PreAuthorize("hasAnyAuthority('billing:invoice:create', 'billing:payment:collect')")
    fun getInvoice(
        @PathVariable id: UUID
    ): ResponseEntity<ApiResponse<InvoiceResponseDto>> {
        val invoice = billingService.getInvoiceById(id)
        return ResponseEntity.ok(
            ApiResponse(
                code = 200,
                message = "Invoice details retrieved successfully",
                data = invoice
            )
        )
    }
}
