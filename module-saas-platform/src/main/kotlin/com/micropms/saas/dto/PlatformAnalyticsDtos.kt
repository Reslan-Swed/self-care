package com.micropms.saas.dto

import com.micropms.common.dto.TenantSummaryDto
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.time.Instant
import java.util.UUID

data class PlatformDashboardMetricsDto(
    val activeTenantsCount: Long,
    val totalMrrCents: Long,
    val trialTenantsCount: Long,
    val pastDueTenantsCount: Long,
    val renewalRatePercentage: Double,
    val globalWhatsappCreditsUsed: Long,
    val globalWhatsappCreditsTotal: Long
)

data class SubscriptionDetailsDto(
    val planCode: String,
    val planName: String,
    val status: String,
    val priceCents: Int,
    val currentPeriodStart: Instant,
    val currentPeriodEnd: Instant,
    val creditsRemaining: Int
)

data class TenantUsageStatsDto(
    val activeDoctorsCount: Int,
    val maxDoctors: Int,
    val totalEncountersCount: Long,
    val totalStorageBytes: Long
)

data class PlatformBillingRecordDto(
    val id: UUID,
    val invoiceNumber: String,
    val amountCents: Long,
    val status: String,
    val periodStart: Instant,
    val periodEnd: Instant,
    val paidAt: Instant?
)

data class AuditImpersonationLogDto(
    val id: UUID,
    val adminId: UUID,
    val justification: String,
    val ipAddress: String,
    val createdAt: Instant,
    val sessionExpiresAt: Instant
)

data class Tenant360ProfileDto(
    val tenant: TenantSummaryDto,
    val subscription: SubscriptionDetailsDto,
    val usageStats: TenantUsageStatsDto,
    val billingHistory: List<PlatformBillingRecordDto>,
    val recentAuditLogs: List<AuditImpersonationLogDto>
)

data class ChangeTenantTierCommand(
    @field:NotBlank(message = "New plan code is required")
    val newPlanCode: String
)

data class GrantCreditsCommand(
    @field:Min(value = 1, message = "Bonus credits must be at least 1")
    val bonusCredits: Int
)
