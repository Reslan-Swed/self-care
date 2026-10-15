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
import java.time.Instant
import java.util.UUID

/**
 * HandlerInterceptor enforcing multi-tenant isolation and token boundary segregation:
 * 1. Platform Admin Tokens:
 *    - Bypasses TenantContext injection (leaves tenant_id null).
 *    - Restricts access strictly to /api/platform/** endpoints (returns HTTP 403 otherwise).
 * 2. Tenant User Tokens:
 *    - Binds cryptographically validated tenant identity into thread-local TenantContext on preHandle.
 *    - Prevents tenant users from accessing /api/platform/** endpoints.
 * 3. Guarantees cleanup in afterCompletion to prevent thread-pool poisoning.
 */
@Component
class TenantInterceptor : HandlerInterceptor {

    private val log = LoggerFactory.getLogger(TenantInterceptor::class.java)

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        val authentication = SecurityContextHolder.getContext()?.authentication ?: return true
        val uri = request.requestURI

        // Allow public/actuator/swagger paths without restriction
        if (isPublicOrInfrastructurePath(uri)) {
            return true
        }

        when (authentication) {
            is TenantAuthenticationToken -> {
                if (!authentication.isAuthenticated) {
                    return true
                }

                if (authentication.isPlatformAdmin) {
                    // Platform Admin Token:
                    // Bypasses TenantContext injection (leaves tenant_id null)
                    // Restricts access strictly to /api/platform/** endpoints
                    if (!uri.startsWith("/api/platform")) {
                        log.warn("Access denied: Platform Admin principal {} attempted to access tenant-scoped endpoint {}", authentication.userId, uri)
                        response.status = HttpServletResponse.SC_FORBIDDEN
                        response.contentType = "application/json"
                        response.writer.write("""{"code":403,"message":"Access denied: Platform Admin tokens are restricted strictly to /api/platform/** endpoints.","errors":null,"timestamp":"${Instant.now()}"}""")
                        return false
                    }
                    // TenantContext remains null for control plane operations
                    log.trace("Platform Admin {} accessing control plane endpoint {}. TenantContext remains null.", authentication.userId, uri)
                    return true
                } else {
                    // Tenant User Token:
                    // Prohibit access to platform control plane endpoints
                    if (uri.startsWith("/api/platform")) {
                        log.warn("Access denied: Tenant User principal {} attempted to access platform-admin endpoint {}", authentication.userId, uri)
                        response.status = HttpServletResponse.SC_FORBIDDEN
                        response.contentType = "application/json"
                        response.writer.write("""{"code":403,"message":"Access denied: Tenant users cannot access /api/platform/** endpoints.","errors":null,"timestamp":"${Instant.now()}"}""")
                        return false
                    }

                    val tenantId = authentication.tenantId
                    if (tenantId != null) {
                        TenantContext.setTenantId(tenantId)
                        log.trace("TenantContext bound from TenantAuthenticationToken: {}", tenantId)
                    }
                    return true
                }
            }
            is JwtAuthenticationToken -> {
                if (authentication.isAuthenticated) {
                    val userType = authentication.tokenAttributes["user_type"]?.toString()
                    val isPlatformAdmin = "PLATFORM_ADMIN".equals(userType, ignoreCase = true)

                    if (isPlatformAdmin) {
                        if (!uri.startsWith("/api/platform")) {
                            response.status = HttpServletResponse.SC_FORBIDDEN
                            response.contentType = "application/json"
                            response.writer.write("""{"code":403,"message":"Access denied: Platform Admin tokens are restricted strictly to /api/platform/** endpoints.","errors":null,"timestamp":"${Instant.now()}"}""")
                            return false
                        }
                        return true
                    }

                    if (uri.startsWith("/api/platform")) {
                        response.status = HttpServletResponse.SC_FORBIDDEN
                        response.contentType = "application/json"
                        response.writer.write("""{"code":403,"message":"Access denied: Tenant users cannot access /api/platform/** endpoints.","errors":null,"timestamp":"${Instant.now()}"}""")
                        return false
                    }

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
                val principal = authentication.principal
                if (principal is TenantUserPrincipal) {
                    if (principal.isPlatformAdmin) {
                        if (!uri.startsWith("/api/platform")) {
                            response.status = HttpServletResponse.SC_FORBIDDEN
                            return false
                        }
                        return true
                    }
                    if (uri.startsWith("/api/platform")) {
                        response.status = HttpServletResponse.SC_FORBIDDEN
                        return false
                    }
                    principal.tenantId?.let { TenantContext.setTenantId(it) }
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

    private fun isPublicOrInfrastructurePath(uri: String): Boolean {
        return uri.startsWith("/api/public") ||
                uri.startsWith("/api/auth") ||
                uri.startsWith("/actuator") ||
                uri.startsWith("/swagger-ui") ||
                uri.startsWith("/v3/api-docs")
    }
}
