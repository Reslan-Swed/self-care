package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import java.time.LocalDate

/**
 * Application Plane entity representing a patient profile.
 * Strictly extends BaseTenantEntity to ensure automatic tenant association
 * and database-level PostgreSQL RLS isolation.
 */
@Entity
@Table(name = "clinic_patients")
class Patient(
    @Column(name = "mrn", nullable = false)
    var medicalRecordNumber: String,

    @Column(name = "first_name", nullable = false)
    var firstName: String,

    @Column(name = "last_name", nullable = false)
    var lastName: String,

    @Column(name = "birth_date", nullable = false)
    var dateOfBirth: LocalDate,

    @Column(name = "gender", nullable = false)
    var gender: String,

    @Column(name = "phone_number")
    var phoneNumber: String? = null,

    @Column(name = "email")
    var email: String? = null
) : BaseTenantEntity()
