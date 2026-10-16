/**
 * Usage Presentation Controller
 */
import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../services/billing.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class UsageController {
  constructor(private billingService: BillingService = new BillingService()) {}

  getCurrentUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const result = await this.billingService.getCurrentUsage(authReq.tenant!.id);
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
