/**
 * Agent Configuration and Versioning Routes
 * Implements T-014: typed settings, immutable versions, activation metadata.
 */
import { Router, Response } from 'express';
import { CreateAgentConfigSchema, STARTER_PRESETS } from '@callivaan/shared';
import { getDatabase } from '@callivaan/database';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';
import { log } from '../logger.js';

export const agentRouter = Router();
agentRouter.use(requireAuth);

agentRouter.get('/presets', (req: AuthenticatedRequest, res: Response) => {
  res.json({ presets: STARTER_PRESETS });
});

agentRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const db = getDatabase();
    const versions = await db.getAgentConfigVersions(tenantId);
    res.json({ versions });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve agent versions' });
  }
});

agentRouter.get('/active', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const db = getDatabase();
    const active = await db.getActiveAgentConfig(tenantId);
    if (!active) {
      res.status(404).json({ error: 'NotFound', message: 'No active agent configuration found' });
      return;
    }
    res.json(active);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve active agent config' });
  }
});

agentRouter.post('/', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const parseResult = CreateAgentConfigSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'ValidationError',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { settings, changeNote, activateImmediately } = parseResult.data;
    const db = getDatabase();

    const newVersion = await db.createAgentConfigVersion(tenantId, {
      settings,
      changeSource: 'web',
      changedByUserId: req.user!.id,
      changeNote: changeNote || 'Updated via portal',
      activateImmediately: activateImmediately ?? true,
    });

    await db.recordAuditEvent({
      tenantId,
      actorId: req.user!.id,
      actorType: 'user',
      action: 'agent_config.version_created',
      targetEntity: 'agent_config',
      targetEntityId: newVersion.id,
      details: {
        versionNumber: newVersion.versionNumber,
        isActive: newVersion.isActive,
      },
      ipAddress: req.ip,
    });

    log('info', 'New agent configuration version created', {
      correlationId: req.correlationId,
      tenantId,
      details: { versionNumber: newVersion.versionNumber, isActive: newVersion.isActive },
    });

    res.status(201).json(newVersion);
  } catch (err) {
    log('error', 'Error creating agent version', { correlationId: req.correlationId, err });
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to create agent version' });
  }
});

agentRouter.post('/:id/activate', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const versionId = req.params.id;
    const db = getDatabase();

    const activated = await db.activateAgentConfigVersion(tenantId, versionId);
    if (!activated) {
      res.status(404).json({ error: 'NotFound', message: 'Configuration version not found' });
      return;
    }

    await db.recordAuditEvent({
      tenantId,
      actorId: req.user!.id,
      actorType: 'user',
      action: 'agent_config.version_activated',
      targetEntity: 'agent_config',
      targetEntityId: activated.id,
      details: { versionNumber: activated.versionNumber },
      ipAddress: req.ip,
    });

    log('info', 'Agent configuration version activated', {
      correlationId: req.correlationId,
      tenantId,
      details: { versionNumber: activated.versionNumber },
    });

    res.json(activated);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to activate agent configuration' });
  }
});
