-- =========================================================================
-- Micro-PMS Multi-Tenant SaaS Platform Schema & PostgreSQL RLS Definition
-- Invariants: Zero Data Leakage (RLS), Relational Typed EAV (No JSONB)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. Control Plane Tables (No tenant_id)
-- -------------------------------------------------------------------------

CREATE TABLE platform_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'TRIALING',
    admin_email VARCHAR(255) NOT NULL
);

CREATE TABLE platform_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    name VARCHAR(100) NOT NULL UNIQUE,
    monthly_price_cents INT NOT NULL,
    max_practitioners INT NOT NULL,
    max_patients INT NOT NULL,
    features_summary TEXT
);

CREATE TABLE platform_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES platform_plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL
);

-- -------------------------------------------------------------------------
-- 2. Application Plane Tables (Strictly Tenant-Scoped)
-- -------------------------------------------------------------------------

CREATE TABLE clinic_patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    mrn VARCHAR(64) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone_number VARCHAR(50),
    email VARCHAR(255),
    CONSTRAINT uq_patient_mrn_per_tenant UNIQUE (tenant_id, mrn)
);

CREATE TABLE clinic_encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    patient_id UUID NOT NULL REFERENCES clinic_patients(id) ON DELETE RESTRICT,
    practitioner_id UUID NOT NULL,
    encounter_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    subjective_notes TEXT,
    objective_notes TEXT,
    assessment TEXT,
    plan TEXT,
    icd10_codes VARCHAR(255)
);

-- -------------------------------------------------------------------------
-- 3. Relational Typed EAV Pattern (Strictly NO JSONB / Raw JSON)
-- -------------------------------------------------------------------------

CREATE TABLE custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    field_key VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL, -- TEXT, NUMERIC, DATE, BOOLEAN, SELECT
    specialty VARCHAR(50) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_custom_field_key_per_tenant UNIQUE (tenant_id, field_key)
);

CREATE TABLE custom_field_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    definition_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
    option_label VARCHAR(150) NOT NULL,
    option_value VARCHAR(150) NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE encounter_field_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    encounter_id UUID NOT NULL REFERENCES clinic_encounters(id) ON DELETE CASCADE,
    definition_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE RESTRICT,
    -- Typed EAV Columns (Strict Relational Typing)
    value_text TEXT,
    value_numeric NUMERIC(12, 4),
    value_date DATE,
    value_boolean BOOLEAN,
    CONSTRAINT uq_encounter_field_value UNIQUE (tenant_id, encounter_id, definition_id)
);

-- -------------------------------------------------------------------------
-- 4. PostgreSQL Row Level Security (RLS) Hardening
-- Enforces zero data leakage by comparing tenant_id against session variable
-- -------------------------------------------------------------------------

-- Enable and FORCE RLS on Application Plane tables
ALTER TABLE clinic_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_patients FORCE ROW LEVEL SECURITY;

ALTER TABLE clinic_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_encounters FORCE ROW LEVEL SECURITY;

ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions FORCE ROW LEVEL SECURITY;

ALTER TABLE custom_field_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_options FORCE ROW LEVEL SECURITY;

ALTER TABLE encounter_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounter_field_values FORCE ROW LEVEL SECURITY;

-- Create Tenant Isolation Policies (Null-safe UUID casting)
CREATE POLICY rls_patients_isolation ON clinic_patients
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY rls_encounters_isolation ON clinic_encounters
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY rls_custom_field_definitions_isolation ON custom_field_definitions
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY rls_custom_field_options_isolation ON custom_field_options
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY rls_encounter_field_values_isolation ON encounter_field_values
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- Indexes for performance
CREATE INDEX idx_patients_tenant_id ON clinic_patients (tenant_id);
CREATE INDEX idx_encounters_tenant_patient ON clinic_encounters (tenant_id, patient_id);
CREATE INDEX idx_eav_values_encounter ON encounter_field_values (tenant_id, encounter_id);
CREATE INDEX idx_eav_definitions_specialty ON custom_field_definitions (tenant_id, specialty);
