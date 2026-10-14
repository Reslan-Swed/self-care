package com.micropms.multitenancy.auditing

import com.micropms.multitenancy.security.TenantAuthenticationToken
import com.micropms.multitenancy.security.TenantUserPrincipal
import org.springframework.data.domain.AuditorAware
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component
import java.util.Optional
import java.util.UUID

/**
 * Spring Data JPA AuditorAware implementation returning the authenticated user UUID
 * from the SecurityContext to populate BaseAuditEntity.createdBy and lastModifiedBy.
 */
@Component("auditorAware")
class SpringSecurityAuditorAware : AuditorAware<UUID> {

    override fun getCurrentAuditor(): Optional<UUID> {
        val authentication = SecurityContextHolder.getContext()?.authentication
            ?: return Optional.empty()

        if (!authentication.isAuthenticated || authentication.principal == "anonymousUser") {
            return Optional.empty()
        }

        return when (authentication) {
            is TenantAuthenticationToken -> {
                Optional.of(authentication.userId)
            }
            else -> {
                when (val principal = authentication.principal) {
                    is TenantUserPrincipal -> Optional.of(principal.userId)
                    is Jwt -> {
                        val sub = principal.subject ?: principal.getClaimAsString("sub")
                        parseUuidSafe(sub)
                    }
                    else -> {
                        parseUuidSafe(authentication.name)
                    }
                }
            }
        }
    }

    private fun parseUuidSafe(value: String?): Optional<UUID> {
        if (value.isNullOrBlank()) return Optional.empty()
        return try {
            Optional.of(UUID.fromString(value.trim()))
        } catch (e: Exception) {
            Optional.empty()
        }
    }
}
