/**
 * Tenant and Business Profile Routes
 * Lean declarative routing delegating presentation to TenantController.
 */
import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const tenantRouter = Router();
const controller = new TenantController();

tenantRouter.use(requireAuth);

tenantRouter.get('/profile', controller.getProfile);
tenantRouter.patch('/profile', requireRole(['owner', 'admin']), controller.updateProfile);
tenantRouter.get('/members', controller.getMembers);
