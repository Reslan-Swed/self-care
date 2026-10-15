package com.micropms.clinic.repository

import com.micropms.clinic.entity.User
import com.micropms.clinic.entity.UserRole
import com.micropms.common.repository.BaseRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface UserRepository : BaseRepository<User, UUID> {
    fun findByEmail(email: String): Optional<User>
    fun existsByEmail(email: String): Boolean
    fun countByRoleAndIsActiveTrue(role: UserRole): Long
    fun findAllByIsActiveTrue(): List<User>
    fun findAllByRoleAndIsActiveTrue(role: UserRole): List<User>
}
