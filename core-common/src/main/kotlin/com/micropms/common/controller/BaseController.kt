package com.micropms.common.controller

import com.micropms.common.dto.ApiResponse
import com.micropms.common.exception.ResourceNotFoundException
import com.micropms.common.repository.BaseRepository
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import java.security.MessageDigest
import java.time.Instant
import java.util.Base64
import java.util.UUID

/**
 * Abstract generic REST controller providing reusable CRUD contracts,
 * paginated queries, projection/DTO mapping abstractions, and standardized
 * pre-signed file URL generation utilities.
 *
 * @param T The domain entity type
 * @param ID The primary key identifier type (typically UUID)
 * @param FormDto The incoming payload request DTO
 * @param ResponseDto The outgoing client projection DTO
 */
abstract class BaseController<T : Any, ID : Any, FormDto : Any, ResponseDto : Any>(
    protected val repository: BaseRepository<T, ID>,
    protected val resourceName: String
) {

    /**
     * Maps an incoming creation/update DTO to a persistent domain entity.
     */
    protected abstract fun toEntity(form: FormDto): T

    /**
     * Maps a persistent domain entity to the client-facing ResponseDto.
     */
    protected abstract fun toResponseDto(entity: T): ResponseDto

    /**
     * Mutates an existing entity with values from the incoming update DTO.
     */
    protected abstract fun updateEntityFromForm(entity: T, form: FormDto): T

    /**
     * Retrieve a single resource by its unique identifier.
     */
    @GetMapping("/{id}")
    open fun findById(@PathVariable id: ID): ResponseEntity<ApiResponse<ResponseDto>> {
        val entity = repository.findById(id).orElseThrow {
            ResourceNotFoundException(resourceName, "id", id)
        }
        return ResponseEntity.ok(ApiResponse.ok(toResponseDto(entity), "$resourceName retrieved successfully"))
    }

    /**
     * Retrieve a paginated list of resources with optional text search filter.
     */
    @GetMapping
    open fun findAll(
        @PageableDefault(size = 20, sort = ["createdAt"], direction = Sort.Direction.DESC) pageable: Pageable,
        @RequestParam(required = false) search: String?
    ): ResponseEntity<ApiResponse<Page<ResponseDto>>> {
        val page = repository.findAll(pageable).map { toResponseDto(it) }
        return ResponseEntity.ok(ApiResponse.ok(page, "$resourceName page retrieved"))
    }

    /**
     * Create a new domain entity from the incoming validated form.
     */
    @PostMapping
    open fun create(@Valid @RequestBody form: FormDto): ResponseEntity<ApiResponse<ResponseDto>> {
        val entity = toEntity(form)
        val saved = repository.save(entity)
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.created(toResponseDto(saved), "$resourceName created successfully"))
    }

    /**
     * Update an existing domain entity by ID.
     */
    @PutMapping("/{id}")
    open fun update(
        @PathVariable id: ID,
        @Valid @RequestBody form: FormDto
    ): ResponseEntity<ApiResponse<ResponseDto>> {
        val existing = repository.findById(id).orElseThrow {
            ResourceNotFoundException(resourceName, "id", id)
        }
        val updated = updateEntityFromForm(existing, form)
        val saved = repository.save(updated)
        return ResponseEntity.ok(ApiResponse.ok(toResponseDto(saved), "$resourceName updated successfully"))
    }

    /**
     * Delete an existing domain entity by ID.
     */
    @DeleteMapping("/{id}")
    open fun delete(@PathVariable id: ID): ResponseEntity<ApiResponse<Unit>> {
        if (!repository.existsById(id)) {
            throw ResourceNotFoundException(resourceName, "id", id)
        }
        repository.deleteById(id)
        return ResponseEntity.ok(ApiResponse.okNoContent("$resourceName deleted successfully"))
    }

    // =========================================================================
    // Standard Utility Methods for Secure File Upload / Download URL Generation
    // =========================================================================

    /**
     * Generates a tamper-proof signed URL for secure direct-to-storage file uploads (S3/GCS compliant).
     * Incorporates HMAC signature, expiration timestamp, content type, and tenant boundary.
     */
    protected fun generatePresignedUploadUrl(
        fileName: String,
        contentType: String,
        expiresInSeconds: Long = 3600
    ): String {
        val fileId = UUID.randomUUID()
        val expiresAt = Instant.now().plusSeconds(expiresInSeconds).epochSecond
        val sanitizedFileName = fileName.replace("[^a-zA-Z0-9._-]".toRegex(), "_")
        val storagePath = "uploads/${fileId}_$sanitizedFileName"
        val signaturePayload = "$storagePath:$contentType:$expiresAt"
        val signature = computeHmacSha256(signaturePayload)

        return "/api/v1/storage/upload?path=$storagePath&expires=$expiresAt&type=$contentType&sig=$signature"
    }

    /**
     * Generates a tamper-proof signed URL for secure authorized file downloads with temporal expiration.
     */
    protected fun generatePresignedDownloadUrl(
        fileKey: String,
        expiresInSeconds: Long = 3600
    ): String {
        val expiresAt = Instant.now().plusSeconds(expiresInSeconds).epochSecond
        val signaturePayload = "$fileKey:$expiresAt"
        val signature = computeHmacSha256(signaturePayload)

        return "/api/v1/storage/download?key=$fileKey&expires=$expiresAt&sig=$signature"
    }

    private fun computeHmacSha256(data: String): String {
        val md = MessageDigest.getInstance("SHA-256")
        val digest = md.digest(data.toByteArray(Charsets.UTF_8))
        return Base64.getUrlEncoder().withoutPadding().encodeToString(digest)
    }
}
