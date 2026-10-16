package com.micropms.saas.controller

import com.micropms.common.dto.ApiResponse
import com.micropms.saas.dto.ChangeTenantTierCommand
import com.micropms.saas.dto.GrantCreditsCommand
import com.micropms.saas.dto.PlatformDashboardMetricsDto
import com.micropms.saas.dto.Tenant360ProfileDto
import com.micropms.saas.service.PlatformAnalyticsService
import jakarta.validation.Valid
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
 * Super Admin Control Plane controller for telemetry, high-level business metrics,
 * and Tenant 360 observability across the platform.
 */
@RestController
@RequestMapping("/api/platform/analytics")
class PlatformAnalyticsController(
    private val platformAnalyticsService: PlatformAnalyticsService
) {

    /**
     * Aggregates global SaaS operational and commercial metrics across the entire platform.
     */
    @GetMapping("/dashboard-metrics")
    @PreAuthorize("hasAuthority('platform:subscriptions:manage') or hasAuthority('ROLE_SUPER_ADMIN')")
    fun getDashboardMetrics(): ResponseEntity<ApiResponse<PlatformDashboardMetricsDto>> {
        val metrics = platformAnalyticsService.getDashboardMetrics()
        return ResponseEntity.ok(ApiResponse.ok(metrics, "Platform dashboard metrics retrieved successfully"))
    }

    /**
     * Retrieves holistic 360-degree observability details of a specific tenant workspace.
     */
    @GetMapping("/tenants/{tenantId}/360")
    @PreAuthorize("hasAuthority('platform:tenants:manage') or hasAuthority('ROLE_SUPER_ADMIN')")
    fun getTenant360Profile(
        @PathVariable tenantId: UUID
    ): ResponseEntity<ApiResponse<Tenant360ProfileDto>> {
        val profile = platformAnalyticsService.getTenant360Profile(tenantId)
        return ResponseEntity.ok(ApiResponse.ok(profile, "Tenant 360 profile retrieved successfully"))
    }

    /**
     * Manually overrides a tenant's subscription tier and clears Redis cache.
     */
    @PostMapping("/tenants/{tenantId}/change-tier")
    @PreAuthorize("hasAuthority('platform:subscriptions:manage') or hasAuthority('ROLE_SUPER_ADMIN')")
    fun changeTenantTier(
        @PathVariable tenantId: UUID,
        @Valid @RequestBody command: ChangeTenantTierCommand
    ): ResponseEntity<ApiResponse<Tenant360ProfileDto>> {
        val updatedProfile = platformAnalyticsService.updateTenantTier(tenantId, command.newPlanCode)
        return ResponseEntity.ok(ApiResponse.ok(updatedProfile, "Tenant subscription tier updated successfully"))
    }

    /**
     * Grants bonus WhatsApp / SMS messaging credits to a tenant.
     */
    @PostMapping("/tenants/{tenantId}/grant-credits")
    @PreAuthorize("hasAuthority('platform:tenants:manage') or hasAuthority('ROLE_SUPER_ADMIN')")
    fun grantCredits(
        @PathVariable tenantId: UUID,
        @Valid @RequestBody command: GrantCreditsCommand
    ): ResponseEntity<ApiResponse<Tenant360ProfileDto>> {
        val updatedProfile = platformAnalyticsService.grantWhatsappCredits(tenantId, command.bonusCredits)
        return ResponseEntity.ok(ApiResponse.ok(updatedProfile, "Bonus WhatsApp credits granted successfully"))
    }
}
