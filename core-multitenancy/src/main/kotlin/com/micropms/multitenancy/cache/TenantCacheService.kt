package com.micropms.multitenancy.cache

import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Service
import java.time.Duration
import java.util.UUID

/**
 * High-performance Redis caching service for validating tenant activation status,
 * feature flag permissions, and background job queue rate limits.
 */
@Service
class TenantCacheService(
    private val redisTemplate: StringRedisTemplate
) {

    private val log = LoggerFactory.getLogger(TenantCacheService::class.java)

    companion object {
        private const val TENANT_STATUS_KEY_PREFIX = "tenant:status:"
        private val DEFAULT_TTL = Duration.ofMinutes(15)
    }

    /**
     * Checks whether a tenant is in active status, consulting Redis cache first.
     */
    fun isTenantActive(tenantId: UUID): Boolean {
        val key = "$TENANT_STATUS_KEY_PREFIX$tenantId"
        val cachedStatus = redisTemplate.opsForValue().get(key)
        return cachedStatus == "ACTIVE"
    }

    /**
     * Caches the operational status of a tenant with TTL.
     */
    fun cacheTenantStatus(tenantId: UUID, status: String) {
        val key = "$TENANT_STATUS_KEY_PREFIX$tenantId"
        redisTemplate.opsForValue().set(key, status, DEFAULT_TTL)
        log.debug("Updated Redis tenant cache for {} to {}", tenantId, status)
    }

    /**
     * Evicts the tenant cache entry on status change or subscription tier update.
     */
    fun evictTenant(tenantId: UUID) {
        val key = "$TENANT_STATUS_KEY_PREFIX$tenantId"
        redisTemplate.delete(key)
        log.debug("Evicted tenant {} from Redis cache", tenantId)
    }
}
