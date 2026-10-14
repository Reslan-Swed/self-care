package com.micropms.saas.service

import com.micropms.saas.entity.Subscription
import com.micropms.saas.entity.SubscriptionPlan
import com.micropms.saas.entity.SubscriptionStatus
import com.micropms.saas.entity.Tenant
import com.micropms.saas.entity.TenantStatus
import com.micropms.saas.exception.QuotaExceededException
import com.micropms.saas.repository.SubscriptionPlanRepository
import com.micropms.saas.repository.SubscriptionRepository
import com.micropms.saas.repository.TenantRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.data.redis.core.ValueOperations
import java.time.Instant
import java.util.Optional
import java.util.UUID

class SubscriptionEnforcementServiceTest {

    private val tenantRepository = mockk<TenantRepository>()
    private val subscriptionRepository = mockk<SubscriptionRepository>()
    private val subscriptionPlanRepository = mockk<SubscriptionPlanRepository>()
    private val redisTemplate = mockk<StringRedisTemplate>(relaxed = true)
    private val valueOps = mockk<ValueOperations<String, String>>(relaxed = true)

    private lateinit var service: SubscriptionEnforcementService

    @BeforeEach
    fun setUp() {
        every { redisTemplate.opsForValue() } returns valueOps
        service = SubscriptionEnforcementService(
            tenantRepository,
            subscriptionRepository,
            subscriptionPlanRepository,
            redisTemplate
        )
    }

    @Test
    fun `should read tenant status directly from Redis cache hit`() {
        val tenantId = UUID.randomUUID()
        every { valueOps.get("tenant:status:$tenantId") } returns "ACTIVE"

        val status = service.getCachedTenantStatus(tenantId)

        assertEquals(TenantStatus.ACTIVE, status)
        verify(exactly = 0) { tenantRepository.findById(any()) }
    }

    @Test
    fun `should fallback to PostgreSQL on Redis miss and backfill cache`() {
        val tenantId = UUID.randomUUID()
        every { valueOps.get("tenant:status:$tenantId") } returns null

        val tenant = Tenant(
            slug = "city-dental",
            name = "City Dental",
            status = TenantStatus.TRIAL,
            adminEmail = "admin@citydental.com"
        ).apply { id = tenantId }

        every { tenantRepository.findById(tenantId) } returns Optional.of(tenant)

        val status = service.getCachedTenantStatus(tenantId)

        assertEquals(TenantStatus.TRIAL, status)
        verify(exactly = 1) { valueOps.set("tenant:status:$tenantId", "TRIAL", any()) }
    }

    @Test
    fun `should enforce doctor quota and reject when count reaches maxDoctors`() {
        val tenantId = UUID.randomUUID()
        val plan = SubscriptionPlan(
            code = "SOLO",
            name = "Solo Practitioner Plan",
            maxDoctors = 1,
            whatsappEnabled = false,
            priceCents = 4900
        )
        val subscription = Subscription(
            tenant = mockk(),
            plan = plan,
            status = SubscriptionStatus.ACTIVE,
            currentPeriodStart = Instant.now(),
            currentPeriodEnd = Instant.now().plusSeconds(86400 * 30),
            smsWhatsappCredits = 0
        )

        every { subscriptionRepository.findByTenantId(tenantId) } returns Optional.of(subscription)

        assertThrows(QuotaExceededException::class.java) {
            service.enforceDoctorQuota(tenantId, currentDoctorCount = 1)
        }
    }

    @Test
    fun `should allow doctor addition when below quota limit`() {
        val tenantId = UUID.randomUUID()
        val plan = SubscriptionPlan(
            code = "CLINIC",
            name = "Group Clinic Plan",
            maxDoctors = 5,
            whatsappEnabled = true,
            priceCents = 19900
        )
        val subscription = Subscription(
            tenant = mockk(),
            plan = plan,
            status = SubscriptionStatus.ACTIVE,
            currentPeriodStart = Instant.now(),
            currentPeriodEnd = Instant.now().plusSeconds(86400 * 30),
            smsWhatsappCredits = 500
        )

        every { subscriptionRepository.findByTenantId(tenantId) } returns Optional.of(subscription)

        assertDoesNotThrow {
            service.enforceDoctorQuota(tenantId, currentDoctorCount = 3)
        }
    }
}
