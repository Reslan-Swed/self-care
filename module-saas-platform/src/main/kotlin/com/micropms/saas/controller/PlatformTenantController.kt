package com.micropms.saas.controller

import com.micropms.common.dto.ApiResponse
import com.micropms.common.exception.ResourceNotFoundException
import com.micropms.saas.dto.GrantCreditsRequest
import com.micropms.saas.dto.RegisterClinicRequest
import com.micropms.saas.dto.SubscriptionSummaryResponse
import com.micropms.saas.dto.TenantDetailResponse
import com.micropms.saas.dto.UpdateSubscriptionPlanRequest
import com.micropms.saas.dto.UpdateTenantStatusRequest
import com.micropms.saas.entity.Tenant
import com.micropms.saas.entity.TenantStatus
import com.micropms.saas.repository.SubscriptionRepository
import com.micropms.saas.repository.TenantRepository
import com.micropms.saas.service.RegisterClinicCommand
import com.micropms.saas.service.SubscriptionEnforcementService
import com.micropms.saas.service.TenantProvisioningService
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Super Admin Control Plane controller for onboarding clinics, inspecting tenant metrics,
 * updating lifecycle statuses, and adjusting subscription plans.
 */
@RestController
@RequestMapping("/api/v1/platform/tenants")
@PreAuthorize("hasAuthority('platform:tenants:manage') or hasAuthority('ROLE_SUPER_ADMIN')")
class PlatformTenantController(
    private val tenantRepository: TenantRepository,
    private val subscriptionRepository: SubscriptionRepository,
    private val provisioningService: TenantProvisioningService,
    private val subscriptionEnforcementService: SubscriptionEnforcementService
) {

    /**
     * Retrieves a paginated list of all platform tenants with optional status filter.
     */
    @GetMapping
    fun listTenants(
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC) pageable: Pageable,
        @RequestParam(required = false) status: TenantStatus?
    ): ResponseEntity<ApiResponse<Page<TenantDetailResponse>>> {
        val tenantsPage = if (status != null) {
            tenantRepository.findByStatus(status, pageable)
        } else {
            tenantRepository.findAll(pageable)
        }

        val mappedPage = tenantsPage.map { mapToTenantDetailResponse(it) }
        return ResponseEntity.ok(ApiResponse.ok(mappedPage, "Tenants list retrieved"))
    }

    /**
     * Retrieves detailed information and active subscription for a specific clinic.
     */
    @GetMapping("/{id}")
    fun getTenantById(@PathVariable id: UUID): ResponseEntity<ApiResponse<TenantDetailResponse>> {
        val tenant = tenantRepository.findById(id).orElseThrow {
            ResourceNotFoundException("Tenant", "id", id)
        }
        return ResponseEntity.ok(ApiResponse.ok(mapToTenantDetailResponse(tenant), "Tenant details retrieved"))
    }

    /**
     * Registers and provisions a new clinic tenant with default 14-day trial subscription.
     */
    @PostMapping
    fun registerClinic(
        @Valid @RequestBody request: RegisterClinicRequest
    ): ResponseEntity<ApiResponse<TenantDetailResponse>> {
        val command = RegisterClinicCommand(
            name = request.name,
            slug = request.slug,
            adminEmail = request.adminEmail,
            initialPassword = request.initialPassword,
            phone = request.phone,
            specialty = request.specialty,
            planCode = request.planCode
        )
        val result = provisioningService.registerClinic(command)
        val response = mapToTenantDetailResponse(result.tenant)

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.created(response, "Clinic provisioned successfully"))
    }

    /**
     * Updates tenant lifecycle status (e.g. SUSPEND, ACTIVE, PAST_DUE).
     */
    @PatchMapping("/{id}/status")
    fun updateStatus(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateTenantStatusRequest
    ): ResponseEntity<ApiResponse<TenantDetailResponse>> {
        subscriptionEnforcementService.updateTenantStatus(id, request.status)
        val tenant = tenantRepository.findById(id).orElseThrow {
            ResourceNotFoundException("Tenant", "id", id)
        }
        return ResponseEntity.ok(ApiResponse.ok(mapToTenantDetailResponse(tenant), "Tenant status updated to ${request.status}"))
    }

    /**
     * Manually grants additional SMS / WhatsApp messaging credits to a clinic.
     */
    @PostMapping("/{id}/credits")
    fun grantCredits(
        @PathVariable id: UUID,
        @Valid @RequestBody request: GrantCreditsRequest
    ): ResponseEntity<ApiResponse<SubscriptionSummaryResponse>> {
        val subscription = subscriptionEnforcementService.grantCredits(id, request.credits)
        val response = SubscriptionSummaryResponse(
            planCode = subscription.plan.code,
            planName = subscription.plan.name,
            maxDoctors = subscription.plan.maxDoctors,
            whatsappEnabled = subscription.plan.whatsappEnabled,
            status = subscription.status,
            currentPeriodEnd = subscription.currentPeriodEnd,
            smsWhatsappCredits = subscription.smsWhatsappCredits
        )
        return ResponseEntity.ok(ApiResponse.ok(response, "Granted ${request.credits} messaging credits"))
    }

    /**
     * Upgrades or alters a clinic's active subscription tier.
     */
    @PutMapping("/{id}/subscription")
    fun updateSubscriptionPlan(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateSubscriptionPlanRequest
    ): ResponseEntity<ApiResponse<SubscriptionSummaryResponse>> {
        val subscription = subscriptionEnforcementService.updateSubscription(id, request.planCode)
        val response = SubscriptionSummaryResponse(
            planCode = subscription.plan.code,
            planName = subscription.plan.name,
            maxDoctors = subscription.plan.maxDoctors,
            whatsappEnabled = subscription.plan.whatsappEnabled,
            status = subscription.status,
            currentPeriodEnd = subscription.currentPeriodEnd,
            smsWhatsappCredits = subscription.smsWhatsappCredits
        )
        return ResponseEntity.ok(ApiResponse.ok(response, "Subscription upgraded to plan '${request.planCode}'"))
    }

    private fun mapToTenantDetailResponse(tenant: Tenant): TenantDetailResponse {
        val subscription = subscriptionRepository.findByTenantId(tenant.id!!).orElse(null)
        val subscriptionSummary = subscription?.let {
            SubscriptionSummaryResponse(
                planCode = it.plan.code,
                planName = it.plan.name,
                maxDoctors = it.plan.maxDoctors,
                whatsappEnabled = it.plan.whatsappEnabled,
                status = it.status,
                currentPeriodEnd = it.currentPeriodEnd,
                smsWhatsappCredits = it.smsWhatsappCredits
            )
        }

        return TenantDetailResponse(
            id = tenant.id!!,
            name = tenant.name,
            slug = tenant.slug,
            phone = tenant.phone,
            status = tenant.status,
            specialty = tenant.specialty,
            adminEmail = tenant.adminEmail,
            subscription = subscriptionSummary,
            createdAt = tenant.createdAt,
            updatedAt = tenant.updatedAt
        )
    }
}
