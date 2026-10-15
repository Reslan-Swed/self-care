package com.micropms.saas.service

import com.micropms.common.exception.QuotaExceededException
import com.micropms.common.quota.DoctorQuotaValidator
import com.micropms.saas.entity.SubscriptionStatus
import com.micropms.saas.repository.SubscriptionRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

/**
 * Validates clinic doctor headcount against the active subscription tier limits.
 * Implements DoctorQuotaValidator from core-common to keep module-clinic-core decoupled.
 */
@Service
class DefaultDoctorQuotaValidator(
    private val subscriptionRepository: SubscriptionRepository
) : DoctorQuotaValidator {

    private val log = LoggerFactory.getLogger(DefaultDoctorQuotaValidator::class.java)

    override fun validateDoctorQuota(tenantId: UUID, currentDoctorCount: Long) {
        val subscription = subscriptionRepository.findByTenantId(tenantId)
            .orElseThrow {
                IllegalStateException("No active subscription plan found for clinic tenant $tenantId. Cannot provision clinical staff.")
            }

        if (subscription.status != SubscriptionStatus.ACTIVE) {
            throw QuotaExceededException("Cannot add doctors to tenant $tenantId: Subscription is currently ${subscription.status}.")
        }

        val maxAllowed = subscription.plan.maxDoctors
        log.debug("Verifying doctor quota for tenant {}: current active count={}, max allowed={}", tenantId, currentDoctorCount, maxAllowed)

        if (currentDoctorCount >= maxAllowed) {
            throw QuotaExceededException(
                "Subscription doctor quota exceeded for tenant. Current plan '${subscription.plan.name}' allows up to $maxAllowed doctor(s). Active doctors: $currentDoctorCount."
            )
        }
    }
}
