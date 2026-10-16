/**
 * Usage Routes
 * Lean declarative routing delegating presentation to UsageController.
 */
import { Router } from 'express';
import { UsageController } from '../controllers/usage.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const usageRouter = Router();
const controller = new UsageController();

usageRouter.use(requireAuth);

usageRouter.get('/current', controller.getCurrentUsage);
