package com.micropms.saas.service

import com.micropms.common.dto.ClinicRegistrationResponseDto
import com.micropms.common.dto.RegisterClinicCommand
import com.micropms.common.provisioning.ClinicAdminProvisioner
import com.micropms.common.provisioning.ProvisionClinicAdminCommand
import com.micropms.multitenancy.cache.TenantCacheService
import com.micropms.multitenancy.security.JwtTokenProvider
import com.micropms.saas.entity.SpecialtyType
import com.micropms.saas.entity.Subscription
import com.micropms.saas.entity.SubscriptionPlan
import com.micropms.saas.entity.SubscriptionStatus
import com.micropms.saas.entity.Tenant
import com.micropms.saas.entity.TenantStatus
import com.micropms.saas.event.ClinicProvisionedEvent
import com.micropms.saas.exception.SlugAlreadyExistsException
import com.micropms.saas.repository.SubscriptionPlanRepository
import com.micropms.saas.repository.SubscriptionRepository
import com.micropms.saas.repository.TenantRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.ApplicationEventPublisher
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.Instant
import java.util.UUID

/**
 * Service orchestrating self-service clinic onboarding:
 * 1. Provisions Tenant Control Plane entity with slug uniqueness check.
 * 2. Assigns 14-day evaluation trial subscription.
 * 3. Caches active status in Redis for fast RLS resolution.
 * 4. Invokes ClinicAdminProvisioner SPI to instantiate initial CLINIC_ADMIN staff in Application Plane.
 * 5. Issues immediate, cryptographically signed JWT token for frictionless UX.
 */
