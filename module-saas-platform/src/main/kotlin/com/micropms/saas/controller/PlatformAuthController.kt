package com.micropms.saas.controller

import com.micropms.common.dto.ApiResponse
import com.micropms.common.dto.AuthResponseDto
import com.micropms.common.dto.LoginRequestDto
import com.micropms.common.dto.UserProfileDto
import com.micropms.multitenancy.security.TenantAuthenticationToken
import com.micropms.saas.service.PlatformAdminAuthService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Controller managing Platform Administrator authentication and profile lookup.
 * Operates strictly on the SaaS Control Plane.
 */
@RestController
@RequestMapping("/api/platform/auth")
class PlatformAuthController(
    private val platformAdminAuthService: PlatformAdminAuthService
) {

    /**
     * Public authentication endpoint for platform super administrators.
     */
    @PostMapping("/login")
    fun login(
        @Valid @RequestBody request: LoginRequestDto
    ): ResponseEntity<ApiResponse<AuthResponseDto>> {
        val authResult = platformAdminAuthService.login(request)
        return ResponseEntity.ok(
            ApiResponse(
                code = 200,
                message = "Platform admin authentication successful",
                data = authResult
            )
        )
    }

    /**
     * Protected endpoint returning the authenticated platform admin profile.
     */
    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN') or hasAuthority('platform:admin')")
    fun getCurrentAdmin(authentication: Authentication): ResponseEntity<ApiResponse<UserProfileDto>> {
        val adminId = when (authentication) {
            is TenantAuthenticationToken -> authentication.userId
            else -> UUID.fromString(authentication.name)
        }

        val profile = platformAdminAuthService.getCurrentAdmin(adminId)
        return ResponseEntity.ok(
            ApiResponse(
                code = 200,
                message = "Platform admin profile retrieved successfully",
                data = profile
            )
        )
    }
}
