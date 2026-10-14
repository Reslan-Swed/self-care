package com.micropms.saas.exception

/**
 * Thrown when attempting to register a clinic with a subdomain slug that is already reserved or in use.
 */
class SlugAlreadyExistsException(val slug: String) :
    RuntimeException("Clinic subdomain slug '$slug' is already in use")

/**
 * Thrown when an active clinic violates or reaches their subscription tier quota (e.g. max doctors limit).
 */
class QuotaExceededException(val quotaName: String, val limit: Int, val currentCount: Int) :
    RuntimeException("Quota limit reached for '$quotaName': current count $currentCount meets or exceeds maximum limit of $limit")

/**
 * Thrown when attempting an invalid lifecycle state transition for a subscription or clinic.
 */
class InvalidSubscriptionStateException(message: String) :
    RuntimeException(message)

/**
 * Thrown when an unauthorized or unprivileged attempt is made to initiate a support impersonation session.
 */
class UnauthorizedImpersonationException(message: String) :
    RuntimeException(message)
