/**
 * Authentication & Tenant Onboarding Domain Service
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { STARTER_PRESETS } from '@callivaan/shared';
import { DatabaseRepository, getDatabase } from '@callivaan/database';
import { config } from '../config.js';
import { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } from '../errors/app-errors.js';

function generateSlug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return `${base || 'business'}-${Math.random().toString(36).substring(2, 6)}`;
}

export interface SignupParams {
  email: string;
  password: string;
  fullName: string;
  businessName: string;
  category: any;
  phoneNumber?: string;
  ipAddress?: string;
}

export class AuthService {
  private get db(): DatabaseRepository {
    return this._db || getDatabase();
  }
  constructor(private _db?: DatabaseRepository) {}

  async signup(params: SignupParams) {
    const { email, password, fullName, businessName, category, phoneNumber, ipAddress } = params;
    const phone = phoneNumber || '+919876543210';

    const existingUser = await this.db.getUserByEmail(email);
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const tenantId = 'ten_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    const user = await this.db.createUser({
      id: userId,
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName,
      phoneNumber: phone,
      emailVerified: false,
      phoneVerified: false,
    });

    const tenant = await this.db.createTenant(
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

    // Business Profile
    await this.db.upsertBusinessProfile(tenantId, {
      businessName,
      category,
      languages: ['hi-en', 'hi', 'en'],
      primaryLanguage: 'hi-en',
      escalationPhoneNumber: phone,
    });

    // Starter Agent Configuration Preset
    const preset = (STARTER_PRESETS[category] || STARTER_PRESETS['repair_service']).settings;
    await this.db.createAgentConfigVersion(tenantId, {
      settings: preset,
      changeSource: 'system_init',
      changedByUserId: userId,
      changeNote: `Initial setup with ${category} preset`,
      activateImmediately: true,
    });

    // Phone Route
    const randomVirtualNumber = `+91804719${Math.floor(1000 + Math.random() * 9000)}`;
    await this.db.upsertPhoneRoute(tenantId, {
      provider: 'exotel',
      providerVirtualNumber: randomVirtualNumber,
      customerOriginalNumber: phone,
      status: 'pending_setup',
      fallbackBehavior: 'announcement_hangup',
      callForwardingSetupCode: `*21*${randomVirtualNumber}#`,
    });

    // Trial Subscription
    await this.db.upsertSubscription(tenantId, {
      planId: 'trial',
      status: 'trial',
    });

    // Compliance Audit Trail
    await this.db.recordAuditEvent({
      tenantId,
      actorId: userId,
      actorType: 'user',
      action: 'tenant.created',
      targetEntity: 'tenant',
      targetEntityId: tenantId,
      ipAddress,
    });

    const accessToken = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiry as any,
    });
    const refreshToken = jwt.sign({ userId: user.id, tokenType: 'refresh' }, config.jwtSecret, {
      expiresIn: config.jwtRefreshExpiry as any,
    });

    return {
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
    };
  }

  async login(email: string, password: string) {
    const userWithHash = await this.db.getUserByEmail(email);
    if (!userWithHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, userWithHash.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const userTenants = await this.db.getUserTenants(userWithHash.id);
    if (userTenants.length === 0) {
      throw new ForbiddenError('User does not belong to any tenant');
    }

    const primary = userTenants[0];
    const accessToken = jwt.sign({ userId: userWithHash.id, email: userWithHash.email }, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiry as any,
    });
    const refreshToken = jwt.sign({ userId: userWithHash.id, tokenType: 'refresh' }, config.jwtSecret, {
      expiresIn: config.jwtRefreshExpiry as any,
    });

    return {
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
    };
  }

  async refresh(refreshToken: string) {
    let decoded: { userId: string; tokenType?: string };
    try {
      decoded = jwt.verify(refreshToken, config.jwtSecret) as { userId: string; tokenType?: string };
      if (decoded.tokenType !== 'refresh') {
        throw new Error('Not a refresh token');
      }
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await this.db.getUserById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    const accessToken = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiry as any,
    });

    return { accessToken };
  }
}
