package com.micropms.saas.service

import com.micropms.common.notification.WhatsAppCreditPort
import com.micropms.common.notification.WhatsAppCreditStatus
import com.micropms.saas.entity.SubscriptionStatus
import com.micropms.saas.repository.SubscriptionRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Adapter implementing WhatsAppCreditPort from core-common.
 * Checks and consumes subscription SMS/WhatsApp credits within transaction boundaries.
 */
@Service
class DefaultWhatsAppCreditAdapter(
    private val subscriptionRepository: SubscriptionRepository
) : WhatsAppCreditPort {

    private val log = LoggerFactory.getLogger(DefaultWhatsAppCreditAdapter::class.java)

    @Transactional(readOnly = true)
    override fun checkCredits(tenantId: UUID): WhatsAppCreditStatus {
        val subscription = subscriptionRepository.findByTenantId(tenantId).orElse(null)
            ?: return WhatsAppCreditStatus(enabled = false, remainingCredits = 0, canDispatchAutomated = false)

        val isActive = subscription.status == SubscriptionStatus.ACTIVE
        val isEnabled = subscription.plan.whatsappEnabled && isActive
        val credits = subscription.smsWhatsappCredits

        return WhatsAppCreditStatus(
            enabled = isEnabled,
            remainingCredits = credits,
            canDispatchAutomated = isEnabled && credits > 0
        )
    }

    @Transactional
    override fun consumeCredit(tenantId: UUID): Boolean {
        val subscription = subscriptionRepository.findByTenantId(tenantId).orElse(null)
            ?: return false

        if (subscription.status != SubscriptionStatus.ACTIVE || !subscription.plan.whatsappEnabled) {
            log.warn("Cannot consume WhatsApp credit for tenant {}: WhatsApp is disabled or subscription is not active", tenantId)
            return false
        }

        if (subscription.smsWhatsappCredits <= 0) {
            log.warn("Cannot consume WhatsApp credit for tenant {}: 0 credits remaining", tenantId)
            return false
        }

        subscription.smsWhatsappCredits -= 1
        subscriptionRepository.save(subscription)
        log.info("Consumed 1 WhatsApp credit for tenant {}. Remaining: {}", tenantId, subscription.smsWhatsappCredits)
        return true
    }
}
