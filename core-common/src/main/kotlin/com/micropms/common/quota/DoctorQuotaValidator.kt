package com.micropms.common.quota

import java.util.UUID

/**
 * Functional interface for validating clinic resource quotas (e.g., maximum allowed doctors)
 * against the tenant's active SaaS subscription plan.
 * Decouples module-clinic-core from direct control-plane module dependencies.
 */
fun interface DoctorQuotaValidator {
    fun validateDoctorQuota(tenantId: UUID, currentDoctorCount: Long)
}
