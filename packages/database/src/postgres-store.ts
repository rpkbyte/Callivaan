/**
 * PostgreSQL Database Repository Implementation for Callivaan
 * Production-ready, multi-tenant SQL queries using pg.Pool.
 */
import pg from 'pg';
const { Pool } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  User,
  Tenant,
  TenantMember,
  BusinessProfile,
  AgentConfigVersion,
  AgentSettings,
  PhoneRoute,
  Call,
  CallSummary,
  UsageLedger,
  Subscription,
  WhatsAppLink,
  WhatsAppProposal,
  AuditEvent,
  PlanId,
  STARTER_PRESETS,
  STANDARD_PLANS,
} from '@callivaan/shared';
import { DatabaseRepository } from './repository.js';

function generateId(prefix: string = 'id'): string {
  return prefix + '_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export class PostgresDatabaseRepository implements DatabaseRepository {
  private pool: pg.Pool;

  constructor(connectionStringOrConfig?: string | pg.PoolConfig) {
    if (typeof connectionStringOrConfig === 'string') {
      this.pool = new Pool({ connectionString: connectionStringOrConfig });
    } else if (connectionStringOrConfig) {
      this.pool = new Pool(connectionStringOrConfig);
    } else {
      this.pool = new Pool({
        connectionString:
          process.env.DATABASE_URL ||
          'postgres://callivaan:callivaan_dev_password@localhost:5432/callivaan_dev',
      });
    }

    this.pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL Pool Client Error:', err);
    });
  }

  public getPool(): pg.Pool {
    return this.pool;
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Initialize Schema DDL and Seed Data
   */
  public async initSchema(): Promise<void> {
    try {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const candidates = [
        path.resolve(currentDir, 'schema.sql'),
        path.resolve(currentDir, '..', 'src', 'schema.sql'),
        path.resolve(process.cwd(), 'packages', 'database', 'src', 'schema.sql'),
        path.resolve(process.cwd(), 'packages', 'database', 'dist', 'schema.sql'),
      ];
      const schemaSqlPath = candidates.find((p) => fs.existsSync(p));
      if (schemaSqlPath) {
        const sql = fs.readFileSync(schemaSqlPath, 'utf8');
        await this.pool.query(sql);
        console.log('PostgreSQL schema initialized successfully from ' + schemaSqlPath);
      }
      await this.seedDemoDataIfEmpty();
    } catch (err) {
      console.error('Failed to initialize PostgreSQL schema:', err);
      throw err;
    }
  }

  public async seedDemoDataIfEmpty(): Promise<void> {
    const res = await this.pool.query('SELECT COUNT(*) FROM tenants');
    if (parseInt(res.rows[0].count, 10) > 0) {
      return; // Already seeded
    }

    const demoUserId = 'usr_demo_owner';
    const demoTenantId = 'ten_callivaan_demo';
    const now = new Date().toISOString();

    // 1. User (password is 'password123')
    await this.pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone_number, email_verified, phone_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        demoUserId,
        'owner@callivaan.demo',
        '$2a$10$WuuWmQFXU/2uoSkKjiEsOuO32DFdZN29u/ATXeIUHpYVzdqrvRyr2',
        'Rajesh Sharma',
        '+919810023456',
        true,
        true,
        now,
        now,
      ]
    );

    // 2. Tenant
    await this.pool.query(
      `INSERT INTO tenants (id, name, slug, timezone, country_code, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [demoTenantId, 'Shree Balaji Motors', 'balaji-motors', 'Asia/Kolkata', 'IN', 'active', now, now]
    );

    // 3. Member
    await this.pool.query(
      `INSERT INTO tenant_members (id, tenant_id, user_id, role, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [generateId('mem'), demoTenantId, demoUserId, 'owner', now]
    );

    // 4. Business Profile
    const profileHours = {
      monday: { open: '09:00', close: '20:00', closed: false },
      tuesday: { open: '09:00', close: '20:00', closed: false },
      wednesday: { open: '09:00', close: '20:00', closed: false },
      thursday: { open: '09:00', close: '20:00', closed: false },
      friday: { open: '09:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '20:00', closed: false },
      sunday: { open: '10:00', close: '18:00', closed: false },
    };
    await this.pool.query(
      `INSERT INTO business_profiles (id, tenant_id, business_name, category, description, languages, primary_language, operating_hours, service_area, escalation_phone_number, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        generateId('prof'),
        demoTenantId,
        'Shree Balaji Motors & Services',
        'repair_service',
        'Authorized multi-brand automobile dealership and service center.',
        JSON.stringify(['hi-en', 'hi', 'en']),
        'hi-en',
        JSON.stringify(profileHours),
        'Delhi NCR, Sector 62 Noida, Gurugram',
        '+919810023456',
        now,
        now,
      ]
    );

    // 5. Agent Config Version
    const preset = STARTER_PRESETS['repair_service'].settings;
    await this.pool.query(
      `INSERT INTO agent_configs (id, tenant_id, version_number, settings, is_active, change_source, changed_by_user_id, change_note, activated_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        generateId('cfg'),
        demoTenantId,
        1,
        JSON.stringify(preset),
        true,
        'system_init',
        demoUserId,
        'Initial setup with Automotive preset',
        now,
        now,
      ]
    );

    // 6. Phone Route
    await this.pool.query(
      `INSERT INTO phone_routes (id, tenant_id, provider, provider_virtual_number, customer_original_number, carrier, forwarding_mode, ring_timeout_seconds, status, fallback_behavior, call_forwarding_setup_code, verified_at, last_test_call_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        generateId('route'),
        demoTenantId,
        'exotel',
        '+918047368800',
        '+919810023456',
        'jio',
        'conditional_no_reply',
        15,
        'active',
        'announcement_hangup',
        '*401*+918047368800',
        now,
        now,
        now,
        now,
      ]
    );

    // 7. WhatsApp Link
    await this.pool.query(
      `INSERT INTO whatsapp_links (id, tenant_id, whatsapp_phone_number, is_verified, pairing_code, opt_ins, paired_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        generateId('wa'),
        demoTenantId,
        '+919810023456',
        true,
        '749102',
        JSON.stringify({ callSummaries: true, urgentAlerts: true, productUpdates: false }),
        now,
        now,
        now,
      ]
    );

    // 8. Usage Ledger
    const currentMonth = now.substring(0, 7);
    await this.pool.query(
      `INSERT INTO usage_ledger (id, tenant_id, period_year_month, telephony_minutes_used, ai_units_used, whatsapp_messages_sent, included_minutes, overage_minutes, estimated_overage_cost_inr, is_hard_limit_reached, last_updated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [generateId('usage'), demoTenantId, currentMonth, 342, 114, 48, 500, 0, 0.0, false, now]
    );

    // 9. Subscription
    await this.pool.query(
      `INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [generateId('sub'), demoTenantId, 'business', 'active', now, new Date(Date.now() + 30 * 86400000).toISOString(), now, now]
    );

    console.log('Seeded demo tenant Shree Balaji Motors into PostgreSQL');
  }

  // =========================================================================
  // 1. User & Auth
  // =========================================================================

  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'> & { passwordHash: string }): Promise<User> {
    const now = new Date().toISOString();
    const query = `
      INSERT INTO users (id, email, password_hash, full_name, phone_number, email_verified, phone_verified, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, email, full_name, phone_number, email_verified, phone_verified, created_at, updated_at
    `;
    const values = [
      user.id,
      user.email.toLowerCase().trim(),
      user.passwordHash,
      user.fullName.trim(),
      user.phoneNumber || null,
      user.emailVerified ?? false,
      user.phoneVerified ?? false,
      now,
      now,
    ];
    const res = await this.pool.query(query, values);
    return this.mapUser(res.rows[0]);
  }

  async getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const query = `SELECT * FROM users WHERE LOWER(email) = LOWER($1)`;
    const res = await this.pool.query(query, [email.trim()]);
    if (res.rows.length === 0) return null;
    return this.mapUserWithPassword(res.rows[0]);
  }

  async getUserById(id: string): Promise<User | null> {
    const query = `SELECT * FROM users WHERE id = $1`;
    const res = await this.pool.query(query, [id]);
    if (res.rows.length === 0) return null;
    return this.mapUser(res.rows[0]);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const now = new Date().toISOString();
    const fields: string[] = ['updated_at = $2'];
    const values: any[] = [id, now];
    let idx = 3;

    if (updates.fullName !== undefined) {
      fields.push(`full_name = $${idx++}`);
      values.push(updates.fullName);
    }
    if (updates.phoneNumber !== undefined) {
      fields.push(`phone_number = $${idx++}`);
      values.push(updates.phoneNumber);
    }
    if (updates.emailVerified !== undefined) {
      fields.push(`email_verified = $${idx++}`);
      values.push(updates.emailVerified);
    }
    if (updates.phoneVerified !== undefined) {
      fields.push(`phone_verified = $${idx++}`);
      values.push(updates.phoneVerified);
    }

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
    const res = await this.pool.query(query, values);
    if (res.rows.length === 0) return null;
    return this.mapUser(res.rows[0]);
  }

  // =========================================================================
  // 2. Tenants & Memberships
  // =========================================================================

  async createTenant(tenant: Omit<Tenant, 'createdAt' | 'updatedAt'>, ownerUserId: string): Promise<Tenant> {
    const now = new Date().toISOString();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const tenantRes = await client.query(
        `INSERT INTO tenants (id, name, slug, timezone, country_code, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [tenant.id, tenant.name, tenant.slug, tenant.timezone, tenant.countryCode, tenant.status, now, now]
      );

      const memberId = generateId('mem');
      await client.query(
        `INSERT INTO tenant_members (id, tenant_id, user_id, role, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [memberId, tenant.id, ownerUserId, 'owner', now]
      );

      await client.query('COMMIT');
      return this.mapTenant(tenantRes.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getTenantById(tenantId: string): Promise<Tenant | null> {
    const res = await this.pool.query('SELECT * FROM tenants WHERE id = $1', [tenantId]);
    if (res.rows.length === 0) return null;
    return this.mapTenant(res.rows[0]);
  }

  async getUserTenants(userId: string): Promise<{ tenant: Tenant; role: string }[]> {
    const query = `
      SELECT t.*, tm.role
      FROM tenant_members tm
      JOIN tenants t ON tm.tenant_id = t.id
      WHERE tm.user_id = $1
    `;
    const res = await this.pool.query(query, [userId]);
    return res.rows.map((row) => ({
      tenant: this.mapTenant(row),
      role: row.role,
    }));
  }

  async getTenantMember(tenantId: string, userId: string): Promise<TenantMember | null> {
    const query = `SELECT * FROM tenant_members WHERE tenant_id = $1 AND user_id = $2`;
    const res = await this.pool.query(query, [tenantId, userId]);
    if (res.rows.length === 0) return null;
    return this.mapTenantMember(res.rows[0]);
  }

  // =========================================================================
  // 3. Business Profiles
  // =========================================================================

  async getBusinessProfile(tenantId: string): Promise<BusinessProfile | null> {
    const res = await this.pool.query('SELECT * FROM business_profiles WHERE tenant_id = $1', [tenantId]);
    if (res.rows.length === 0) return null;
    return this.mapBusinessProfile(res.rows[0]);
  }

  async upsertBusinessProfile(tenantId: string, profile: Partial<BusinessProfile>): Promise<BusinessProfile> {
    const now = new Date().toISOString();
    const existing = await this.getBusinessProfile(tenantId);

    if (existing) {
      const updated: BusinessProfile = {
        ...existing,
        ...profile,
        updatedAt: now,
      };
      await this.pool.query(
        `UPDATE business_profiles
         SET business_name = $2, category = $3, description = $4, languages = $5, primary_language = $6,
             operating_hours = $7, service_area = $8, escalation_phone_number = $9, updated_at = $10
         WHERE tenant_id = $1`,
        [
          tenantId,
          updated.businessName,
          updated.category,
          updated.description,
          JSON.stringify(updated.languages),
          updated.primaryLanguage,
          JSON.stringify(updated.operatingHours),
          updated.serviceArea || '',
          updated.escalationPhoneNumber || null,
          now,
        ]
      );
      return updated;
    } else {
      const newId = generateId('prof');
      const newProfile: BusinessProfile = {
        id: newId,
        tenantId,
        businessName: profile.businessName || 'My Business',
        category: profile.category || 'repair_service',
        description: profile.description || '',
        languages: profile.languages || ['hi-en'],
        primaryLanguage: profile.primaryLanguage || 'hi-en',
        operatingHours: profile.operatingHours || {},
        serviceArea: profile.serviceArea || '',
        escalationPhoneNumber: profile.escalationPhoneNumber,
        createdAt: now,
        updatedAt: now,
      };
      await this.pool.query(
        `INSERT INTO business_profiles (id, tenant_id, business_name, category, description, languages, primary_language, operating_hours, service_area, escalation_phone_number, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          newId,
          tenantId,
          newProfile.businessName,
          newProfile.category,
          newProfile.description,
          JSON.stringify(newProfile.languages),
          newProfile.primaryLanguage,
          JSON.stringify(newProfile.operatingHours),
          newProfile.serviceArea,
          newProfile.escalationPhoneNumber || null,
          now,
          now,
        ]
      );
      return newProfile;
    }
  }

  // =========================================================================
  // 4. Agent Configurations & Versions
  // =========================================================================

  async getActiveAgentConfig(tenantId: string): Promise<AgentConfigVersion | null> {
    const res = await this.pool.query(
      `SELECT * FROM agent_configs WHERE tenant_id = $1 AND is_active = TRUE ORDER BY version_number DESC LIMIT 1`,
      [tenantId]
    );
    if (res.rows.length === 0) return null;
    return this.mapAgentConfig(res.rows[0]);
  }

  async getAgentConfigVersions(tenantId: string): Promise<AgentConfigVersion[]> {
    const res = await this.pool.query(
      `SELECT * FROM agent_configs WHERE tenant_id = $1 ORDER BY version_number DESC`,
      [tenantId]
    );
    return res.rows.map((r) => this.mapAgentConfig(r));
  }

  async createAgentConfigVersion(
    tenantId: string,
    params: {
      settings: AgentSettings;
      changeSource: 'web' | 'mobile' | 'whatsapp' | 'system_init';
      changedByUserId?: string;
      changeNote?: string;
      activateImmediately?: boolean;
    }
  ): Promise<AgentConfigVersion> {
    const now = new Date().toISOString();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const maxVerRes = await client.query(
        `SELECT COALESCE(MAX(version_number), 0) as max_ver FROM agent_configs WHERE tenant_id = $1`,
        [tenantId]
      );
      const nextVer = parseInt(maxVerRes.rows[0].max_ver, 10) + 1;
      const shouldActivate = params.activateImmediately ?? true;

      if (shouldActivate) {
        await client.query(
          `UPDATE agent_configs SET is_active = FALSE WHERE tenant_id = $1`,
          [tenantId]
        );
      }

      const newId = generateId('cfg');
      const insertRes = await client.query(
        `INSERT INTO agent_configs (id, tenant_id, version_number, settings, is_active, change_source, changed_by_user_id, change_note, activated_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          newId,
          tenantId,
          nextVer,
          JSON.stringify(params.settings),
          shouldActivate,
          params.changeSource,
          params.changedByUserId || null,
          params.changeNote || null,
          shouldActivate ? now : null,
          now,
        ]
      );

      await client.query('COMMIT');
      return this.mapAgentConfig(insertRes.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async activateAgentConfigVersion(tenantId: string, versionId: string): Promise<AgentConfigVersion | null> {
    const now = new Date().toISOString();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`UPDATE agent_configs SET is_active = FALSE WHERE tenant_id = $1`, [tenantId]);
      const res = await client.query(
        `UPDATE agent_configs SET is_active = TRUE, activated_at = $3 WHERE tenant_id = $1 AND id = $2 RETURNING *`,
        [tenantId, versionId, now]
      );
      await client.query('COMMIT');
      if (res.rows.length === 0) return null;
      return this.mapAgentConfig(res.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getAgentConfigById(tenantId: string, versionId: string): Promise<AgentConfigVersion | null> {
    const res = await this.pool.query(
      `SELECT * FROM agent_configs WHERE tenant_id = $1 AND id = $2`,
      [tenantId, versionId]
    );
    if (res.rows.length === 0) return null;
    return this.mapAgentConfig(res.rows[0]);
  }

  // =========================================================================
  // 5. Phone Routes
  // =========================================================================

  async getPhoneRoute(tenantId: string): Promise<PhoneRoute | null> {
    const res = await this.pool.query('SELECT * FROM phone_routes WHERE tenant_id = $1', [tenantId]);
    if (res.rows.length === 0) return null;
    return this.mapPhoneRoute(res.rows[0]);
  }

  async getPhoneRouteByVirtualNumber(virtualNumber: string): Promise<PhoneRoute | null> {
    const res = await this.pool.query(
      'SELECT * FROM phone_routes WHERE provider_virtual_number = $1',
      [virtualNumber]
    );
    if (res.rows.length === 0) return null;
    return this.mapPhoneRoute(res.rows[0]);
  }

  async upsertPhoneRoute(tenantId: string, params: Partial<PhoneRoute>): Promise<PhoneRoute> {
    const now = new Date().toISOString();
    const existing = await this.getPhoneRoute(tenantId);

    if (existing) {
      const updated: PhoneRoute = {
        ...existing,
        ...params,
        updatedAt: now,
      };
      await this.pool.query(
        `UPDATE phone_routes
         SET provider = $2, provider_virtual_number = $3, customer_original_number = $4,
             carrier = $5, forwarding_mode = $6, ring_timeout_seconds = $7,
             status = $8, fallback_behavior = $9, call_forwarding_setup_code = $10,
             verified_at = $11, last_test_call_at = $12, updated_at = $13
         WHERE tenant_id = $1`,
        [
          tenantId,
          updated.provider,
          updated.providerVirtualNumber,
          updated.customerOriginalNumber || null,
          updated.carrier || 'jio',
          updated.forwardingMode || 'conditional_no_reply',
          updated.ringTimeoutSeconds || 15,
          updated.status,
          updated.fallbackBehavior,
          updated.callForwardingSetupCode || null,
          updated.verifiedAt || null,
          updated.lastTestCallAt || null,
          now,
        ]
      );
      return updated;
    } else {
      const newId = generateId('route');
      const newRoute: PhoneRoute = {
        id: newId,
        tenantId,
        provider: params.provider || 'exotel',
        providerVirtualNumber: params.providerVirtualNumber || '+918047368800',
        customerOriginalNumber: params.customerOriginalNumber,
        carrier: params.carrier || 'jio',
        forwardingMode: params.forwardingMode || 'conditional_no_reply',
        ringTimeoutSeconds: params.ringTimeoutSeconds || 15,
        status: params.status || 'pending_setup',
        fallbackBehavior: params.fallbackBehavior || 'announcement_hangup',
        callForwardingSetupCode: params.callForwardingSetupCode || '*401*+918047368800',
        verifiedAt: params.verifiedAt,
        lastTestCallAt: params.lastTestCallAt,
        createdAt: now,
        updatedAt: now,
      };
      await this.pool.query(
        `INSERT INTO phone_routes (id, tenant_id, provider, provider_virtual_number, customer_original_number, carrier, forwarding_mode, ring_timeout_seconds, status, fallback_behavior, call_forwarding_setup_code, verified_at, last_test_call_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          newId,
          tenantId,
          newRoute.provider,
          newRoute.providerVirtualNumber,
          newRoute.customerOriginalNumber || null,
          newRoute.carrier,
          newRoute.forwardingMode,
          newRoute.ringTimeoutSeconds,
          newRoute.status,
          newRoute.fallbackBehavior,
          newRoute.callForwardingSetupCode || null,
          newRoute.verifiedAt || null,
          newRoute.lastTestCallAt || null,
          now,
          now,
        ]
      );
      return newRoute;
    }
  }

  // =========================================================================
  // 6. Calls
  // =========================================================================

  async createCall(call: Omit<Call, 'createdAt'>): Promise<Call> {
    const now = new Date().toISOString();
    const query = `
      INSERT INTO calls (id, tenant_id, provider_call_id, provider_stream_id, caller_number, virtual_number, agent_config_version_id, status, duration_seconds, audio_url, telecom_circle, disposition, two_party_consent_disclosed, started_at, ended_at, cost_estimate_inr, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    const res = await this.pool.query(query, [
      call.id,
      call.tenantId,
      call.providerCallId,
      call.providerStreamId || null,
      call.callerNumber,
      call.virtualNumber,
      call.agentConfigVersionId,
      call.status,
      call.durationSeconds,
      call.audioUrl || null,
      call.telecomCircle || 'Delhi NCR',
      call.disposition || 'inquiry',
      call.twoPartyConsentDisclosed ?? true,
      call.startedAt,
      call.endedAt || null,
      call.costEstimateInr || 0.0,
      now,
    ]);
    return this.mapCall(res.rows[0]);
  }

  async getCallById(tenantId: string, callId: string): Promise<Call | null> {
    const res = await this.pool.query(
      `SELECT * FROM calls WHERE tenant_id = $1 AND id = $2`,
      [tenantId, callId]
    );
    if (res.rows.length === 0) return null;
    return this.mapCall(res.rows[0]);
  }

  async getCallByProviderCallId(providerCallId: string): Promise<Call | null> {
    const res = await this.pool.query(
      `SELECT * FROM calls WHERE provider_call_id = $1`,
      [providerCallId]
    );
    if (res.rows.length === 0) return null;
    return this.mapCall(res.rows[0]);
  }

  async updateCall(tenantId: string, callId: string, updates: Partial<Call>): Promise<Call | null> {
    const fields: string[] = [];
    const values: any[] = [tenantId, callId];
    let idx = 3;

    if (updates.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(updates.status);
    }
    if (updates.durationSeconds !== undefined) {
      fields.push(`duration_seconds = $${idx++}`);
      values.push(updates.durationSeconds);
    }
    if (updates.endedAt !== undefined) {
      fields.push(`ended_at = $${idx++}`);
      values.push(updates.endedAt);
    }
    if (updates.audioUrl !== undefined) {
      fields.push(`audio_url = $${idx++}`);
      values.push(updates.audioUrl);
    }
    if (updates.disposition !== undefined) {
      fields.push(`disposition = $${idx++}`);
      values.push(updates.disposition);
    }
    if (updates.costEstimateInr !== undefined) {
      fields.push(`cost_estimate_inr = $${idx++}`);
      values.push(updates.costEstimateInr);
    }

    if (fields.length === 0) {
      return this.getCallById(tenantId, callId);
    }

    const query = `UPDATE calls SET ${fields.join(', ')} WHERE tenant_id = $1 AND id = $2 RETURNING *`;
    const res = await this.pool.query(query, values);
    if (res.rows.length === 0) return null;
    return this.mapCall(res.rows[0]);
  }

  async listCalls(tenantId: string, limit: number = 50, offset: number = 0): Promise<{ calls: Call[]; total: number }> {
    const countRes = await this.pool.query(`SELECT COUNT(*) FROM calls WHERE tenant_id = $1`, [tenantId]);
    const total = parseInt(countRes.rows[0].count, 10);

    const res = await this.pool.query(
      `SELECT * FROM calls WHERE tenant_id = $1 ORDER BY started_at DESC LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );
    return {
      calls: res.rows.map((r) => this.mapCall(r)),
      total,
    };
  }

  async deleteCall(tenantId: string, callId: string): Promise<boolean> {
    const res = await this.pool.query(
      `DELETE FROM calls WHERE tenant_id = $1 AND id = $2`,
      [tenantId, callId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  // =========================================================================
  // 7. Call Summaries
  // =========================================================================

  async createCallSummary(summary: Omit<CallSummary, 'createdAt'>): Promise<CallSummary> {
    const now = new Date().toISOString();
    const query = `
      INSERT INTO call_summaries (id, call_id, tenant_id, summary_text, extracted_lead, transcript_json, lead_score, buyer_intent_topic, is_unknown_flags, delivery_status, delivered_via_whatsapp_at, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const res = await this.pool.query(query, [
      summary.id,
      summary.callId,
      summary.tenantId,
      summary.summaryText,
      JSON.stringify(summary.extractedLead),
      JSON.stringify(summary.transcript || []),
      summary.leadScore || 0,
      summary.buyerIntentTopic || null,
      JSON.stringify(summary.isUnknownFlags),
      summary.deliveryStatus,
      summary.deliveredViaWhatsAppAt || null,
      now,
    ]);
    return this.mapCallSummary(res.rows[0]);
  }

  async getCallSummary(tenantId: string, callId: string): Promise<CallSummary | null> {
    const res = await this.pool.query(
      `SELECT * FROM call_summaries WHERE tenant_id = $1 AND call_id = $2`,
      [tenantId, callId]
    );
    if (res.rows.length === 0) return null;
    return this.mapCallSummary(res.rows[0]);
  }

  async updateCallSummary(tenantId: string, callId: string, updates: Partial<CallSummary>): Promise<CallSummary | null> {
    const fields: string[] = [];
    const values: any[] = [tenantId, callId];
    let idx = 3;

    if (updates.summaryText !== undefined) {
      fields.push(`summary_text = $${idx++}`);
      values.push(updates.summaryText);
    }
    if (updates.deliveryStatus !== undefined) {
      fields.push(`delivery_status = $${idx++}`);
      values.push(updates.deliveryStatus);
    }
    if (updates.deliveredViaWhatsAppAt !== undefined) {
      fields.push(`delivered_via_whatsapp_at = $${idx++}`);
      values.push(updates.deliveredViaWhatsAppAt);
    }
    if (updates.leadScore !== undefined) {
      fields.push(`lead_score = $${idx++}`);
      values.push(updates.leadScore);
    }

    if (fields.length === 0) return this.getCallSummary(tenantId, callId);

    const query = `UPDATE call_summaries SET ${fields.join(', ')} WHERE tenant_id = $1 AND call_id = $2 RETURNING *`;
    const res = await this.pool.query(query, values);
    if (res.rows.length === 0) return null;
    return this.mapCallSummary(res.rows[0]);
  }

  // =========================================================================
  // 8. WhatsApp Links & Preferences
  // =========================================================================

  async getWhatsAppLink(tenantId: string): Promise<WhatsAppLink | null> {
    const res = await this.pool.query('SELECT * FROM whatsapp_links WHERE tenant_id = $1', [tenantId]);
    if (res.rows.length === 0) return null;
    return this.mapWhatsAppLink(res.rows[0]);
  }

  async getWhatsAppLinkByPhone(whatsappPhone: string): Promise<WhatsAppLink | null> {
    const res = await this.pool.query(
      'SELECT * FROM whatsapp_links WHERE whatsapp_phone_number = $1',
      [whatsappPhone.trim()]
    );
    if (res.rows.length === 0) return null;
    return this.mapWhatsAppLink(res.rows[0]);
  }

  async createOrUpdateWhatsAppPairing(
    tenantId: string,
    whatsappPhone: string,
    pairingCode: string,
    expiresAt: string
  ): Promise<WhatsAppLink> {
    const now = new Date().toISOString();
    const existing = await this.getWhatsAppLink(tenantId);

    if (existing) {
      const res = await this.pool.query(
        `UPDATE whatsapp_links
         SET whatsapp_phone_number = $2, pairing_code = $3, pairing_code_expires_at = $4, is_verified = FALSE, updated_at = $5
         WHERE tenant_id = $1
         RETURNING *`,
        [tenantId, whatsappPhone.trim(), pairingCode, expiresAt, now]
      );
      return this.mapWhatsAppLink(res.rows[0]);
    } else {
      const newId = generateId('wa');
      const res = await this.pool.query(
        `INSERT INTO whatsapp_links (id, tenant_id, whatsapp_phone_number, is_verified, pairing_code, pairing_code_expires_at, opt_ins, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          newId,
          tenantId,
          whatsappPhone.trim(),
          false,
          pairingCode,
          expiresAt,
          JSON.stringify({ callSummaries: true, urgentAlerts: true, productUpdates: false }),
          now,
          now,
        ]
      );
      return this.mapWhatsAppLink(res.rows[0]);
    }
  }

  async verifyWhatsAppLink(pairingCode: string, whatsappPhone: string): Promise<WhatsAppLink | null> {
    const now = new Date().toISOString();
    const res = await this.pool.query(
      `SELECT * FROM whatsapp_links WHERE pairing_code = $1 AND is_verified = FALSE AND pairing_code_expires_at > NOW()`,
      [pairingCode.trim()]
    );
    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    const updateRes = await this.pool.query(
      `UPDATE whatsapp_links
       SET is_verified = TRUE, paired_at = $2, pairing_code = NULL, pairing_code_expires_at = NULL, updated_at = $2
       WHERE id = $1
       RETURNING *`,
      [row.id, now]
    );
    return this.mapWhatsAppLink(updateRes.rows[0]);
  }

  async updateWhatsAppOptIns(tenantId: string, optIns: Partial<WhatsAppLink['optIns']>): Promise<WhatsAppLink | null> {
    const existing = await this.getWhatsAppLink(tenantId);
    if (!existing) return null;

    const merged = { ...existing.optIns, ...optIns };
    const now = new Date().toISOString();
    const res = await this.pool.query(
      `UPDATE whatsapp_links SET opt_ins = $2, updated_at = $3 WHERE tenant_id = $1 RETURNING *`,
      [tenantId, JSON.stringify(merged), now]
    );
    return this.mapWhatsAppLink(res.rows[0]);
  }

  async setWhatsAppOptOut(whatsappPhone: string): Promise<boolean> {
    const now = new Date().toISOString();
    const res = await this.pool.query(
      `UPDATE whatsapp_links
       SET opt_ins = $2, opted_out_at = $3, updated_at = $3
       WHERE whatsapp_phone_number = $1`,
      [whatsappPhone.trim(), JSON.stringify({ callSummaries: false, urgentAlerts: false, productUpdates: false }), now]
    );
    return (res.rowCount ?? 0) > 0;
  }

  // =========================================================================
  // 9. WhatsApp Proposals
  // =========================================================================

  async createWhatsAppProposal(proposal: Omit<WhatsAppProposal, 'id' | 'createdAt'>): Promise<WhatsAppProposal> {
    const now = new Date().toISOString();
    const newId = generateId('prop');
    const query = `
      INSERT INTO whatsapp_proposals (id, tenant_id, sender_whatsapp_number, raw_user_message, proposed_patch, human_readable_summary, requires_clarification, clarification_prompt, status, created_at, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const res = await this.pool.query(query, [
      newId,
      proposal.tenantId,
      proposal.senderWhatsAppNumber,
      proposal.rawUserMessage,
      JSON.stringify(proposal.proposedPatch),
      proposal.humanReadableSummary,
      proposal.requiresClarification,
      proposal.clarificationPrompt || null,
      proposal.status,
      now,
      proposal.expiresAt,
    ]);
    return this.mapWhatsAppProposal(res.rows[0]);
  }

  async getPendingWhatsAppProposal(tenantId: string, senderPhone: string): Promise<WhatsAppProposal | null> {
    const query = `
      SELECT * FROM whatsapp_proposals
      WHERE tenant_id = $1 AND sender_whatsapp_number = $2 AND status = 'pending_confirmation' AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 1
    `;
    const res = await this.pool.query(query, [tenantId, senderPhone]);
    if (res.rows.length === 0) return null;
    return this.mapWhatsAppProposal(res.rows[0]);
  }

  async updateWhatsAppProposalStatus(id: string, status: WhatsAppProposal['status']): Promise<WhatsAppProposal | null> {
    const res = await this.pool.query(
      `UPDATE whatsapp_proposals SET status = $2 WHERE id = $1 RETURNING *`,
      [id, status]
    );
    if (res.rows.length === 0) return null;
    return this.mapWhatsAppProposal(res.rows[0]);
  }

  // =========================================================================
  // 10. Usage Ledger
  // =========================================================================

  async getUsageLedger(tenantId: string, periodYearMonth: string): Promise<UsageLedger | null> {
    const res = await this.pool.query(
      `SELECT * FROM usage_ledger WHERE tenant_id = $1 AND period_year_month = $2`,
      [tenantId, periodYearMonth]
    );
    if (res.rows.length === 0) return null;
    return this.mapUsageLedger(res.rows[0]);
  }

  async recordCallUsage(tenantId: string, durationSeconds: number, aiUnits?: number): Promise<UsageLedger> {
    const period = new Date().toISOString().substring(0, 7);
    const minutes = Math.ceil(durationSeconds / 60);
    const units = aiUnits ?? Math.ceil(durationSeconds / 10);
    const now = new Date().toISOString();

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const existing = await client.query(
        `SELECT * FROM usage_ledger WHERE tenant_id = $1 AND period_year_month = $2 FOR UPDATE`,
        [tenantId, period]
      );

      let record: UsageLedger;
      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        const newMinutes = parseInt(row.telephony_minutes_used, 10) + minutes;
        const newUnits = parseInt(row.ai_units_used, 10) + units;
        const included = parseInt(row.included_minutes, 10);
        const overage = Math.max(0, newMinutes - included);
        const overageCost = overage * 6.0;
        const isHardLimit = newMinutes >= included * 2;

        const updateRes = await client.query(
          `UPDATE usage_ledger
           SET telephony_minutes_used = $3, ai_units_used = $4, overage_minutes = $5,
               estimated_overage_cost_inr = $6, is_hard_limit_reached = $7, last_updated = $8
           WHERE id = $1 AND tenant_id = $2
           RETURNING *`,
          [row.id, tenantId, newMinutes, newUnits, overage, overageCost, isHardLimit, now]
        );
        record = this.mapUsageLedger(updateRes.rows[0]);
      } else {
        const subRes = await client.query('SELECT plan_id FROM subscriptions WHERE tenant_id = $1', [tenantId]);
        const planId: PlanId = (subRes.rows[0]?.plan_id as PlanId) || 'trial';
        const plan = STANDARD_PLANS.find((p) => p.id === planId) || STANDARD_PLANS[0];
        const included = plan?.includedMinutes || 30;
        const overage = Math.max(0, minutes - included);
        const overageCost = overage * (plan?.overageRatePerMinuteInr || 6.0);
        const isHardLimit = minutes >= included * 2;

        const insertRes = await client.query(
          `INSERT INTO usage_ledger (id, tenant_id, period_year_month, telephony_minutes_used, ai_units_used, whatsapp_messages_sent, included_minutes, overage_minutes, estimated_overage_cost_inr, is_hard_limit_reached, last_updated)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *`,
          [generateId('usage'), tenantId, period, minutes, units, 0, included, overage, overageCost, isHardLimit, now]
        );
        record = this.mapUsageLedger(insertRes.rows[0]);
      }

      await client.query('COMMIT');
      return record;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async recordWhatsAppMessageUsage(tenantId: string): Promise<UsageLedger> {
    const period = new Date().toISOString().substring(0, 7);
    const now = new Date().toISOString();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const existing = await client.query(
        `SELECT * FROM usage_ledger WHERE tenant_id = $1 AND period_year_month = $2 FOR UPDATE`,
        [tenantId, period]
      );

      let record: UsageLedger;
      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        const newCount = parseInt(row.whatsapp_messages_sent, 10) + 1;
        const updateRes = await client.query(
          `UPDATE usage_ledger SET whatsapp_messages_sent = $3, last_updated = $4 WHERE id = $1 AND tenant_id = $2 RETURNING *`,
          [row.id, tenantId, newCount, now]
        );
        record = this.mapUsageLedger(updateRes.rows[0]);
      } else {
        const insertRes = await client.query(
          `INSERT INTO usage_ledger (id, tenant_id, period_year_month, telephony_minutes_used, ai_units_used, whatsapp_messages_sent, included_minutes, overage_minutes, estimated_overage_cost_inr, is_hard_limit_reached, last_updated)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *`,
          [generateId('usage'), tenantId, period, 0, 0, 1, 30, 0, 0.0, false, now]
        );
        record = this.mapUsageLedger(insertRes.rows[0]);
      }
      await client.query('COMMIT');
      return record;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // =========================================================================
  // 11. Subscriptions
  // =========================================================================

  async getSubscription(tenantId: string): Promise<Subscription | null> {
    const res = await this.pool.query('SELECT * FROM subscriptions WHERE tenant_id = $1', [tenantId]);
    if (res.rows.length === 0) return null;
    return this.mapSubscription(res.rows[0]);
  }

  async upsertSubscription(
    tenantId: string,
    params: { planId: PlanId; status?: Subscription['status']; providerSubscriptionId?: string }
  ): Promise<Subscription> {
    const now = new Date().toISOString();
    const existing = await this.getSubscription(tenantId);

    if (existing) {
      const updated: Subscription = {
        ...existing,
        planId: params.planId,
        status: params.status || existing.status,
        providerSubscriptionId: params.providerSubscriptionId || existing.providerSubscriptionId,
        updatedAt: now,
      };
      await this.pool.query(
        `UPDATE subscriptions
         SET plan_id = $2, status = $3, provider_subscription_id = $4, updated_at = $5
         WHERE tenant_id = $1`,
        [tenantId, updated.planId, updated.status, updated.providerSubscriptionId || null, now]
      );
      return updated;
    } else {
      const newSub: Subscription = {
        id: generateId('sub'),
        tenantId,
        planId: params.planId,
        status: params.status || 'trial',
        currentPeriodStart: now,
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        cancelAtPeriodEnd: false,
        providerSubscriptionId: params.providerSubscriptionId,
        createdAt: now,
        updatedAt: now,
      };
      await this.pool.query(
        `INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end, provider_subscription_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          newSub.id,
          tenantId,
          newSub.planId,
          newSub.status,
          newSub.currentPeriodStart,
          newSub.currentPeriodEnd,
          newSub.cancelAtPeriodEnd,
          newSub.providerSubscriptionId || null,
          now,
          now,
        ]
      );
      return newSub;
    }
  }

  // =========================================================================
  // 12. Webhook Events
  // =========================================================================

  async checkAndRecordWebhookEvent(
    provider: string,
    externalEventId: string,
    eventType: string,
    payload: unknown
  ): Promise<{ isDuplicate: boolean; eventId: string }> {
    const existing = await this.pool.query(
      'SELECT id, status FROM webhook_events WHERE provider = $1 AND external_event_id = $2',
      [provider, externalEventId]
    );
    if (existing.rows.length > 0) {
      return { isDuplicate: true, eventId: existing.rows[0].id };
    }

    const newId = generateId('wh');
    const now = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO webhook_events (id, provider, external_event_id, event_type, payload, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'received', $6)`,
      [newId, provider, externalEventId, eventType, JSON.stringify(payload), now]
    );
    return { isDuplicate: false, eventId: newId };
  }

  async markWebhookProcessed(eventId: string, errorMessage?: string): Promise<void> {
    const now = new Date().toISOString();
    const status = errorMessage ? 'failed' : 'processed';
    await this.pool.query(
      `UPDATE webhook_events SET status = $2, processed_at = $3, error_message = $4 WHERE id = $1`,
      [eventId, status, now, errorMessage || null]
    );
  }

  // =========================================================================
  // 13. Audit Events
  // =========================================================================

  async recordAuditEvent(event: Omit<AuditEvent, 'id' | 'createdAt'>): Promise<AuditEvent> {
    const newId = generateId('aud');
    const now = new Date().toISOString();
    const query = `
      INSERT INTO audit_events (id, tenant_id, actor_id, actor_type, action, target_entity, target_entity_id, details, ip_address, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const res = await this.pool.query(query, [
      newId,
      event.tenantId || null,
      event.actorId,
      event.actorType,
      event.action,
      event.targetEntity,
      event.targetEntityId,
      JSON.stringify(event.details || {}),
      event.ipAddress || null,
      now,
    ]);
    return this.mapAuditEvent(res.rows[0]);
  }

  async listAuditEvents(tenantId: string, limit: number = 50): Promise<AuditEvent[]> {
    const res = await this.pool.query(
      `SELECT * FROM audit_events WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [tenantId, limit]
    );
    return res.rows.map((r) => this.mapAuditEvent(r));
  }

  // =========================================================================
  // Row Mapping Helpers
  // =========================================================================

  private mapUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      phoneNumber: row.phone_number,
      emailVerified: row.email_verified,
      phoneVerified: row.phone_verified,
      createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at?.toISOString ? row.updated_at.toISOString() : row.updated_at,
    };
  }

  private mapUserWithPassword(row: any): User & { passwordHash: string } {
    return {
      ...this.mapUser(row),
      passwordHash: row.password_hash,
    };
  }

  private mapTenant(row: any): Tenant {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      timezone: row.timezone,
      countryCode: row.country_code,
      status: row.status,
      createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at?.toISOString ? row.updated_at.toISOString() : row.updated_at,
    };
  }

  private mapTenantMember(row: any): TenantMember {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      userId: row.user_id,
      role: row.role,
      createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
    };
  }

  private mapBusinessProfile(row: any): BusinessProfile {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      businessName: row.business_name,
      category: row.category,
      description: row.description || '',
      languages: typeof row.languages === 'string' ? JSON.parse(row.languages) : row.languages,
      primaryLanguage: row.primary_language,
      operatingHours: typeof row.operating_hours === 'string' ? JSON.parse(row.operating_hours) : row.operating_hours,
      serviceArea: row.service_area || '',
      escalationPhoneNumber: row.escalation_phone_number || undefined,
      createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at?.toISOString ? row.updated_at.toISOString() : row.updated_at,
    };
  }

  private mapAgentConfig(row: any): AgentConfigVersion {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      versionNumber: row.version_number,
      settings: typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings,
      isActive: row.is_active,
      changeSource: row.change_source,
      changedByUserId: row.changed_by_user_id || undefined,
      changeNote: row.change_note || undefined,
      activatedAt: row.activated_at?.toISOString ? row.activated_at.toISOString() : row.activated_at,
      createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
    };
  }

  private mapPhoneRoute(row: any): PhoneRoute {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      provider: row.provider,
      providerVirtualNumber: row.provider_virtual_number,
      customerOriginalNumber: row.customer_original_number || undefined,
      carrier: row.carrier || 'jio',
      forwardingMode: row.forwarding_mode || 'conditional_no_reply',
      ringTimeoutSeconds: row.ring_timeout_seconds || 15,
      status: row.status,
      fallbackBehavior: row.fallback_behavior,
      callForwardingSetupCode: row.call_forwarding_setup_code || undefined,
      verifiedAt: row.verified_at?.toISOString ? row.verified_at.toISOString() : row.verified_at,
      lastTestCallAt: row.last_test_call_at?.toISOString ? row.last_test_call_at.toISOString() : row.last_test_call_at,
      createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at?.toISOString ? row.updated_at.toISOString() : row.updated_at,
    };
  }

  private mapCall(row: any): Call {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      providerCallId: row.provider_call_id,
      providerStreamId: row.provider_stream_id || undefined,
      callerNumber: row.caller_number,
      virtualNumber: row.virtual_number,
      agentConfigVersionId: row.agent_config_version_id,
      status: row.status,
      durationSeconds: row.duration_seconds || 0,
      audioUrl: row.audio_url || undefined,
      telecomCircle: row.telecom_circle || 'Delhi NCR',
      disposition: row.disposition || 'inquiry',
      twoPartyConsentDisclosed: row.two_party_consent_disclosed ?? true,
      retentionExpiresAt: row.retention_expires_at?.toISOString ? row.retention_expires_at.toISOString() : row.retention_expires_at,
      startedAt: row.started_at?.toISOString ? row.started_at.toISOString() : row.started_at,
      endedAt: row.ended_at?.toISOString ? row.ended_at.toISOString() : row.ended_at,
      costEstimateInr: row.cost_estimate_inr ? parseFloat(row.cost_estimate_inr) : 0.0,
      createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
    };
  }

  private mapCallSummary(row: any): CallSummary {
    return {
      id: row.id,
      callId: row.call_id,
      tenantId: row.tenant_id,
      summaryText: row.summary_text,
      extractedLead: typeof row.extracted_lead === 'string' ? JSON.parse(row.extracted_lead) : row.extracted_lead,
      transcript: row.transcript_json ? (typeof row.transcript_json === 'string' ? JSON.parse(row.transcript_json) : row.transcript_json) : [],
      leadScore: row.lead_score || 0,
      buyerIntentTopic: row.buyer_intent_topic || undefined,
      isUnknownFlags: typeof row.is_unknown_flags === 'string' ? JSON.parse(row.is_unknown_flags) : row.is_unknown_flags,
      deliveryStatus: row.delivery_status,
      deliveredViaWhatsAppAt: row.delivered_via_whatsapp_at?.toISOString ? row.delivered_via_whatsapp_at.toISOString() : row.delivered_via_whatsapp_at,
      createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
    };
  }

  private mapWhatsAppLink(row: any): WhatsAppLink {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      whatsappPhoneNumber: row.whatsapp_phone_number,
      isVerified: row.is_verified,
      pairingCode: row.pairing_code || undefined,
      pairingCodeExpiresAt: row.pairing_code_expires_at?.toISOString ? row.pairing_code_expires_at.toISOString() : row.pairing_code_expires_at,
      pairedAt: row.paired_at?.toISOString ? row.paired_at.toISOString() : row.paired_at,
      optIns: typeof row.opt_ins === 'string' ? JSON.parse(row.opt_ins) : row.opt_ins,
      optedOutAt: row.opted_out_at?.toISOString ? row.opted_out_at.toISOString() : row.opted_out_at,
      createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at?.toISOString ? row.updated_at.toISOString() : row.updated_at,
    };
  }

  private mapWhatsAppProposal(row: any): WhatsAppProposal {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      senderWhatsAppNumber: row.sender_whatsapp_number,
      rawUserMessage: row.raw_user_message,
      proposedPatch: typeof row.proposed_patch === 'string' ? JSON.parse(row.proposed_patch) : row.proposed_patch,
      humanReadableSummary: row.human_readable_summary,
      requiresClarification: row.requires_clarification,
      clarificationPrompt: row.clarification_prompt || undefined,
      status: row.status,
      createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
      expiresAt: row.expires_at?.toISOString ? row.expires_at.toISOString() : row.expires_at,
    };
  }

  private mapUsageLedger(row: any): UsageLedger {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      periodYearMonth: row.period_year_month,
      telephonyMinutesUsed: parseInt(row.telephony_minutes_used, 10) || 0,
      aiUnitsUsed: parseInt(row.ai_units_used, 10) || 0,
      whatsappMessagesSent: parseInt(row.whatsapp_messages_sent, 10) || 0,
      includedMinutes: parseInt(row.included_minutes, 10) || 30,
      overageMinutes: parseInt(row.overage_minutes, 10) || 0,
      estimatedOverageCostInr: parseFloat(row.estimated_overage_cost_inr) || 0,
      isHardLimitReached: Boolean(row.is_hard_limit_reached),
      lastUpdated: row.last_updated?.toISOString ? row.last_updated.toISOString() : (row.last_updated || new Date().toISOString()),
    };
  }

  private mapSubscription(row: any): Subscription {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      planId: row.plan_id,
      status: row.status,
      currentPeriodStart: row.current_period_start?.toISOString ? row.current_period_start.toISOString() : row.current_period_start,
      currentPeriodEnd: row.current_period_end?.toISOString ? row.current_period_end.toISOString() : row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      providerSubscriptionId: row.provider_subscription_id || undefined,
      createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at?.toISOString ? row.updated_at.toISOString() : row.updated_at,
    };
  }

  private mapAuditEvent(row: any): AuditEvent {
    return {
      id: row.id,
      tenantId: row.tenant_id || undefined,
      actorId: row.actor_id,
      actorType: row.actor_type,
      action: row.action,
      targetEntity: row.target_entity,
      targetEntityId: row.target_entity_id,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details,
      ipAddress: row.ip_address || undefined,
      createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
    };
  }
}


