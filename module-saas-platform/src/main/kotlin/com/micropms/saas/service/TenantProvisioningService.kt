package com.micropms.saas.service

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
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.SecureRandom
import java.time.Duration
import java.time.Instant
import java.util.Base64
import java.util.UUID

data class RegisterClinicCommand(
    val name: String,
    val slug: String,
    val adminEmail: String,
    val initialPassword: String? = null,
    val phone: String? = null,
    val specialty: SpecialtyType = SpecialtyType.GENERAL,
    val planCode: String = "TRIAL"
)

data class ProvisionedClinicResult(
    val tenant: Tenant,
    val subscription: Subscription,
    val initialAdminPassword: String
)

/**
 * Core engine responsible for onboarding new healthcare practices, provisioning their
 * isolated database metadata, assigning introductory trial subscriptions, and broadcasting
 * lifecycle initialization events.
 */
@Service
class TenantProvisioningService(
    private val tenantRepository: TenantRepository,
    private val subscriptionPlanRepository: SubscriptionPlanRepository,
    private val subscriptionRepository: SubscriptionRepository,
    private val redisTemplate: StringRedisTemplate,
    private val eventPublisher: ApplicationEventPublisher
) {

    private val log = LoggerFactory.getLogger(TenantProvisioningService::class.java)

    companion object {
        private const val REDIS_STATUS_PREFIX = "tenant:status:"
        private val REDIS_STATUS_TTL = Duration.ofHours(24)
        private val SLUG_REGEX = Regex("^[a-z0-9]+(?:-[a-z0-9]+)*$")
    }

    /**
     * Registers and provisions a new clinic tenant on the platform.
     * Enforces slug format and uniqueness, assigns a default 14-day trial, caches
     * the active status in Redis, and publishes the ClinicProvisionedEvent.
     */
    @Transactional
    fun registerClinic(command: RegisterClinicCommand): ProvisionedClinicResult {
        val sanitizedSlug = command.slug.trim().lowercase()

        // 1. Slug format validation
        require(sanitizedSlug.matches(SLUG_REGEX)) {
            "Subdomain slug '$sanitizedSlug' is invalid. Only lowercase alphanumeric characters and hyphens are allowed."
        }
        require(sanitizedSlug.length in 3..63) {
            "Subdomain slug length must be between 3 and 63 characters."
        }

        // 2. Slug uniqueness check
        if (tenantRepository.existsBySlug(sanitizedSlug)) {
            log.warn("Registration rejected: slug '{}' is already in use", sanitizedSlug)
            throw SlugAlreadyExistsException(sanitizedSlug)
        }

        // 3. Persist Tenant Control Plane entity
        val tenant = Tenant(
            slug = sanitizedSlug,
            name = command.name.trim(),
            phone = command.phone?.trim(),
            status = TenantStatus.TRIAL,
            specialty = command.specialty,
            adminEmail = command.adminEmail.trim().lowercase()
        )
        val savedTenant = tenantRepository.save(tenant)
        val tenantId = savedTenant.id ?: throw IllegalStateException("Tenant ID unassigned after persistence")

        // 4. Resolve or bootstrap Trial Subscription Plan
        val plan = subscriptionPlanRepository.findByCode(command.planCode)
            .orElseGet {
                log.info("Bootstrapping default '{}' subscription plan", command.planCode)
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

        // 5. Create 14-day evaluation subscription
        val now = Instant.now()
        val trialSubscription = Subscription(
            tenant = savedTenant,
            plan = plan,
            status = SubscriptionStatus.ACTIVE,
            currentPeriodStart = now,
            currentPeriodEnd = now.plus(Duration.ofDays(14)),
            smsWhatsappCredits = 100
        )
        val savedSubscription = subscriptionRepository.save(trialSubscription)

        // 6. Cache tenant status in Redis for sub-millisecond status resolution
        cacheTenantStatusInRedis(tenantId, TenantStatus.TRIAL)

        // 7. Resolve or generate secure initial admin credentials
        val initialPassword = command.initialPassword?.takeIf { it.isNotBlank() }
            ?: generateSecurePassword()

        // 8. Publish domain event
        eventPublisher.publishEvent(
            ClinicProvisionedEvent(
                tenantId = tenantId,
                slug = sanitizedSlug,
                name = savedTenant.name,
                adminEmail = savedTenant.adminEmail,
                initialPassword = initialPassword,
                specialty = savedTenant.specialty,
                provisionedAt = now
            )
        )

        log.info("Successfully provisioned clinic tenant '{}' ({}) with 14-day trial", savedTenant.name, tenantId)
        return ProvisionedClinicResult(savedTenant, savedSubscription, initialPassword)
    }

    private fun cacheTenantStatusInRedis(tenantId: UUID, status: TenantStatus) {
        try {
            val key = "$REDIS_STATUS_PREFIX$tenantId"
            redisTemplate.opsForValue().set(key, status.name, REDIS_STATUS_TTL)
            log.trace("Cached tenant status in Redis: {} -> {}", key, status.name)
        } catch (e: Exception) {
            log.warn("Redis caching unavailable for tenant {}: {}", tenantId, e.message)
        }
    }

    private fun generateSecurePassword(): String {
        val random = SecureRandom()
        val bytes = ByteArray(12)
        random.nextBytes(bytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }
}
