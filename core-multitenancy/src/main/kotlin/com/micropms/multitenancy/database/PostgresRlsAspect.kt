package com.micropms.multitenancy.database

import com.micropms.multitenancy.context.TenantContext
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.slf4j.LoggerFactory
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.util.UUID

/**
 * Aspect intercepting Spring @Transactional boundaries to configure PostgreSQL
 * Row-Level Security (RLS) on the current connection.
 *
 * Uses 'SET LOCAL app.current_tenant_id = :tenantId' which guarantees that the
 * configuration parameter is automatically discarded upon transaction COMMIT or
 * ROLLBACK, preventing HikariCP pool poisoning and ensuring zero data leakage.
 */
@Aspect
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
class PostgresRlsAspect(
    private val jdbcTemplate: JdbcTemplate
) {

    private val log = LoggerFactory.getLogger(PostgresRlsAspect::class.java)

    @Around("@annotation(org.springframework.transaction.annotation.Transactional) || @within(org.springframework.transaction.annotation.Transactional)")
    fun applyTenantRlsBoundary(joinPoint: ProceedingJoinPoint): Any? {
        val tenantId = TenantContext.getTenantId()

        if (tenantId != null) {
            setLocalTenantSessionVariable(tenantId)
        } else {
            log.trace("Executing transaction in system/global context without tenant RLS boundary")
        }

        return joinPoint.proceed()
    }

    /**
     * Executes the SQL session command on the active database connection.
     * Enforces UUID format to prevent SQL injection vulnerabilities.
     */
    fun setLocalTenantSessionVariable(tenantId: UUID) {
        // Strict format assertion for UUID string
        val sanitizedUuid = tenantId.toString()
        require(sanitizedUuid.matches(UUID_REGEX)) { "Invalid UUID format for tenant RLS session" }

        try {
            jdbcTemplate.execute("SET LOCAL app.current_tenant_id = '$sanitizedUuid'")
            log.trace("Applied PostgreSQL RLS session: SET LOCAL app.current_tenant_id = '{}'", sanitizedUuid)
        } catch (e: Exception) {
            log.error("Failed to execute SET LOCAL app.current_tenant_id for tenant {}: {}", sanitizedUuid, e.message)
            throw IllegalStateException("Database RLS tenant boundary could not be initialized", e)
        }
    }

    companion object {
        private val UUID_REGEX = Regex("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
    }
}
