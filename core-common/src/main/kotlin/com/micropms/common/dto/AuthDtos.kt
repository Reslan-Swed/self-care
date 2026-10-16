package com.micropms.common.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

/**
 * Standard credentials payload for both clinic staff and platform administrators.
 */
data class LoginRequestDto(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Must be a valid email address")
    val email: String,

    @field:NotBlank(message = "Password is required")
    val password: String,

    val tenantSlug: String? = null
)

/**
 * Detailed user profile returned upon authentication and for /me endpoints.
 * Never includes password hashes or sensitive security secrets.
 */
data class UserProfileDto(
    val id: UUID,
    val email: String,
    val fullName: String,
    val role: String,
    val userType: String,
    val authorities: List<String>,
    val phone: String? = null,
    val specialty: String? = null,
    val licenseNumber: String? = null,
    val tenantId: UUID? = null,
    val tenantSlug: String? = null,
    val tenantName: String? = null,
    val isActive: Boolean = true
)

/**
 * Tenant metadata associated with the authenticated clinic user.
 */
data class TenantSummaryDto(
    val id: UUID,
    val name: String,
    val slug: String,
    val status: String,
    val specialty: String? = null,
    val subscriptionTier: String? = null
)

/**
 * Standard response payload returned upon successful login or registration.
 */
data class AuthResponseDto(
    val token: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long,
    val user: UserProfileDto,
    val tenant: TenantSummaryDto? = null
)

/**
 * Public self-service registration command to onboard a new clinic practice.
 */
data class RegisterClinicCommand(
    @field:NotBlank(message = "Clinic name is required")
    @field:Size(min = 2, max = 255, message = "Clinic name must be between 2 and 255 characters")
    val clinicName: String,

    @field:NotBlank(message = "Clinic subdomain slug is required")
    @field:Pattern(
        regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
        message = "Slug must contain only lowercase alphanumeric characters and single hyphens"
    )
    @field:Size(min = 3, max = 63, message = "Slug must be between 3 and 63 characters")
    val clinicSlug: String,

    val specialty: String = "GENERAL",
    val planCode: String = "TRIAL",
    val phone: String? = null,

    @field:NotBlank(message = "Administrator full name is required")
    val adminFullName: String,

    @field:NotBlank(message = "Administrator email is required")
    @field:Email(message = "Must be a valid email format")
    val adminEmail: String,

    @field:NotBlank(message = "Administrator password is required")
    @field:Size(min = 8, message = "Password must be at least 8 characters")
    val adminPassword: String,

    val adminPhone: String? = null
)

/**
 * Response payload returned upon successful clinic onboarding.
 */
data class ClinicRegistrationResponseDto(
    val tenantId: UUID,
    val clinicName: String,
    val clinicSlug: String,
    val adminId: UUID,
    val adminEmail: String,
    val adminFullName: String,
    val token: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long,
    val registeredAt: Instant = Instant.now()
)
