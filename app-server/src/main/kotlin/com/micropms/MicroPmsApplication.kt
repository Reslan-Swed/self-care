package com.micropms

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

/**
 * Main entry point for the Micro-PMS Multi-Tenant SaaS platform application server.
 * Aggregates core-common, core-multitenancy, module-saas-platform, and module-clinic-core.
 */
@SpringBootApplication(scanBasePackages = ["com.micropms"])
class MicroPmsApplication

fun main(args: Array<String>) {
    runApplication<MicroPmsApplication>(*args)
}
