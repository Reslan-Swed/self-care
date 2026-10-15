package com.micropms.saas.entity

import com.micropms.common.entity.BaseAuditEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Index
import jakarta.persistence.Table

/**
 * Control Plane entity representing a global platform administrator or support engineer.
 * Strictly inherits BaseAuditEntity directly (NO tenant_id column and NEVER extends BaseTenantEntity).
 */
@Entity
@Table(
    name = "platform_admins",
    indexes = [
        Index(name = "idx_platform_admins_email", columnList = "email", unique = true)
    ]
)
class PlatformAdmin(
    @Column(name = "email", nullable = false, unique = true, length = 255)
    var email: String,

    @Column(name = "password_hash", nullable = false, length = 255)
    var passwordHash: String,

    @Column(name = "full_name", nullable = false, length = 255)
    var fullName: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    var role: PlatformRole = PlatformRole.SUPER_ADMIN,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true
) : BaseAuditEntity()
