package com.micropms.multitenancy.security

import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import java.util.UUID

/**
 * Discriminator distinguishing Platform Super Administrators (Control Plane)
 * from Clinic Staff Users (Application Plane).
 */
enum class AuthUserType {
    PLATFORM_ADMIN,
    TENANT_USER
}

/**
 * Domain principal encapsulating the authenticated user identity,
 * user type (PLATFORM_ADMIN vs TENANT_USER), and tenant identifier if scoped.
 */
data class TenantUserPrincipal(
    val userId: UUID,
    val tenantId: UUID? = null,
    val email: String? = null,
    val username: String? = null,
    val userType: AuthUserType = AuthUserType.TENANT_USER
) {
    val isPlatformAdmin: Boolean get() = userType == AuthUserType.PLATFORM_ADMIN
}

/**
 * Spring Security authentication token holding verified credentials,
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
    val tenantId: UUID? get() = principal.tenantId
    val isPlatformAdmin: Boolean get() = principal.isPlatformAdmin

    override fun getCredentials(): Any = jwt

    override fun getPrincipal(): TenantUserPrincipal = principal

    override fun getName(): String = principal.userId.toString()

    override fun toString(): String {
        return "TenantAuthenticationToken(userId=${principal.userId}, tenantId=${principal.tenantId}, userType=${principal.userType}, authorities=$authorities)"
    }
}
