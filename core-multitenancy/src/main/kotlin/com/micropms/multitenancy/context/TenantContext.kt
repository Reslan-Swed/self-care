package com.micropms.multitenancy.context

import java.util.UUID

/**
 * Thread-safe holder for the current execution thread's tenant context.
 * Guaranteed to be cleaned up after request completion to prevent thread-pool leakage.
 */
object TenantContext {

    private val currentTenant = ThreadLocal<UUID>()

    fun setTenantId(tenantId: UUID) {
        currentTenant.set(tenantId)
    }

    fun getTenantId(): UUID? {
        return currentTenant.get()
    }

    fun requireTenantId(): UUID {
        return currentTenant.get()
            ?: throw IllegalStateException("TenantContext is empty: request is not within a tenant-scoped session")
    }

    fun clear() {
        currentTenant.remove()
    }
}
