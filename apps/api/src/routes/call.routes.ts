/**
 * Call History and Summaries Management Routes
 * Implements T-015 & T-024: list, filter, view details, and customer-directed deletion.
 */
import { Router, Response } from 'express';
import { getDatabase } from '@callivaan/database';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';
import { log } from '../logger.js';

export const callRouter = Router();
callRouter.use(requireAuth);

callRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const offset = parseInt((req.query.offset as string) || '0', 10);

    const db = getDatabase();
    const result = await db.listCalls(tenantId, limit, offset);

    // Fetch summaries for returned calls
    const callsWithSummaries = await Promise.all(
      result.calls.map(async (c) => {
        const summary = await db.getCallSummary(tenantId, c.id);
        return {
          ...c,
          summary: summary || null,
        };
      })
    );

    res.json({
      calls: callsWithSummaries,
      total: result.total,
      limit,
      offset,
    });
  } catch (err) {
    log('error', 'Error listing calls', { correlationId: req.correlationId, err });
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve call history' });
  }
});

callRouter.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const callId = req.params.id;
    const db = getDatabase();

    const call = await db.getCallById(tenantId, callId);
    if (!call) {
      res.status(404).json({ error: 'NotFound', message: 'Call record not found' });
      return;
    }

    const summary = await db.getCallSummary(tenantId, callId);
    const config = await db.getAgentConfigById(tenantId, call.agentConfigVersionId);

    res.json({
      call,
      summary: summary || null,
      agentConfigVersion: config || null,
    });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve call details' });
  }
});

callRouter.delete('/:id', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const callId = req.params.id;
    const db = getDatabase();

    const deleted = await db.deleteCall(tenantId, callId);
    if (!deleted) {
      res.status(404).json({ error: 'NotFound', message: 'Call not found or already deleted' });
      return;
    }

    await db.recordAuditEvent({
      tenantId,
      actorId: req.user!.id,
      actorType: 'user',
      action: 'call.deleted',
      targetEntity: 'call',
      targetEntityId: callId,
      ipAddress: req.ip,
    });

    log('info', 'Customer-directed call deletion executed', {
      correlationId: req.correlationId,
      tenantId,
      details: { callId },
    });

    res.json({ message: 'Call record and associated summary deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to delete call record' });
  }
});
