package com.micropms.saas.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.saas.entity.AuditImpersonationLog
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface AuditImpersonationLogRepository : BaseRepository<AuditImpersonationLog, UUID> {
    fun findByAdminId(adminId: UUID, pageable: Pageable): Page<AuditImpersonationLog>
    fun findByTenantId(tenantId: UUID, pageable: Pageable): Page<AuditImpersonationLog>
}
