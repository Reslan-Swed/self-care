package com.micropms.multitenancy.config

import com.micropms.multitenancy.interceptor.TenantInterceptor
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.AutoConfiguration
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 * Spring Boot auto-configuration class wiring multi-tenancy interceptors,
 * JPA auditing auditor aware, and web MVC lifecycle handlers.
 */
@Configuration
@ComponentScan(basePackages = ["com.micropms.multitenancy"])
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
class MultiTenancyAutoConfiguration(
    private val tenantInterceptor: TenantInterceptor
) : WebMvcConfigurer {

    private val log = LoggerFactory.getLogger(MultiTenancyAutoConfiguration::class.java)

    override fun addInterceptors(registry: InterceptorRegistry) {
        log.info("Registering TenantInterceptor with exclusion paths: /api/public/**, /api/auth/**, /actuator/**")

        registry.addInterceptor(tenantInterceptor)
            .addPathPatterns("/**")
            .excludePathPatterns(
                "/api/public/**",
                "/api/auth/**",
                "/actuator/**",
                "/v3/api-docs/**",
                "/swagger-ui/**",
                "/swagger-ui.html",
                "/error"
            )
            .order(1)
    }
}
