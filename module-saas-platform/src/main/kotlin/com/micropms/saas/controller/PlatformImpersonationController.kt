package com.micropms.saas.controller

import com.micropms.common.dto.ApiResponse
import com.micropms.saas.dto.AuditImpersonationLogResponse
import com.micropms.saas.dto.ImpersonateTenantRequest
import com.micropms.saas.dto.ImpersonationResponse
import com.micropms.saas.repository.AuditImpersonationLogRepository
import com.micropms.saas.service.ImpersonationService
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Controller allowing authorized super-administrators to initiate audited support impersonation sessions
 * and inspect recent support session audit history.
 */
@RestController
@RequestMapping("/api/v1/platform/impersonation")
@PreAuthorize("hasAuthority('platform:impersonate:tenant') or hasAuthority('ROLE_SUPER_ADMIN')")
class PlatformImpersonationController(
    private val impersonationService: ImpersonationService,
    private val auditLogRepository: AuditImpersonationLogRepository
) {

    /**
     * Issues a short-lived impersonation token (30-minute validity) enabling super admin
     * access to an isolated clinic tenant with mandatory justification and IP audit logging.
     */
    @PostMapping("/token")
    fun issueImpersonationToken(
        @Valid @RequestBody request: ImpersonateTenantRequest,
        servletRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<ImpersonationResponse>> {
        val adminId = resolveCurrentAdminId()
        val clientIp = resolveClientIp(servletRequest)

        val result = impersonationService.issueImpersonationToken(
            adminId = adminId,
            tenantId = request.tenantId,
            justification = request.justification,
            ipAddress = clientIp
        )

        val response = ImpersonationResponse(
            token = result.token,
            tokenType = "Bearer",
            tenantId = result.tenantId,
            sessionExpiresAt = result.expiresAt,
            issuedAt = result.issuedAt
        )

        return ResponseEntity.ok(ApiResponse.ok(response, "Impersonation session established for 30 minutes"))
    }

    /**
     * Retrieves recent immutable impersonation audit logs for compliance review.
     */
    @GetMapping("/audit")
    fun listAuditLogs(
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC) pageable: Pageable,
        @RequestParam(required = false) tenantId: UUID?
    ): ResponseEntity<ApiResponse<Page<AuditImpersonationLogResponse>>> {
        val logsPage = if (tenantId != null) {
            auditLogRepository.findByTenantId(tenantId, pageable)
        } else {
            auditLogRepository.findAll(pageable)
        }

        val mapped = logsPage.map { log ->
            AuditImpersonationLogResponse(
                id = log.id!!,
                adminId = log.adminId,
                tenantId = log.tenantId,
                justification = log.justification,
                ipAddress = log.ipAddress,
                sessionExpiresAt = log.sessionExpiresAt,
                createdAt = log.createdAt
            )
        }

        return ResponseEntity.ok(ApiResponse.ok(mapped, "Audit logs retrieved"))
    }

    private fun resolveCurrentAdminId(): UUID {
        val authentication = SecurityContextHolder.getContext()?.authentication
            ?: throw IllegalStateException("SecurityContext has no active authentication")

        return try {
            UUID.fromString(authentication.name)
        } catch (e: Exception) {
            // Fallback for demo / development administrative sessions
            UUID.fromString("00000000-0000-0000-0000-000000000001")
        }
    }

    private fun resolveClientIp(request: HttpServletRequest): String {
        val xForwardedFor = request.getHeader("X-Forwarded-For")
        if (!xForwardedFor.isNullOrBlank()) {
            return xForwardedFor.split(",")[0].trim()
        }
        val xRealIp = request.getHeader("X-Real-IP")
        if (!xRealIp.isNullOrBlank()) {
            return xRealIp.trim()
        }
        return request.remoteAddr ?: "127.0.0.1"
    }
}
