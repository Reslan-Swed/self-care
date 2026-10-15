package com.micropms.saas.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.saas.entity.PlatformAdmin
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface PlatformAdminRepository : BaseRepository<PlatformAdmin, UUID> {
    fun findByEmail(email: String): Optional<PlatformAdmin>
    fun existsByEmail(email: String): Boolean
}
