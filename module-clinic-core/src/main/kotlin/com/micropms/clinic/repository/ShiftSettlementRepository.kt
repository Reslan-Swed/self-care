package com.micropms.clinic.repository

import com.micropms.clinic.entity.ShiftSettlement
import com.micropms.clinic.entity.ShiftStatus
import com.micropms.common.repository.BaseRepository
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.Optional
import java.util.UUID

@Repository
interface ShiftSettlementRepository : BaseRepository<ShiftSettlement, UUID> {
    fun findFirstByReceptionistIdAndStatusOrderByOpenedAtDesc(
        receptionistId: UUID,
        status: ShiftStatus
    ): Optional<ShiftSettlement>

    fun findByOpenedAtBetweenOrderByOpenedAtDesc(
        start: Instant,
        end: Instant
    ): List<ShiftSettlement>

    fun findAllByOrderByOpenedAtDesc(): List<ShiftSettlement>
}
