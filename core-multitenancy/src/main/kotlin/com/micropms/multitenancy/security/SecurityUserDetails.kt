package com.micropms.multitenancy.security

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.UUID

/**
 * Unified UserDetails implementation wrapping either a clinic User (Application Plane)
 * or a PlatformAdmin (Control Plane).
 *
 * Exposes userId, tenantId (nullable for platform admins), userType, and authorities.
 */
class SecurityUserDetails(
    val userId: UUID,
    val tenantId: UUID?,
    val userType: AuthUserType,
    val email: String,
    private val passwordHash: String,
    val fullName: String,
    val role: String,
    private val authorities: Collection<GrantedAuthority>,
    private val active: Boolean = true
) : UserDetails {

    val isPlatformAdmin: Boolean get() = userType == AuthUserType.PLATFORM_ADMIN
    val isClinicStaff: Boolean get() = userType == AuthUserType.TENANT_USER

    override fun getAuthorities(): Collection<GrantedAuthority> = authorities

    override fun getPassword(): String = passwordHash

    override fun getUsername(): String = email

    override fun isAccountNonExpired(): Boolean = true

    override fun isAccountNonLocked(): Boolean = active

    override fun isCredentialsNonExpired(): Boolean = true

    override fun isEnabled(): Boolean = active

    companion object {
        fun forClinicUser(
            userId: UUID,
            tenantId: UUID,
            email: String,
            passwordHash: String,
            fullName: String,
            role: String,
            authorities: Collection<String>,
            active: Boolean = true
        ): SecurityUserDetails {
            val grantedAuthorities = authorities.map { SimpleGrantedAuthority(it) }.toMutableSet()
            val formattedRole = if (role.startsWith("ROLE_")) role else "ROLE_$role"
            grantedAuthorities.add(SimpleGrantedAuthority(formattedRole))

            return SecurityUserDetails(
                userId = userId,
                tenantId = tenantId,
                userType = AuthUserType.TENANT_USER,
                email = email,
                passwordHash = passwordHash,
                fullName = fullName,
                role = role,
                authorities = grantedAuthorities,
                active = active
            )
        }

        fun forPlatformAdmin(
            adminId: UUID,
            email: String,
            passwordHash: String,
            fullName: String,
            role: String = "SUPER_ADMIN",
            authorities: Collection<String> = listOf(
                "ROLE_SUPER_ADMIN",
                "platform:admin",
                "platform:tenants:manage",
                "platform:impersonate:tenant"
            ),
            active: Boolean = true
        ): SecurityUserDetails {
            val grantedAuthorities = authorities.map { SimpleGrantedAuthority(it) }.toMutableSet()
            val formattedRole = if (role.startsWith("ROLE_")) role else "ROLE_$role"
            grantedAuthorities.add(SimpleGrantedAuthority(formattedRole))

            return SecurityUserDetails(
                userId = adminId,
                tenantId = null,
                userType = AuthUserType.PLATFORM_ADMIN,
                email = email,
                passwordHash = passwordHash,
                fullName = fullName,
                role = role,
                authorities = grantedAuthorities,
                active = active
            )
        }
    }
}
