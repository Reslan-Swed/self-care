package com.micropms.common.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.domain.AuditorAware
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import org.springframework.security.core.context.SecurityContextHolder
import java.util.Optional
import java.util.UUID

/**
 * Enables Spring Data JPA Auditing and resolves createdBy / lastModifiedBy
 * automatically from the security context principal (JWT subject).
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
class JpaAuditingConfig {

    @Bean
    fun auditorAware(): AuditorAware<UUID> {
        return AuditorAware {
            val authentication = SecurityContextHolder.getContext()?.authentication
            if (authentication == null || !authentication.isAuthenticated || authentication.principal == "anonymousUser") {
                Optional.empty()
            } else {
                try {
                    val name = authentication.name
                    Optional.of(UUID.fromString(name))
                } catch (e: Exception) {
                    Optional.empty()
                }
            }
        }
    }
}
