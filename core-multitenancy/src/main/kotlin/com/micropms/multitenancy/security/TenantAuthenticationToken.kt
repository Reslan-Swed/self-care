package com.micropms.multitenancy.security

import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import java.util.UUID

/**
 * Immutable domain principal encapsulating the authenticated tenant user.
 */
data class TenantUserPrincipal(
    val userId: UUID,
    val tenantId: UUID,
    val email: String? = null,
    val username: String? = null
)

/**
 * Spring Security authentication token holding verified user credentials,
 * the decoded JWT, fine-grained RBAC authorities, and the isolated tenant identifier.
 */
class TenantAuthenticationToken(
    val jwt: Jwt,
    val principal: TenantUserPrincipal,
    authorities: Collection<GrantedAuthority>
) : AbstractAuthenticationToken(authorities) {

    init {
        super.setAuthenticated(true)
    }

    val userId: UUID get() = principal.userId
    val tenantId: UUID get() = principal.tenantId

    override fun getCredentials(): Any = jwt

    override fun getPrincipal(): TenantUserPrincipal = principal

    override fun getName(): String = principal.userId.toString()

    override fun toString(): String {
        return "TenantAuthenticationToken(userId=${principal.userId}, tenantId=${principal.tenantId}, authorities=$authorities)"
    }
}
