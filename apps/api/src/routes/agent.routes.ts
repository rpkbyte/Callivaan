/**
 * Agent Configuration Routes
 * Lean declarative routing delegating presentation to AgentController.
 */
import { Router } from 'express';
import { AgentController } from '../controllers/agent.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const agentRouter = Router();
const controller = new AgentController();

agentRouter.use(requireAuth);

agentRouter.get('/presets', controller.getPresets);
agentRouter.get('/', controller.listVersions);
agentRouter.get('/active', controller.getActiveConfig);
agentRouter.post('/', requireRole(['owner', 'admin']), controller.createVersion);
agentRouter.post('/:id/activate', requireRole(['owner', 'admin']), controller.activateVersion);
