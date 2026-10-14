package com.micropms.saas.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.saas.entity.Tenant
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface TenantRepository : BaseRepository<Tenant, UUID> {
    fun findBySubdomain(subdomain: String): Optional<Tenant>
    fun existsBySubdomain(subdomain: String): Boolean
}
