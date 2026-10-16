/**
 * Authentication Presentation Controller
 */
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { SignupSchema, LoginSchema, RefreshTokenSchema } from '@callivaan/shared';
import { log } from '../logger.js';

export class AuthController {
  constructor(private authService: AuthService = new AuthService()) {}

  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const parseResult = SignupSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await this.authService.signup({
        ...parseResult.data,
        ipAddress: req.ip,
      });

      log('info', 'New tenant account registered successfully', {
        correlationId: authReq.correlationId,
        tenantId: result.tenant.id,
        details: { email: result.user.email, category: parseResult.data.category },
      });

      res.status(201).json(result);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const parseResult = LoginSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'ValidationError',
          details: parseResult.error.flatten().fieldErrors,
        });
        return;
      }

      const { email, password } = parseResult.data;
      const result = await this.authService.login(email, password);

      log('info', 'User login successful', {
        correlationId: authReq.correlationId,
        tenantId: result.tenant.id,
        details: { email: result.user.email },
      });

      res.json(result);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = RefreshTokenSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ error: 'ValidationError', message: 'refreshToken is required' });
        return;
      }

      const result = await this.authService.refresh(parseResult.data.refreshToken);
      res.json(result);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.name, message: err.message });
        return;
      }
      next(err);
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    res.json({
      user: authReq.user,
      tenant: authReq.tenant,
      role: authReq.memberRole,
    });
  };
}
