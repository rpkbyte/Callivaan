/**
 * WhatsApp Pairing and Identity Verification Routes
 * Implements T-016: short-lived single-use pairing codes, opt-in management.
 */
import { Router, Response } from 'express';
import { WhatsAppPairingRequestSchema, WhatsAppOptInUpdateSchema } from '@callivaan/shared';
import { getDatabase } from '@callivaan/database';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';
import { log } from '../logger.js';

export const whatsappRouter = Router();
whatsappRouter.use(requireAuth);

whatsappRouter.get('/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const db = getDatabase();
    const link = await db.getWhatsAppLink(tenantId);
    res.json({
      isLinked: !!(link && link.isVerified),
      link: link || null,
    });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve WhatsApp status' });
  }
});

whatsappRouter.post('/pairing-code', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const parseResult = WhatsAppPairingRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'ValidationError',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { whatsappPhoneNumber } = parseResult.data;
    const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry

    const db = getDatabase();
    const link = await db.createOrUpdateWhatsAppPairing(tenantId, whatsappPhoneNumber, pairingCode, expiresAt);

    await db.recordAuditEvent({
      tenantId,
      actorId: req.user!.id,
      actorType: 'user',
      action: 'whatsapp.pairing_code_issued',
      targetEntity: 'whatsapp_link',
      targetEntityId: link.id,
      details: { expiresAt },
      ipAddress: req.ip,
    });

    log('info', 'WhatsApp pairing code issued', {
      correlationId: req.correlationId,
      tenantId,
      details: { expiresAt },
    });

    res.json({
      pairingCode,
      whatsappPhoneNumber,
      expiresAt,
      instruction: `Send the 6-digit code "${pairingCode}" to the Callivaan Official WhatsApp number to link your account.`,
    });
  } catch (err) {
    log('error', 'Error issuing pairing code', { correlationId: req.correlationId, err });
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to issue pairing code' });
  }
});

whatsappRouter.post('/verify', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { pairingCode, whatsappPhoneNumber } = req.body;
    if (!pairingCode || !whatsappPhoneNumber) {
      res.status(400).json({ error: 'ValidationError', message: 'pairingCode and whatsappPhoneNumber are required' });
      return;
    }

    const db = getDatabase();
    const verified = await db.verifyWhatsAppLink(pairingCode, whatsappPhoneNumber);
    if (!verified) {
      res.status(400).json({
        error: 'VerificationFailed',
        message: 'Invalid or expired pairing code, or phone number mismatch',
      });
      return;
    }

    await db.recordAuditEvent({
      tenantId: verified.tenantId,
      actorId: req.user!.id,
      actorType: 'user',
      action: 'whatsapp.linked_and_verified',
      targetEntity: 'whatsapp_link',
      targetEntityId: verified.id,
      ipAddress: req.ip,
    });

    log('info', 'WhatsApp account verified and linked', {
      correlationId: req.correlationId,
      tenantId: verified.tenantId,
    });

    res.json({
      message: 'WhatsApp account successfully linked',
      link: verified,
    });
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to verify pairing code' });
  }
});

whatsappRouter.patch('/opt-ins', requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const parseResult = WhatsAppOptInUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'ValidationError',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const db = getDatabase();
    const updated = await db.updateWhatsAppOptIns(tenantId, parseResult.data);
    if (!updated) {
      res.status(404).json({ error: 'NotFound', message: 'WhatsApp account is not yet paired' });
      return;
    }

    await db.recordAuditEvent({
      tenantId,
      actorId: req.user!.id,
      actorType: 'user',
      action: 'whatsapp.opt_ins_updated',
      targetEntity: 'whatsapp_link',
      targetEntityId: updated.id,
      details: parseResult.data,
      ipAddress: req.ip,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to update WhatsApp opt-ins' });
  }
});
