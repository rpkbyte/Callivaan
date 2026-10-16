/**
 * Billing, Subscription, and Usage Domain Service
 */
import { DatabaseRepository, getDatabase } from '@callivaan/database';
import { STANDARD_PLANS, PlanId } from '@callivaan/shared';
import { NotFoundError, BadRequestError } from '../errors/app-errors.js';

export class BillingService {
  private get db(): DatabaseRepository {
    return this._db || getDatabase();
  }
  constructor(private _db?: DatabaseRepository) {}

  getPlans() {
    return { plans: STANDARD_PLANS };
  }

  async getCurrentUsage(tenantId: string) {
    const currentPeriod = new Date().toISOString().substring(0, 7); // e.g. 2026-10
    const ledger = await this.db.getUsageLedger(tenantId, currentPeriod);
    const sub = await this.db.getSubscription(tenantId);
    const plan = STANDARD_PLANS.find((p) => p.id === (sub?.planId || 'trial')) || STANDARD_PLANS[0];

    const telephonyMinutesUsed = ledger?.telephonyMinutesUsed || 0;
    const includedMinutes = ledger?.includedMinutes || plan.includedMinutes;
    const percentUsed = includedMinutes > 0 ? Math.min(100, Math.round((telephonyMinutesUsed / includedMinutes) * 100)) : 100;
    const isWarningThreshold = percentUsed >= 80 && percentUsed < 100;
    const isLimitExceeded = telephonyMinutesUsed >= includedMinutes;

    return {
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
    };
  }

  async getSubscription(tenantId: string) {
    const sub = await this.db.getSubscription(tenantId);
    if (!sub) {
      throw new NotFoundError('No subscription found');
    }
    const plan = STANDARD_PLANS.find((p) => p.id === sub.planId) || STANDARD_PLANS[0];
    return {
      subscription: sub,
      plan,
    };
  }

  async createCheckoutSession(tenantId: string, userId: string, planId: PlanId, billingCycle: 'monthly' | 'annual', ipAddress?: string) {
    const plan = STANDARD_PLANS.find((p) => p.id === planId);
    if (!plan) {
      throw new BadRequestError('Specified plan does not exist');
    }

    const orderId = 'order_rzp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const amountInr = billingCycle === 'annual' ? plan.priceMonthlyInr * 10 : plan.priceMonthlyInr;

    await this.db.recordAuditEvent({
      tenantId,
      actorId: userId,
      actorType: 'user',
      action: 'billing.checkout_session_created',
      targetEntity: 'subscription',
      targetEntityId: orderId,
      details: { planId, billingCycle, amountInr },
      ipAddress,
    });

    return {
      orderId,
      planId,
      planName: plan.name,
      amountInr,
      currency: 'INR',
      billingCycle,
      provider: 'razorpay',
      checkoutUrl: `https://checkout.callivaan.demo/pay/${orderId}`,
    };
  }

  async activatePlanDemo(tenantId: string, userId: string, planId: PlanId, ipAddress?: string) {
    const updated = await this.db.upsertSubscription(tenantId, {
      planId,
      status: 'active',
      providerSubscriptionId: 'sub_sim_' + Date.now(),
    });

    await this.db.recordAuditEvent({
      tenantId,
      actorId: userId,
      actorType: 'user',
      action: 'billing.subscription_activated',
      targetEntity: 'subscription',
      targetEntityId: updated.id,
      details: { planId },
      ipAddress,
    });

    return { message: 'Plan successfully activated', subscription: updated };
  }
}
