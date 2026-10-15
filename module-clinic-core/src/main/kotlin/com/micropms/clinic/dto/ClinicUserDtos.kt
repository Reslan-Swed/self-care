package com.micropms.clinic.dto

import com.micropms.clinic.entity.UserRole
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class CreateClinicUserRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Must be a valid email format")
    val email: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 8, message = "Password must be at least 8 characters")
    val password: String,

    @field:NotBlank(message = "Full name is required")
    val fullName: String,

    val phone: String? = null,

    @field:NotNull(message = "User role is required")
    val role: UserRole = UserRole.DOCTOR,

    val specialty: String? = null,
    val licenseNumber: String? = null
)

data class ClinicUserResponseDto(
    val id: UUID,
    val email: String,
    val fullName: String,
    val phone: String?,
    val role: UserRole,
    val specialty: String?,
    val licenseNumber: String?,
    val isActive: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant
)
