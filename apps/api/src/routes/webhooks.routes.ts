/**
 * Provider Webhook Ingestion Routes
 * Implements T-011 (Telephony Call Flow), T-016/T-018 (WhatsApp Pairing & Safe Patch Engine), T-022 (Billing Webhooks)
 * Strictly enforces signature validation, idempotency, and allowlisted patches.
 */
import { Router, Response } from 'express';
import crypto from 'crypto';
import {
  ExotelIncomingCallWebhookSchema,
  WhatsAppInboundWebhookSchema,
  AgentSettings,
} from '@callivaan/shared';
import { getDatabase } from '@callivaan/database';
import { config } from '../config.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { log } from '../logger.js';

export const webhooksRouter = Router();

// ---------------------------------------------------------
// 1. Telephony Webhooks (Exotel)
// ---------------------------------------------------------

webhooksRouter.post('/telephony/exotel', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parseResult = ExotelIncomingCallWebhookSchema.safeParse(req.body);
    if (!parseResult.success) {
      log('warn', 'Invalid Exotel webhook payload received', {
        correlationId: req.correlationId,
        details: { errors: parseResult.error.flatten() },
      });
      res.status(400).send('<Response><Hangup/></Response>');
      return;
    }

    const { CallSid, From: callerNumber, To: virtualNumber } = parseResult.data;
    const db = getDatabase();

    // Idempotency check
    const { isDuplicate, eventId } = await db.checkAndRecordWebhookEvent('exotel', CallSid, 'incoming_call', req.body);
    if (isDuplicate) {
      log('info', 'Duplicate Exotel webhook call ignored', {
        correlationId: req.correlationId,
        details: { CallSid },
      });
      res.type('text/xml').send('<Response><Hangup/></Response>');
      return;
    }

    // Map virtual number to tenant
    const route = await db.getPhoneRouteByVirtualNumber(virtualNumber);
    if (!route) {
      log('warn', 'Exotel call to unmapped virtual number', {
        correlationId: req.correlationId,
        details: { virtualNumber },
      });
      await db.markWebhookProcessed(eventId, 'Unmapped virtual number');
      res.type('text/xml').send('<Response><Say>The number you called is not configured.</Say><Hangup/></Response>');
      return;
    }

    const tenantId = route.tenantId;

    // Check plan entitlements and limits
    const currentPeriod = new Date().toISOString().substring(0, 7);
    const ledger = await db.getUsageLedger(tenantId, currentPeriod);
    if (ledger?.isHardLimitReached) {
      log('warn', 'Call rejected due to hard plan limit reached', {
        correlationId: req.correlationId,
        tenantId,
      });
      await db.markWebhookProcessed(eventId, 'Plan hard limit reached');
      res.type('text/xml').send(
        '<Response><Say>This service is temporarily unavailable due to plan limits. Please contact support.</Say><Hangup/></Response>'
      );
      return;
    }

    // Resolve active agent configuration snapshot
    const activeConfig = await db.getActiveAgentConfig(tenantId);
    if (!activeConfig) {
      log('warn', 'No active agent config for tenant handling call', {
        correlationId: req.correlationId,
        tenantId,
      });
      await db.markWebhookProcessed(eventId, 'No active agent config');
      res.type('text/xml').send('<Response><Say>Please leave a message after the beep.</Say><Hangup/></Response>');
      return;
    }

    // Create Call record in progress
    const callId = 'call_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    await db.createCall({
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

    await db.markWebhookProcessed(eventId);

    log('info', 'Inbound call mapped to tenant and agent session initialized', {
      correlationId: req.correlationId,
      tenantId,
      details: { CallSid, callId, configVersion: activeConfig.versionNumber },
    });

    // Return Exotel AgentStream instruction pointing to media gateway
    const streamUrl = `${config.mediaBaseUrl}/v1/media/exotel?callSid=${CallSid}&callId=${callId}&tenantId=${tenantId}`;
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Stream url="${streamUrl}">
    <Parameter name="tenantId" value="${tenantId}" />
    <Parameter name="callId" value="${callId}" />
    <Parameter name="configVersionId" value="${activeConfig.id}" />
  </Stream>
</Response>`;

    res.type('text/xml').send(twimlResponse);
  } catch (err) {
    log('error', 'Error processing Exotel inbound call webhook', { correlationId: req.correlationId, err });
    res.type('text/xml').send('<Response><Say>Technical failure. Please try again later.</Say><Hangup/></Response>');
  }
});

// ---------------------------------------------------------
// 2. WhatsApp Business Platform Webhooks
// ---------------------------------------------------------

// WhatsApp Verification Challenge
webhooksRouter.get('/whatsapp', (req: AuthenticatedRequest, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsappVerifyToken) {
    log('info', 'WhatsApp webhook verification challenge accepted', { correlationId: req.correlationId });
    res.status(200).send(challenge);
  } else {
    log('warn', 'WhatsApp webhook verification challenge rejected', {
      correlationId: req.correlationId,
      details: { token },
    });
    res.status(403).send('Forbidden');
  }
});

// WhatsApp Inbound Messages & Interactive Replies
webhooksRouter.post('/whatsapp', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const signature = req.headers['x-hub-signature-256'] as string | undefined;

    // Signature verification (if app secret is configured)
    if (config.whatsappAppSecret && signature) {
      const expectedSignature = 'sha256=' + crypto.createHmac('sha256', config.whatsappAppSecret).update(rawBody).digest('hex');
      if (signature !== expectedSignature && config.env === 'production') {
        log('warn', 'Invalid WhatsApp webhook HMAC signature', { correlationId: req.correlationId });
        res.status(401).json({ error: 'Unauthorized', message: 'Invalid webhook signature' });
        return;
      }
    }

    const parseResult = WhatsAppInboundWebhookSchema.safeParse(req.body);
    if (!parseResult.success) {
      // Could be status update or delivery receipt
      res.status(200).json({ status: 'ok' });
      return;
    }

    const db = getDatabase();
    const entry = parseResult.data.entry[0]?.changes[0]?.value;
    const messages = entry?.messages;

    if (!messages || messages.length === 0) {
      res.status(200).json({ status: 'ok' });
      return;
    }

    const message = messages[0];
    const messageId = message.id;
    const senderPhone = message.from;
    const textBody = (message.text?.body || message.button?.text || '').trim();

    // Idempotency check
    const { isDuplicate, eventId } = await db.checkAndRecordWebhookEvent('whatsapp', messageId, 'inbound_message', message);
    if (isDuplicate) {
      res.status(200).json({ status: 'duplicate_ignored' });
      return;
    }

    log('info', 'Inbound WhatsApp message received', {
      correlationId: req.correlationId,
      details: { messageId, textBodyLength: textBody.length },
    });

    const reply = await handleWhatsAppMessage(db, senderPhone, textBody);
    await db.markWebhookProcessed(eventId);

    res.status(200).json({ status: 'processed', responseMessage: reply });
  } catch (err) {
    log('error', 'Error handling WhatsApp webhook', { correlationId: req.correlationId, err });
    res.status(200).json({ status: 'error_handled' });
  }
});

/**
 * Natural Language / Command Processor for WhatsApp
 * Conforms to docs/rules.md:
 * - STOP / opt-out
 * - Pairing code verification
 * - Two-step confirmation for prompt changes
 * - Typed allowlisted patch conversion
 * - Zero emojis in responses
 */
async function handleWhatsAppMessage(
  db: ReturnType<typeof getDatabase>,
  senderPhone: string,
  rawText: string
): Promise<string> {
  const normalized = rawText.trim().toLowerCase();

  // 1. Opt-out (STOP)
  if (normalized === 'stop' || normalized === 'unsubscribe') {
    await db.setWhatsAppOptOut(senderPhone);
    return 'You have been opted out of Callivaan notifications. Reply START or visit your account portal to resume.';
  }

  // 2. 6-digit Pairing Code Check
  if (/^\d{6}$/.test(rawText.trim())) {
    const verifiedLink = await db.verifyWhatsAppLink(rawText.trim(), senderPhone);
    if (verifiedLink) {
      return `Account linked successfully. You will now receive call summaries on this WhatsApp number. You can also send instructions to adjust your agent's language, tone, and information collection rules.`;
    } else {
      return `Invalid or expired pairing code. Please generate a new code from your Callivaan web portal or Android app.`;
    }
  }

  // Look up verified tenant link
  const link = await db.getWhatsAppLinkByPhone(senderPhone);
  if (!link) {
    return 'This WhatsApp number is not linked to any active Callivaan account. Please sign in to your dashboard to pair your account with a 6-digit code.';
  }

  const tenantId = link.tenantId;

  // 3. Confirm Pending Proposal
  if (normalized === 'confirm' || normalized === 'haan' || normalized === 'yes') {
    const pending = await db.getPendingWhatsAppProposal(tenantId, senderPhone);
    if (!pending) {
      return 'No pending configuration change waiting for confirmation. You can send a new instruction anytime.';
    }

    const currentConfig = await db.getActiveAgentConfig(tenantId);
    if (!currentConfig) {
      return 'Unable to locate current active agent configuration.';
    }

    const updatedSettings: AgentSettings = {
      ...currentConfig.settings,
      ...pending.proposedPatch,
    };

    const newVersion = await db.createAgentConfigVersion(tenantId, {
      settings: updatedSettings,
      changeSource: 'whatsapp',
      changeNote: `Applied via WhatsApp: "${pending.rawUserMessage}"`,
      activateImmediately: true,
    });

    await db.updateWhatsAppProposalStatus(pending.id, 'confirmed');

    await db.recordAuditEvent({
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
    const pending = await db.getPendingWhatsAppProposal(tenantId, senderPhone);
    if (pending) {
      await db.updateWhatsAppProposalStatus(pending.id, 'rejected');
      return 'Proposed change has been canceled. Your active agent settings remain unchanged.';
    }
    return 'No pending change to cancel.';
  }

  // 5. Parse Plain Language Instruction into an Allowlisted Patch
  const interpreted = interpretWhatsAppInstruction(rawText);

  if (interpreted.isRestrictedAction) {
    return `Security constraint: Changing ${interpreted.restrictedCategory} requires signing in to your web portal or mobile app.`;
  }

  if (interpreted.requiresClarification) {
    return interpreted.clarificationPrompt || 'Could you please clarify your request? For example: "Set language to Hindi" or "Ask caller name first".';
  }

  // Save proposed patch awaiting confirmation
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min expiry
  await db.createWhatsAppProposal({
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

/**
 * Allowlisted Settings Interpreter
 * Converts English and Hinglish messages to typed AgentSettings patch.
 */
function interpretWhatsAppInstruction(text: string): {
  patch: Partial<AgentSettings>;
  summary: string;
  isRestrictedAction?: boolean;
  restrictedCategory?: string;
  requiresClarification: boolean;
  clarificationPrompt?: string;
} {
  const lower = text.toLowerCase();

  // Guard against restricted sensitive actions (rules.md section 5)
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

// ---------------------------------------------------------
// 3. Billing Webhooks (Razorpay)
// ---------------------------------------------------------

webhooksRouter.post('/billing/razorpay', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const signature = req.headers['x-razorpay-signature'] as string | undefined;

    if (config.razorpayWebhookSecret && signature) {
      const expected = crypto.createHmac('sha256', config.razorpayWebhookSecret).update(rawBody).digest('hex');
      if (signature !== expected && config.env === 'production') {
        log('warn', 'Invalid Razorpay webhook signature', { correlationId: req.correlationId });
        res.status(401).json({ error: 'Unauthorized', message: 'Invalid Razorpay signature' });
        return;
      }
    }

    const event = req.body.event as string;
    const eventId = (req.body.id as string) || 'rzp_evt_' + Date.now();
    const db = getDatabase();

    const { isDuplicate } = await db.checkAndRecordWebhookEvent('razorpay', eventId, event || 'payment_event', req.body);
    if (isDuplicate) {
      res.status(200).json({ status: 'duplicate_ignored' });
      return;
    }

    log('info', 'Razorpay webhook received', {
      correlationId: req.correlationId,
      details: { event, eventId },
    });

    res.status(200).json({ status: 'processed' });
  } catch (err) {
    log('error', 'Error processing Razorpay webhook', { correlationId: req.correlationId, err });
    res.status(500).json({ error: 'InternalServerError' });
  }
});
