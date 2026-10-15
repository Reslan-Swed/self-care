package com.micropms.clinic.repository

import com.micropms.common.repository.BaseRepository
import com.micropms.clinic.entity.CustomFieldDefinition
import com.micropms.clinic.entity.TargetEntity
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface CustomFieldDefinitionRepository : BaseRepository<CustomFieldDefinition, UUID> {
    fun findByTargetEntityOrderByDisplayOrderAsc(targetEntity: TargetEntity): List<CustomFieldDefinition>
    fun findByFieldKey(fieldKey: String): CustomFieldDefinition?
    fun existsByFieldKey(fieldKey: String): Boolean
}
