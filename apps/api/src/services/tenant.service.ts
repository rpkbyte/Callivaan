/**
 * Tenant & Business Profile Domain Service
 */
import { DatabaseRepository, getDatabase } from '@callivaan/database';
import { BusinessProfile } from '@callivaan/shared';
import { NotFoundError } from '../errors/app-errors.js';

export class TenantService {
  private get db(): DatabaseRepository {
    return this._db || getDatabase();
  }
  constructor(private _db?: DatabaseRepository) {}

  async getProfile(tenantId: string): Promise<BusinessProfile> {
    const profile = await this.db.getBusinessProfile(tenantId);
    if (!profile) {
      throw new NotFoundError('Business profile not found');
    }
    return profile;
  }

  async updateProfile(tenantId: string, userId: string, data: any, ipAddress?: string): Promise<BusinessProfile> {
    const updated = await this.db.upsertBusinessProfile(tenantId, data);

    await this.db.recordAuditEvent({
      tenantId,
      actorId: userId,
      actorType: 'user',
      action: 'business_profile.updated',
      targetEntity: 'business_profile',
      targetEntityId: updated.id,
      details: { changedFields: Object.keys(data) },
      ipAddress,
    });

    return updated;
  }

  async getAuditEvents(tenantId: string, limit: number = 50) {
    const events = await this.db.listAuditEvents(tenantId, limit);
    return { auditEvents: events };
  }

  async getMetrics(tenantId: string) {
    const calls = await this.db.listCalls(tenantId, 100);

    const totalCalls = calls.total;
    const successfulCalls = calls.calls.filter((c) => c.status === 'completed' || c.status === 'callback_requested').length;
    const degradedCalls = calls.calls.filter((c) => c.status === 'human_fallback' || c.status === 'technical_failure').length;

    const successRatePercent = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 100;

    return {
      uptimeSeconds: process.uptime(),
      callMetrics: {
        totalCalls,
        successfulCalls,
        degradedCalls,
        successRatePercent,
        firstAudioLatencyTargetMs: 800,
        summaryGenerationTargetSeconds: 15,
      },
    };
  }
}
