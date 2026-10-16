package com.micropms.common.provisioning

import java.util.UUID

/**
 * Command carrying credentials for the initial practice administrator.
 */
data class ProvisionClinicAdminCommand(
    val tenantId: UUID,
    val fullName: String,
    val email: String,
    val passwordHash: String,
    val phone: String? = null,
    val specialty: String? = null
)

/**
 * Result returned after provisioning the initial clinic administrator in the Application Plane.
 */
data class ProvisionedClinicAdminResult(
    val userId: UUID,
    val fullName: String,
    val email: String,
    val role: String,
    val authorities: List<String>
)

/**
 * Decoupled SPI allowing module-saas-platform to trigger initial administrator creation
 * in module-clinic-core upon self-service tenant registration.
 */
fun interface ClinicAdminProvisioner {
    fun provisionInitialAdmin(command: ProvisionClinicAdminCommand): ProvisionedClinicAdminResult
}
