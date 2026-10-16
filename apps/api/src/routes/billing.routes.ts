/**
 * Billing and Checkout Routes
 * Lean declarative routing delegating presentation to BillingController.
 */
import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const billingRouter = Router();
const controller = new BillingController();

billingRouter.use(requireAuth);

billingRouter.get('/plans', controller.getPlans);
billingRouter.get('/subscription', controller.getSubscription);
billingRouter.post('/checkout', requireRole(['owner', 'admin']), controller.createCheckoutSession);
billingRouter.post('/activate-plan-demo', requireRole(['owner', 'admin']), controller.activatePlanDemo);
