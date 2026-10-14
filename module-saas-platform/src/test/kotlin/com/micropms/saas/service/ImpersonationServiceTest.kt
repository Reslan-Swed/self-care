package com.micropms.saas.service

import com.micropms.saas.entity.AuditImpersonationLog
import com.micropms.saas.entity.Tenant
import com.micropms.saas.entity.TenantStatus
import com.micropms.saas.exception.UnauthorizedImpersonationException
import com.micropms.saas.repository.AuditImpersonationLogRepository
import com.micropms.saas.repository.TenantRepository
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import java.nio.charset.StandardCharsets
import java.util.Optional
import java.util.UUID

class ImpersonationServiceTest {

    private val tenantRepository = mockk<TenantRepository>()
    private val auditLogRepository = mockk<AuditImpersonationLogRepository>()
    private val testSecret = "super-secret-key-that-is-at-least-256-bits-long-for-testing-purposes-12345"

    private lateinit var service: ImpersonationService

    @BeforeEach
    fun setUp() {
        service = ImpersonationService(tenantRepository, auditLogRepository, testSecret)
    }

    @AfterEach
    fun tearDown() {
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `should issue signed JWT and record audit log when super admin executes impersonation`() {
        val adminId = UUID.randomUUID()
        val tenantId = UUID.randomUUID()

        // Configure authenticated super-admin security context
        val auth = UsernamePasswordAuthenticationToken(
            adminId.toString(),
            null,
            listOf(SimpleGrantedAuthority("platform:impersonate:tenant"))
        )
        SecurityContextHolder.getContext().authentication = auth

        val targetTenant = Tenant(
            slug = "st-jude-pediatrics",
            name = "St. Jude Pediatrics",
            status = TenantStatus.ACTIVE,
            adminEmail = "admin@stjude.org"
        ).apply { id = tenantId }

        every { tenantRepository.findById(tenantId) } returns Optional.of(targetTenant)

        val logSlot = slot<AuditImpersonationLog>()
        every { auditLogRepository.save(capture(logSlot)) } answers { logSlot.captured }

        val result = service.issueImpersonationToken(
            adminId = adminId,
            tenantId = tenantId,
            justification = "Investigating billing sync failure reported in Ticket #4921",
            ipAddress = "192.168.1.100"
        )

        assertNotNull(result.token)
        assertEquals(tenantId, result.tenantId)
        assertEquals(adminId, result.impersonatorAdminId)

        // Verify claims in issued JWT
        val signingKey = Keys.hmacShaKeyFor(testSecret.toByteArray(StandardCharsets.UTF_8))
        val claims = Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(result.token)
            .payload

        assertEquals(adminId.toString(), claims.subject)
        assertEquals(tenantId.toString(), claims["tenant_id"])
        assertEquals(true, claims["is_impersonated"])
        assertEquals(adminId.toString(), claims["impersonator_admin_id"])

        // Verify immutable database audit entry
        verify(exactly = 1) { auditLogRepository.save(any()) }
        assertEquals(adminId, logSlot.captured.adminId)
        assertEquals(tenantId, logSlot.captured.tenantId)
        assertEquals("192.168.1.100", logSlot.captured.ipAddress)
    }

    @Test
    fun `should reject impersonation when caller lacks super admin authority`() {
        val adminId = UUID.randomUUID()
        val tenantId = UUID.randomUUID()

        // Unprivileged user context
        val auth = UsernamePasswordAuthenticationToken(
            adminId.toString(),
            null,
            listOf(SimpleGrantedAuthority("ROLE_USER"))
        )
        SecurityContextHolder.getContext().authentication = auth

        assertThrows(UnauthorizedImpersonationException::class.java) {
            service.issueImpersonationToken(
                adminId = adminId,
                tenantId = tenantId,
                justification = "Unauthorized attempt to view patient records",
                ipAddress = "10.0.0.1"
            )
        }
    }
}
