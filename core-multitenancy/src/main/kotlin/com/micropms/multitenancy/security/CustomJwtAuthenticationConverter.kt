package com.micropms.multitenancy.security

import org.slf4j.LoggerFactory
import org.springframework.core.convert.converter.Converter
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component
import java.util.UUID

/**
 * Production JWT converter decoding claims into an authenticated TenantAuthenticationToken:
 * - 'sub' claim -> Principal User ID (UUID)
 * - 'tenant_id' claim -> Extracted Tenant ID (UUID)
 * - 'role' claim -> Mapped to "ROLE_<ROLE_NAME>"
 * - 'authorities' array claim -> Mapped to List<SimpleGrantedAuthority> for @PreAuthorize
 */
@Component
class CustomJwtAuthenticationConverter : Converter<Jwt, AbstractAuthenticationToken> {

    private val log = LoggerFactory.getLogger(CustomJwtAuthenticationConverter::class.java)

    override fun convert(jwt: Jwt): AbstractAuthenticationToken {
        // 1. Resolve Principal User ID ('sub')
        val subClaim = jwt.subject ?: jwt.getClaimAsString("sub")
            ?: throw BadCredentialsException("JWT token is missing mandatory 'sub' claim")
        val userId = try {
            UUID.fromString(subClaim)
        } catch (e: Exception) {
            throw BadCredentialsException("JWT 'sub' claim '$subClaim' is not a valid UUID format")
        }

        // 2. Resolve Tenant ID ('tenant_id')
        val tenantIdClaim = jwt.getClaimAsString("tenant_id")
            ?: throw BadCredentialsException("JWT token is missing mandatory 'tenant_id' claim")
        val tenantId = try {
            UUID.fromString(tenantIdClaim)
        } catch (e: Exception) {
            throw BadCredentialsException("JWT 'tenant_id' claim '$tenantIdClaim' is not a valid UUID format")
        }

        // 3. Resolve authorities and roles
        val authorities = mutableSetOf<GrantedAuthority>()

        // Map 'role' claim to "ROLE_<ROLE_NAME>"
        val roleClaim = jwt.getClaimAsString("role")
        if (!roleClaim.isNullOrBlank()) {
            val roleFormatted = if (roleClaim.startsWith("ROLE_")) roleClaim else "ROLE_$roleClaim"
            authorities.add(SimpleGrantedAuthority(roleFormatted))
        }

        // Map optional 'roles' list claim to "ROLE_<ROLE_NAME>"
        val rolesListClaim = jwt.getClaimAsStringList("roles")
        rolesListClaim?.forEach { r ->
            if (r.isNotBlank()) {
                val roleFormatted = if (r.startsWith("ROLE_")) r else "ROLE_$r"
                authorities.add(SimpleGrantedAuthority(roleFormatted))
            }
        }

        // Map 'authorities' claim to SimpleGrantedAuthority
        val authoritiesClaim = jwt.claims["authorities"]
        when (authoritiesClaim) {
            is Collection<*> -> {
                authoritiesClaim.filterIsInstance<String>().forEach { auth ->
                    if (auth.isNotBlank()) {
                        authorities.add(SimpleGrantedAuthority(auth.trim()))
                    }
                }
            }
            is String -> {
                authoritiesClaim.split(",", " ").forEach { auth ->
                    if (auth.isNotBlank()) {
                        authorities.add(SimpleGrantedAuthority(auth.trim()))
                    }
                }
            }
        }

        val email = jwt.getClaimAsString("email")
        val username = jwt.getClaimAsString("preferred_username") ?: email

        val principal = TenantUserPrincipal(
            userId = userId,
            tenantId = tenantId,
            email = email,
            username = username
        )

        log.trace("Successfully authenticated user {} for tenant {}", userId, tenantId)

        return TenantAuthenticationToken(
            jwt = jwt,
            principal = principal,
            authorities = authorities
        )
    }
}
