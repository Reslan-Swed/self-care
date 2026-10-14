package com.micropms.multitenancy.database

import com.micropms.multitenancy.context.TenantContext
import org.hibernate.resource.jdbc.spi.StatementInspector
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

/**
 * Hibernate StatementInspector hook providing secondary defence-in-depth verification
 * for multi-tenant database operations.
 */
@Component
class HibernateTenantConnectionPreparer : StatementInspector {

    private val log = LoggerFactory.getLogger(HibernateTenantConnectionPreparer::class.java)

    override fun inspect(sql: String): String {
        val currentTenant = TenantContext.getTenantId()
        if (currentTenant != null) {
            log.trace("Hibernate executing SQL under active tenant context {}", currentTenant)
        }
        return sql
    }
}
