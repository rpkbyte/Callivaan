/**
 * Admin Audit and Metrics Routes
 * Lean declarative routing delegating presentation to AdminController.
 */
import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const adminRouter = Router();
const controller = new AdminController();

adminRouter.use(requireAuth);

adminRouter.get('/audit-events', requireRole(['owner', 'admin']), controller.getAuditEvents);
adminRouter.get('/metrics', requireRole(['owner', 'admin']), controller.getMetrics);
