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
 * Production JWT converter decoding claims into an authenticated TenantAuthenticationToken.
 * Distinguishes between two token types:
 * 1. Platform Admin Tokens:
 *    - Claim user_type: "PLATFORM_ADMIN"
 *    - Maps role to ROLE_SUPER_ADMIN
 *    - Leaves tenant_id null (bypasses TenantContext injection)
 * 2. Tenant User Tokens:
 *    - Claim user_type: "TENANT_USER" (or contains mandatory 'tenant_id')
 *    - Injects tenant_id into TenantContext
 *    - Maps clinic roles and fine-grained authorities
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

        // 2. Identify token type: PLATFORM_ADMIN vs TENANT_USER
        val userTypeClaim = jwt.getClaimAsString("user_type")
        val isPlatformAdmin = userTypeClaim.equals("PLATFORM_ADMIN", ignoreCase = true) ||
                (userTypeClaim == null && jwt.getClaimAsBoolean("is_super_admin") == true && jwt.getClaimAsString("tenant_id") == null)

        val authorities = mutableSetOf<GrantedAuthority>()
        val email = jwt.getClaimAsString("email")
        val username = jwt.getClaimAsString("preferred_username") ?: email

        if (isPlatformAdmin) {
            // Platform Admin Token:
            // Maps role to ROLE_SUPER_ADMIN and core platform administration authorities
            authorities.add(SimpleGrantedAuthority("ROLE_SUPER_ADMIN"))
            authorities.add(SimpleGrantedAuthority("platform:admin"))
            authorities.add(SimpleGrantedAuthority("platform:tenants:manage"))
            authorities.add(SimpleGrantedAuthority("platform:impersonate:tenant"))

            // Map any custom platform roles or authorities if present
            mapAdditionalAuthorities(jwt, authorities)

            val principal = TenantUserPrincipal(
                userId = userId,
                tenantId = null,
                email = email,
                username = username,
                userType = AuthUserType.PLATFORM_ADMIN
            )

            log.trace("Decoded PLATFORM_ADMIN JWT principal {}", userId)

            return TenantAuthenticationToken(
                jwt = jwt,
                principal = principal,
                authorities = authorities
            )
        } else {
            // Tenant User Token:
            // Mandatory tenant_id claim
            val tenantIdClaim = jwt.getClaimAsString("tenant_id")
                ?: throw BadCredentialsException("JWT token for TENANT_USER is missing mandatory 'tenant_id' claim")
            val tenantId = try {
                UUID.fromString(tenantIdClaim)
            } catch (e: Exception) {
                throw BadCredentialsException("JWT 'tenant_id' claim '$tenantIdClaim' is not a valid UUID format")
            }

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

            // Map fine-grained authorities claim
            mapAdditionalAuthorities(jwt, authorities)

            val principal = TenantUserPrincipal(
                userId = userId,
                tenantId = tenantId,
                email = email,
                username = username,
                userType = AuthUserType.TENANT_USER
            )

            log.trace("Decoded TENANT_USER JWT principal {} for tenant {}", userId, tenantId)

            return TenantAuthenticationToken(
                jwt = jwt,
                principal = principal,
                authorities = authorities
            )
        }
    }

    private fun mapAdditionalAuthorities(jwt: Jwt, authorities: MutableSet<GrantedAuthority>) {
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
    }
}
