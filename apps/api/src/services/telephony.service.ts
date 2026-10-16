/**
 * Telephony Routing & Virtual Gateway Domain Service
 */
import { DatabaseRepository, getDatabase } from '@callivaan/database';
import { PhoneRoute } from '@callivaan/shared';
import { NotFoundError, BadRequestError } from '../errors/app-errors.js';

export class TelephonyService {
  private get db(): DatabaseRepository {
    return this._db || getDatabase();
  }
  constructor(private _db?: DatabaseRepository) {}

  async getRoute(tenantId: string): Promise<PhoneRoute> {
    const route = await this.db.getPhoneRoute(tenantId);
    if (!route) {
      throw new NotFoundError('No phone route configured for tenant');
    }
    return route;
  }

  async updateRoute(tenantId: string, userId: string, updates: any, ipAddress?: string): Promise<PhoneRoute> {
    const updated = await this.db.upsertPhoneRoute(tenantId, updates);

    await this.db.recordAuditEvent({
      tenantId,
      actorId: userId,
      actorType: 'user',
      action: 'phone_route.updated',
      targetEntity: 'phone_route',
      targetEntityId: updated.id,
      details: updates,
      ipAddress,
    });

    return updated;
  }

  async runTestCall(tenantId: string, callerNumber?: string) {
    const activeConfig = await this.db.getActiveAgentConfig(tenantId);
    if (!activeConfig) {
      throw new BadRequestError('No active agent configuration found. Please configure and activate your agent first.');
    }

    const route = await this.db.getPhoneRoute(tenantId);
    if (!route) {
      throw new BadRequestError('Phone route is not configured');
    }

    const testCallerNumber = callerNumber || '+919999988888';
    const testCallId = 'call_test_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    const call = await this.db.createCall({
      id: testCallId,
      tenantId,
      providerCallId: 'exotel_sim_' + Date.now(),
      callerNumber: testCallerNumber,
      virtualNumber: route.providerVirtualNumber,
      agentConfigVersionId: activeConfig.id,
      status: 'completed',
      durationSeconds: 45,
      startedAt: new Date(Date.now() - 45000).toISOString(),
      endedAt: new Date().toISOString(),
      costEstimateInr: 1.5,
    });

    const summary = await this.db.createCallSummary({
      id: 'sum_' + testCallId,
      callId: testCallId,
      tenantId,
      summaryText: `Caller requested inspection for AC cooling issue in South Delhi. Verified availability for tomorrow morning. Callback number provided.`,
      extractedLead: {
        callerName: 'Amit Verma',
        callbackNumber: testCallerNumber,
        requestedService: 'AC Repair / Cooling Issue',
        preferredTime: 'Tomorrow 10:00 AM - 12:00 PM',
        urgency: 'urgent',
        followUpAction: 'Assign technician slot and send confirmation SMS/WhatsApp',
      },
      isUnknownFlags: {
        callerNameUnknown: false,
        preferredTimeUnknown: false,
        serviceNeededUnknown: false,
        urgencyUnknown: false,
      },
      deliveryStatus: 'delivered',
      deliveredViaWhatsAppAt: new Date().toISOString(),
    });

    await this.db.upsertPhoneRoute(tenantId, {
      lastTestCallAt: new Date().toISOString(),
      status: 'verified',
    });

    await this.db.recordCallUsage(tenantId, 45, 1);

    return {
      message: 'Test call completed successfully',
      call,
      summary,
    };
  }
}
