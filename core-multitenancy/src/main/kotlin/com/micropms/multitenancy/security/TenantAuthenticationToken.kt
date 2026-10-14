package com.micropms.multitenancy.security

import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.GrantedAuthority
import java.util.UUID

/**
 * Spring Security authentication token holding verified user credentials,
 * fine-grained RBAC authorities, and the isolated tenant identifier.
 */
class TenantAuthenticationToken(
    val userId: UUID,
    val tenantId: UUID,
    val email: String,
    authorities: Collection<GrantedAuthority>
) : AbstractAuthenticationToken(authorities) {

    init {
        super.setAuthenticated(true)
    }

    override fun getCredentials(): Any? = null

    override fun getPrincipal(): Any = userId.toString()

    override fun toString(): String {
        return "TenantAuthenticationToken(userId=$userId, tenantId=$tenantId, authorities=$authorities)"
    }
}
