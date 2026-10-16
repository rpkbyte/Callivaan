/**
 * Tenant Presentation Controller
 */
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { BusinessProfileUpdateSchema } from '@callivaan/shared';
import { log } from '../logger.js';

export class TenantController {
  constructor(private tenantService: TenantService = new TenantService()) {}

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const profile = await this.tenantService.getProfile(authReq.tenant!.id);
      res.json(profile);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const parseResult = BusinessProfileUpdateSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
        return;
      }

      const tenantId = authReq.tenant!.id;
      const updated = await this.tenantService.updateProfile(
        tenantId,
        authReq.user!.id,
        parseResult.data,
        req.ip
      );

      log('info', 'Business profile updated', {
        correlationId: authReq.correlationId,
        tenantId,
        details: { updatedFields: Object.keys(parseResult.data) },
      });

      res.json(updated);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  getMembers = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    res.json({
      members: [
        {
          userId: authReq.user!.id,
          fullName: authReq.user!.fullName,
          email: authReq.user!.email,
          role: authReq.memberRole,
        },
      ],
    });
  };
}
