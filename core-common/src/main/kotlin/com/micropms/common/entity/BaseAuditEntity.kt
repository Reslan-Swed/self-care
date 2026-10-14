package com.micropms.common.entity

import jakarta.persistence.Column
import jakarta.persistence.EntityListeners
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.Version
import org.hibernate.Hibernate
import org.springframework.data.annotation.CreatedBy
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedBy
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.io.Serializable
import java.time.Instant
import java.util.UUID

/**
 * Base abstract mapped superclass providing first-class auditing, optimistic locking,
 * and UUID primary key identity across all domain entities.
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener::class)
abstract class BaseAuditEntity : Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    open var id: UUID? = null

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    open var createdAt: Instant = Instant.now()

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    open var updatedAt: Instant = Instant.now()

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    open var createdBy: UUID? = null

    @LastModifiedBy
    @Column(name = "last_modified_by")
    open var lastModifiedBy: UUID? = null

    @Version
    @Column(name = "version", nullable = false)
    open var version: Long = 0L

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || Hibernate.getClass(this) != Hibernate.getClass(other)) return false
        val otherEntity = other as BaseAuditEntity
        return id != null && id == otherEntity.id
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: getClassHashCode()
    }

    private fun getClassHashCode(): Int {
        return javaClass.hashCode()
    }

    override fun toString(): String {
        return "${this::class.simpleName}(id=$id, createdAt=$createdAt, updatedAt=$updatedAt, version=$version)"
    }
}
