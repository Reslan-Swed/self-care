package com.micropms.saas.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.saas.entity.Subscription
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface SubscriptionRepository : BaseRepository<Subscription, UUID> {

    @Query("SELECT s FROM Subscription s JOIN FETCH s.plan JOIN FETCH s.tenant WHERE s.tenant.id = :tenantId")
    fun findByTenantId(@Param("tenantId") tenantId: UUID): Optional<Subscription>

    @Query("SELECT s FROM Subscription s JOIN FETCH s.plan JOIN FETCH s.tenant WHERE s.tenant.slug = :slug")
    fun findByTenantSlug(@Param("slug") slug: String): Optional<Subscription>
}
