package com.micropms.multitenancy.entity

import com.micropms.common.entity.BaseAuditEntity
import com.micropms.multitenancy.context.TenantContext
import jakarta.persistence.Column
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.PrePersist
import java.util.UUID

/**
 * Base mapped superclass for all Application Plane tenant-scoped entities.
 * Automatically injects and enforces the tenant identifier from the validated
 * thread-local TenantContext on persistence.
 */
@MappedSuperclass
abstract class BaseTenantEntity : BaseAuditEntity() {

    @Column(name = "tenant_id", nullable = false, updatable = false)
    open var tenantId: UUID? = null

    /**
     * Injects the active tenantId from TenantContext prior to entity persistence.
     * Prevents tenant cross-contamination and enforces zero data leakage.
     */
    @PrePersist
    fun prePersistTenantEnforcement() {
        val currentTenant = TenantContext.getTenantId()
            ?: throw IllegalStateException("Cannot persist ${this::class.simpleName} without an active TenantContext in session")

        if (this.tenantId == null) {
            this.tenantId = currentTenant
        } else if (this.tenantId != currentTenant) {
            throw SecurityException("Security violation: Attempted to persist entity with mismatched tenant ID (${this.tenantId}) against active session ($currentTenant)")
        }
    }
}
