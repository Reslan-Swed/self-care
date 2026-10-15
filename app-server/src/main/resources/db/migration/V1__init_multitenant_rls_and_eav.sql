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
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'TRIAL',
    specialty VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    admin_email VARCHAR(255) NOT NULL
);

CREATE TABLE platform_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    max_doctors INT NOT NULL DEFAULT 1,
    whatsapp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    price_cents INT NOT NULL DEFAULT 0
);

CREATE TABLE platform_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    tenant_id UUID NOT NULL UNIQUE REFERENCES platform_tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES platform_plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    sms_whatsapp_credits INT NOT NULL DEFAULT 0
);

CREATE TABLE platform_impersonation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    admin_id UUID NOT NULL,
    target_tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE CASCADE,
    justification TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    session_expires_at TIMESTAMPTZ NOT NULL
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
    file_number VARCHAR(100),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    gender VARCHAR(20),
    birth_date DATE,
    blood_group VARCHAR(10),
    medical_alerts TEXT
);

CREATE TABLE clinic_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    patient_id UUID NOT NULL REFERENCES clinic_patients(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 15,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, CONFIRMED, WAITING, IN_CONSULTATION, COMPLETED, CANCELLED, NO_SHOW
    reason_for_visit VARCHAR(255)
);

CREATE TABLE clinic_encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    appointment_id UUID REFERENCES clinic_appointments(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES clinic_patients(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL,
    encounter_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    chief_complaint TEXT NOT NULL DEFAULT '',
    subjective_notes TEXT,
    objective_exam TEXT,
    diagnosis TEXT NOT NULL DEFAULT '',
    prescription TEXT
);

CREATE TABLE clinic_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    invoice_number VARCHAR(100) NOT NULL,
    patient_id UUID NOT NULL REFERENCES clinic_patients(id) ON DELETE RESTRICT,
    encounter_id UUID REFERENCES clinic_encounters(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    total_amount_cents BIGINT NOT NULL DEFAULT 0,
    paid_amount_cents BIGINT NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    CONSTRAINT uq_invoice_number_per_tenant UNIQUE (tenant_id, invoice_number)
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
    data_type VARCHAR(50) NOT NULL, -- TEXT, NUMBER, NUMERIC, DATE, BOOLEAN, SELECT
    specialty VARCHAR(50) NOT NULL DEFAULT 'GENERAL_PRACTICE',
    target_entity VARCHAR(50) NOT NULL DEFAULT 'ENCOUNTER',
    display_order INT NOT NULL DEFAULT 0,
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

ALTER TABLE clinic_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_appointments FORCE ROW LEVEL SECURITY;

ALTER TABLE clinic_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_encounters FORCE ROW LEVEL SECURITY;

ALTER TABLE clinic_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_invoices FORCE ROW LEVEL SECURITY;

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

CREATE POLICY rls_appointments_isolation ON clinic_appointments
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY rls_encounters_isolation ON clinic_encounters
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY rls_invoices_isolation ON clinic_invoices
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
CREATE INDEX idx_patients_tenant_name ON clinic_patients (tenant_id, full_name);
CREATE INDEX idx_patients_tenant_phone ON clinic_patients (tenant_id, phone);
CREATE INDEX idx_appointments_tenant_patient ON clinic_appointments (tenant_id, patient_id);
CREATE INDEX idx_appointments_tenant_doctor_sched ON clinic_appointments (tenant_id, doctor_id, scheduled_at);
CREATE INDEX idx_appointments_tenant_queue ON clinic_appointments (tenant_id, status, scheduled_at);
CREATE INDEX idx_encounters_tenant_patient ON clinic_encounters (tenant_id, patient_id);
CREATE INDEX idx_encounters_tenant_doctor ON clinic_encounters (tenant_id, doctor_id);
CREATE INDEX idx_invoices_tenant_patient ON clinic_invoices (tenant_id, patient_id);
CREATE INDEX idx_eav_values_encounter ON encounter_field_values (tenant_id, encounter_id);
CREATE INDEX idx_eav_definitions_specialty ON custom_field_definitions (tenant_id, specialty);
