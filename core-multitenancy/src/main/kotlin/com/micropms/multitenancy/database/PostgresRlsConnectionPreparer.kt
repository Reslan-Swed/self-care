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
 * Enforces database-level isolation via PostgreSQL Row Level Security (RLS).
 * Intercepts @Transactional method executions to inject the tenant context
 * into PostgreSQL session variables:
 *
 *   SET LOCAL app.current_tenant_id = '<tenant-id>';
 *
 * This ensures that even if an application bug bypasses ORM queries,
 * the PostgreSQL database engine refuses to return or alter records of another tenant.
 */
@Aspect
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
class PostgresRlsConnectionPreparer(
    private val jdbcTemplate: JdbcTemplate
) {

    private val log = LoggerFactory.getLogger(PostgresRlsConnectionPreparer::class.java)

    @Around("@annotation(org.springframework.transaction.annotation.Transactional) || @within(org.springframework.transaction.annotation.Transactional)")
    fun enforceTenantRls(joinPoint: ProceedingJoinPoint): Any? {
        val tenantId = TenantContext.getTenantId()

        if (tenantId != null) {
            setPostgresTenantSessionVariable(tenantId)
        }

        return joinPoint.proceed()
    }

    /**
     * Executes the PostgreSQL session-local variable assignment.
     * Uses SET LOCAL so the setting is strictly scoped to the current transaction
     * and automatically reverts on transaction commit/rollback.
     */
    fun setPostgresTenantSessionVariable(tenantId: UUID) {
        try {
            jdbcTemplate.execute("SET LOCAL app.current_tenant_id = '${tenantId}'")
            log.trace("Configured PostgreSQL RLS session: app.current_tenant_id = {}", tenantId)
        } catch (e: Exception) {
            log.error("Failed to set PostgreSQL RLS session variable for tenant {}: {}", tenantId, e.message)
            throw IllegalStateException("Database RLS tenant boundary could not be initialized", e)
        }
    }
}
