-- =========================================================================
-- V2: Refactor Platform Admins and Tenant Users with Foreign Key Relationships
--
-- Invariants:
-- 1. Control Plane Segregation: platform_admins table (NO tenant_id)
-- 2. Application Plane: users table (Strictly tenant-scoped with RLS)
-- 3. Composite unique constraint: (tenant_id, email)
-- 4. Converts doctor_id in clinic_appointments and clinic_encounters to proper FKs
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Control Plane: Platform Super Administrators (No tenant_id)
-- -------------------------------------------------------------------------

CREATE TABLE platform_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'SUPER_ADMIN', -- SUPER_ADMIN, SUPPORT_AGENT
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_platform_admins_email ON platform_admins (email);

-- -------------------------------------------------------------------------
-- 2. Application Plane: Clinic Staff Users (Tenant-Scoped)
-- -------------------------------------------------------------------------

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'DOCTOR', -- CLINIC_ADMIN, DOCTOR, RECEPTIONIST
    specialty VARCHAR(100),
    license_number VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_users_tenant_email UNIQUE (tenant_id, email)
);

-- Enable and FORCE Row Level Security on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

CREATE POLICY rls_users_isolation ON users
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE INDEX idx_users_tenant_id ON users (tenant_id);
CREATE INDEX idx_users_tenant_email ON users (tenant_id, email);
CREATE INDEX idx_users_tenant_role ON users (tenant_id, role);

-- -------------------------------------------------------------------------
-- 3. Explicit Foreign Key Relationships for Clinic Appointments & Encounters
-- -------------------------------------------------------------------------

ALTER TABLE clinic_appointments
    ADD CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE clinic_encounters
    ADD CONSTRAINT fk_encounters_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE RESTRICT;
