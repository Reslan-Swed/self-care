package com.micropms.multitenancy.interceptor

import com.micropms.multitenancy.context.TenantContext
import com.micropms.multitenancy.security.TenantAuthenticationToken
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import java.util.UUID

/**
 * Interceptor responsible for binding the cryptographically verified tenant identity
 * from the Spring Security authentication token into the thread-local TenantContext,
 * and strictly clearing the context upon request completion.
 */
@Component
class TenantInterceptor : HandlerInterceptor {

    private val log = LoggerFactory.getLogger(TenantInterceptor::class.java)

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        val authentication = SecurityContextHolder.getContext().authentication

        if (authentication is TenantAuthenticationToken && authentication.isAuthenticated) {
            val tenantId = authentication.tenantId
            TenantContext.setTenantId(tenantId)
            log.trace("TenantContext initialized with tenantId: {}", tenantId)
        }

        return true
    }

    override fun afterCompletion(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        ex: Exception?
    ) {
        // ALWAYS clean up TenantContext to prevent thread-pool contamination across requests
        TenantContext.clear()
        log.trace("TenantContext cleanly removed from thread")
    }
}
