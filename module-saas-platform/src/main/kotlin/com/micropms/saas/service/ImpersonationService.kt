package com.micropms.saas.service

import com.micropms.common.exception.ResourceNotFoundException
import com.micropms.saas.entity.AuditImpersonationLog
import com.micropms.saas.entity.TenantStatus
import com.micropms.saas.exception.UnauthorizedImpersonationException
import com.micropms.saas.repository.AuditImpersonationLogRepository
import com.micropms.saas.repository.TenantRepository
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.nio.charset.StandardCharsets
import java.time.Duration
import java.time.Instant
import java.util.Date
import java.util.UUID

data class ImpersonationTokenDetails(
    val token: String,
    val tenantId: UUID,
    val impersonatorAdminId: UUID,
    val issuedAt: Instant,
    val expiresAt: Instant
)

/**
 * Service managing highly privileged support impersonation sessions.
 * Allows super-administrators to troubleshoot clinic-level issues under strict audit logging
 * and short-lived temporal token boundaries.
 */
@Service
class ImpersonationService(
    private val tenantRepository: TenantRepository,
    private val auditLogRepository: AuditImpersonationLogRepository,
    @Value("\${micropms.jwt.secret:default-secret-key-must-be-at-least-256-bits-long-for-hmac-sha256}")
    private val jwtSecretKey: String
) {

    private val log = LoggerFactory.getLogger(ImpersonationService::class.java)

    companion object {
        private val IMPERSONATION_TOKEN_TTL = Duration.ofMinutes(30)
    }

    /**
     * Issues a cryptographically signed, short-lived JWT token enabling support staff
     * to access a clinic tenant. Enforces caller authorization, verifies tenant existence,
     * injects impersonation claims, and immutably records the action in AuditImpersonationLog.
     */
    @Transactional
    fun issueImpersonationToken(
        adminId: UUID,
        tenantId: UUID,
        justification: String,
        ipAddress: String
    ): ImpersonationTokenDetails {
        // 1. Verify caller authorities from SecurityContext
        val authentication = SecurityContextHolder.getContext()?.authentication
        val isSuperAdmin = authentication?.authorities?.any {
            it.authority == "ROLE_SUPER_ADMIN" ||
            it.authority == "platform:impersonate:tenant" ||
            it.authority == "platform:tenants:manage"
        } ?: false

        if (!isSuperAdmin) {
            log.error("Unauthorized impersonation attempt by user {} against tenant {}", adminId, tenantId)
            throw UnauthorizedImpersonationException("User lacks required 'platform:impersonate:tenant' or 'ROLE_SUPER_ADMIN' authority")
        }

        // 2. Validate justification and IP address
        require(justification.trim().length >= 10) {
            "Impersonation justification must be at least 10 characters detailing the support ticket or reason"
        }
        require(ipAddress.isNotBlank()) {
            "Client IP address is required for regulatory audit trails"
        }

        // 3. Verify target clinic exists
        val tenant = tenantRepository.findById(tenantId).orElseThrow {
            ResourceNotFoundException("Tenant", "id", tenantId)
        }

        if (tenant.status == TenantStatus.SUSPENDED) {
            log.warn("Impersonation requested on suspended tenant '{}' ({}) by admin {}", tenant.name, tenantId, adminId)
        }

        val now = Instant.now()
        val expiresAt = now.plus(IMPERSONATION_TOKEN_TTL)

        // 4. Generate cryptographically signed, short-lived JWT
        val signingKey = Keys.hmacShaKeyFor(jwtSecretKey.toByteArray(StandardCharsets.UTF_8))
        val token = Jwts.builder()
            .header().add("typ", "JWT").and()
            .subject(adminId.toString())
            .claim("tenant_id", tenantId.toString())
            .claim("tenant_slug", tenant.slug)
            .claim("is_impersonated", true)
            .claim("impersonator_admin_id", adminId.toString())
            .claim("role", "SUPER_ADMIN")
            .claim("authorities", listOf(
                "CLINICAL_READ",
                "CLINICAL_WRITE",
                "ADMIN_READ",
                "ADMIN_WRITE",
                "PATIENT_READ",
                "PATIENT_WRITE",
                "INVOICE_READ",
                "INVOICE_WRITE"
            ))
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiresAt))
            .id(UUID.randomUUID().toString())
            .signWith(signingKey)
            .compact()

        // 5. Immutably record audit entry in database
        val auditEntry = AuditImpersonationLog(
            adminId = adminId,
            tenantId = tenantId,
            justification = justification.trim(),
            ipAddress = ipAddress.trim(),
            sessionExpiresAt = expiresAt
        )
        auditLogRepository.save(auditEntry)

        log.info("ISSUED IMPERSONATION SESSION: Admin {} -> Tenant '{}' ({}) until {}. IP: {}",
            adminId, tenant.name, tenantId, expiresAt, ipAddress)

        return ImpersonationTokenDetails(
            token = token,
            tenantId = tenantId,
            impersonatorAdminId = adminId,
            issuedAt = now,
            expiresAt = expiresAt
        )
    }
}
