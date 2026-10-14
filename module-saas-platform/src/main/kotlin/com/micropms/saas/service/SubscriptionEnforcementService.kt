package com.micropms.saas.service

import com.micropms.common.exception.ResourceNotFoundException
import com.micropms.saas.entity.Subscription
import com.micropms.saas.entity.SubscriptionStatus
import com.micropms.saas.entity.TenantStatus
import com.micropms.saas.exception.InvalidSubscriptionStateException
import com.micropms.saas.exception.QuotaExceededException
import com.micropms.saas.repository.SubscriptionPlanRepository
import com.micropms.saas.repository.SubscriptionRepository
import com.micropms.saas.repository.TenantRepository
import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.Instant
import java.util.UUID

/**
 * Service enforcing subscription tier boundaries, plan-level feature access,
 * practitioner quota limits, and managing Redis cache invalidation.
 */
@Service
class SubscriptionEnforcementService(
    private val tenantRepository: TenantRepository,
    private val subscriptionRepository: SubscriptionRepository,
    private val subscriptionPlanRepository: SubscriptionPlanRepository,
    private val redisTemplate: StringRedisTemplate
) {

    private val log = LoggerFactory.getLogger(SubscriptionEnforcementService::class.java)

    companion object {
        private const val REDIS_STATUS_PREFIX = "tenant:status:"
        private val REDIS_STATUS_TTL = Duration.ofHours(24)
    }

    /**
     * Resolves the operational status of a tenant with sub-millisecond latency from Redis,
     * seamlessly falling back to PostgreSQL on cache misses and backfilling the cache.
     */
    fun getCachedTenantStatus(tenantId: UUID): TenantStatus {
        val cacheKey = "$REDIS_STATUS_PREFIX$tenantId"

        // 1. Try Redis cache
        try {
            val cached = redisTemplate.opsForValue().get(cacheKey)
            if (!cached.isNullOrBlank()) {
                return TenantStatus.valueOf(cached)
            }
        } catch (e: Exception) {
            log.warn("Redis lookup failed for key '{}': {}", cacheKey, e.message)
        }

        // 2. Fallback to PostgreSQL
        log.debug("Cache miss for tenant status {}. Querying primary database.", tenantId)
        val tenant = tenantRepository.findById(tenantId).orElseThrow {
            ResourceNotFoundException("Tenant", "id", tenantId)
        }

        // 3. Backfill Redis
        try {
            redisTemplate.opsForValue().set(cacheKey, tenant.status.name, REDIS_STATUS_TTL)
        } catch (e: Exception) {
            log.warn("Failed to backfill Redis cache for tenant {}: {}", tenantId, e.message)
        }

        return tenant.status
    }

    /**
     * Verifies if a given tenant has active entitlement to a platform feature
     * (e.g., WHATSAPP, ADVANCED_ANALYTICS, EAV_CUSTOM_FIELDS).
     */
    @Transactional(readOnly = true)
    fun checkFeatureAccess(tenantId: UUID, feature: String): Boolean {
        val status = getCachedTenantStatus(tenantId)
        if (status == TenantStatus.SUSPENDED || status == TenantStatus.PAST_DUE) {
            log.warn("Feature '{}' denied for tenant {}: account status is {}", feature, tenantId, status)
            return false
        }

        val subscription = subscriptionRepository.findByTenantId(tenantId).orElse(null)
            ?: return false

        if (subscription.status != SubscriptionStatus.ACTIVE) {
            return false
        }

        return when (feature.uppercase()) {
            "WHATSAPP" -> subscription.plan.whatsappEnabled
            "SMS" -> subscription.smsWhatsappCredits > 0
            else -> true
        }
    }

    /**
     * Enforces the doctor/practitioner account quota for a clinic.
     * Rejects new doctor creation if active count meets or exceeds the subscription plan maximum.
     */
    @Transactional(readOnly = true)
    fun enforceDoctorQuota(tenantId: UUID, currentDoctorCount: Int) {
        val subscription = subscriptionRepository.findByTenantId(tenantId).orElseThrow {
            ResourceNotFoundException("Subscription", "tenantId", tenantId)
        }

        if (subscription.status != SubscriptionStatus.ACTIVE) {
            throw InvalidSubscriptionStateException("Cannot onboard doctors: subscription is ${subscription.status}")
        }

        val maxAllowed = subscription.plan.maxDoctors
        if (currentDoctorCount >= maxAllowed) {
            log.warn("Doctor quota exceeded for tenant {}: current {} >= plan max {}", tenantId, currentDoctorCount, maxAllowed)
            throw QuotaExceededException("maxDoctors", maxAllowed, currentDoctorCount)
        }
    }

    /**
     * Upgrades or updates a clinic's subscription plan and evicts the corresponding Redis cache.
     */
    @Transactional
    fun updateSubscription(tenantId: UUID, newPlanCode: String): Subscription {
        val subscription = subscriptionRepository.findByTenantId(tenantId).orElseThrow {
            ResourceNotFoundException("Subscription", "tenantId", tenantId)
        }

        val newPlan = subscriptionPlanRepository.findByCode(newPlanCode).orElseThrow {
            ResourceNotFoundException("SubscriptionPlan", "code", newPlanCode)
        }

        subscription.plan = newPlan
        subscription.status = SubscriptionStatus.ACTIVE
        subscription.currentPeriodStart = Instant.now()
        subscription.currentPeriodEnd = Instant.now().plus(Duration.ofDays(30))

        val updated = subscriptionRepository.save(subscription)

        // Evict cached tenant status to reflect plan changes immediately
        evictTenantCache(tenantId)

        log.info("Updated subscription for tenant {} to plan '{}'", tenantId, newPlanCode)
        return updated
    }

    /**
     * Manually adjusts SMS / WhatsApp credits for a tenant.
     */
    @Transactional
    fun grantCredits(tenantId: UUID, additionalCredits: Int): Subscription {
        val subscription = subscriptionRepository.findByTenantId(tenantId).orElseThrow {
            ResourceNotFoundException("Subscription", "tenantId", tenantId)
        }
        subscription.smsWhatsappCredits += additionalCredits
        return subscriptionRepository.save(subscription)
    }

    /**
     * Updates tenant operational status (e.g. SUSPEND, ACTIVATE) and synchronizes Redis cache.
     */
    @Transactional
    fun updateTenantStatus(tenantId: UUID, newStatus: TenantStatus) {
        val tenant = tenantRepository.findById(tenantId).orElseThrow {
            ResourceNotFoundException("Tenant", "id", tenantId)
        }
        tenant.status = newStatus
        tenantRepository.save(tenant)

        val cacheKey = "$REDIS_STATUS_PREFIX$tenantId"
        try {
            redisTemplate.opsForValue().set(cacheKey, newStatus.name, REDIS_STATUS_TTL)
        } catch (e: Exception) {
            log.warn("Failed to update Redis status cache for tenant {}: {}", tenantId, e.message)
        }
        log.info("Tenant {} status updated to {}", tenantId, newStatus)
    }

    private fun evictTenantCache(tenantId: UUID) {
        try {
            val key = "$REDIS_STATUS_PREFIX$tenantId"
            redisTemplate.delete(key)
            log.trace("Evicted Redis cache for tenant {}", tenantId)
        } catch (e: Exception) {
            log.warn("Failed to evict Redis cache for tenant {}: {}", tenantId, e.message)
        }
    }
}
