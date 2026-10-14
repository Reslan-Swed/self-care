package com.micropms.saas.service

import com.micropms.saas.entity.SpecialtyType
import com.micropms.saas.entity.SubscriptionPlan
import com.micropms.saas.entity.Tenant
import com.micropms.saas.entity.TenantStatus
import com.micropms.saas.event.ClinicProvisionedEvent
import com.micropms.saas.exception.SlugAlreadyExistsException
import com.micropms.saas.repository.SubscriptionPlanRepository
import com.micropms.saas.repository.SubscriptionRepository
import com.micropms.saas.repository.TenantRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.data.redis.core.ValueOperations
import java.util.Optional
import java.util.UUID

class TenantProvisioningServiceTest {

    private val tenantRepository = mockk<TenantRepository>()
    private val subscriptionPlanRepository = mockk<SubscriptionPlanRepository>()
    private val subscriptionRepository = mockk<SubscriptionRepository>()
    private val redisTemplate = mockk<StringRedisTemplate>(relaxed = true)
    private val valueOps = mockk<ValueOperations<String, String>>(relaxed = true)
    private val eventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

    private lateinit var service: TenantProvisioningService

    @BeforeEach
    fun setUp() {
        every { redisTemplate.opsForValue() } returns valueOps
        service = TenantProvisioningService(
            tenantRepository,
            subscriptionPlanRepository,
            subscriptionRepository,
            redisTemplate,
            eventPublisher
        )
    }

    @Test
    fun `should successfully register clinic and provision 14-day trial`() {
        val command = RegisterClinicCommand(
            name = "Apex Cardiology",
            slug = "apex-cardio",
            adminEmail = "admin@apexcardio.com",
            phone = "+1-555-0199",
            specialty = SpecialtyType.DERMATOLOGY
        )

        every { tenantRepository.existsBySlug("apex-cardio") } returns false

        val savedTenantSlot = slot<Tenant>()
        every { tenantRepository.save(capture(savedTenantSlot)) } answers {
            val t = savedTenantSlot.captured
            t.id = UUID.randomUUID()
            t
        }

        val trialPlan = SubscriptionPlan(
            code = "TRIAL",
            name = "14-Day Free Evaluation Trial",
            maxDoctors = 3,
            whatsappEnabled = true,
            priceCents = 0
        )
        every { subscriptionPlanRepository.findByCode("TRIAL") } returns Optional.of(trialPlan)
        every { subscriptionRepository.save(any()) } answers { firstArg() }

        val result = service.registerClinic(command)

        assertNotNull(result.tenant.id)
        assertEquals("apex-cardio", result.tenant.slug)
        assertEquals(TenantStatus.TRIAL, result.tenant.status)
        assertEquals(3, result.subscription.plan.maxDoctors)

        // Verify Redis caching
        verify { valueOps.set(match { it.startsWith("tenant:status:") }, "TRIAL", any()) }

        // Verify domain event publication
        verify {
            eventPublisher.publishEvent(match<ClinicProvisionedEvent> {
                it.slug == "apex-cardio" && it.adminEmail == "admin@apexcardio.com"
            })
        }
    }

    @Test
    fun `should reject registration when slug already exists`() {
        val command = RegisterClinicCommand(
            name = "Duplicate Clinic",
            slug = "metro-health",
            adminEmail = "admin@metro.com"
        )
        every { tenantRepository.existsBySlug("metro-health") } returns true

        assertThrows(SlugAlreadyExistsException::class.java) {
            service.registerClinic(command)
        }
    }

    @Test
    fun `should reject invalid slug formats`() {
        val invalidCommand = RegisterClinicCommand(
            name = "Invalid Slug Clinic",
            slug = "Metro Health!", // spaces & special chars invalid
            adminEmail = "admin@metro.com"
        )

        assertThrows(IllegalArgumentException::class.java) {
            service.registerClinic(invalidCommand)
        }
    }
}
