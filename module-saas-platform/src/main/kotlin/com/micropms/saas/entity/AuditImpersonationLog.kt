package com.micropms.saas.entity

import com.micropms.common.entity.BaseAuditEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Index
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

/**
 * Immutable audit log entity recording all privileged super-admin impersonation sessions
 * for clinical support, troubleshooting, and compliance verification.
 * Inherits BaseAuditEntity directly (NO tenant_id isolation column).
 */
@Entity
@Table(
    name = "platform_impersonation_logs",
    indexes = [
        Index(name = "idx_impersonation_admin", columnList = "admin_id"),
        Index(name = "idx_impersonation_target_tenant", columnList = "target_tenant_id"),
        Index(name = "idx_impersonation_created_at", columnList = "created_at")
    ]
)
class AuditImpersonationLog(
    @Column(name = "admin_id", nullable = false, updatable = false)
    var adminId: UUID,

    @Column(name = "target_tenant_id", nullable = false, updatable = false)
    var tenantId: UUID,

    @Column(name = "justification", nullable = false, updatable = false, columnDefinition = "TEXT")
    var justification: String,

    @Column(name = "ip_address", nullable = false, updatable = false, length = 45)
    var ipAddress: String,

    @Column(name = "session_expires_at", nullable = false, updatable = false)
    var sessionExpiresAt: Instant
) : BaseAuditEntity()
