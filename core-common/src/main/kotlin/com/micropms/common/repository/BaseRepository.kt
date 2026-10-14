package com.micropms.common.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.repository.NoRepositoryBean
import java.util.Optional

/**
 * Standard enterprise repository interface exposing JPA persistence, Specifications,
 * and dynamic projection capabilities.
 */
@NoRepositoryBean
interface BaseRepository<T : Any, ID : Any> : JpaRepository<T, ID>, JpaSpecificationExecutor<T> {

    /**
     * Retrieve an entity by ID projected into a dynamic projection DTO interface or class.
     */
    fun <P : Any> findById(id: ID, projectionClass: Class<P>): Optional<P>

    /**
     * Execute a filtered specification query with pagination and dynamic projection.
     */
    fun <P : Any> findBy(
        spec: Specification<T>?,
        projectionFunction: (org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<T>) -> Page<P>
    ): Page<P>
}
