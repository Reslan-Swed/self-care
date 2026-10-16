package com.micropms.multitenancy.config

import com.micropms.multitenancy.security.CustomJwtAuthenticationConverter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

/**
 * Production Spring Security configuration enforcing stateless session management,
 * OAuth2 Resource Server JWT validation via CustomJwtAuthenticationConverter,
 * and fine-grained method-level RBAC security (@PreAuthorize).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
class SecurityConfig(
    private val customJwtAuthenticationConverter: CustomJwtAuthenticationConverter
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            // 1. Disable CSRF for stateless REST APIs
            .csrf { it.disable() }
            .cors { it.configurationSource(corsConfigurationSource()) }

            // 2. Stateless session policy
            .sessionManagement { session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }

            // 3. Endpoint authorization rules
            .authorizeHttpRequests { auth ->
                auth
                    // Public endpoints
                    .requestMatchers(
                        "/api/public/**",
                        "/api/auth/**",
                        "/api/platform/auth/**",
                        "/actuator/health/**",
                        "/actuator/info",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html"
                    ).permitAll()
                    // All other clinical and SaaS endpoints require authentication
                    .anyRequest().authenticated()
            }

            // 4. JWT Resource Server validation with CustomJwtAuthenticationConverter
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwtConfigurer ->
                    jwtConfigurer.jwtAuthenticationConverter(customJwtAuthenticationConverter)
                }
            }

        return http.build()
    }

    @Bean
    fun passwordEncoder(): org.springframework.security.crypto.password.PasswordEncoder {
        return org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration().apply {
            allowedOriginPatterns = listOf("*")
            allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            allowedHeaders = listOf("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin")
            exposedHeaders = listOf("Location", "Content-Disposition")
            allowCredentials = true
            maxAge = 3600L
        }
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
}
