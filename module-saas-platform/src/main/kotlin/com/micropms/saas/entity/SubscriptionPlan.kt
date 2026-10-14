package com.micropms.saas.entity

import com.micropms.common.entity.BaseAuditEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Index
import jakarta.persistence.Table

/**
 * Control Plane entity defining available subscription tiers and quota limits.
 * Inherits BaseAuditEntity directly (NO tenant_id column).
 */
@Entity
@Table(
    name = "platform_plans",
    indexes = [
        Index(name = "idx_platform_plans_code", columnList = "code", unique = true)
    ]
)
class SubscriptionPlan(
    @Column(name = "code", nullable = false, unique = true, length = 50)
    var code: String,

    @Column(name = "name", nullable = false, length = 100)
    var name: String,

    @Column(name = "max_doctors", nullable = false)
    var maxDoctors: Int = 1,

    @Column(name = "whatsapp_enabled", nullable = false)
    var whatsappEnabled: Boolean = false,

    @Column(name = "price_cents", nullable = false)
    var priceCents: Int = 0
) : BaseAuditEntity()
