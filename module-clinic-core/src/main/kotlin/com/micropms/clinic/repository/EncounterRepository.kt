package com.micropms.clinic.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.clinic.entity.Encounter
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface EncounterRepository : BaseRepository<Encounter, UUID> {
    fun findByPatientId(patientId: UUID, pageable: Pageable): Page<Encounter>
}
