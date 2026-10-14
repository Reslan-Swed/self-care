package com.micropms.common.exception

/**
 * Thrown when an entity or resource with a specified identifier cannot be located.
 */
class ResourceNotFoundException(
    val resourceName: String,
    val fieldName: String,
    val fieldValue: Any
) : RuntimeException("$resourceName not found with $fieldName: '$fieldValue'")
