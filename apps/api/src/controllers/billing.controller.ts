/**
 * Billing Presentation Controller
 */
import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../services/billing.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CheckoutSessionRequestSchema } from '@callivaan/shared';
import { log } from '../logger.js';

export class BillingController {
  constructor(private billingService: BillingService = new BillingService()) {}

  getPlans = (_req: Request, res: Response): void => {
    res.json(this.billingService.getPlans());
  };

  getSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const result = await this.billingService.getSubscription(authReq.tenant!.id);
      res.json(result);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  createCheckoutSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const parseResult = CheckoutSessionRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
        return;
      }

      const { planId, billingCycle } = parseResult.data;
      const tenantId = authReq.tenant!.id;

      const result = await this.billingService.createCheckoutSession(
        tenantId,
        authReq.user!.id,
        planId,
        billingCycle,
        req.ip
      );

      log('info', 'Checkout session generated', {
        correlationId: authReq.correlationId,
        tenantId,
        details: { planId, amountInr: result.amountInr, orderId: result.orderId },
      });

      res.json(result);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  activatePlanDemo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { planId } = req.body;
      if (!planId) {
        res.status(400).json({ error: 'ValidationError', message: 'planId is required' });
        return;
      }

      const tenantId = authReq.tenant!.id;
      const result = await this.billingService.activatePlanDemo(
        tenantId,
        authReq.user!.id,
        planId,
        req.ip
      );

      res.json(result);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };
}
