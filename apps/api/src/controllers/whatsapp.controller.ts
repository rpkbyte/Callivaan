/**
 * WhatsApp Presentation Controller
 */
import { Request, Response, NextFunction } from 'express';
import { WhatsAppService } from '../services/whatsapp.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { WhatsAppPairingRequestSchema, WhatsAppOptInUpdateSchema } from '@callivaan/shared';
import { log } from '../logger.js';

export class WhatsAppController {
  constructor(private whatsAppService: WhatsAppService = new WhatsAppService()) {}

  getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const status = await this.whatsAppService.getStatus(authReq.tenant!.id);
      res.json(status);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  requestPairingCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const parseResult = WhatsAppPairingRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
        return;
      }

      const tenantId = authReq.tenant!.id;
      const result = await this.whatsAppService.issuePairingCode(
        tenantId,
        authReq.user!.id,
        parseResult.data.whatsappPhoneNumber,
        req.ip
      );

      log('info', 'WhatsApp pairing code issued', {
        correlationId: authReq.correlationId,
        tenantId,
        details: { expiresAt: result.expiresAt },
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

  verifyPairing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { pairingCode, whatsappPhoneNumber } = req.body;
      if (!pairingCode || !whatsappPhoneNumber) {
        res.status(400).json({ error: 'ValidationError', message: 'pairingCode and whatsappPhoneNumber are required' });
        return;
      }

      const verified = await this.whatsAppService.verifyPairing(
        pairingCode,
        whatsappPhoneNumber,
        authReq.user?.id,
        req.ip
      );

      log('info', 'WhatsApp account verified and linked', {
        correlationId: authReq.correlationId,
        tenantId: verified.tenantId,
      });

      res.json({
        message: 'WhatsApp account successfully linked',
        link: verified,
      });
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: 'VerificationFailed', message: err.message });
        return;
      }
      next(err);
    }
  };

  updateOptIns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const parseResult = WhatsAppOptInUpdateSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
        return;
      }

      const tenantId = authReq.tenant!.id;
      const updated = await this.whatsAppService.updateOptIns(
        tenantId,
        authReq.user!.id,
        parseResult.data,
        req.ip
      );

      res.json(updated);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };
}
