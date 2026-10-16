/**
 * Call History Presentation Controller
 */
import { Request, Response, NextFunction } from 'express';
import { CallService } from '../services/call.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { log } from '../logger.js';

export class CallController {
  constructor(private callService: CallService = new CallService()) {}

  listCalls = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const offset = parseInt((req.query.offset as string) || '0', 10);

      const result = await this.callService.listCalls(authReq.tenant!.id, limit, offset);
      res.json(result);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  getCallDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const callId = req.params.id;

      const result = await this.callService.getCallDetails(authReq.tenant!.id, callId);
      res.json(result);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  deleteCall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const callId = req.params.id;

      const result = await this.callService.deleteCall(
        authReq.tenant!.id,
        callId,
        authReq.user!.id,
        req.ip
      );

      log('info', 'Customer-directed call deletion executed', {
        correlationId: authReq.correlationId,
        tenantId: authReq.tenant!.id,
        details: { callId },
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
