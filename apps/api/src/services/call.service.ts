/**
 * Call History & Lead Analytics Domain Service
 */
import { DatabaseRepository, getDatabase } from '@callivaan/database';
import { NotFoundError } from '../errors/app-errors.js';

export class CallService {
  private get db(): DatabaseRepository {
    return this._db || getDatabase();
  }
  constructor(private _db?: DatabaseRepository) {}

  async listCalls(tenantId: string, limit: number = 20, offset: number = 0) {
    const result = await this.db.listCalls(tenantId, limit, offset);

    const callsWithSummaries = await Promise.all(
      result.calls.map(async (c) => {
        const summary = await this.db.getCallSummary(tenantId, c.id);
        return {
          ...c,
          summary: summary || null,
        };
      })
    );

    return {
      calls: callsWithSummaries,
      total: result.total,
      limit,
      offset,
    };
  }

  async getCallDetails(tenantId: string, callId: string) {
    const call = await this.db.getCallById(tenantId, callId);
    if (!call) {
      throw new NotFoundError('Call record not found');
    }

    const summary = await this.db.getCallSummary(tenantId, callId);
    const config = await this.db.getAgentConfigById(tenantId, call.agentConfigVersionId);

    return {
      call,
      summary: summary || null,
      agentConfigVersion: config || null,
    };
  }

  async deleteCall(tenantId: string, callId: string, userId: string, ipAddress?: string) {
    const deleted = await this.db.deleteCall(tenantId, callId);
    if (!deleted) {
      throw new NotFoundError('Call not found or already deleted');
    }

    await this.db.recordAuditEvent({
      tenantId,
      actorId: userId,
      actorType: 'user',
      action: 'call.deleted',
      targetEntity: 'call',
      targetEntityId: callId,
      ipAddress,
    });

    return { message: 'Call record and associated summary deleted successfully' };
  }
}
