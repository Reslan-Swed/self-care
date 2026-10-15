package com.micropms.clinic.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.clinic.entity.CustomFieldDefinition
import com.micropms.clinic.entity.EncounterFieldValue
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface EncounterFieldValueRepository : BaseRepository<EncounterFieldValue, UUID> {
    fun findByEncounterId(encounterId: UUID): List<EncounterFieldValue>
    fun findByEncounterIdAndFieldDefinition(encounterId: UUID, fieldDefinition: CustomFieldDefinition): EncounterFieldValue?
    fun deleteByEncounterId(encounterId: UUID)
}
