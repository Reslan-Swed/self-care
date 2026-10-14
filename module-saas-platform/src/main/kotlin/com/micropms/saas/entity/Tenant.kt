package com.micropms.saas.entity

import com.micropms.common.entity.BaseAuditEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Table

enum class TenantStatus {
    ACTIVE,
    SUSPENDED,
    TRIALING,
    DEACTIVATED
}

/**
 * Control Plane entity representing an isolated clinic organization or practice.
 * Strictly extends BaseAuditEntity (Control Plane entities DO NOT have a tenant_id).
 */
@Entity
@Table(name = "platform_tenants")
class Tenant(
    @Column(name = "name", nullable = false)
    var name: String,

    @Column(name = "subdomain", nullable = false, unique = true)
    var subdomain: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: TenantStatus = TenantStatus.TRIALING,

    @Column(name = "admin_email", nullable = false)
    var adminEmail: String
) : BaseAuditEntity()
