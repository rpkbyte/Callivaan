-- Callivaan Initial Database Schema
-- Multi-tenant, robust indexes, audit logging, and idempotency guarantees

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(32),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Tenants (Business accounts)
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    timezone VARCHAR(64) DEFAULT 'Asia/Kolkata',
    country_code VARCHAR(4) DEFAULT 'IN',
    status VARCHAR(32) DEFAULT 'trial', -- 'trial', 'active', 'suspended'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- 3. Tenant Memberships
CREATE TABLE IF NOT EXISTS tenant_members (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL DEFAULT 'owner', -- 'owner', 'admin', 'staff'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_member UNIQUE (tenant_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant ON tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user ON tenant_members(user_id);

-- 4. Business Profiles
CREATE TABLE IF NOT EXISTS business_profiles (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'repair_service',
    description TEXT DEFAULT '',
    languages TEXT NOT NULL DEFAULT '["en","hi","hi-en"]', -- JSON array
    primary_language VARCHAR(16) DEFAULT 'hi-en',
    operating_hours TEXT NOT NULL DEFAULT '{}', -- JSON map
    service_area VARCHAR(255) DEFAULT '',
    escalation_phone_number VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_business_profiles_tenant ON business_profiles(tenant_id);

-- 5. Versioned Agent Configurations
CREATE TABLE IF NOT EXISTS agent_configs (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    settings TEXT NOT NULL, -- JSON AgentSettings
    is_active BOOLEAN DEFAULT FALSE,
    change_source VARCHAR(32) DEFAULT 'web', -- 'web', 'mobile', 'whatsapp', 'system_init'
    changed_by_user_id VARCHAR(36),
    change_note TEXT,
    activated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_version UNIQUE (tenant_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_agent_configs_tenant_active ON agent_configs(tenant_id, is_active);

-- 6. Phone Routes (Telephony mapping)
CREATE TABLE IF NOT EXISTS phone_routes (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    provider VARCHAR(32) DEFAULT 'exotel',
    provider_virtual_number VARCHAR(32) NOT NULL, -- The virtual number callers reach
    customer_original_number VARCHAR(32),
    status VARCHAR(32) DEFAULT 'pending_setup', -- 'pending_setup', 'verified', 'active', 'error'
    fallback_behavior VARCHAR(32) DEFAULT 'announcement_hangup',
    call_forwarding_setup_code VARCHAR(64),
    verified_at TIMESTAMP WITH TIME ZONE,
    last_test_call_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_phone_routes_virtual_num ON phone_routes(provider_virtual_number);
CREATE INDEX IF NOT EXISTS idx_phone_routes_tenant ON phone_routes(tenant_id);

-- 7. WhatsApp Links & Preferences
CREATE TABLE IF NOT EXISTS whatsapp_links (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    whatsapp_phone_number VARCHAR(32) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    pairing_code VARCHAR(16),
    pairing_code_expires_at TIMESTAMP WITH TIME ZONE,
    paired_at TIMESTAMP WITH TIME ZONE,
    opt_ins TEXT NOT NULL DEFAULT '{"callSummaries":true,"urgentAlerts":true,"productUpdates":false}', -- JSON
    opted_out_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_links_phone ON whatsapp_links(whatsapp_phone_number);

-- 8. WhatsApp Configuration Proposals (Two-step confirmation)
CREATE TABLE IF NOT EXISTS whatsapp_proposals (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sender_whatsapp_number VARCHAR(32) NOT NULL,
    raw_user_message TEXT NOT NULL,
    proposed_patch TEXT NOT NULL, -- JSON partial settings
    human_readable_summary TEXT NOT NULL,
    requires_clarification BOOLEAN DEFAULT FALSE,
    clarification_prompt TEXT,
    status VARCHAR(32) DEFAULT 'pending_confirmation', -- 'pending_confirmation', 'confirmed', 'rejected', 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_wa_proposals_tenant_status ON whatsapp_proposals(tenant_id, status);

-- 9. Calls History
CREATE TABLE IF NOT EXISTS calls (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    provider_call_id VARCHAR(128) NOT NULL,
    provider_stream_id VARCHAR(128),
    caller_number VARCHAR(32) NOT NULL,
    virtual_number VARCHAR(32) NOT NULL,
    agent_config_version_id VARCHAR(36) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'callback_requested', 'human_fallback', 'caller_disconnected', 'limit_reached', 'technical_failure'
    duration_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    cost_estimate_inr NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_calls_tenant_started ON calls(tenant_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_provider_call_id ON calls(provider_call_id);

-- 10. Call Summaries
CREATE TABLE IF NOT EXISTS call_summaries (
    id VARCHAR(36) PRIMARY KEY,
    call_id VARCHAR(36) UNIQUE NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    extracted_lead TEXT NOT NULL DEFAULT '{}', -- JSON ExtractedLead
    is_unknown_flags TEXT NOT NULL DEFAULT '{}', -- JSON unknown flags
    delivery_status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'delivered', 'failed', 'not_eligible'
    delivered_via_whatsapp_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_call_summaries_tenant ON call_summaries(tenant_id);

-- 11. Usage Ledger
CREATE TABLE IF NOT EXISTS usage_ledger (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    period_year_month VARCHAR(7) NOT NULL, -- e.g. '2026-10'
    telephony_minutes_used INTEGER DEFAULT 0,
    ai_units_used INTEGER DEFAULT 0,
    whatsapp_messages_sent INTEGER DEFAULT 0,
    included_minutes INTEGER DEFAULT 30,
    overage_minutes INTEGER DEFAULT 0,
    estimated_overage_cost_inr NUMERIC(10, 2) DEFAULT 0.00,
    is_hard_limit_reached BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_usage_period UNIQUE (tenant_id, period_year_month)
);
CREATE INDEX IF NOT EXISTS idx_usage_ledger_tenant_period ON usage_ledger(tenant_id, period_year_month);

-- 12. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id VARCHAR(32) NOT NULL DEFAULT 'trial', -- 'trial', 'personal', 'business', 'team'
    status VARCHAR(32) NOT NULL DEFAULT 'trial', -- 'trial', 'active', 'past_due', 'canceled', 'suspended'
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    provider_subscription_id VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id);

-- 13. Webhook Events (Idempotency and Audit)
CREATE TABLE IF NOT EXISTS webhook_events (
    id VARCHAR(36) PRIMARY KEY,
    provider VARCHAR(32) NOT NULL, -- 'exotel', 'whatsapp', 'razorpay'
    external_event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'received', -- 'received', 'processed', 'duplicate', 'failed'
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_provider_external_event UNIQUE (provider, external_event_id)
);
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_id ON webhook_events(provider, external_event_id);

-- 14. Audit Events
CREATE TABLE IF NOT EXISTS audit_events (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36),
    actor_id VARCHAR(36) NOT NULL,
    actor_type VARCHAR(32) NOT NULL, -- 'user', 'system', 'whatsapp', 'admin'
    action VARCHAR(64) NOT NULL,
    target_entity VARCHAR(64) NOT NULL,
    target_entity_id VARCHAR(36) NOT NULL,
    details TEXT DEFAULT '{}',
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_events_tenant ON audit_events(tenant_id, created_at DESC);
