package com.micropms.multitenancy.context

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.UUID
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference

class TenantContextTest {

    @AfterEach
    fun tearDown() {
        TenantContext.clear()
    }

    @Test
    fun `should set and retrieve tenant ID in current thread`() {
        val tenantId = UUID.randomUUID()
        TenantContext.setTenantId(tenantId)

        assertEquals(tenantId, TenantContext.getTenantId())
        assertEquals(tenantId, TenantContext.requireTenantId())
    }

    @Test
    fun `should throw IllegalStateException when requireTenantId called on empty context`() {
        TenantContext.clear()
        assertThrows(IllegalStateException::class.java) {
            TenantContext.requireTenantId()
        }
    }

    @Test
    fun `should execute within tenant scope and cleanup in finally block via runWithTenant`() {
        val tenantId = UUID.randomUUID()

        val result = TenantContext.runWithTenant(tenantId) {
            assertEquals(tenantId, TenantContext.getTenantId())
            "success_result"
        }

        assertEquals("success_result", result)
        assertNull(TenantContext.getTenantId())
    }

    @Test
    fun `should guarantee cleanup in runWithTenant even when exception is thrown`() {
        val tenantId = UUID.randomUUID()

        assertThrows(RuntimeException::class.java) {
            TenantContext.runWithTenant(tenantId) {
                throw RuntimeException("Intentional business failure")
            }
        }

        assertNull(TenantContext.getTenantId(), "TenantContext must be cleared after exception in runWithTenant")
    }

    @Test
    fun `should preserve outer tenant when executing nested runWithTenant`() {
        val outerTenant = UUID.randomUUID()
        val innerTenant = UUID.randomUUID()

        TenantContext.runWithTenant(outerTenant) {
            assertEquals(outerTenant, TenantContext.getTenantId())

            TenantContext.runWithTenant(innerTenant) {
                assertEquals(innerTenant, TenantContext.getTenantId())
            }

            assertEquals(outerTenant, TenantContext.getTenantId(), "Outer tenant must be restored after inner block")
        }

        assertNull(TenantContext.getTenantId())
    }

    @Test
    fun `should isolate tenant context across concurrent threads`() {
        val thread1Tenant = UUID.randomUUID()
        val thread2Tenant = UUID.randomUUID()
        val latch = CountDownLatch(2)

        val thread1Observed = AtomicReference<UUID>()
        val thread2Observed = AtomicReference<UUID>()

        val t1 = Thread {
            TenantContext.setTenantId(thread1Tenant)
            Thread.sleep(20)
            thread1Observed.set(TenantContext.getTenantId())
            TenantContext.clear()
            latch.countDown()
        }

        val t2 = Thread {
            TenantContext.setTenantId(thread2Tenant)
            Thread.sleep(20)
            thread2Observed.set(TenantContext.getTenantId())
            TenantContext.clear()
            latch.countDown()
        }

        t1.start()
        t2.start()

        assertTrue(latch.await(2, TimeUnit.SECONDS))
        assertEquals(thread1Tenant, thread1Observed.get())
        assertEquals(thread2Tenant, thread2Observed.get())
    }
}
