/**
 * Authentication Routes (Signup, Login, Refresh, Me)
 */
import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SignupSchema, LoginSchema, RefreshTokenSchema, STARTER_PRESETS } from '@callivaan/shared';
import { getDatabase } from '@callivaan/database';
import { config } from '../config.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { log } from '../logger.js';

export const authRouter = Router();

function generateSlug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return `${base || 'business'}-${Math.random().toString(36).substring(2, 6)}`;
}

authRouter.post('/signup', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = SignupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'ValidationError',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password, fullName, businessName, category, phoneNumber } = parseResult.data;
    const db = getDatabase();

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email address already exists',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const tenantId = 'ten_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    const user = await db.createUser({
      id: userId,
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName,
      phoneNumber,
      emailVerified: false,
      phoneVerified: false,
    });

    const tenant = await db.createTenant(
      {
        id: tenantId,
        name: businessName,
        slug: generateSlug(businessName),
        timezone: 'Asia/Kolkata',
        countryCode: 'IN',
        status: 'trial',
      },
      userId
    );

    // Create Business Profile
    await db.upsertBusinessProfile(tenantId, {
      businessName,
      category,
      languages: ['hi-en', 'hi', 'en'],
      primaryLanguage: 'hi-en',
      escalationPhoneNumber: phoneNumber,
    });

    // Seed starter agent configuration based on vertical preset
    const preset = (STARTER_PRESETS[category] || STARTER_PRESETS['repair_service']).settings;
    await db.createAgentConfigVersion(tenantId, {
      settings: preset,
      changeSource: 'system_init',
      changedByUserId: userId,
      changeNote: `Initial setup with ${category} preset`,
      activateImmediately: true,
    });

    // Assign phone route
    const randomVirtualNumber = `+91804719${Math.floor(1000 + Math.random() * 9000)}`;
    await db.upsertPhoneRoute(tenantId, {
      provider: 'exotel',
      providerVirtualNumber: randomVirtualNumber,
      customerOriginalNumber: phoneNumber,
      status: 'pending_setup',
      fallbackBehavior: 'announcement_hangup',
      callForwardingSetupCode: `*21*${randomVirtualNumber}#`,
    });

    // Assign trial subscription
    await db.upsertSubscription(tenantId, {
      planId: 'trial',
      status: 'trial',
    });

    // Audit event
    await db.recordAuditEvent({
      tenantId,
      actorId: userId,
      actorType: 'user',
      action: 'tenant.created',
      targetEntity: 'tenant',
      targetEntityId: tenantId,
      ipAddress: req.ip,
    });

    const accessToken = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiry as any,
    });
    const refreshToken = jwt.sign({ userId: user.id, tokenType: 'refresh' }, config.jwtSecret, {
      expiresIn: config.jwtRefreshExpiry as any,
    });

    log('info', 'New tenant account registered successfully', {
      correlationId: req.correlationId,
      tenantId,
      details: { email: user.email, category },
    });

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
      },
      role: 'owner',
      accessToken,
      refreshToken,
    });
  } catch (err) {
    log('error', 'Signup failure', { correlationId: req.correlationId, err });
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to process signup request' });
  }
});

authRouter.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'ValidationError',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = parseResult.data;
    const db = getDatabase();

    const userWithHash = await db.getUserByEmail(email);
    if (!userWithHash) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, userWithHash.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
      return;
    }

    const userTenants = await db.getUserTenants(userWithHash.id);
    if (userTenants.length === 0) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'User does not belong to any tenant',
      });
      return;
    }

    const primary = userTenants[0];
    const accessToken = jwt.sign({ userId: userWithHash.id, email: userWithHash.email }, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiry as any,
    });
    const refreshToken = jwt.sign({ userId: userWithHash.id, tokenType: 'refresh' }, config.jwtSecret, {
      expiresIn: config.jwtRefreshExpiry as any,
    });

    log('info', 'User login successful', {
      correlationId: req.correlationId,
      tenantId: primary.tenant.id,
      details: { email: userWithHash.email },
    });

    res.json({
      user: {
        id: userWithHash.id,
        email: userWithHash.email,
        fullName: userWithHash.fullName,
      },
      tenant: {
        id: primary.tenant.id,
        name: primary.tenant.name,
        slug: primary.tenant.slug,
        status: primary.tenant.status,
      },
      role: primary.role,
      availableTenants: userTenants.map((t) => ({ id: t.tenant.id, name: t.tenant.name, role: t.role })),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    log('error', 'Login failure', { correlationId: req.correlationId, err });
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to process login request' });
  }
});

authRouter.post('/refresh', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = RefreshTokenSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'ValidationError', message: 'refreshToken is required' });
      return;
    }

    const { refreshToken } = parseResult.data;
    let decoded: { userId: string; tokenType?: string };
    try {
      decoded = jwt.verify(refreshToken, config.jwtSecret) as { userId: string; tokenType?: string };
      if (decoded.tokenType !== 'refresh') {
        throw new Error('Not a refresh token');
      }
    } catch {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired refresh token' });
      return;
    }

    const db = getDatabase();
    const user = await db.getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized', message: 'User account not found' });
      return;
    }

    const newAccessToken = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiry as any,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    log('error', 'Token refresh failure', { correlationId: req.correlationId, err });
    res.status(500).json({ error: 'InternalServerError', message: 'Failed to refresh token' });
  }
});

authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user,
    tenant: req.tenant,
    role: req.memberRole,
  });
});
