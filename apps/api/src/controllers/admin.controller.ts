/**
 * Admin & Metrics Presentation Controller
 */
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class AdminController {
  constructor(private tenantService: TenantService = new TenantService()) {}

  getAuditEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const result = await this.tenantService.getAuditEvents(authReq.tenant!.id, limit);
      res.json(result);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  getMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const result = await this.tenantService.getMetrics(authReq.tenant!.id);
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
