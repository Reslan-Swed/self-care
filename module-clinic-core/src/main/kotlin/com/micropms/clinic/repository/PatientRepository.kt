package com.micropms.clinic.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.clinic.entity.Patient
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface PatientRepository : BaseRepository<Patient, UUID> {
    fun findByPhone(phone: String): Optional<Patient>
    fun existsByPhone(phone: String): Boolean
    fun findByFileNumber(fileNumber: String): Optional<Patient>

    @Query("SELECT p FROM Patient p WHERE LOWER(p.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR p.phone LIKE CONCAT('%', :query, '%')")
    fun searchByNameOrPhone(@Param("query") query: String): List<Patient>

    // Backwards compatibility
    fun findByMedicalRecordNumber(mrn: String): Optional<Patient> = findByFileNumber(mrn)
    fun existsByMedicalRecordNumber(mrn: String): Boolean = findByFileNumber(mrn).isPresent
    fun findByLastNameIgnoreCaseContaining(lastName: String, pageable: Pageable): Page<Patient>
}
