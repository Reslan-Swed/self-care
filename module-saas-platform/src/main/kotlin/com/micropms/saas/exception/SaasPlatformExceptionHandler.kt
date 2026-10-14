package com.micropms.saas.exception

import com.micropms.common.dto.ApiErrorResponse
import org.slf4j.LoggerFactory
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.Instant

/**
 * Controller advice handling SaaS Platform specific domain exceptions
 * and mapping them to standardized ApiErrorResponse envelopes.
 */
@RestControllerAdvice(basePackages = ["com.micropms.saas"])
@Order(Ordered.HIGHEST_PRECEDENCE)
class SaasPlatformExceptionHandler {

    private val log = LoggerFactory.getLogger(SaasPlatformExceptionHandler::class.java)

    @ExceptionHandler(SlugAlreadyExistsException::class)
    fun handleSlugAlreadyExists(ex: SlugAlreadyExistsException): ResponseEntity<ApiErrorResponse> {
        log.warn("Subdomain conflict: {}", ex.message)
        val response = ApiErrorResponse(
            code = HttpStatus.CONFLICT.value(),
            message = ex.message ?: "Subdomain slug already exists",
            errors = null,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response)
    }

    @ExceptionHandler(QuotaExceededException::class)
    fun handleQuotaExceeded(ex: QuotaExceededException): ResponseEntity<ApiErrorResponse> {
        log.warn("Quota exceeded: {}", ex.message)
        val response = ApiErrorResponse(
            code = HttpStatus.BAD_REQUEST.value(),
            message = ex.message ?: "Quota limit exceeded",
            errors = null,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
    }

    @ExceptionHandler(InvalidSubscriptionStateException::class)
    fun handleInvalidSubscriptionState(ex: InvalidSubscriptionStateException): ResponseEntity<ApiErrorResponse> {
        log.warn("Subscription state error: {}", ex.message)
        val response = ApiErrorResponse(
            code = HttpStatus.BAD_REQUEST.value(),
            message = ex.message ?: "Invalid subscription state",
            errors = null,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response)
    }

    @ExceptionHandler(UnauthorizedImpersonationException::class)
    fun handleUnauthorizedImpersonation(ex: UnauthorizedImpersonationException): ResponseEntity<ApiErrorResponse> {
        log.error("Security alert: unauthorized impersonation attempt: {}", ex.message)
        val response = ApiErrorResponse(
            code = HttpStatus.FORBIDDEN.value(),
            message = ex.message ?: "Unauthorized impersonation attempt",
            errors = null,
            timestamp = Instant.now()
        )
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response)
    }
}
