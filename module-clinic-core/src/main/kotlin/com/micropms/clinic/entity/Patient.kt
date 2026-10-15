package com.micropms.clinic.entity

import com.micropms.multitenancy.entity.BaseTenantEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Table
import java.time.LocalDate

enum class Gender {
    MALE,
    FEMALE
}

/**
 * Application Plane entity representing a patient profile.
 * Strictly extends BaseTenantEntity to ensure automatic tenant association
 * and database-level PostgreSQL RLS isolation.
 */
@Entity
@Table(name = "clinic_patients")
class Patient(
    @Column(name = "file_number")
    var fileNumber: String? = null,

    @Column(name = "full_name", nullable = false)
    var fullName: String,

    @Column(name = "phone", nullable = false)
    var phone: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    var gender: Gender? = null,

    @Column(name = "birth_date")
    var birthDate: LocalDate? = null,

    @Column(name = "blood_group")
    var bloodGroup: String? = null,

    @Column(name = "medical_alerts", columnDefinition = "TEXT")
    var medicalAlerts: String? = null
) : BaseTenantEntity() {

    constructor(
        medicalRecordNumber: String,
        firstName: String,
        lastName: String,
        dateOfBirth: LocalDate,
        gender: String,
        phoneNumber: String?,
        email: String?
    ) : this(
        fileNumber = medicalRecordNumber,
        fullName = "$firstName $lastName".trim(),
        phone = phoneNumber ?: "",
        gender = try { Gender.valueOf(gender.uppercase()) } catch (_: Exception) { null },
        birthDate = dateOfBirth
    ) {
        this.email = email
    }

    // Compatibility getters & setters
    var medicalRecordNumber: String
        get() = fileNumber ?: id.toString()
        set(value) { fileNumber = value }

    var firstName: String
        get() = fullName.split(" ").firstOrNull() ?: fullName
        set(value) {
            val parts = fullName.split(" ")
            fullName = if (parts.size > 1) "$value ${parts.drop(1).joinToString(" ")}" else value
        }

    var lastName: String
        get() = fullName.split(" ").drop(1).joinToString(" ").ifEmpty { "" }
        set(value) {
            val first = fullName.split(" ").firstOrNull() ?: ""
            fullName = "$first $value".trim()
        }

    var dateOfBirth: LocalDate
        get() = birthDate ?: LocalDate.now()
        set(value) { birthDate = value }

    var phoneNumber: String?
        get() = phone
        set(value) { phone = value ?: "" }

    var email: String? = null
}
