/**
 * Billing, Subscription, and Checkout Routes
 * Implements T-022: plans, subscriptions, and checkout sessions.
 */
import { Router, Response } from 'express';
import { STANDARD_PLANS, CheckoutSessionRequestSchema } from '@callivaan/shared';
import { getDatabase } from '@callivaan/database';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';
import { log } from '../logger.js';

export const billingRouter = Router();
billingRouter.use(requireAuth);

billingRouter.get('/plans', (req: AuthenticatedRequest, res: Response) => {
  res.json({ plans: STANDARD_PLANS });
});

billingRouter.get('/subscription', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const db = getDatabase();
    const sub = await db.getSubscription(tenantId);
    if (!sub) {
      res.status(404).json({ error: 'NotFound', message: 'No subscription found' });
      return;
    }
    const plan = STANDARD_PLANS.find((p) => p.id === sub.planId) || STANDARD_PLANS[0];
    res.json({
      subscription: sub,
      plan,
    });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve subscription' });
  }
});

billingRouter.post('/checkout', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const parseResult = CheckoutSessionRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'ValidationError',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { planId, billingCycle } = parseResult.data;
    const plan = STANDARD_PLANS.find((p) => p.id === planId);
    if (!plan) {
      res.status(400).json({ error: 'InvalidPlan', message: 'Specified plan does not exist' });
      return;
    }

    const db = getDatabase();
    const orderId = 'order_rzp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    // In a live environment with Razorpay, this calls razorpay.orders.create(...)
    // For local dev / pilot, we generate a valid checkout order session
    const amountInr = billingCycle === 'annual' ? plan.priceMonthlyInr * 10 : plan.priceMonthlyInr;

    await db.recordAuditEvent({
      tenantId,
      actorId: req.user!.id,
      actorType: 'user',
      action: 'billing.checkout_session_created',
      targetEntity: 'subscription',
      targetEntityId: orderId,
      details: { planId, billingCycle, amountInr },
      ipAddress: req.ip,
    });

    log('info', 'Checkout session generated', {
      correlationId: req.correlationId,
      tenantId,
      details: { planId, amountInr, orderId },
    });

    res.json({
      orderId,
      planId,
      planName: plan.name,
      amountInr,
      currency: 'INR',
      billingCycle,
      provider: 'razorpay',
      checkoutUrl: `https://checkout.callivaan.demo/pay/${orderId}`,
    });
  } catch (err) {
    log('error', 'Error creating checkout session', { correlationId: req.correlationId, err });
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to create checkout session' });
  }
});

billingRouter.post('/activate-plan-demo', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  // Safe helper to simulate instant activation for review and tests
  try {
    const tenantId = req.tenant!.id;
    const { planId } = req.body;
    if (!planId) {
      res.status(400).json({ error: 'ValidationError', message: 'planId is required' });
      return;
    }

    const db = getDatabase();
    const updated = await db.upsertSubscription(tenantId, {
      planId,
      status: 'active',
      providerSubscriptionId: 'sub_sim_' + Date.now(),
    });

    await db.recordAuditEvent({
      tenantId,
      actorId: req.user!.id,
      actorType: 'user',
      action: 'billing.subscription_activated',
      targetEntity: 'subscription',
      targetEntityId: updated.id,
      details: { planId },
      ipAddress: req.ip,
    });

    res.json({ message: 'Plan successfully activated', subscription: updated });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to activate plan' });
  }
});
