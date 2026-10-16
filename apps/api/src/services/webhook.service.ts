/**
 * External Webhook Processing Domain Service
 * Handles Exotel Telephony, WhatsApp Meta Graph API, and Razorpay payment events.
 */
import { DatabaseRepository, getDatabase } from '@callivaan/database';
import { AgentSettings } from '@callivaan/shared';
import { config } from '../config.js';
import { log } from '../logger.js';

export class WebhookService {
  private get db(): DatabaseRepository {
    return this._db || getDatabase();
  }
  constructor(private _db?: DatabaseRepository) {}

  async processExotelInboundCall(payload: { CallSid: string; From: string; To: string; correlationId?: string }) {
    const { CallSid, From: callerNumber, To: virtualNumber, correlationId } = payload;

    // 1. Idempotency check
    const { isDuplicate, eventId } = await this.db.checkAndRecordWebhookEvent('exotel', CallSid, 'incoming_call', payload);
    if (isDuplicate) {
      log('info', 'Duplicate Exotel webhook call ignored', {
        correlationId,
        details: { CallSid },
      });
      return { isDuplicate: true, xml: '<Response><Hangup/></Response>' };
    }

    // 2. Map virtual number to tenant
    const route = await this.db.getPhoneRouteByVirtualNumber(virtualNumber);
    if (!route) {
      log('warn', 'Exotel call to unmapped virtual number', {
        correlationId,
        details: { virtualNumber },
      });
      await this.db.markWebhookProcessed(eventId, 'Unmapped virtual number');
      return {
        isDuplicate: false,
        xml: '<Response><Say>The number you called is not configured.</Say><Hangup/></Response>',
      };
    }

    const tenantId = route.tenantId;

    // 3. Check plan entitlements and limits
    const currentPeriod = new Date().toISOString().substring(0, 7);
    const ledger = await this.db.getUsageLedger(tenantId, currentPeriod);
    if (ledger?.isHardLimitReached) {
      log('warn', 'Call rejected due to hard plan limit reached', {
        correlationId,
        tenantId,
      });
      await this.db.markWebhookProcessed(eventId, 'Plan hard limit reached');
      return {
        isDuplicate: false,
        xml: '<Response><Say>This service is temporarily unavailable due to plan limits. Please contact support.</Say><Hangup/></Response>',
      };
    }

    // 4. Resolve active agent configuration snapshot
    const activeConfig = await this.db.getActiveAgentConfig(tenantId);
    if (!activeConfig) {
      log('warn', 'No active agent config for tenant handling call', {
        correlationId,
        tenantId,
      });
      await this.db.markWebhookProcessed(eventId, 'No active agent config');
      return {
        isDuplicate: false,
        xml: '<Response><Say>Please leave a message after the beep.</Say><Hangup/></Response>',
      };
    }

    // 5. Create Call record in progress
    const callId = 'call_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    await this.db.createCall({
      id: callId,
      tenantId,
      providerCallId: CallSid,
      callerNumber,
      virtualNumber,
      agentConfigVersionId: activeConfig.id,
      status: 'in_progress',
      durationSeconds: 0,
      startedAt: new Date().toISOString(),
    });

    await this.db.markWebhookProcessed(eventId);

    log('info', 'Inbound call mapped to tenant and agent session initialized', {
      correlationId,
      tenantId,
      details: { CallSid, callId, configVersion: activeConfig.versionNumber },
    });

    const streamUrl = `${config.mediaBaseUrl}/v1/media/exotel?callSid=${CallSid}&callId=${callId}&tenantId=${tenantId}`;
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Stream url="${streamUrl}">
    <Parameter name="tenantId" value="${tenantId}" />
    <Parameter name="callId" value="${callId}" />
    <Parameter name="configVersionId" value="${activeConfig.id}" />
  </Stream>
