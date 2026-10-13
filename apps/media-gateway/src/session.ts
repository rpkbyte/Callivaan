/**
 * Call Session Orchestrator
 * Bridges telephony media frames with the Voice AI session.
 * Enforces max duration, tenant scoping, snapshotting, and summary generation.
 */
import { getDatabase } from '@callivaan/database';
import { AgentConfigVersion, CallOutcome, ExtractedLead } from '@callivaan/shared';
import { ExotelTelephonyAdapter } from './adapters/telephony.adapter.js';
import { VoiceAiAdapter } from './adapters/voice-ai.adapter.js';
import { logMedia } from './logger.js';

export class CallSession {
  public readonly callId: string;
  public readonly tenantId: string;
  public readonly callSid: string;
  private telephonyAdapter: ExotelTelephonyAdapter;
  private voiceAiAdapter?: VoiceAiAdapter;
  private configSnapshot?: AgentConfigVersion;
  private startedAt: number;
  private maxDurationTimer?: NodeJS.Timeout;
  private isEnded = false;

  constructor(callId: string, tenantId: string, callSid: string, telephonyAdapter: ExotelTelephonyAdapter) {
    this.callId = callId;
    this.tenantId = tenantId;
    this.callSid = callSid;
    this.telephonyAdapter = telephonyAdapter;
    this.startedAt = Date.now();
  }

  public async init() {
    const db = getDatabase();

    // 1. Snapshot active agent configuration
    const activeConfig = await db.getActiveAgentConfig(this.tenantId);
    if (!activeConfig) {
      logMedia('error', 'Cannot start session: no active agent configuration', {
        callSid: this.callSid,
        tenantId: this.tenantId,
      });
      this.telephonyAdapter.closeCall();
      return;
    }
    this.configSnapshot = activeConfig;

    // 2. Bound max duration (rules.md section 3)
    const maxSeconds = activeConfig.settings.maxCallDurationSeconds || 300;
    this.maxDurationTimer = setTimeout(() => {
      this.handleMaxDurationExceeded();
    }, maxSeconds * 1000);

    // 3. Initialize Voice AI adapter
    this.voiceAiAdapter = new VoiceAiAdapter(activeConfig.settings, {
      onAssistantAudio: (base64Audio) => {
        this.telephonyAdapter.sendAudioChunk(base64Audio);
      },
      onInterruption: () => {
        this.telephonyAdapter.sendClear();
      },
      onLeadExtracted: async (lead, summaryText) => {
        await this.persistCallSummary(lead, summaryText);
      },
      onError: (err) => {
        logMedia('error', 'Voice AI error occurred', { callSid: this.callSid, err });
      },
      onCallComplete: (reason) => {
        this.endCall('completed', reason);
      },
    });

    // 4. Bind Telephony Events
    this.telephonyAdapter.bindEvents({
      onStart: (data) => {
        logMedia('info', 'Stream start acknowledged', {
          callSid: data.callSid,
          streamSid: data.streamSid,
          tenantId: this.tenantId,
        });
        this.voiceAiAdapter?.startSession();
      },
      onMedia: (data) => {
        this.voiceAiAdapter?.handleCallerAudioFrame(data.payload);
      },
      onMark: (data) => {
        logMedia('debug', 'Mark event received', { streamSid: data.streamSid, details: { mark: data.markName } });
      },
      onStop: (data) => {
        logMedia('info', 'Stream stopped by provider or caller hangup', {
          callSid: data.callSid || this.callSid,
          streamSid: data.streamSid,
        });
        this.endCall('caller_disconnected', 'caller_hangup');
      },
      onError: (err) => {
        logMedia('error', 'Telephony stream error', { callSid: this.callSid, err });
        this.endCall('technical_failure', err.message);
      },
    });

    logMedia('info', 'Call session initialized successfully', {
      callSid: this.callSid,
      tenantId: this.tenantId,
      details: { callId: this.callId, maxSeconds },
    });
  }

  private handleMaxDurationExceeded() {
    logMedia('warn', 'Max call duration reached, terminating call gracefully', {
      callSid: this.callSid,
      tenantId: this.tenantId,
    });
    this.endCall('limit_reached', 'max_duration_exceeded');
  }

  private async persistCallSummary(lead: ExtractedLead, summaryText: string) {
    try {
      const db = getDatabase();
      const isCallerNameUnknown = !lead.callerName;
      const isTimeUnknown = !lead.preferredTime;
      const isServiceUnknown = !lead.requestedService;

      await db.createCallSummary({
        id: 'sum_' + this.callId,
        callId: this.callId,
        tenantId: this.tenantId,
        summaryText,
        extractedLead: lead,
        isUnknownFlags: {
          callerNameUnknown: isCallerNameUnknown,
          preferredTimeUnknown: isTimeUnknown,
          serviceNeededUnknown: isServiceUnknown,
          urgencyUnknown: false,
        },
        deliveryStatus: 'pending',
      });

      logMedia('info', 'Call summary and extracted lead persisted', {
        callSid: this.callSid,
        tenantId: this.tenantId,
        details: { callId: this.callId, isCallerNameUnknown },
      });
    } catch (err) {
      logMedia('error', 'Failed to persist call summary', { callSid: this.callSid, err });
    }
  }

  public async endCall(outcome: CallOutcome, reason: string) {
    if (this.isEnded) return;
    this.isEnded = true;

    if (this.maxDurationTimer) clearTimeout(this.maxDurationTimer);

    const durationSeconds = Math.max(1, Math.round((Date.now() - this.startedAt) / 1000));
    const db = getDatabase();

    try {
      // 1. Update call record
      await db.updateCall(this.tenantId, this.callId, {
        status: outcome,
        durationSeconds,
        endedAt: new Date().toISOString(),
      });

      // 2. Record telephony & AI usage
      await db.recordCallUsage(this.tenantId, durationSeconds, 1);

      logMedia('info', `Call finished with outcome: ${outcome}`, {
        callSid: this.callSid,
        tenantId: this.tenantId,
        details: { callId: this.callId, durationSeconds, reason },
      });
    } catch (err) {
      logMedia('error', 'Error finalizing call in database', { callSid: this.callSid, err });
    } finally {
      this.telephonyAdapter.closeCall();
    }
  }
}
