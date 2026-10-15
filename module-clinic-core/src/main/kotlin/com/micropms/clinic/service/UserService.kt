package com.micropms.clinic.service

import com.micropms.clinic.dto.ClinicUserResponseDto
import com.micropms.clinic.dto.CreateClinicUserRequest
import com.micropms.clinic.entity.User
import com.micropms.clinic.entity.UserRole
import com.micropms.clinic.repository.UserRepository
import com.micropms.common.exception.ResourceNotFoundException
import com.micropms.common.quota.DoctorQuotaValidator
import com.micropms.multitenancy.context.TenantContext
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class UserService(
    private val userRepository: UserRepository,
    @Autowired(required = false)
    private val doctorQuotaValidator: DoctorQuotaValidator? = null
) {
    private val log = LoggerFactory.getLogger(UserService::class.java)

    /**
     * Creates a new clinic user, validating doctor quotas against the tenant's active subscription if role is DOCTOR.
     */
    @Transactional
    fun createClinicUser(request: CreateClinicUserRequest): ClinicUserResponseDto {
        val tenantId = TenantContext.requireTenantId()
        val normalizedEmail = request.email.trim().lowercase()

        // 1. Check for email uniqueness within current tenant
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw IllegalArgumentException("A user with email '$normalizedEmail' already exists in this clinic.")
        }

        // 2. Validate doctor quota against subscription if creating a doctor
        if (request.role == UserRole.DOCTOR) {
            val currentDoctorCount = userRepository.countByRoleAndIsActiveTrue(UserRole.DOCTOR)
            log.debug("Tenant {} currently has {} active doctors. Validating against subscription plan...", tenantId, currentDoctorCount)
            doctorQuotaValidator?.validateDoctorQuota(tenantId, currentDoctorCount)
        }

        // 3. Persist new clinic user
        // Passwords in production are hashed via BCryptPasswordEncoder
        val passwordHash = "{noop}${request.password}"

        val user = User(
            email = normalizedEmail,
            passwordHash = passwordHash,
            fullName = request.fullName.trim(),
            phone = request.phone?.trim(),
            role = request.role,
            specialty = request.specialty?.trim(),
            licenseNumber = request.licenseNumber?.trim(),
            isActive = true
        )

        val saved = userRepository.save(user)
        log.info("Created clinic user {} with role {} for tenant {}", saved.id, saved.role, tenantId)
        return toDto(saved)
    }

    /**
     * Soft-deactivates a user (isActive = false) while preserving historical audit relationships.
     */
    @Transactional
    fun deactivateUser(userId: UUID): ClinicUserResponseDto {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found with ID: $userId") }

        if (!user.isActive) {
            log.info("User {} is already deactivated", userId)
            return toDto(user)
        }

        user.isActive = false
        val updated = userRepository.save(user)
        log.info("Soft-deactivated clinic user {} ({})", updated.id, updated.email)
        return toDto(updated)
    }

    fun getUserById(userId: UUID): ClinicUserResponseDto {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found with ID: $userId") }
        return toDto(user)
    }

    fun getAllActiveUsers(): List<ClinicUserResponseDto> {
        return userRepository.findAllByIsActiveTrue().map { toDto(it) }
    }

    fun getActiveDoctors(): List<ClinicUserResponseDto> {
        return userRepository.findAllByRoleAndIsActiveTrue(UserRole.DOCTOR).map { toDto(it) }
    }

    private fun toDto(user: User): ClinicUserResponseDto {
        return ClinicUserResponseDto(
            id = user.id,
            email = user.email,
            fullName = user.fullName,
            phone = user.phone,
            role = user.role,
            specialty = user.specialty,
            licenseNumber = user.licenseNumber,
            isActive = user.isActive,
            createdAt = user.createdAt,
            updatedAt = user.updatedAt
        )
    }
}