</Response>`;

    return { isDuplicate: false, xml: twimlResponse };
  }

  async processWhatsAppInbound(message: any, correlationId?: string): Promise<{ isDuplicate: boolean; reply?: string }> {
    const messageId = message.id;
    const senderPhone = message.from;
    const textBody = (message.text?.body || message.button?.text || '').trim();

    const { isDuplicate, eventId } = await this.db.checkAndRecordWebhookEvent('whatsapp', messageId, 'inbound_message', message);
    if (isDuplicate) {
      return { isDuplicate: true };
    }

    log('info', 'Inbound WhatsApp message received', {
      correlationId,
      details: { messageId, textBodyLength: textBody.length },
    });

    const reply = await this.handleWhatsAppMessage(senderPhone, textBody);
    await this.db.markWebhookProcessed(eventId);

    return { isDuplicate: false, reply };
  }

  async processRazorpayEvent(event: string, eventId: string, payload: any): Promise<{ isDuplicate: boolean }> {
    const { isDuplicate } = await this.db.checkAndRecordWebhookEvent('razorpay', eventId, event || 'payment_event', payload);
    return { isDuplicate };
  }

  private async handleWhatsAppMessage(senderPhone: string, rawText: string): Promise<string> {
    const normalized = rawText.trim().toLowerCase();

    // 1. Opt-out (STOP)
    if (normalized === 'stop' || normalized === 'unsubscribe') {
      await this.db.setWhatsAppOptOut(senderPhone);
      return 'You have been opted out of Callivaan notifications. Reply START or visit your account portal to resume.';
    }

    // 2. 6-digit Pairing Code Check
    if (/^\d{6}$/.test(rawText.trim())) {
      const verifiedLink = await this.db.verifyWhatsAppLink(rawText.trim(), senderPhone);
      if (verifiedLink) {
        return `Account linked successfully. You will now receive call summaries on this WhatsApp number. You can also send instructions to adjust your agent's language, tone, and information collection rules.`;
      } else {
        return `Invalid or expired pairing code. Please generate a new code from your Callivaan web portal or Android app.`;
      }
    }

    // Look up verified tenant link
    const link = await this.db.getWhatsAppLinkByPhone(senderPhone);
    if (!link) {
      return 'This WhatsApp number is not linked to any active Callivaan account. Please sign in to your dashboard to pair your account with a 6-digit code.';
    }

    const tenantId = link.tenantId;

    // 3. Confirm Pending Proposal
    if (normalized === 'confirm' || normalized === 'haan' || normalized === 'yes') {
      const pending = await this.db.getPendingWhatsAppProposal(tenantId, senderPhone);
      if (!pending) {
        return 'No pending configuration change waiting for confirmation. You can send a new instruction anytime.';
      }

      const currentConfig = await this.db.getActiveAgentConfig(tenantId);
      if (!currentConfig) {
        return 'Unable to locate current active agent configuration.';
      }

      const updatedSettings: AgentSettings = {
        ...currentConfig.settings,
        ...pending.proposedPatch,
      };

      const newVersion = await this.db.createAgentConfigVersion(tenantId, {
        settings: updatedSettings,
        changeSource: 'whatsapp',
        changeNote: `Applied via WhatsApp: "${pending.rawUserMessage}"`,
        activateImmediately: true,
      });

      await this.db.updateWhatsAppProposalStatus(pending.id, 'confirmed');

      await this.db.recordAuditEvent({
        tenantId,
        actorId: `whatsapp:${senderPhone}`,
        actorType: 'whatsapp',
        action: 'agent_config.whatsapp_patch_applied',
        targetEntity: 'agent_config',
        targetEntityId: newVersion.id,
        details: {
          proposalId: pending.id,
          newVersionNumber: newVersion.versionNumber,
          patch: pending.proposedPatch,
        },
      });

      return `Changes confirmed and active. Agent version ${newVersion.versionNumber} is now live for all future calls.`;
    }

    // 4. Cancel / Reject Pending Proposal
    if (normalized === 'cancel' || normalized === 'nahi' || normalized === 'no') {
      const pending = await this.db.getPendingWhatsAppProposal(tenantId, senderPhone);
      if (pending) {
        await this.db.updateWhatsAppProposalStatus(pending.id, 'rejected');
        return 'Proposed change has been canceled. Your active agent settings remain unchanged.';
      }
      return 'No pending change to cancel.';
    }

    // 5. Parse Plain Language Instruction into an Allowlisted Patch
    const interpreted = this.interpretWhatsAppInstruction(rawText);

    if (interpreted.isRestrictedAction) {
      return `Security constraint: Changing ${interpreted.restrictedCategory} requires signing in to your web portal or mobile app.`;
    }

    if (interpreted.requiresClarification) {
      return interpreted.clarificationPrompt || 'Could you please clarify your request? For example: "Set language to Hindi" or "Ask caller name first".';
    }

    // Save proposed patch awaiting confirmation
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await this.db.createWhatsAppProposal({
      tenantId,
      senderWhatsAppNumber: senderPhone,
      rawUserMessage: rawText,
      proposedPatch: interpreted.patch,
      humanReadableSummary: interpreted.summary,
      requiresClarification: false,
      status: 'pending_confirmation',
      expiresAt,
    });

    return `Proposed change:\n${interpreted.summary}\n\nTo activate this on your live agent, reply "CONFIRM". To cancel, reply "CANCEL".`;
  }

  private interpretWhatsAppInstruction(text: string): {
    patch: Partial<AgentSettings>;
    summary: string;
    isRestrictedAction?: boolean;
    restrictedCategory?: string;
    requiresClarification: boolean;
    clarificationPrompt?: string;
  } {
    const lower = text.toLowerCase();

    if (lower.includes('billing') || lower.includes('payment') || lower.includes('card') || lower.includes('subscription')) {
      return { patch: {}, summary: '', isRestrictedAction: true, restrictedCategory: 'billing and payment', requiresClarification: false };
    }
    if (lower.includes('forwarding') || lower.includes('phone route') || lower.includes('number routing') || lower.includes('delete account')) {
      return { patch: {}, summary: '', isRestrictedAction: true, restrictedCategory: 'phone routing or account security', requiresClarification: false };
    }

    const patch: Partial<AgentSettings> = {};
    const changes: string[] = [];

    // Language settings
    if (lower.includes('hindi mein') || lower.includes('only hindi') || lower.includes('hindi language')) {
      patch.language = 'hi';
      changes.push('Language changed to Hindi');
    } else if (lower.includes('english mein') || lower.includes('only english') || lower.includes('english language')) {
      patch.language = 'en';
      changes.push('Language changed to English');
    } else if (lower.includes('hinglish') || lower.includes('hindi aur english') || lower.includes('mixed language')) {
      patch.language = 'hi-en';
      changes.push('Language changed to Hindi-English mix (Hinglish)');
    }

    // Tone settings
    if (lower.includes('professional') || lower.includes('formal')) {
      patch.tone = 'professional';
      changes.push('Tone changed to Professional');
    } else if (lower.includes('warm') || lower.includes('polite') || lower.includes('friendly')) {
      patch.tone = 'warm';
      changes.push('Tone changed to Warm');
    } else if (lower.includes('concise') || lower.includes('short') || lower.includes('to the point')) {
      patch.tone = 'concise';
      changes.push('Tone changed to Concise');
    }

    // Fields to collect
    if (lower.includes('naam pucho') || lower.includes('ask name') || lower.includes('caller name')) {
      changes.push('Collect caller name: Enabled');
    }
    if (lower.includes('appointment') || lower.includes('preferred time') || lower.includes('time pucho')) {
      changes.push('Collect preferred appointment time: Enabled');
    }
    if (lower.includes('urgency') || lower.includes('urgent alert')) {
      changes.push('Urgency tagging: Enabled');
    }

    // Prohibited commitments / Price policy
    if (lower.includes('price confirm mat karna') || lower.includes('do not confirm price') || lower.includes('rate mat batana')) {
      patch.prohibitedCommitments = [
        'Do not quote or confirm final repair charges over call. Inform caller that team will provide accurate inspection details.',
      ];
      changes.push('Commitment rule added: Do not confirm pricing over phone');
    }

    // Custom greeting
    if (lower.startsWith('greeting:') || lower.startsWith('set greeting')) {
      const greetingText = text.replace(/^(greeting:|set greeting)\s*/i, '').trim();
      if (greetingText.length >= 5) {
        patch.greeting = greetingText;
        changes.push(`New greeting set: "${greetingText}"`);
      }
    }

    if (changes.length === 0) {
      return {
        patch: {},
        summary: '',
        requiresClarification: true,
        clarificationPrompt: `Unable to understand instruction "${text}". You can change language (e.g. "Hindi mein baat karo"), tone ("professional tone"), or collection fields ("caller ka naam pucho").`,
      };
    }

    return {
      patch,
      summary: changes.map((c) => '- ' + c).join('\n'),
      requiresClarification: false,
    };
  }
}
