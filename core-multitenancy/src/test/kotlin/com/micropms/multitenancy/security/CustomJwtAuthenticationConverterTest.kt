package com.micropms.multitenancy.security

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.oauth2.jwt.Jwt
import java.time.Instant
import java.util.UUID

class CustomJwtAuthenticationConverterTest {

    private val converter = CustomJwtAuthenticationConverter()

    @Test
    fun `should convert valid JWT claims to TenantAuthenticationToken`() {
        val userId = UUID.randomUUID()
        val tenantId = UUID.randomUUID()

        val jwt = Jwt.withTokenValue("mock-token")
            .header("alg", "none")
            .claim("sub", userId.toString())
            .claim("tenant_id", tenantId.toString())
            .claim("role", "CLINICIAN")
            .claim("authorities", listOf("CLINICAL_READ", "CLINICAL_WRITE"))
            .claim("email", "doctor@example.com")
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .build()

        val authentication = converter.convert(jwt)

        assertNotNull(authentication)
        assertTrue(authentication is TenantAuthenticationToken)

        val tenantToken = authentication as TenantAuthenticationToken
        assertEquals(userId, tenantToken.userId)
        assertEquals(tenantId, tenantToken.tenantId)
        assertEquals("doctor@example.com", tenantToken.principal.email)

        val authorityNames = tenantToken.authorities.map { it.authority }.toSet()
        assertTrue(authorityNames.contains("ROLE_CLINICIAN"), "Must format 'role' claim to 'ROLE_CLINICIAN'")
        assertTrue(authorityNames.contains("CLINICAL_READ"))
        assertTrue(authorityNames.contains("CLINICAL_WRITE"))
    }

    @Test
    fun `should throw BadCredentialsException when tenant_id claim is missing`() {
        val userId = UUID.randomUUID()

        val jwt = Jwt.withTokenValue("mock-token")
            .header("alg", "none")
            .claim("sub", userId.toString())
            .claim("role", "ADMIN")
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .build()

        assertThrows(BadCredentialsException::class.java) {
            converter.convert(jwt)
        }
    }

    @Test
    fun `should throw BadCredentialsException when sub claim is invalid UUID`() {
        val tenantId = UUID.randomUUID()

        val jwt = Jwt.withTokenValue("mock-token")
            .header("alg", "none")
            .claim("sub", "not-a-valid-uuid")
            .claim("tenant_id", tenantId.toString())
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .build()

        assertThrows(BadCredentialsException::class.java) {
            converter.convert(jwt)
        }
    }
}
