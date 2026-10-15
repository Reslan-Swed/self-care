package com.micropms.clinic.service

import com.micropms.clinic.dto.CreateClinicUserRequest
import com.micropms.clinic.entity.User
import com.micropms.clinic.entity.UserRole
import com.micropms.clinic.repository.UserRepository
import com.micropms.common.exception.QuotaExceededException
import com.micropms.common.quota.DoctorQuotaValidator
import com.micropms.multitenancy.context.TenantContext
import io.mockk.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.util.*

class UserServiceTest {

    private val userRepository: UserRepository = mockk()
    private val doctorQuotaValidator: DoctorQuotaValidator = mockk()

    private lateinit var userService: UserService
    private val testTenantId = UUID.randomUUID()

    @BeforeEach
    fun setUp() {
        TenantContext.setTenantId(testTenantId)
        userService = UserService(userRepository, doctorQuotaValidator)
    }

    @AfterEach
    fun tearDown() {
        TenantContext.clear()
    }

    @Test
    fun `createClinicUser creates doctor successfully when quota is valid`() {
        val email = "dr.smith@clinic.com"
        val request = CreateClinicUserRequest(
            email = email,
            password = "securePassword123",
            fullName = "Dr. John Smith",
            role = UserRole.DOCTOR,
            specialty = "Cardiology",
            licenseNumber = "MED-998811"
        )

        every { userRepository.existsByEmail(email) } returns false
        every { userRepository.countByRoleAndIsActiveTrue(UserRole.DOCTOR) } returns 2L
        justRun { doctorQuotaValidator.validateDoctorQuota(testTenantId, 2L) }

        val savedUserSlot = slot<User>()
        every { userRepository.save(capture(savedUserSlot)) } answers {
            val u = savedUserSlot.captured
            u.id = UUID.randomUUID()
            u
        }

        val result = userService.createClinicUser(request)

        assertNotNull(result.id)
        assertEquals(email, result.email)
        assertEquals(UserRole.DOCTOR, result.role)
        assertTrue(result.isActive)
        assertEquals("Cardiology", result.specialty)

        verify(exactly = 1) { doctorQuotaValidator.validateDoctorQuota(testTenantId, 2L) }
        verify(exactly = 1) { userRepository.save(any()) }
    }

    @Test
    fun `createClinicUser throws QuotaExceededException when doctor limit reached`() {
        val email = "dr.exceeded@clinic.com"
        val request = CreateClinicUserRequest(
            email = email,
            password = "securePassword123",
            fullName = "Dr. Exceeded",
            role = UserRole.DOCTOR
        )

        every { userRepository.existsByEmail(email) } returns false
        every { userRepository.countByRoleAndIsActiveTrue(UserRole.DOCTOR) } returns 5L
        every { doctorQuotaValidator.validateDoctorQuota(testTenantId, 5L) } throws
                QuotaExceededException("Subscription doctor quota exceeded for tenant. Plan allows up to 5.")

        assertThrows(QuotaExceededException::class.java) {
            userService.createClinicUser(request)
        }

        verify(exactly = 0) { userRepository.save(any()) }
    }

    @Test
    fun `createClinicUser throws exception when email already exists in tenant`() {
        val email = "existing@clinic.com"
        val request = CreateClinicUserRequest(
            email = email,
            password = "password123",
            fullName = "Existing Staff",
            role = UserRole.RECEPTIONIST
        )

        every { userRepository.existsByEmail(email) } returns true

        val ex = assertThrows(IllegalArgumentException::class.java) {
            userService.createClinicUser(request)
        }
        assertTrue(ex.message!!.contains("already exists"))
        verify(exactly = 0) { userRepository.save(any()) }
    }

    @Test
    fun `deactivateUser marks active user as inactive`() {
        val userId = UUID.randomUUID()
        val user = User(
            email = "staff@clinic.com",
            passwordHash = "{noop}hash",
            fullName = "Staff Member",
            role = UserRole.RECEPTIONIST,
            isActive = true
        ).apply { id = userId }

        every { userRepository.findById(userId) } returns Optional.of(user)
        every { userRepository.save(any()) } answers { firstArg() }

        val result = userService.deactivateUser(userId)

        assertFalse(result.isActive)
        verify(exactly = 1) { userRepository.save(user) }
    }
}
