/**
 * Audit and Operational Metrics Routes
 * Implements T-024 and T-025.
 */
import { Router, Response } from 'express';
import { getDatabase } from '@callivaan/database';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';
import { log } from '../logger.js';

export const adminRouter = Router();
adminRouter.use(requireAuth);

adminRouter.get('/audit-events', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const db = getDatabase();

    const events = await db.listAuditEvents(tenantId, limit);
    res.json({ auditEvents: events });
  } catch (err) {
    log('error', 'Error retrieving audit events', { correlationId: req.correlationId, err });
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve audit events' });
  }
});

adminRouter.get('/metrics', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const db = getDatabase();
    const calls = await db.listCalls(tenantId, 100);

    const totalCalls = calls.total;
    const successfulCalls = calls.calls.filter((c) => c.status === 'completed' || c.status === 'callback_requested').length;
    const degradedCalls = calls.calls.filter((c) => c.status === 'human_fallback' || c.status === 'technical_failure').length;

    const successRatePercent = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 100;

    res.json({
      uptimeSeconds: process.uptime(),
      callMetrics: {
        totalCalls,
        successfulCalls,
        degradedCalls,
        successRatePercent,
        firstAudioLatencyTargetMs: 800,
        summaryGenerationTargetSeconds: 15,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve metrics' });
  }
});
