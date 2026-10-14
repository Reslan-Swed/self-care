package com.micropms.saas.event

import com.micropms.saas.entity.SpecialtyType
import java.time.Instant
import java.util.UUID

/**
 * Domain event published when a new clinic tenant is registered and provisioned on the platform.
 * Triggers downstream async workflows: admin credential dispatch, notification hooks, and database schemas.
 */
data class ClinicProvisionedEvent(
    val tenantId: UUID,
    val slug: String,
    val name: String,
    val adminEmail: String,
    val initialPassword: String,
    val specialty: SpecialtyType,
    val provisionedAt: Instant = Instant.now()
)
