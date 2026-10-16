/**
 * WhatsApp Pairing & Opt-In Domain Service
 */
import { DatabaseRepository, getDatabase } from '@callivaan/database';
import { WhatsAppLink } from '@callivaan/shared';
import { NotFoundError, BadRequestError } from '../errors/app-errors.js';

export class WhatsAppService {
  private get db(): DatabaseRepository {
    return this._db || getDatabase();
  }
  constructor(private _db?: DatabaseRepository) {}

  async getStatus(tenantId: string) {
    const link = await this.db.getWhatsAppLink(tenantId);
    return {
      isLinked: !!(link && link.isVerified),
      link: link || null,
    };
  }

  async issuePairingCode(tenantId: string, userId: string, whatsappPhoneNumber: string, ipAddress?: string) {
    const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const link = await this.db.createOrUpdateWhatsAppPairing(tenantId, whatsappPhoneNumber, pairingCode, expiresAt);

    await this.db.recordAuditEvent({
      tenantId,
      actorId: userId,
      actorType: 'user',
      action: 'whatsapp.pairing_code_issued',
      targetEntity: 'whatsapp_link',
      targetEntityId: link.id,
      details: { expiresAt },
      ipAddress,
    });

    return {
      pairingCode,
      whatsappPhoneNumber,
      expiresAt,
      instruction: `Send the 6-digit code "${pairingCode}" to the Callivaan Official WhatsApp number to link your account.`,
    };
  }

  async verifyPairing(pairingCode: string, whatsappPhoneNumber: string, userId?: string, ipAddress?: string): Promise<WhatsAppLink> {
    const verified = await this.db.verifyWhatsAppLink(pairingCode, whatsappPhoneNumber);
    if (!verified) {
      throw new BadRequestError('Invalid or expired pairing code, or phone number mismatch');
    }

    if (userId) {
      await this.db.recordAuditEvent({
        tenantId: verified.tenantId,
        actorId: userId,
        actorType: 'user',
        action: 'whatsapp.linked_and_verified',
        targetEntity: 'whatsapp_link',
        targetEntityId: verified.id,
        ipAddress,
      });
    }

    return verified;
  }

  async updateOptIns(tenantId: string, userId: string, optIns: any, ipAddress?: string): Promise<WhatsAppLink> {
    const updated = await this.db.updateWhatsAppOptIns(tenantId, optIns);
    if (!updated) {
      throw new NotFoundError('WhatsApp account is not yet paired');
    }

    await this.db.recordAuditEvent({
      tenantId,
      actorId: userId,
      actorType: 'user',
      action: 'whatsapp.opt_ins_updated',
      targetEntity: 'whatsapp_link',
      targetEntityId: updated.id,
      details: optIns,
      ipAddress,
    });

    return updated;
  }
}
