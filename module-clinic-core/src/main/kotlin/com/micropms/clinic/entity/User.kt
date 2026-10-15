package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Index
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint

/**
 * Application Plane entity representing clinic staff (Doctors, Receptionists, Clinic Admins).
 * Extends BaseTenantEntity and enforces strict tenant scoping with PostgreSQL RLS.
 * Composite unique constraint enforces (tenant_id, email) isolation.
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = [
        UniqueConstraint(name = "uq_users_tenant_email", columnNames = ["tenant_id", "email"])
    ],
    indexes = [
        Index(name = "idx_users_tenant_id", columnList = "tenant_id"),
        Index(name = "idx_users_tenant_email", columnList = "tenant_id, email"),
        Index(name = "idx_users_tenant_role", columnList = "tenant_id, role")
    ]
)
class User(
    @Column(name = "email", nullable = false, length = 255)
    var email: String,

    @Column(name = "password_hash", nullable = false, length = 255)
    var passwordHash: String,

    @Column(name = "full_name", nullable = false, length = 255)
    var fullName: String,

    @Column(name = "phone", length = 50)
    var phone: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    var role: UserRole = UserRole.DOCTOR,

    @Column(name = "specialty", length = 100)
    var specialty: String? = null,

    @Column(name = "license_number", length = 100)
    var licenseNumber: String? = null,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true
) : BaseTenantEntity()
