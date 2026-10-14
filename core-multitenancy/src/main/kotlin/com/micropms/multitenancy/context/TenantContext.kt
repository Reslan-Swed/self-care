package com.micropms.multitenancy.context

import java.util.UUID

/**
 * Thread-safe Kotlin object wrapping ThreadLocal<UUID?> for managing the active tenant context.
 * Strictly guarantees clean lifecycle and prevention of thread pool poisoning.
 */
object TenantContext {

    private val currentTenant = ThreadLocal<UUID?>()

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

    /**
     * Executes the given code block within the specified tenant scope and guarantees cleanup
     * or context restoration in a finally block to prevent thread-pool poisoning.
     */
    inline fun <T> runWithTenant(tenantId: UUID, block: () -> T): T {
        val previousTenantId = getTenantId()
        setTenantId(tenantId)
        return try {
            block()
        } finally {
            if (previousTenantId != null) {
                setTenantId(previousTenantId)
            } else {
                clear()
            }
        }
    }
}
