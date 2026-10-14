package com.micropms.saas.controller

import com.micropms.common.controller.BaseController
import com.micropms.saas.entity.Tenant
import com.micropms.saas.entity.TenantStatus
import com.micropms.saas.repository.TenantRepository
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.util.UUID

data class TenantCreateForm(
    @field:NotBlank(message = "Clinic name cannot be blank")
    val name: String,

    @field:NotBlank(message = "Subdomain cannot be blank")
    @field:Pattern(regexp = "^[a-z0-9-]+$", message = "Subdomain must contain only lowercase alphanumeric characters and hyphens")
    val subdomain: String,

    @field:Email(message = "Valid admin email required")
    @field:NotBlank(message = "Admin email cannot be blank")
    val adminEmail: String
)

data class TenantResponseDto(
    val id: UUID,
    val name: String,
    val subdomain: String,
    val status: TenantStatus,
    val adminEmail: String,
    val createdAt: Instant,
    val updatedAt: Instant
)

@RestController
@RequestMapping("/api/v1/platform/tenants")
@PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
class TenantController(
    tenantRepository: TenantRepository
) : BaseController<Tenant, UUID, TenantCreateForm, TenantResponseDto>(
    repository = tenantRepository,
    resourceName = "Tenant"
) {

    override fun toEntity(form: TenantCreateForm): Tenant {
        return Tenant(
            name = form.name,
            subdomain = form.subdomain,
            adminEmail = form.adminEmail,
            status = TenantStatus.ACTIVE
        )
    }

    override fun toResponseDto(entity: Tenant): TenantResponseDto {
        return TenantResponseDto(
            id = entity.id ?: throw IllegalStateException("Tenant ID unassigned"),
            name = entity.name,
            subdomain = entity.subdomain,
            status = entity.status,
            adminEmail = entity.adminEmail,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    override fun updateEntityFromForm(entity: Tenant, form: TenantCreateForm): Tenant {
        entity.name = form.name
        entity.adminEmail = form.adminEmail
        return entity
    }
}
