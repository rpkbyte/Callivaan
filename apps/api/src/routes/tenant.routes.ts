/**
 * Tenant and Business Profile Management Routes
 */
import { Router, Response } from 'express';
import { BusinessProfileUpdateSchema } from '@callivaan/shared';
import { getDatabase } from '@callivaan/database';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';
import { log } from '../logger.js';

export const tenantRouter = Router();
tenantRouter.use(requireAuth);

tenantRouter.get('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const db = getDatabase();
    const profile = await db.getBusinessProfile(tenantId);
    if (!profile) {
      res.status(404).json({ error: 'NotFound', message: 'Business profile not found' });
      return;
    }
    res.json(profile);
  } catch (err) {
    log('error', 'Error fetching business profile', { correlationId: req.correlationId, err });
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve business profile' });
  }
});

tenantRouter.patch('/profile', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const parseResult = BusinessProfileUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'ValidationError',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const db = getDatabase();
    const updated = await db.upsertBusinessProfile(tenantId, parseResult.data);

    await db.recordAuditEvent({
      tenantId,
      actorId: req.user!.id,
      actorType: 'user',
      action: 'business_profile.updated',
      targetEntity: 'business_profile',
      targetEntityId: updated.id,
      details: { changedFields: Object.keys(parseResult.data) },
      ipAddress: req.ip,
    });

    log('info', 'Business profile updated', {
      correlationId: req.correlationId,
      tenantId,
      details: { updatedFields: Object.keys(parseResult.data) },
    });

    res.json(updated);
  } catch (err) {
    log('error', 'Error updating business profile', { correlationId: req.correlationId, err });
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to update business profile' });
  }
});

tenantRouter.get('/members', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const db = getDatabase();
    // For demo/starter, return current member info
    res.json({
      members: [
        {
          userId: req.user!.id,
          fullName: req.user!.fullName,
          email: req.user!.email,
          role: req.memberRole,
        },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve members' });
  }
});
