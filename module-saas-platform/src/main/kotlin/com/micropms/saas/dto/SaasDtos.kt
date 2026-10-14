package com.micropms.saas.dto

import com.micropms.saas.entity.SpecialtyType
import com.micropms.saas.entity.SubscriptionStatus
import com.micropms.saas.entity.TenantStatus
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class RegisterClinicRequest(
    @field:NotBlank(message = "Clinic legal or display name cannot be blank")
    val name: String,

    @field:NotBlank(message = "Subdomain slug cannot be blank")
    @field:Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must contain only lowercase alphanumeric characters and hyphens")
    @field:Size(min = 3, max = 63, message = "Slug must be between 3 and 63 characters")
    val slug: String,

    @field:Email(message = "Valid administrator email required")
    @field:NotBlank(message = "Admin email cannot be blank")
    val adminEmail: String,

    val phone: String? = null,
    val initialPassword: String? = null,
    val specialty: SpecialtyType = SpecialtyType.GENERAL,
    val planCode: String = "TRIAL"
)

data class UpdateTenantStatusRequest(
    @field:NotNull(message = "Target status is required")
    val status: TenantStatus
)

data class GrantCreditsRequest(
    @field:Min(value = 1, message = "Credits to grant must be at least 1")
    val credits: Int
)

data class UpdateSubscriptionPlanRequest(
    @field:NotBlank(message = "Plan code is required")
    val planCode: String
)

data class TenantDetailResponse(
    val id: UUID,
    val name: String,
    val slug: String,
    val phone: String?,
    val status: TenantStatus,
    val specialty: SpecialtyType,
    val adminEmail: String,
    val subscription: SubscriptionSummaryResponse?,
    val createdAt: Instant,
    val updatedAt: Instant
)

data class SubscriptionSummaryResponse(
    val planCode: String,
    val planName: String,
    val maxDoctors: Int,
    val whatsappEnabled: Boolean,
    val status: SubscriptionStatus,
    val currentPeriodEnd: Instant,
    val smsWhatsappCredits: Int
)

data class ImpersonateTenantRequest(
    @field:NotNull(message = "Target tenant ID is required")
    val tenantId: UUID,

    @field:NotBlank(message = "Audit justification is mandatory")
    @field:Size(min = 10, max = 1000, message = "Justification must be between 10 and 1000 characters")
    val justification: String
)

data class ImpersonationResponse(
    val token: String,
    val tokenType: String = "Bearer",
    val tenantId: UUID,
    val sessionExpiresAt: Instant,
    val issuedAt: Instant
)

data class AuditImpersonationLogResponse(
    val id: UUID,
    val adminId: UUID,
    val tenantId: UUID,
    val justification: String,
    val ipAddress: String,
    val sessionExpiresAt: Instant,
    val createdAt: Instant
)
