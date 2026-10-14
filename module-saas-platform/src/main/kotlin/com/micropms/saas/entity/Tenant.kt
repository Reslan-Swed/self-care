package com.micropms.saas.entity

import com.micropms.common.entity.BaseAuditEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Index
import jakarta.persistence.Table

enum class TenantStatus {
    TRIAL,
    ACTIVE,
    PAST_DUE,
    SUSPENDED
}

enum class SpecialtyType {
    GENERAL,
    DENTAL,
    DERMATOLOGY,
    PEDIATRICS
}

/**
 * Control Plane entity representing an isolated clinic organization or practice.
 * Strictly inherits BaseAuditEntity directly and NEVER extends BaseTenantEntity.
 */
@Entity
@Table(
    name = "platform_tenants",
    indexes = [
        Index(name = "idx_platform_tenants_slug", columnList = "slug", unique = true),
        Index(name = "idx_platform_tenants_status", columnList = "status")
    ]
)
class Tenant(
    @Column(name = "slug", nullable = false, unique = true, length = 100)
    var slug: String,

    @Column(name = "name", nullable = false)
    var name: String,

    @Column(name = "phone")
    var phone: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    var status: TenantStatus = TenantStatus.TRIAL,

    @Enumerated(EnumType.STRING)
    @Column(name = "specialty", nullable = false, length = 50)
    var specialty: SpecialtyType = SpecialtyType.GENERAL,

    @Column(name = "admin_email", nullable = false)
    var adminEmail: String
) : BaseAuditEntity()
