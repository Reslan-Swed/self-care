package com.micropms.common.exception

/**
 * Thrown when a tenant attempts to provision resources (such as active doctors)
 * exceeding the allowances of their active SaaS subscription tier.
 */
class QuotaExceededException(message: String) : RuntimeException(message)
