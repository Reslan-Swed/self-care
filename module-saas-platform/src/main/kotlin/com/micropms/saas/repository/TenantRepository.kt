package com.micropms.saas.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.saas.entity.Tenant
import com.micropms.saas.entity.TenantStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface TenantRepository : BaseRepository<Tenant, UUID> {
    fun findBySlug(slug: String): Optional<Tenant>
    fun existsBySlug(slug: String): Boolean
    fun findByStatus(status: TenantStatus, pageable: Pageable): Page<Tenant>
    fun countByStatus(status: TenantStatus): Long
}
