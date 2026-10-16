/**
 * Telephony Routing Routes
 * Lean declarative routing delegating presentation to RouteController.
 */
import { Router } from 'express';
import { RouteController } from '../controllers/route.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const routeRouter = Router();
const controller = new RouteController();

routeRouter.use(requireAuth);

routeRouter.get(['/', '/route'], controller.getRoute);
routeRouter.patch(['/', '/route'], requireRole(['owner', 'admin']), controller.updateRoute);
routeRouter.post(['/test-call', '/route/test-call'], controller.testCall);
