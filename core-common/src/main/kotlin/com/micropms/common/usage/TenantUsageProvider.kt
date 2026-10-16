package com.micropms.common.usage

import java.util.UUID

/**
 * Snapshot of application plane resource utilization for a specific tenant.
 */
data class TenantUsageSnapshot(
    val activeDoctorsCount: Int,
    val totalEncountersCount: Long,
    val totalStorageBytes: Long
)

/**
 * Decoupled SPI allowing module-saas-platform to retrieve clinical resource consumption
 * without taking a direct compile-time dependency on module-clinic-core.
 */
fun interface TenantUsageProvider {
    fun getTenantUsage(tenantId: UUID): TenantUsageSnapshot
}
