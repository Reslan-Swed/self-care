package com.micropms.common.dto

import java.time.Instant

/**
 * Detailed validation field error representation.
 */
data class FieldErrorDto(
    val field: String,
    val rejectedValue: Any?,
    val message: String
)

/**
 * Standardized error envelope returned by GlobalExceptionHandler for 4xx/5xx responses.
 */
data class ApiErrorResponse(
    val code: Int,
    val message: String,
    val errors: List<FieldErrorDto>? = null,
    val timestamp: Instant = Instant.now()
) {
    companion object {
        fun of(
            code: Int,
            message: String,
            errors: List<FieldErrorDto>? = null
        ): ApiErrorResponse = ApiErrorResponse(
            code = code,
            message = message,
            errors = errors,
            timestamp = Instant.now()
        )
    }
}