@Service
class TenantRegistrationService(
    private val tenantRepository: TenantRepository,
    private val subscriptionPlanRepository: SubscriptionPlanRepository,
    private val subscriptionRepository: SubscriptionRepository,
    private val tenantCacheService: TenantCacheService,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val eventPublisher: ApplicationEventPublisher,
    @Autowired(required = false)
    private val clinicAdminProvisioner: ClinicAdminProvisioner? = null
) {

    private val log = LoggerFactory.getLogger(TenantRegistrationService::class.java)

    companion object {
        private val SLUG_REGEX = Regex("^[a-z0-9]+(?:-[a-z0-9]+)*$")
        private val DEFAULT_ADMIN_AUTHORITIES = listOf(
            "ROLE_CLINIC_ADMIN",
            "clinic:users:manage",
            "clinic:users:read",
            "clinic:eav_fields:manage",
            "appointment:read",
            "appointment:create",
            "appointment:cancel",
            "queue:status:update",
            "patient:basic:read",
            "patient:basic:write",
            "invoice:read",
            "invoice:write"
        )
    }

    /**
     * Atomically registers a new healthcare clinic practice, provisions database metadata,
     * seeds initial administrator credentials, and returns an initial JWT authentication token.
     */
    @Transactional
    fun registerClinic(command: RegisterClinicCommand): ClinicRegistrationResponseDto {
        val sanitizedSlug = command.clinicSlug.trim().lowercase()

        // 1. Slug format validation
        require(sanitizedSlug.matches(SLUG_REGEX)) {
            "Subdomain slug '$sanitizedSlug' is invalid. Only lowercase alphanumeric characters and single hyphens are allowed."
        }
        require(sanitizedSlug.length in 3..63) {
            "Subdomain slug length must be between 3 and 63 characters."
        }

        // 2. Slug uniqueness check
        if (tenantRepository.existsBySlug(sanitizedSlug)) {
            log.warn("Onboarding rejected: slug '{}' is already taken", sanitizedSlug)
            throw SlugAlreadyExistsException(sanitizedSlug)
        }

        // 3. Resolve clinical specialty
        val specialty = try {
            SpecialtyType.valueOf(command.specialty.trim().uppercase())
        } catch (_: Exception) {
            SpecialtyType.GENERAL
        }

        // 4. Persist Tenant Control Plane entity
        val tenant = Tenant(
            slug = sanitizedSlug,
            name = command.clinicName.trim(),
            phone = command.phone?.trim() ?: command.adminPhone?.trim(),
            status = TenantStatus.TRIAL,
            specialty = specialty,
            adminEmail = command.adminEmail.trim().lowercase()
        )
        val savedTenant = tenantRepository.save(tenant)
        val tenantId = savedTenant.id

        // 5. Assign 14-day evaluation subscription
        val plan = subscriptionPlanRepository.findByCode(command.planCode)
            .orElseGet {
                log.info("Bootstrapping default '{}' evaluation subscription plan", command.planCode)
                subscriptionPlanRepository.save(
                    SubscriptionPlan(
                        code = command.planCode,
                        name = "14-Day Free Evaluation Trial",
                        maxDoctors = 3,
                        whatsappEnabled = true,
                        priceCents = 0
                    )
                )
            }

        val now = Instant.now()
        val trialSubscription = Subscription(
            tenant = savedTenant,
            plan = plan,
            status = SubscriptionStatus.ACTIVE,
            currentPeriodStart = now,
            currentPeriodEnd = now.plus(Duration.ofDays(14)),
            smsWhatsappCredits = 100
        )
        subscriptionRepository.save(trialSubscription)

        // 6. Cache tenant status in Redis
        try {
            tenantCacheService.cacheTenantStatus(tenantId, TenantStatus.TRIAL.name)
        } catch (e: Exception) {
            log.warn("Failed to cache tenant status in Redis: {}", e.message)
        }

        // 7. Hash administrator password and provision initial staff user
        val passwordHash = passwordEncoder.encode(command.adminPassword)

        val adminResult = clinicAdminProvisioner?.provisionInitialAdmin(
            ProvisionClinicAdminCommand(
                tenantId = tenantId,
                fullName = command.adminFullName.trim(),
                email = command.adminEmail.trim().lowercase(),
                passwordHash = passwordHash,
                phone = command.adminPhone?.trim(),
                specialty = specialty.name
            )
        )

        val adminId = adminResult?.userId ?: UUID.randomUUID()
        val authorities = adminResult?.authorities ?: DEFAULT_ADMIN_AUTHORITIES

        // 8. Generate immediate JWT token for seamless first-turn session bootstrap
        val token = jwtTokenProvider.generateTenantUserToken(
            userId = adminId,
            tenantId = tenantId,
            email = command.adminEmail.trim().lowercase(),
            role = "CLINIC_ADMIN",
            authorities = authorities,
            tenantSlug = savedTenant.slug
        )

        // 9. Publish domain lifecycle event
        eventPublisher.publishEvent(
            ClinicProvisionedEvent(
                tenantId = tenantId,
                slug = savedTenant.slug,
                name = savedTenant.name,
                adminEmail = savedTenant.adminEmail,
                initialPassword = "[SECURED]",
                specialty = savedTenant.specialty,
                provisionedAt = now
            )
        )

        log.info("Successfully registered and onboarded clinic '{}' ({}) with admin '{}'",
            savedTenant.name, tenantId, command.adminEmail)

        return ClinicRegistrationResponseDto(
            tenantId = tenantId,
            clinicName = savedTenant.name,
            clinicSlug = savedTenant.slug,
            adminId = adminId,
            adminEmail = savedTenant.adminEmail,
            adminFullName = command.adminFullName.trim(),
            token = token,
            tokenType = "Bearer",
            expiresIn = jwtTokenProvider.expirationSeconds,
            registeredAt = now
        )
    }

    /**
     * Checks whether a slug is available for self-service registration.
     */
    @Transactional(readOnly = true)
    fun isSlugAvailable(slug: String): Boolean {
        val sanitized = slug.trim().lowercase()
        if (!sanitized.matches(SLUG_REGEX) || sanitized.length !in 3..63) {
            return false
        }
        return !tenantRepository.existsBySlug(sanitized)
    }
}
