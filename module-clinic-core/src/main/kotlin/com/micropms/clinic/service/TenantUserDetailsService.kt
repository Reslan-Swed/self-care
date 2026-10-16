package com.micropms.clinic.service

import com.micropms.clinic.entity.User
import com.micropms.clinic.repository.UserRepository
import com.micropms.multitenancy.context.TenantContext
import com.micropms.multitenancy.security.SecurityUserDetails
import org.slf4j.LoggerFactory
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Multi-tenant UserDetailsService loading clinic staff within active tenant boundaries.
 * Enforces tenant context isolation and constructs SecurityUserDetails with fine-grained authorities.
 */
@Service
@Transactional(readOnly = true)
class TenantUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService {

    private val log = LoggerFactory.getLogger(TenantUserDetailsService::class.java)

    /**
     * Standard UserDetailsService hook resolving staff user from current TenantContext.
     */
    override fun loadUserByUsername(username: String): UserDetails {
        val tenantId = TenantContext.getTenantId()
            ?: throw UsernameNotFoundException("Cannot load user '$username' without active tenant context")

        return loadUserByEmailAndTenant(username, tenantId)
    }

    /**
     * Explicit loader resolving a clinic staff user by email and specified tenantId.
     */
    fun loadUserByEmailAndTenant(email: String, tenantId: UUID): SecurityUserDetails {
        val normalizedEmail = email.trim().lowercase()

        val user: User = TenantContext.runWithTenant(tenantId) {
            userRepository.findByEmail(normalizedEmail).orElseThrow {
                log.warn("User '{}' not found in tenant {}", normalizedEmail, tenantId)
                UsernameNotFoundException("Staff user not found with email '$normalizedEmail' in tenant $tenantId")
            }
        }

        return SecurityUserDetails.forClinicUser(
            userId = user.id,
            tenantId = tenantId,
            email = user.email,
            passwordHash = user.passwordHash,
            fullName = user.fullName,
            role = user.role.name,
            authorities = user.role.authorities(),
            active = user.isActive
        )
    }
}
