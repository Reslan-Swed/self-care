package com.micropms.clinic.service

import com.micropms.clinic.entity.UserRole
import com.micropms.clinic.repository.EncounterRepository
import com.micropms.clinic.repository.UserRepository
import com.micropms.common.usage.TenantUsageProvider
import com.micropms.common.usage.TenantUsageSnapshot
import com.micropms.multitenancy.context.TenantContext
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Adapter implementing TenantUsageProvider SPI from core-common.
 * Queries tenant-scoped clinical database tables under isolated TenantContext.
 */
@Service
class DefaultTenantUsageProvider(
    private val userRepository: UserRepository,
    private val encounterRepository: EncounterRepository
) : TenantUsageProvider {

    @Transactional(readOnly = true)
    override fun getTenantUsage(tenantId: UUID): TenantUsageSnapshot {
        return TenantContext.runWithTenant(tenantId) {
            val activeDoctors = userRepository.countByRoleAndIsActiveTrue(UserRole.DOCTOR).toInt()
            val totalEncounters = encounterRepository.count()
            // Estimate clinical document/attachment storage in bytes (base 5MB + 8KB per encounter)
            val estimatedStorage = 5242880L + (totalEncounters * 8192L)

            TenantUsageSnapshot(
                activeDoctorsCount = activeDoctors,
                totalEncountersCount = totalEncounters,
                totalStorageBytes = estimatedStorage
            )
        }
    }
}
