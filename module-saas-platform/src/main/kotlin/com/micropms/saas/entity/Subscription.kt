package com.micropms.saas.entity

import com.micropms.common.entity.BaseAuditEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Index
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import java.time.Instant

enum class SubscriptionStatus {
    ACTIVE,
    CANCELLED,
    EXPIRED
}

/**
 * Control Plane entity representing an active clinic subscription tier,
 * renewal billing period, and allocated messaging credits.
 * Strictly inherits BaseAuditEntity directly (NO BaseTenantEntity).
 */
@Entity
@Table(
    name = "platform_subscriptions",
    indexes = [
        Index(name = "idx_platform_subscriptions_tenant", columnList = "tenant_id"),
        Index(name = "idx_platform_subscriptions_status", columnList = "status")
    ]
)
class Subscription(
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, unique = true)
    var tenant: Tenant,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plan_id", nullable = false)
    var plan: SubscriptionPlan,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    var status: SubscriptionStatus = SubscriptionStatus.ACTIVE,

    @Column(name = "current_period_start", nullable = false)
    var currentPeriodStart: Instant = Instant.now(),

    @Column(name = "current_period_end", nullable = false)
    var currentPeriodEnd: Instant,

    @Column(name = "sms_whatsapp_credits", nullable = false)
    var smsWhatsappCredits: Int = 0
) : BaseAuditEntity()
