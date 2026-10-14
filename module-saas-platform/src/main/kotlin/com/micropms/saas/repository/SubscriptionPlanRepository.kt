package com.micropms.saas.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.saas.entity.SubscriptionPlan
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface SubscriptionPlanRepository : BaseRepository<SubscriptionPlan, UUID> {
    fun findByCode(code: String): Optional<SubscriptionPlan>
    fun existsByCode(code: String): Boolean
}
