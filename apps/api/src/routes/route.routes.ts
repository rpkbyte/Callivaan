/**
 * Telephony Routing and Setup Guidance Routes
 * Implements T-021: guided route setup, verification, and test calls.
 */
import { Router, Response } from 'express';
import { PhoneRouteSetupSchema } from '@callivaan/shared';
import { getDatabase } from '@callivaan/database';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';
import { log } from '../logger.js';

export const routeRouter = Router();
routeRouter.use(requireAuth);

routeRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const db = getDatabase();
    const route = await db.getPhoneRoute(tenantId);
    if (!route) {
      res.status(404).json({ error: 'NotFound', message: 'No phone route configured for tenant' });
      return;
    }
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve phone route' });
  }
});

routeRouter.patch('/', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const parseResult = PhoneRouteSetupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'ValidationError',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const db = getDatabase();
    const updated = await db.upsertPhoneRoute(tenantId, parseResult.data);

    await db.recordAuditEvent({
      tenantId,
      actorId: req.user!.id,
      actorType: 'user',
      action: 'phone_route.updated',
      targetEntity: 'phone_route',
      targetEntityId: updated.id,
      details: parseResult.data,
      ipAddress: req.ip,
    });

    log('info', 'Phone route settings updated', {
      correlationId: req.correlationId,
      tenantId,
      details: parseResult.data,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to update phone route' });
  }
});

routeRouter.post('/test-call', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const db = getDatabase();

    const activeConfig = await db.getActiveAgentConfig(tenantId);
    if (!activeConfig) {
      res.status(400).json({
        error: 'PreconditionFailed',
        message: 'No active agent configuration found. Please configure and activate your agent first.',
      });
      return;
    }

    const route = await db.getPhoneRoute(tenantId);
    if (!route) {
      res.status(400).json({ error: 'PreconditionFailed', message: 'Phone route is not configured' });
      return;
    }

    const testCallerNumber = (req.body.callerNumber as string) || '+919999988888';
    const testCallId = 'call_test_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    // Create call record
    const call = await db.createCall({
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

    // Create summary
    const summary = await db.createCallSummary({
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

    // Update route test call timestamp & status
    await db.upsertPhoneRoute(tenantId, {
      lastTestCallAt: new Date().toISOString(),
      status: 'verified',
    });

    // Record usage
    await db.recordCallUsage(tenantId, 45, 1);

    log('info', 'Simulated test call completed successfully', {
      correlationId: req.correlationId,
      tenantId,
      details: { callId: testCallId, durationSeconds: 45 },
    });

    res.json({
      message: 'Test call completed successfully',
      call,
      summary,
    });
  } catch (err) {
    log('error', 'Error running test call', { correlationId: req.correlationId, err });
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to run test call' });
  }
});
