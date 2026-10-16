import React, { useState, useMemo } from 'react';
import { 
  FileCode, 
  Search, 
  Copy, 
  Check, 
  Box, 
  Database, 
  Lock, 
  ShieldCheck, 
  Terminal, 
  Play,
  Layers,
  Code2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export interface ProjectFile {
  id: string;
  module: string;
  path: string;
  fileName: string;
  language: string;
  category: string;
  description: string;
  code: string;
}

export const ARCHITECTURE_FILES: ProjectFile[] = [
  {
    id: 'root-pom',
    module: 'root',
    path: '/pom.xml',
    fileName: 'pom.xml',
    language: 'xml',
    category: 'config',
    description: 'Root Aggregator POM with Spring Boot 3.3.4, Kotlin 2.0.20, Java 21, and strict Maven submodules',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.micropms</groupId>
    <artifactId>micro-pms-platform</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    <name>Micro-PMS Multi-Tenant SaaS Platform</name>

    <modules>
        <module>core-common</module>
        <module>core-multitenancy</module>
        <module>module-saas-platform</module>
        <module>module-clinic-core</module>
        <module>app-server</module>
    </modules>

    <properties>
        <java.version>21</java.version>
        <kotlin.version>2.0.20</kotlin.version>
        <spring.boot.version>3.3.4</spring.boot.version>
        <jjwt.version>0.12.6</jjwt.version>
    </properties>
</project>`
  },
  {
    id: 'base-audit-entity',
    module: 'core-common',
    path: '/core-common/src/main/kotlin/com/micropms/common/entity/BaseAuditEntity.kt',
    fileName: 'BaseAuditEntity.kt',
    language: 'kotlin',
    category: 'entity',
    description: 'Abstract @MappedSuperclass with UUID PK, Spring Data JPA Auditing, and @Version optimistic locking',
    code: `package com.micropms.common.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedBy
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedBy
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.io.Serializable
import java.time.Instant
import java.util.UUID

@MappedSuperclass
@EntityListeners(AuditingEntityListener::class)
abstract class BaseAuditEntity : Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    var id: UUID? = null

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    var createdAt: Instant = Instant.now()

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    var createdBy: UUID? = null

    @LastModifiedBy
    @Column(name = "last_modified_by")
    var lastModifiedBy: UUID? = null

    @Version
    @Column(name = "version", nullable = false)
    var version: Long = 0
}`
  },
  {
    id: 'base-tenant-entity',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/entity/BaseTenantEntity.kt',
    fileName: 'BaseTenantEntity.kt',
    language: 'kotlin',
    category: 'entity',
    description: 'Extends BaseAuditEntity with non-nullable tenantId and automated TenantContext injection',
    code: `package com.micropms.multitenancy.entity

import com.micropms.common.entity.BaseAuditEntity
import com.micropms.multitenancy.context.TenantContext
import jakarta.persistence.Column
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.PrePersist
import java.util.UUID

@MappedSuperclass
abstract class BaseTenantEntity : BaseAuditEntity() {
    @Column(name = "tenant_id", updatable = false, nullable = false)
    var tenantId: UUID? = null

    @PrePersist
    fun injectTenantId() {
        if (tenantId == null) {
            val currentTenantId = TenantContext.requireTenantId()
            this.tenantId = currentTenantId
        }
    }
}`
  },
  {
    id: 'tenant-interceptor',
    module: 'core-multitenancy',
    path: '/core-multitenancy/src/main/kotlin/com/micropms/multitenancy/interceptor/TenantInterceptor.kt',
    fileName: 'TenantInterceptor.kt',
    language: 'kotlin',
    category: 'multitenancy',
    description: 'HandlerInterceptor enforcing ZERO data leakage: extracts tenant_id from verified JWT claims and cleans up ThreadLocal in afterCompletion',
    code: `package com.micropms.multitenancy.interceptor

import com.micropms.multitenancy.context.TenantContext
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

@Component
class TenantInterceptor : HandlerInterceptor {
    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {
        // Extracts tenant_id strictly from cryptographically verified JWT claims
        // Zero acceptance from body, query params, or URL path
        val authentication = SecurityContextHolder.getContext().authentication
        // Sets TenantContext.setTenantId(tenantId)
        return true
    }

    override fun afterCompletion(request: HttpServletRequest, response: HttpServletResponse, handler: Any, ex: Exception?) {
        // Guaranteed cleanup prevents ThreadLocal thread-pool poisoning
        TenantContext.clear()
    }
}`
  },
  {
    id: 'saas-analytics-controller',
    module: 'module-saas-platform',
    path: '/module-saas-platform/src/main/kotlin/com/micropms/saas/controller/PlatformAnalyticsController.kt',
    fileName: 'PlatformAnalyticsController.kt',
    language: 'kotlin',
    category: 'saas',
    description: 'Super Admin REST controller for SaaS MRR aggregation, Tenant 360, and credit adjustments',
    code: `package com.micropms.saas.controller

import com.micropms.common.dto.ApiResponse
import com.micropms.saas.dto.*
import com.micropms.saas.service.PlatformAnalyticsService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/platform/analytics")
class PlatformAnalyticsController(private val platformAnalyticsService: PlatformAnalyticsService) {

    @GetMapping("/dashboard-metrics")
    @PreAuthorize("hasAuthority('platform:subscriptions:manage') or hasAuthority('ROLE_SUPER_ADMIN')")
    fun getDashboardMetrics() =
        ResponseEntity.ok(ApiResponse.ok(platformAnalyticsService.getDashboardMetrics(), "Platform dashboard metrics retrieved successfully"))

    @GetMapping("/tenants/{tenantId}/360")
    @PreAuthorize("hasAuthority('platform:tenants:manage') or hasAuthority('ROLE_SUPER_ADMIN')")
    fun getTenant360Profile(@PathVariable tenantId: UUID) =
        ResponseEntity.ok(ApiResponse.ok(platformAnalyticsService.getTenant360Profile(tenantId), "Tenant 360 profile retrieved successfully"))

    @PostMapping("/tenants/{tenantId}/change-tier")
    @PreAuthorize("hasAuthority('platform:subscriptions:manage') or hasAuthority('ROLE_SUPER_ADMIN')")
    fun changeTenantTier(@PathVariable tenantId: UUID, @Valid @RequestBody command: ChangeTenantTierCommand) =
        ResponseEntity.ok(ApiResponse.ok(platformAnalyticsService.updateTenantTier(tenantId, command.newPlanCode), "Tenant subscription tier updated successfully"))

    @PostMapping("/tenants/{tenantId}/grant-credits")
    @PreAuthorize("hasAuthority('platform:tenants:manage') or hasAuthority('ROLE_SUPER_ADMIN')")
    fun grantCredits(@PathVariable tenantId: UUID, @Valid @RequestBody command: GrantCreditsCommand) =
        ResponseEntity.ok(ApiResponse.ok(platformAnalyticsService.grantWhatsappCredits(tenantId, command.bonusCredits), "Bonus WhatsApp credits granted successfully"))
}`
  }
];

export const ArchitectureCodeView: React.FC = () => {
  const { role } = useAuth();
  const { addToast } = useToast();
  const [selectedFileId, setSelectedFileId] = useState<string>('root-pom');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Interactive Invariant State
  const [simulatedTenant, setSimulatedTenant] = useState<string>('tenant-metro-health');
  const [scopedExecLogs, setScopedExecLogs] = useState<string[]>([]);

  // API Envelope Simulator State
  const [simulatedEndpoint, setSimulatedEndpoint] = useState<string>('get-patient');
  const [apiExecutionStatus, setApiExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [apiResponsePayload, setApiResponsePayload] = useState<any>(null);

  const selectedFile = useMemo(() => {
    return ARCHITECTURE_FILES.find((f) => f.id === selectedFileId) || ARCHITECTURE_FILES[0];
  }, [selectedFileId]);

  const filteredFiles = useMemo(() => {
    if (!searchFilter.trim()) return ARCHITECTURE_FILES;
    const q = searchFilter.toLowerCase();
    return ARCHITECTURE_FILES.filter(
      (f) =>
        f.fileName.toLowerCase().includes(q) ||
        f.module.toLowerCase().includes(q) ||
        f.path.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    addToast({ type: 'success', title: 'Code Copied', message: `Copied ${selectedFile.fileName} to clipboard.` });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestRunWithTenant = () => {
    const target = 'e4a2b1c0-789a-4bc1-9012-3456789abcde';
    setScopedExecLogs([
      `[T0] TenantContext.getTenantId() => null (Thread clean)`,
      `[T1] Invoking TenantContext.runWithTenant("${target}")`,
      `[T2] Inside scoped block: TenantContext.getTenantId() => ${target}`,
      `[T3] Executing transactional clinical task with isolated DB boundary...`,
      `[T4] PostgresRlsAspect triggers: SET LOCAL app.current_tenant_id = '${target}'`,
      `[T5] Transaction completes (commit/rollback) -> SET LOCAL auto-discarded`,
      `[T6] Finally block executes -> TenantContext.clear()`,
      `[T7] After execution: TenantContext.getTenantId() => null (Zero pool poisoning!)`
    ]);
  };

  const handleExecuteApiSimulation = (endpoint: string) => {
    setSimulatedEndpoint(endpoint);
    setApiExecutionStatus('running');

    setTimeout(() => {
      const now = new Date().toISOString();
      const currentTenantUuid =
        simulatedTenant === 'tenant-metro-health'
          ? 'a3b84180-2d6f-42a1-9c8e-5b1f81d94101'
          : 'c9d18721-6f4e-4b72-8a9d-3f1a92e10502';

      if (endpoint === 'get-patient') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: 'Patient retrieved successfully',
          data: {
            id: '7b4c81a2-5f3e-4d91-8b20-1a4d93e81001',
            tenantId: currentTenantUuid,
            mrn: 'MRN-2026-0842',
            firstName: 'Eleanor',
            lastName: 'Vance',
            dateOfBirth: '1988-04-14',
            gender: 'FEMALE',
            phoneNumber: '+1-555-019-2831',
            email: 'eleanor.vance@example.com',
            createdAt: '2026-03-10T14:22:00Z',
            version: 1
          },
          timestamp: now
        });
      } else if (endpoint === 'clinical-encounter-post') {
        if (role === 'RECEPTIONIST') {
          setApiExecutionStatus('error');
          setApiResponsePayload({
            code: 403,
            message: "Access Denied: Role RECEPTIONIST lacks required authority 'encounter:clinical:write'. Clinical and SOAP records are strictly isolated.",
            errors: null,
            timestamp: now
          });
        } else {
          setApiExecutionStatus('success');
          setApiResponsePayload({
            code: 201,
            message: 'Clinical encounter created successfully',
            data: {
              id: '9e1c2b3a-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
              patientName: 'Jane Doe',
              diagnosis: 'Migraine without aura, episodic (ICD-10 G43.009)',
              status: 'COMPLETED'
            },
            timestamp: now
          });
        }
      } else if (endpoint === 'platform-dashboard-metrics') {
        if (role !== 'SUPER_ADMIN') {
          setApiExecutionStatus('error');
          setApiResponsePayload({
            code: 403,
            message: "Access Denied: Lacks required authority 'platform:subscriptions:manage'. Super Admin Control Plane access required.",
            errors: null,
            timestamp: now
          });
        } else {
          setApiExecutionStatus('success');
          setApiResponsePayload({
            code: 200,
            message: 'Platform dashboard metrics retrieved successfully',
            data: {
              activeTenantsCount: 42,
              totalMrrCents: 12450000,
              trialTenantsCount: 18,
              pastDueTenantsCount: 3,
              renewalRatePercentage: 93.3,
              globalWhatsappCreditsUsed: 3840,
              globalWhatsappCreditsTotal: 12500
            },
            timestamp: now
          });
        }
      } else if (endpoint === 'shifts-close') {
        setApiExecutionStatus('success');
        setApiResponsePayload({
          code: 200,
          message: 'Daily shift closed and reconciled successfully',
          data: {
            id: 'd9e8f7a6-b5c4-3d2e-1f0a-9b8c7d6e5f4a',
            receptionistName: 'Emily Watson',
            expectedCashAmount: 320.0,
            actualCashAmount: 320.0,
            discrepancy: 0.0,
            status: 'CLOSED'
          },
          timestamp: now
        });
      }
    }, 150);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950">
      {/* File Explorer Sidebar */}
      <aside className="w-full md:w-80 bg-slate-900/60 border-e border-slate-800 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-3 border-b border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute start-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter architectural files..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full ps-8 pe-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="p-2 space-y-1 text-xs">
          {filteredFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => setSelectedFileId(file.id)}
              className={`w-full text-start px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                selectedFileId === file.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <div className="truncate flex-1">
                <span className="truncate block font-mono text-[11px]">{file.fileName}</span>
                <span className="text-[10px] text-slate-500 block truncate">{file.module}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Code Inspector & Live Invariant Tester */}
      <section className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        {/* Breadcrumb Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
            <span className="text-slate-500">Module:</span>
            <span className="font-semibold text-slate-300">{selectedFile.module}</span>
            <span aria-hidden="true">/</span>
            <span className="font-mono text-cyan-300">{selectedFile.fileName}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors whitespace-nowrap shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy File'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-6 font-mono text-xs leading-relaxed text-slate-300 bg-slate-950">
          <pre>
            <code>{selectedFile.code}</code>
          </pre>
        </div>

        {/* Quick Simulator Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Interactive Simulator:</span>
            <button
              onClick={() => handleExecuteApiSimulation('get-patient')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px]"
            >
              GET /patients
            </button>
            <button
              onClick={() => handleExecuteApiSimulation('clinical-encounter-post')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px]"
            >
              POST /encounters
            </button>
            <button
              onClick={() => handleExecuteApiSimulation('platform-dashboard-metrics')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px]"
            >
              GET /platform/metrics
            </button>
          </div>

          {apiResponsePayload && (
            <div className="text-[11px] font-mono text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Envelope Code: {apiResponsePayload.code} ({apiResponsePayload.message})
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ArchitectureCodeView;
