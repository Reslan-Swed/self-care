package com.micropms.common.tenant

import java.util.UUID

/**
 * Lightweight tenant metadata representation for authentication and context resolution.
 */
data class TenantSummary(
    val id: UUID,
    val slug: String,
    val name: String,
    val status: String,
    val specialty: String? = null,
    val isActive: Boolean = true
)

/**
 * Decoupled SPI allowing module-clinic-core to resolve tenant status and metadata
 * without taking a direct compile dependency on module-saas-platform entities.
 */
fun interface TenantLookupPort {
    fun findBySlug(slug: String): TenantSummary?
    fun findById(id: UUID): TenantSummary? = null
}
