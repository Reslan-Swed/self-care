package com.micropms.saas.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.saas.entity.Subscription
import com.micropms.saas.entity.SubscriptionStatus
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

    fun findAllByStatus(status: SubscriptionStatus): List<Subscription>

    fun countByStatus(status: SubscriptionStatus): Long

    @Query("SELECT COALESCE(SUM(s.plan.priceCents), 0) FROM Subscription s WHERE s.status = 'ACTIVE'")
    fun sumActiveMrrCents(): Long

    @Query("SELECT COALESCE(SUM(s.smsWhatsappCredits), 0) FROM Subscription s")
    fun sumTotalCreditsRemaining(): Long
}
