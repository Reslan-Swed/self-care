package com.micropms.multitenancy.interceptor

import com.micropms.multitenancy.context.TenantContext
import com.micropms.multitenancy.security.TenantAuthenticationToken
import com.micropms.multitenancy.security.TenantUserPrincipal
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import java.util.UUID

/**
 * HandlerInterceptor that binds the cryptographically validated tenant identity from
 * SecurityContext / JWT Principal into thread-local TenantContext on preHandle,
 * and guarantees cleanup in afterCompletion to prevent pool poisoning.
 */
@Component
class TenantInterceptor : HandlerInterceptor {

    private val log = LoggerFactory.getLogger(TenantInterceptor::class.java)

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        val authentication = SecurityContextHolder.getContext()?.authentication

        when (authentication) {
            is TenantAuthenticationToken -> {
                if (authentication.isAuthenticated) {
                    val tenantId = authentication.tenantId
                    TenantContext.setTenantId(tenantId)
                    log.trace("TenantContext bound from TenantAuthenticationToken: {}", tenantId)
                }
            }
            is JwtAuthenticationToken -> {
                if (authentication.isAuthenticated) {
                    val tenantIdClaim = authentication.tokenAttributes["tenant_id"]?.toString()
                    if (tenantIdClaim != null) {
                        try {
                            val tenantId = UUID.fromString(tenantIdClaim)
                            TenantContext.setTenantId(tenantId)
                            log.trace("TenantContext bound from JwtAuthenticationToken: {}", tenantId)
                        } catch (e: Exception) {
                            log.warn("Failed to parse tenant_id claim '{}' from JWT", tenantIdClaim)
                        }
                    }
                }
            }
            else -> {
                val principal = authentication?.principal
                if (principal is TenantUserPrincipal) {
                    TenantContext.setTenantId(principal.tenantId)
                    log.trace("TenantContext bound from TenantUserPrincipal: {}", principal.tenantId)
                }
            }
        }

        return true
    }

    override fun afterCompletion(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        ex: Exception?
    ) {
        // ALWAYS clean up TenantContext to prevent thread-pool poisoning across requests
        TenantContext.clear()
        log.trace("TenantContext cleanly removed from thread in afterCompletion")
    }
}
