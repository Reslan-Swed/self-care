package com.micropms.common.notification

import java.util.UUID

/**
 * Status of tenant WhatsApp capabilities and credit allowances.
 */
data class WhatsAppCreditStatus(
    val enabled: Boolean,
    val remainingCredits: Int,
    val canDispatchAutomated: Boolean
)

/**
 * Decoupled SPI allowing module-clinic-core to query and consume WhatsApp credits
 * against the SaaS subscription without direct compile dependency on module-saas-platform.
 */
interface WhatsAppCreditPort {
    fun checkCredits(tenantId: UUID): WhatsAppCreditStatus
    fun consumeCredit(tenantId: UUID): Boolean
}
