package com.micropms.common.dto

import java.time.Instant

/**
 * Standardized unified REST response envelope for all successful operations.
 */
data class ApiResponse<T>(
    val code: Int,
    val message: String,
    val data: T?,
    val timestamp: Instant = Instant.now()
) {
    companion object {
        fun <T> ok(data: T?, message: String = "Record retrieved"): ApiResponse<T> =
            ApiResponse(
                code = 200,
                message = message,
                data = data,
                timestamp = Instant.now()
            )

        fun <T> created(data: T?, message: String = "Record created"): ApiResponse<T> =
            ApiResponse(
                code = 201,
                message = message,
                data = data,
                timestamp = Instant.now()
            )

        fun okNoContent(message: String = "Operation completed successfully"): ApiResponse<Unit> =
            ApiResponse(
                code = 200,
                message = message,
                data = null,
                timestamp = Instant.now()
            )
    }
}
