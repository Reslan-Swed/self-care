package com.micropms.saas.controller

import com.micropms.common.dto.ApiResponse
import com.micropms.common.dto.ClinicRegistrationResponseDto
import com.micropms.common.dto.RegisterClinicCommand
import com.micropms.saas.service.TenantRegistrationService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

/**
 * Public REST Controller for self-service practice onboarding and subdomain verification.
 * Permitted without authentication under /api/public/**.
 */
@RestController
@RequestMapping("/api/public/onboarding")
class PublicOnboardingController(
    private val tenantRegistrationService: TenantRegistrationService
) {

    /**
     * Self-service registration endpoint for new healthcare practices.
     * Atomically creates Tenant, Subscription, initial CLINIC_ADMIN user, and returns active JWT token.
     */
    @PostMapping("/register")
    fun register(
        @Valid @RequestBody command: RegisterClinicCommand
    ): ResponseEntity<ApiResponse<ClinicRegistrationResponseDto>> {
        val result = tenantRegistrationService.registerClinic(command)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(
                ApiResponse(
                    code = 201,
                    message = "Clinic workspace and initial administrator account provisioned successfully",
                    data = result
                )
            )
    }

    /**
     * Real-time validation endpoint for frontend subdomain slug availability check.
     */
    @GetMapping("/check-slug")
    fun checkSlugAvailability(
        @RequestParam slug: String
    ): ResponseEntity<ApiResponse<Map<String, Any>>> {
        val isAvailable = tenantRegistrationService.isSlugAvailable(slug)
        return ResponseEntity.ok(
            ApiResponse(
                code = 200,
                message = if (isAvailable) "Slug is available" else "Slug is unavailable or invalid",
                data = mapOf(
                    "slug" to slug.trim().lowercase(),
                    "available" to isAvailable
                )
            )
        )
    }
}
