/**
 * Call History Routes
 * Lean declarative routing delegating presentation to CallController.
 */
import { Router } from 'express';
import { CallController } from '../controllers/call.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const callRouter = Router();
const controller = new CallController();

callRouter.use(requireAuth);

callRouter.get('/', controller.listCalls);
callRouter.get('/:id', controller.getCallDetails);
callRouter.delete('/:id', requireRole(['owner', 'admin']), controller.deleteCall);
