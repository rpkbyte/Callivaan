/**
 * Authentication Routes
 * Lean declarative routing delegating presentation to AuthController.
 */
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();
const controller = new AuthController();

authRouter.post('/signup', controller.signup);
authRouter.post('/login', controller.login);
authRouter.post('/refresh', controller.refresh);
authRouter.get('/me', requireAuth, controller.me);
