/**
 * Callivaan Product API Server Setup
 * Configured with Clean Architecture, Aspect-Oriented Interceptors, and Sub-450ms Telemetry.
 */
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { correlationIdMiddleware, AuthenticatedRequest } from './middleware/auth.js';
import { requestTimingAspect, auditTrailAspect, globalErrorFilterAspect } from './aop/index.js';
import { authRouter } from './routes/auth.routes.js';
import { tenantRouter } from './routes/tenant.routes.js';
import { agentRouter } from './routes/agent.routes.js';
import { routeRouter } from './routes/route.routes.js';
import { callRouter } from './routes/call.routes.js';
import { whatsappRouter } from './routes/whatsapp.routes.js';
import { usageRouter } from './routes/usage.routes.js';
import { billingRouter } from './routes/billing.routes.js';
import { webhooksRouter } from './routes/webhooks.routes.js';
import { adminRouter } from './routes/admin.routes.js';

export function createServer() {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.allowedOrigins.includes(origin) || config.env !== 'production') {
          callback(null, true);
        } else {
          callback(new Error('Blocked by CORS policy'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-correlation-id'],
    })
  );

  // Raw body retention for webhook HMAC signature checks
  app.use(
    express.json({
      verify: (req: AuthenticatedRequest, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true }));

  // Correlation IDs on all incoming requests
  app.use(correlationIdMiddleware);

  // AOP Interceptors (Timing Telemetry & Automated Compliance Audit Aspect)
  app.use(requestTimingAspect);
  app.use(auditTrailAspect);

  // Health and Liveness checks
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'callivaan-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API modules
  app.use('/v1/auth', authRouter);
  app.use('/v1/tenant', tenantRouter);
  app.use('/v1/agent-configs', agentRouter);
  app.use('/v1/telephony', routeRouter);
  app.use('/v1/whatsapp', whatsappRouter);
  app.use('/v1/calls', callRouter);
  app.use('/v1/usage', usageRouter);
  app.use('/v1/billing', billingRouter);
  app.use('/v1/webhooks', webhooksRouter);
  app.use('/v1/admin', adminRouter);

  // 404 Route Handler
  app.use((req: AuthenticatedRequest, res: Response) => {
    res.status(404).json({
      error: 'NotFound',
      message: `The endpoint ${req.method} ${req.path} was not found on this service`,
    });
  });

  // Global AOP Exception Filter Aspect (RFC 7807 Problem Details)
  app.use(globalErrorFilterAspect);

  return app;
}
