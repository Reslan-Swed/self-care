package com.micropms.clinic.controller

import com.micropms.clinic.dto.ClinicUserResponseDto
import com.micropms.clinic.dto.CreateClinicUserRequest
import com.micropms.clinic.service.UserService
import com.micropms.common.dto.ApiResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Controller managing clinic staff users within the tenant realm.
 * Protected with fine-grained RBAC authority 'clinic:users:manage'.
 */
@RestController
@RequestMapping("/api/clinic/users")
class UserController(
    private val userService: UserService
) {

    /**
     * Create a clinic user with role and doctor quota validation.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('clinic:users:manage')")
    fun createClinicUser(
        @Valid @RequestBody request: CreateClinicUserRequest
    ): ResponseEntity<ApiResponse<ClinicUserResponseDto>> {
        val user = userService.createClinicUser(request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(code = 201, message = "Clinic user created successfully", data = user))
    }

    /**
     * Update an existing clinic user profile.
     */
    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    @PreAuthorize("hasAuthority('clinic:users:manage')")
    fun updateClinicUser(
        @PathVariable id: UUID,
        @Valid @RequestBody request: com.micropms.clinic.dto.UpdateClinicUserRequest
    ): ResponseEntity<ApiResponse<ClinicUserResponseDto>> {
        val updated = userService.updateClinicUser(id, request)
        return ResponseEntity.ok(ApiResponse(code = 200, message = "Clinic user updated successfully", data = updated))
    }

    /**
     * Soft-deactivate a clinic user (isActive = false).
     */
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAuthority('clinic:users:manage')")
    fun deactivateUser(
        @PathVariable id: UUID
    ): ResponseEntity<ApiResponse<ClinicUserResponseDto>> {
        val deactivated = userService.deactivateUser(id)
        return ResponseEntity.ok(ApiResponse(code = 200, message = "Clinic user deactivated successfully", data = deactivated))
    }

    /**
     * Delete mapping alias for soft-deactivation.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('clinic:users:manage')")
    fun deleteUser(
        @PathVariable id: UUID
    ): ResponseEntity<ApiResponse<ClinicUserResponseDto>> {
        val deactivated = userService.deactivateUser(id)
        return ResponseEntity.ok(ApiResponse(code = 200, message = "Clinic user deactivated successfully", data = deactivated))
    }

    /**
     * Retrieve active clinic users.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('clinic:users:manage') or hasAuthority('clinic:users:read')")
    fun listUsers(): ResponseEntity<ApiResponse<List<ClinicUserResponseDto>>> {
        val users = userService.getAllActiveUsers()
        return ResponseEntity.ok(ApiResponse(code = 200, message = "Active clinic users retrieved", data = users))
    }

    /**
     * Retrieve active doctors for appointment scheduling dropdowns.
     */
    @GetMapping("/doctors")
    @PreAuthorize("hasAnyAuthority('clinic:users:manage', 'clinic:users:read', 'appointment:create', 'appointment:read')")
    fun listDoctors(): ResponseEntity<ApiResponse<List<ClinicUserResponseDto>>> {
        val doctors = userService.getActiveDoctors()
        return ResponseEntity.ok(ApiResponse(code = 200, message = "Active clinic doctors retrieved", data = doctors))
    }

    /**
     * Retrieve single user details.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('clinic:users:manage') or hasAuthority('clinic:users:read')")
    fun getUser(@PathVariable id: UUID): ResponseEntity<ApiResponse<ClinicUserResponseDto>> {
        val user = userService.getUserById(id)
        return ResponseEntity.ok(ApiResponse(code = 200, message = "User details retrieved", data = user))
    }
}
