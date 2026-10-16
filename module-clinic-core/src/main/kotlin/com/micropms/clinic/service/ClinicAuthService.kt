package com.micropms.clinic.service

import com.micropms.clinic.entity.User
import com.micropms.clinic.repository.UserRepository
import com.micropms.common.dto.AuthResponseDto
import com.micropms.common.dto.LoginRequestDto
import com.micropms.common.dto.TenantSummaryDto
import com.micropms.common.dto.UserProfileDto
import com.micropms.common.exception.ResourceNotFoundException
import com.micropms.common.tenant.TenantLookupPort
import com.micropms.common.tenant.TenantSummary
import com.micropms.multitenancy.context.TenantContext
import com.micropms.multitenancy.security.AuthUserType
import com.micropms.multitenancy.security.JwtTokenProvider
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.DisabledException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Service managing clinic staff authentication, credentials verification,
 * and current user profile session bootstrap (/me endpoint).
 */
@Service
@Transactional(readOnly = true)
class ClinicAuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    @Autowired(required = false)
    private val tenantLookupPort: TenantLookupPort? = null
) {

    private val log = LoggerFactory.getLogger(ClinicAuthService::class.java)

    /**
     * Authenticates clinic staff against their tenant's isolated user pool.
     * Validates tenant status, verifies BCrypt password hash, enforces isActive,
     * and signs an application-plane JWT.
     */
    fun login(request: LoginRequestDto, tenantSlugHeader: String? = null): AuthResponseDto {
        val slug = request.tenantSlug?.trim()?.lowercase()
            ?: tenantSlugHeader?.trim()?.lowercase()
            ?: throw IllegalArgumentException("Tenant slug must be provided via request body or 'X-Tenant-Slug' header.")

        // 1. Resolve and validate tenant status
        val tenantInfo: TenantSummary = tenantLookupPort?.findBySlug(slug)
            ?: TenantSummary(
                id = UUID.nameUUIDFromBytes(slug.toByteArray()),
                slug = slug,
                name = slug.replace("-", " ").replaceFirstChar { it.uppercase() },
                status = "ACTIVE",
                isActive = true
            )

        if (!tenantInfo.isActive) {
            log.warn("Login denied: Tenant '{}' ({}) is inactive or suspended", slug, tenantInfo.id)
            throw DisabledException("Clinic workspace '$slug' is inactive or suspended.")
        }

        val tenantId = tenantInfo.id
        val normalizedEmail = request.email.trim().lowercase()

        // 2. Query user inside tenant scope
        val user: User = TenantContext.runWithTenant(tenantId) {
            userRepository.findByEmail(normalizedEmail).orElseThrow {
                log.warn("Login failed: User '{}' not found in tenant '{}'", normalizedEmail, slug)
                BadCredentialsException("Invalid email or password.")
            }
        }

        // 3. Verify user active status
        if (!user.isActive) {
            log.warn("Login denied: User '{}' in tenant '{}' is deactivated", normalizedEmail, slug)
            throw DisabledException("Account is deactivated. Please contact your clinic administrator.")
        }

        // 4. Verify password hash
        val matches = passwordEncoder.matches(request.password, user.passwordHash) ||
                (user.passwordHash.startsWith("{noop}") && user.passwordHash.removePrefix("{noop}") == request.password)

        if (!matches) {
            log.warn("Login failed: Invalid credentials for user '{}' in tenant '{}'", normalizedEmail, slug)
            throw BadCredentialsException("Invalid email or password.")
        }

        // 5. Generate cryptographically signed JWT
        val authorities = user.role.authorities()
        val token = jwtTokenProvider.generateTenantUserToken(
            userId = user.id,
            tenantId = tenantId,
            email = user.email,
            role = user.role.name,
            authorities = authorities,
            tenantSlug = tenantInfo.slug
        )

        log.info("Successful login for user {} ({}) in clinic '{}'", user.id, user.role, slug)

        return AuthResponseDto(
            token = token,
            tokenType = "Bearer",
            expiresIn = jwtTokenProvider.expirationSeconds,
            user = UserProfileDto(
                id = user.id,
                email = user.email,
                fullName = user.fullName,
                role = user.role.name,
                userType = AuthUserType.TENANT_USER.name,
                authorities = authorities,
                phone = user.phone,
                specialty = user.specialty,
                licenseNumber = user.licenseNumber,
                tenantId = tenantId,
                tenantSlug = tenantInfo.slug,
                tenantName = tenantInfo.name,
                isActive = user.isActive
            ),
            tenant = TenantSummaryDto(
                id = tenantInfo.id,
                name = tenantInfo.name,
                slug = tenantInfo.slug,
                status = tenantInfo.status,
                specialty = tenantInfo.specialty
            )
        )
    }

    /**
     * Resolves the full profile of the currently authenticated clinic staff member
     * for frontend state bootstrap and permission initialization (/me endpoint).
     */
    fun getCurrentUser(userId: UUID, tenantId: UUID): UserProfileDto {
        val user: User = TenantContext.runWithTenant(tenantId) {
            userRepository.findById(userId).orElseThrow {
                ResourceNotFoundException("Staff user not found with ID: $userId")
            }
        }

        val tenantInfo = tenantLookupPort?.findById(tenantId)

        return UserProfileDto(
            id = user.id,
            email = user.email,
            fullName = user.fullName,
            role = user.role.name,
            userType = AuthUserType.TENANT_USER.name,
            authorities = user.role.authorities(),
            phone = user.phone,
            specialty = user.specialty,
            licenseNumber = user.licenseNumber,
            tenantId = tenantId,
            tenantSlug = tenantInfo?.slug,
            tenantName = tenantInfo?.name,
            isActive = user.isActive
        )
    }
}
