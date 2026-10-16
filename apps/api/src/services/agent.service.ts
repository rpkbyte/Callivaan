/**
 * Agent Configuration Domain Service
 */
import { DatabaseRepository, getDatabase } from '@callivaan/database';
import { AgentConfigVersion, STARTER_PRESETS } from '@callivaan/shared';
import { NotFoundError } from '../errors/app-errors.js';

export interface CreateVersionParams {
  tenantId: string;
  userId: string;
  settings: any;
  changeNote?: string;
  activateImmediately?: boolean;
  ipAddress?: string;
}

export class AgentService {
  private get db(): DatabaseRepository {
    return this._db || getDatabase();
  }
  constructor(private _db?: DatabaseRepository) {}

  getPresets() {
    return { presets: STARTER_PRESETS };
  }

  async getVersions(tenantId: string): Promise<AgentConfigVersion[]> {
    return this.db.getAgentConfigVersions(tenantId);
  }

  async getActiveConfig(tenantId: string): Promise<AgentConfigVersion> {
    const active = await this.db.getActiveAgentConfig(tenantId);
    if (!active) {
      throw new NotFoundError('No active agent configuration found');
    }
    return active;
  }

  async createVersion(params: CreateVersionParams): Promise<AgentConfigVersion> {
    const { tenantId, userId, settings, changeNote, activateImmediately, ipAddress } = params;

    const newVersion = await this.db.createAgentConfigVersion(tenantId, {
      settings,
      changeSource: 'web',
      changedByUserId: userId,
      changeNote: changeNote || 'Updated via portal',
      activateImmediately: activateImmediately ?? true,
    });

    await this.db.recordAuditEvent({
      tenantId,
      actorId: userId,
      actorType: 'user',
      action: 'agent_config.version_created',
      targetEntity: 'agent_config',
      targetEntityId: newVersion.id,
      details: {
        versionNumber: newVersion.versionNumber,
        isActive: newVersion.isActive,
      },
      ipAddress,
    });

    return newVersion;
  }

  async activateVersion(tenantId: string, versionId: string, userId: string, ipAddress?: string): Promise<AgentConfigVersion> {
    const activated = await this.db.activateAgentConfigVersion(tenantId, versionId);
    if (!activated) {
      throw new NotFoundError('Configuration version not found');
    }

    await this.db.recordAuditEvent({
      tenantId,
      actorId: userId,
      actorType: 'user',
      action: 'agent_config.version_activated',
      targetEntity: 'agent_config',
      targetEntityId: activated.id,
      details: { versionNumber: activated.versionNumber },
      ipAddress,
    });

    return activated;
  }
}
