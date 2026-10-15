package com.micropms.common.exception

import com.micropms.common.dto.ApiErrorResponse
import com.micropms.common.dto.FieldErrorDto
import jakarta.validation.ConstraintViolationException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.Instant

/**
 * Global REST exception handler mapping platform and validation exceptions
 * to standardized ApiErrorResponse envelopes. Enforces clinical privacy by
 * scrubbing PII and sensitive internal details.
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    private val log = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    /**
     * Handles DTO validation errors triggered by @Valid annotations.
     */
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleMethodArgumentNotValid(
        ex: MethodArgumentNotValidException
    ): ResponseEntity<ApiErrorResponse> {
        val fieldErrors = ex.bindingResult.fieldErrors.map { fieldError ->
            FieldErrorDto(
                field = fieldError.field,
                rejectedValue = fieldError.rejectedValue?.toString(),
                message = fieldError.defaultMessage ?: "Invalid value"
            )
        }

        val errorResponse = ApiErrorResponse(
            code = HttpStatus.BAD_REQUEST.value(),
            message = "Validation failed for ${fieldErrors.size} field(s)",
            errors = fieldErrors,
            timestamp = Instant.now()
        )

        log.warn("Validation error encountered on endpoint: {} field(s) rejected", fieldErrors.size)
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse)
    }

    /**
     * Handles direct parameter or entity constraint violations.
     */
    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolation(
        ex: ConstraintViolationException
    ): ResponseEntity<ApiErrorResponse> {
        val errors = ex.constraintViolations.map { violation ->
            FieldErrorDto(
                field = violation.propertyPath.toString(),
                rejectedValue = violation.invalidValue?.toString(),
                message = violation.message
            )
        }

        val response = ApiErrorResponse(
            code = HttpStatus.BAD_REQUEST.value(),
            message = "Constraint violation occurred",
            errors = errors,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
    }

    /**
     * Handles domain resource lookup failures.
     */
    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleResourceNotFound(
        ex: ResourceNotFoundException
    ): ResponseEntity<ApiErrorResponse> {
        val response = ApiErrorResponse(
            code = HttpStatus.NOT_FOUND.value(),
            message = ex.message ?: "Requested resource not found",
            errors = null,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response)
    }

    /**
     * Handles Spring Security access denial (RBAC / tenant isolation violations).
     */
    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(
        ex: AccessDeniedException
    ): ResponseEntity<ApiErrorResponse> {
        log.warn("Access denied for security context: insufficient authorities or unauthorized tenant access")
        val response = ApiErrorResponse(
            code = HttpStatus.FORBIDDEN.value(),
            message = "Access denied: insufficient permissions to access this clinical or administrative resource",
            errors = null,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response)
    }

    /**
     * Handles subscription quota limit violations (e.g. max doctors exceeded).
     */
    @ExceptionHandler(QuotaExceededException::class)
    fun handleQuotaExceeded(
        ex: QuotaExceededException
    ): ResponseEntity<ApiErrorResponse> {
        log.warn("Subscription quota violation: {}", ex.message)
        val response = ApiErrorResponse(
            code = HttpStatus.UNPROCESSABLE_ENTITY.value(),
            message = ex.message ?: "Subscription plan quota exceeded",
            errors = null,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(response)
    }

    /**
     * Handles illegal argument and invalid state transitions.
     */
    @ExceptionHandler(IllegalArgumentException::class, IllegalStateException::class)
    fun handleIllegalState(
        ex: RuntimeException
    ): ResponseEntity<ApiErrorResponse> {
        log.warn("Client state violation: {}", ex.message)
        val response = ApiErrorResponse(
            code = HttpStatus.BAD_REQUEST.value(),
            message = ex.message ?: "Invalid request state",
            errors = null,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
    }

    /**
     * Fallback for uncaught system exceptions. Sanitizes messages to prevent
     * stack trace leakage or internal schema exposure.
     */
    @ExceptionHandler(Exception::class)
    fun handleGenericException(
        ex: Exception
    ): ResponseEntity<ApiErrorResponse> {
        log.error("Internal platform error occurred: {}", ex.javaClass.simpleName, ex)
        val response = ApiErrorResponse(
            code = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            message = "An unexpected error occurred while processing the request. Contact support with the reference timestamp.",
            errors = null,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response)
    }
}
