package com.micropms.clinic.controller

import com.micropms.clinic.service.ClinicAuthService
import com.micropms.common.dto.ApiResponse
import com.micropms.common.dto.AuthResponseDto
import com.micropms.common.dto.LoginRequestDto
import com.micropms.common.dto.UserProfileDto
import com.micropms.multitenancy.context.TenantContext
import com.micropms.multitenancy.security.TenantAuthenticationToken
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Controller handling clinic staff authentication and session profile resolution.
 */
@RestController
@RequestMapping("/api/auth")
class ClinicAuthController(
    private val clinicAuthService: ClinicAuthService
) {

    /**
     * Authenticates clinic staff (CLINIC_ADMIN, DOCTOR, RECEPTIONIST) and returns signed JWT token.
     */
    @PostMapping("/login")
    fun login(
        @Valid @RequestBody request: LoginRequestDto,
        @RequestHeader(value = "X-Tenant-Slug", required = false) tenantSlugHeader: String?
    ): ResponseEntity<ApiResponse<AuthResponseDto>> {
        val authResult = clinicAuthService.login(request, tenantSlugHeader)
        return ResponseEntity.ok(
            ApiResponse(
                code = 200,
                message = "Authentication successful",
                data = authResult
            )
        )
    }

    /**
     * Retrieves the profile, authorities, and clinic metadata of the authenticated user
     * for frontend state and navigation bootstrap.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    fun getCurrentUser(authentication: Authentication): ResponseEntity<ApiResponse<UserProfileDto>> {
        val userId: UUID
        val tenantId: UUID

        when (authentication) {
            is TenantAuthenticationToken -> {
                userId = authentication.userId
                tenantId = authentication.tenantId
                    ?: TenantContext.getTenantId()
                    ?: throw IllegalStateException("Tenant context not found for authenticated clinic staff")
            }
            else -> {
                userId = UUID.fromString(authentication.name)
                tenantId = TenantContext.requireTenantId()
            }
        }

        val profile = clinicAuthService.getCurrentUser(userId, tenantId)
        return ResponseEntity.ok(
            ApiResponse(
                code = 200,
                message = "Current user profile retrieved successfully",
                data = profile
            )
        )
    }
}
