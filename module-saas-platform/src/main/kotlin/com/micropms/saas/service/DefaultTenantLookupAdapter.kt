package com.micropms.saas.service

import com.micropms.common.tenant.TenantLookupPort
import com.micropms.common.tenant.TenantSummary
import com.micropms.saas.entity.TenantStatus
import com.micropms.saas.repository.TenantRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Adapter implementing TenantLookupPort from core-common.
 * Allows module-clinic-core to resolve tenant status and metadata across module boundaries.
 */
@Service
@Transactional(readOnly = true)
class DefaultTenantLookupAdapter(
    private val tenantRepository: TenantRepository
) : TenantLookupPort {

    override fun findBySlug(slug: String): TenantSummary? {
        val normalizedSlug = slug.trim().lowercase()
        return tenantRepository.findBySlug(normalizedSlug)
            .map { tenant ->
                TenantSummary(
                    id = tenant.id,
                    slug = tenant.slug,
                    name = tenant.name,
                    status = tenant.status.name,
                    specialty = tenant.specialty.name,
                    isActive = tenant.status != TenantStatus.SUSPENDED
                )
            }
            .orElse(null)
    }

    override fun findById(id: UUID): TenantSummary? {
        return tenantRepository.findById(id)
            .map { tenant ->
                TenantSummary(
                    id = tenant.id,
                    slug = tenant.slug,
                    name = tenant.name,
                    status = tenant.status.name,
                    specialty = tenant.specialty.name,
                    isActive = tenant.status != TenantStatus.SUSPENDED
                )
            }
            .orElse(null)
    }
}
