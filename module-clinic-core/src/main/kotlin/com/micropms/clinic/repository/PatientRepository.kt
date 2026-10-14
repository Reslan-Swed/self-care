package com.micropms.clinic.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.clinic.entity.Patient
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface PatientRepository : BaseRepository<Patient, UUID> {
    fun findByMedicalRecordNumber(mrn: String): Optional<Patient>
    fun existsByMedicalRecordNumber(mrn: String): Boolean
    fun findByLastNameIgnoreCaseContaining(lastName: String, pageable: Pageable): Page<Patient>
}
