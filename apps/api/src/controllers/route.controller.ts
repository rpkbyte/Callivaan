/**
 * Telephony Routing Presentation Controller
 */
import { Request, Response, NextFunction } from 'express';
import { TelephonyService } from '../services/telephony.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { PhoneRouteSetupSchema } from '@callivaan/shared';
import { log } from '../logger.js';

export class RouteController {
  constructor(private telephonyService: TelephonyService = new TelephonyService()) {}

  getRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const route = await this.telephonyService.getRoute(authReq.tenant!.id);
      res.json(route);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  updateRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const parseResult = PhoneRouteSetupSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
        return;
      }

      const tenantId = authReq.tenant!.id;
      const updated = await this.telephonyService.updateRoute(
        tenantId,
        authReq.user!.id,
        parseResult.data,
        req.ip
      );

      log('info', 'Phone route settings updated', {
        correlationId: authReq.correlationId,
        tenantId,
        details: parseResult.data,
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

  testCall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.tenant!.id;
      const callerNumber = req.body.callerNumber as string | undefined;

      const result = await this.telephonyService.runTestCall(tenantId, callerNumber);

      log('info', 'Simulated test call completed successfully', {
        correlationId: authReq.correlationId,
        tenantId,
        details: { callId: result.call.id, durationSeconds: result.call.durationSeconds },
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
}
