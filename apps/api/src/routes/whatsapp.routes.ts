/**
 * WhatsApp Pairing and Opt-In Routes
 * Lean declarative routing delegating presentation to WhatsAppController.
 */
import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsapp.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const whatsappRouter = Router();
const controller = new WhatsAppController();

whatsappRouter.use(requireAuth);

whatsappRouter.get('/status', controller.getStatus);
whatsappRouter.post('/pairing-code', requireRole(['owner', 'admin']), controller.requestPairingCode);
whatsappRouter.post('/verify', controller.verifyPairing);
whatsappRouter.patch('/opt-ins', requireRole(['owner', 'admin']), controller.updateOptIns);
