package com.micropms.multitenancy.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets
import java.time.Duration
import java.time.Instant
import java.util.Date
import java.util.UUID
import javax.crypto.SecretKey

/**
 * Service to generate, sign, and validate JWT tokens with embedded claims
 * for both Tenant Users (Clinic Staff) and Platform Administrators.
 */
@Component
class JwtTokenProvider(
    @Value("\${micropms.jwt.secret:default-secret-key-must-be-at-least-256-bits-long-for-hmac-sha256}")
    private val jwtSecretKey: String,
    @Value("\${micropms.jwt.expiration-hours:24}")
    private val expirationHours: Long = 24
) {
    private val log = LoggerFactory.getLogger(JwtTokenProvider::class.java)

    private val signingKey: SecretKey by lazy {
        Keys.hmacShaKeyFor(jwtSecretKey.toByteArray(StandardCharsets.UTF_8))
    }

    val tokenTtl: Duration get() = Duration.ofHours(expirationHours)
    val expirationSeconds: Long get() = tokenTtl.seconds

    /**
     * Generates a cryptographically signed JWT for a clinic tenant user.
     * Contains claims: sub (userId), tenant_id, user_type ("TENANT_USER"), role, authorities list, tenant_slug.
     */
    fun generateTenantUserToken(
        userId: UUID,
        tenantId: UUID,
        email: String,
        role: String,
        authorities: Collection<String>,
        tenantSlug: String? = null
    ): String {
        val now = Instant.now()
        val expiresAt = now.plus(tokenTtl)

        val formattedRole = if (role.startsWith("ROLE_")) role.removePrefix("ROLE_") else role

        val builder = Jwts.builder()
            .header().add("typ", "JWT").and()
            .subject(userId.toString())
            .claim("tenant_id", tenantId.toString())
            .claim("user_type", AuthUserType.TENANT_USER.name)
            .claim("email", email)
            .claim("role", formattedRole)
            .claim("authorities", authorities.toList())
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiresAt))
            .id(UUID.randomUUID().toString())

        tenantSlug?.let { builder.claim("tenant_slug", it) }

        val token = builder.signWith(signingKey).compact()
        log.trace("Generated TENANT_USER token for user {} in tenant {}", userId, tenantId)
        return token
    }

    /**
     * Generates a cryptographically signed JWT for a platform super administrator.
     * Contains claims: sub (adminId), user_type ("PLATFORM_ADMIN"), role ("ROLE_SUPER_ADMIN"), platform authorities list.
     * Leaves tenant_id null.
     */
    fun generatePlatformAdminToken(
        adminId: UUID,
        email: String,
        role: String = "SUPER_ADMIN",
        authorities: Collection<String> = listOf(
            "ROLE_SUPER_ADMIN",
            "platform:admin",
            "platform:tenants:manage",
            "platform:impersonate:tenant"
        )
    ): String {
        val now = Instant.now()
        val expiresAt = now.plus(tokenTtl)

        val formattedRole = if (role.startsWith("ROLE_")) role.removePrefix("ROLE_") else role

        val token = Jwts.builder()
            .header().add("typ", "JWT").and()
            .subject(adminId.toString())
            .claim("user_type", AuthUserType.PLATFORM_ADMIN.name)
            .claim("email", email)
            .claim("role", formattedRole)
            .claim("authorities", authorities.toList())
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiresAt))
            .id(UUID.randomUUID().toString())
            .signWith(signingKey)
            .compact()

        log.trace("Generated PLATFORM_ADMIN token for admin {}", adminId)
        return token
    }

    /**
     * Verifies token signature and checks expiration.
     */
    fun validateToken(token: String): Boolean {
        return try {
            val claims = parseClaims(token)
            claims.expiration.after(Date())
        } catch (e: JwtException) {
            log.debug("Invalid JWT token: {}", e.message)
            false
        } catch (e: IllegalArgumentException) {
            log.debug("Empty or null JWT token: {}", e.message)
            false
        }
    }

    /**
     * Parses and returns token claims payload.
     */
    fun parseClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .payload
    }

    fun extractUserId(token: String): UUID {
        val claims = parseClaims(token)
        return UUID.fromString(claims.subject)
    }

    fun extractTenantId(token: String): UUID? {
        val claims = parseClaims(token)
        val tenantIdClaim = claims["tenant_id"]?.toString() ?: return null
        return UUID.fromString(tenantIdClaim)
    }

    fun extractUserType(token: String): AuthUserType {
        val claims = parseClaims(token)
        val userTypeClaim = claims["user_type"]?.toString()
        return if ("PLATFORM_ADMIN".equals(userTypeClaim, ignoreCase = true)) {
            AuthUserType.PLATFORM_ADMIN
        } else {
            AuthUserType.TENANT_USER
        }
    }
}
