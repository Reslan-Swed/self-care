package com.micropms.clinic.service

import com.micropms.clinic.entity.User
import com.micropms.clinic.entity.UserRole
import com.micropms.clinic.repository.UserRepository
import com.micropms.common.provisioning.ClinicAdminProvisioner
import com.micropms.common.provisioning.ProvisionClinicAdminCommand
import com.micropms.common.provisioning.ProvisionedClinicAdminResult
import com.micropms.multitenancy.context.TenantContext
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Adapter implementing the ClinicAdminProvisioner SPI from core-common.
 * Allows module-saas-platform to trigger initial administrator creation in the Application Plane
 * upon tenant registration without tight compile-time coupling.
 */
@Service
class ClinicAdminProvisionerAdapter(
    private val userRepository: UserRepository
) : ClinicAdminProvisioner {

    private val log = LoggerFactory.getLogger(ClinicAdminProvisionerAdapter::class.java)

    @Transactional
    override fun provisionInitialAdmin(command: ProvisionClinicAdminCommand): ProvisionedClinicAdminResult {
        return TenantContext.runWithTenant(command.tenantId) {
            val normalizedEmail = command.email.trim().lowercase()

            val adminUser = User(
                email = normalizedEmail,
                passwordHash = command.passwordHash,
                fullName = command.fullName.trim(),
                phone = command.phone?.trim(),
                role = UserRole.CLINIC_ADMIN,
                specialty = command.specialty?.trim(),
                isActive = true
            )

            val saved = userRepository.save(adminUser)
            log.info("Provisioned initial CLINIC_ADMIN user {} ({}) for tenant {}", saved.id, saved.email, command.tenantId)

            ProvisionedClinicAdminResult(
                userId = saved.id,
                fullName = saved.fullName,
                email = saved.email,
                role = saved.role.name,
                authorities = saved.role.authorities()
            )
        }
    }
}
