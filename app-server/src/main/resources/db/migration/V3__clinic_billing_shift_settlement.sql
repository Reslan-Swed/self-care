-- =========================================================================
-- V3: Clinic Billing Ledger, Payments, and Receptionist Shift Settlement
--
-- Invariants:
-- 1. Tenant Scoping: All tables include tenant_id referencing platform_tenants(id)
-- 2. Row Level Security: FORCE ROW LEVEL SECURITY with app.current_tenant_id
-- 3. High-precision numeric columns: NUMERIC(12, 2) for all financial currency
-- =========================================================================

-- 1. Upgrade clinic_invoices to high-precision numeric columns
ALTER TABLE clinic_invoices 
    ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;

-- 2. Create clinic_invoice_payments table
CREATE TABLE clinic_invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    invoice_id UUID NOT NULL REFERENCES clinic_invoices(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- CASH, CARD, TRANSFER
    received_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    notes TEXT,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security for clinic_invoice_payments
ALTER TABLE clinic_invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_invoice_payments FORCE ROW LEVEL SECURITY;

CREATE POLICY rls_invoice_payments_isolation ON clinic_invoice_payments
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE INDEX idx_invoice_payments_tenant_id ON clinic_invoice_payments (tenant_id);
CREATE INDEX idx_invoice_payments_invoice_id ON clinic_invoice_payments (invoice_id);
CREATE INDEX idx_invoice_payments_received_by ON clinic_invoice_payments (received_by);
CREATE INDEX idx_invoice_payments_date ON clinic_invoice_payments (payment_date);

-- 3. Create clinic_shift_settlements table
CREATE TABLE clinic_shift_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES platform_tenants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    receptionist_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    expected_cash_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    actual_cash_amount NUMERIC(12, 2),
    card_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    transfer_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discrepancy NUMERIC(12, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- OPEN, CLOSED
    closure_notes TEXT
);

-- Row Level Security for clinic_shift_settlements
ALTER TABLE clinic_shift_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_shift_settlements FORCE ROW LEVEL SECURITY;

CREATE POLICY rls_shift_settlements_isolation ON clinic_shift_settlements
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE INDEX idx_shift_settlements_tenant_id ON clinic_shift_settlements (tenant_id);
CREATE INDEX idx_shift_settlements_receptionist ON clinic_shift_settlements (receptionist_id);
CREATE INDEX idx_shift_settlements_status ON clinic_shift_settlements (status);
CREATE INDEX idx_shift_settlements_opened_at ON clinic_shift_settlements (opened_at);
