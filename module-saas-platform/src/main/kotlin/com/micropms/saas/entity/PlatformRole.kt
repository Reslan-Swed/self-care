package com.micropms.saas.entity

/**
 * Roles granted to platform super administrators and global support personnel.
 * Strictly decoupled from tenant-scoped clinic roles.
 */
enum class PlatformRole {
    SUPER_ADMIN,
    SUPPORT_AGENT
}
