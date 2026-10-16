package com.micropms.clinic.entity

/**
 * Roles assigned to clinic staff within an isolated tenant realm.
 * Maps directly to fine-grained RBAC authorities to enforce clinical privacy.
 */
enum class UserRole {
    CLINIC_ADMIN,
    DOCTOR,
    RECEPTIONIST;

    /**
     * Resolves the fine-grained Spring Security authorities for each role.
     * Clinical data (SOAP notes, diagnoses, prescriptions) is strictly restricted to DOCTORs.
     */
    fun authorities(): List<String> = when (this) {
        CLINIC_ADMIN -> listOf(
            "ROLE_CLINIC_ADMIN",
            "clinic:users:manage",
            "clinic:users:read",
            "clinic:eav_fields:manage",
            "appointment:read",
            "appointment:create",
            "appointment:cancel",
            "queue:status:update",
            "patient:basic:read",
            "patient:basic:write",
            "invoice:read",
            "invoice:write"
        )
        DOCTOR -> listOf(
            "ROLE_DOCTOR",
            "encounter:clinical:read",
            "encounter:clinical:write",
            "patient:basic:read",
            "patient:clinical:read",
            "patient:clinical:write",
            "appointment:read",
            "appointment:create",
            "queue:status:update",
            "clinic:users:read"
        )
        RECEPTIONIST -> listOf(
            "ROLE_RECEPTIONIST",
            "appointment:create",
            "appointment:read",
            "appointment:cancel",
            "queue:status:update",
            "patient:basic:read",
            "patient:basic:write",
            "invoice:read",
            "invoice:write",
            "clinic:users:read"
        )
    }
}
