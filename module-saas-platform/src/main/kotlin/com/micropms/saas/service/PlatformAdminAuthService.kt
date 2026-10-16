package com.micropms.saas.service

import com.micropms.common.dto.AuthResponseDto
import com.micropms.common.dto.LoginRequestDto
import com.micropms.common.dto.UserProfileDto
import com.micropms.common.exception.ResourceNotFoundException
import com.micropms.multitenancy.security.AuthUserType
import com.micropms.multitenancy.security.JwtTokenProvider
import com.micropms.saas.entity.PlatformAdmin
import com.micropms.saas.entity.PlatformRole
import com.micropms.saas.repository.PlatformAdminRepository
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.DisabledException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Service managing authentication and identity resolution for Platform Super Administrators.
 * Control Plane only: does not bind or touch tenant context.
 */
@Service
@Transactional(readOnly = true)
class PlatformAdminAuthService(
    private val platformAdminRepository: PlatformAdminRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    private val log = LoggerFactory.getLogger(PlatformAdminAuthService::class.java)

    /**
     * Authenticates a platform super-admin against the platform_admins table.
     * Signs a control-plane JWT with user_type = "PLATFORM_ADMIN" and tenant_id = null.
     */
    fun login(request: LoginRequestDto): AuthResponseDto {
        val normalizedEmail = request.email.trim().lowercase()

        val admin: PlatformAdmin = platformAdminRepository.findByEmail(normalizedEmail)
            .orElseThrow {
                log.warn("Platform admin login failed: Unknown email '{}'", normalizedEmail)
                BadCredentialsException("Invalid platform admin credentials.")
            }

        if (!admin.isActive) {
            log.warn("Platform admin login rejected: Admin '{}' ({}) is deactivated", admin.email, admin.id)
            throw DisabledException("Platform administrator account is deactivated.")
        }

        val matches = passwordEncoder.matches(request.password, admin.passwordHash) ||
                (admin.passwordHash.startsWith("{noop}") && admin.passwordHash.removePrefix("{noop}") == request.password)

        if (!matches) {
            log.warn("Platform admin login failed: Invalid password for '{}'", normalizedEmail)
            BadCredentialsException("Invalid platform admin credentials.")
        }

        val authorities = resolveAuthorities(admin.role)
        val token = jwtTokenProvider.generatePlatformAdminToken(
            adminId = admin.id,
            email = admin.email,
            role = admin.role.name,
            authorities = authorities
        )

        log.info("Platform admin '{}' ({}) authenticated successfully", admin.email, admin.id)

        return AuthResponseDto(
            token = token,
            tokenType = "Bearer",
            expiresIn = jwtTokenProvider.expirationSeconds,
            user = UserProfileDto(
                id = admin.id,
                email = admin.email,
                fullName = admin.fullName,
                role = admin.role.name,
                userType = AuthUserType.PLATFORM_ADMIN.name,
                authorities = authorities,
                tenantId = null,
                tenantSlug = null,
                tenantName = null,
                isActive = admin.isActive
            ),
            tenant = null
        )
    }

    /**
     * Resolves the profile of the currently authenticated platform administrator for /api/platform/auth/me.
     */
    fun getCurrentAdmin(adminId: UUID): UserProfileDto {
        val admin = platformAdminRepository.findById(adminId)
            .orElseThrow { ResourceNotFoundException("Platform administrator not found with ID: $adminId") }

        return UserProfileDto(
            id = admin.id,
            email = admin.email,
            fullName = admin.fullName,
            role = admin.role.name,
            userType = AuthUserType.PLATFORM_ADMIN.name,
            authorities = resolveAuthorities(admin.role),
            tenantId = null,
            tenantSlug = null,
            tenantName = null,
            isActive = admin.isActive
        )
    }

    private fun resolveAuthorities(role: PlatformRole): List<String> = when (role) {
        PlatformRole.SUPER_ADMIN -> listOf(
            "ROLE_SUPER_ADMIN",
            "platform:admin",
            "platform:tenants:manage",
            "platform:tenants:read",
            "platform:impersonate:tenant",
            "platform:subscriptions:manage"
        )
        PlatformRole.SUPPORT_AGENT -> listOf(
            "ROLE_SUPPORT_AGENT",
            "platform:tenants:read",
            "platform:impersonate:tenant"
        )
    }
}
