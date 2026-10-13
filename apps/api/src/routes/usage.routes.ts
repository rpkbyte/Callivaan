/**
 * Usage Ledger and Plan Limit Routes
 * Implements T-023: usage dashboard, warnings, and limits.
 */
import { Router, Response } from 'express';
import { STANDARD_PLANS } from '@callivaan/shared';
import { getDatabase } from '@callivaan/database';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { log } from '../logger.js';

export const usageRouter = Router();
usageRouter.use(requireAuth);

usageRouter.get('/current', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const db = getDatabase();

    const currentPeriod = new Date().toISOString().substring(0, 7); // e.g. 2026-10
    const ledger = await db.getUsageLedger(tenantId, currentPeriod);
    const sub = await db.getSubscription(tenantId);
    const plan = STANDARD_PLANS.find((p) => p.id === (sub?.planId || 'trial')) || STANDARD_PLANS[0];

    const telephonyMinutesUsed = ledger?.telephonyMinutesUsed || 0;
    const includedMinutes = ledger?.includedMinutes || plan.includedMinutes;
    const percentUsed = includedMinutes > 0 ? Math.min(100, Math.round((telephonyMinutesUsed / includedMinutes) * 100)) : 100;
    const isWarningThreshold = percentUsed >= 80 && percentUsed < 100;
    const isLimitExceeded = telephonyMinutesUsed >= includedMinutes;

    res.json({
      period: currentPeriod,
      plan: {
        id: plan.id,
        name: plan.name,
        includedMinutes: plan.includedMinutes,
        overageRatePerMinuteInr: plan.overageRatePerMinuteInr,
      },
      subscriptionStatus: sub?.status || 'trial',
      usage: {
        telephonyMinutesUsed,
        aiUnitsUsed: ledger?.aiUnitsUsed || 0,
        whatsappMessagesSent: ledger?.whatsappMessagesSent || 0,
        includedMinutes,
        remainingMinutes: Math.max(0, includedMinutes - telephonyMinutesUsed),
        overageMinutes: ledger?.overageMinutes || 0,
        estimatedOverageCostInr: ledger?.estimatedOverageCostInr || 0,
        percentUsed,
        isWarningThreshold,
        isHardLimitReached: ledger?.isHardLimitReached || false,
        isLimitExceeded,
      },
    });
  } catch (err) {
    log('error', 'Error retrieving usage ledger', { correlationId: req.correlationId, err });
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve usage details' });
  }
});
