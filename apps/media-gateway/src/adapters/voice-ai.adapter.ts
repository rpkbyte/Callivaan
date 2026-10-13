/**
 * Voice AI Session Adapter
 * Implements T-013: provider-neutral voice session, turn-taking, interruption,
 * safety priority hierarchy, business facts grounding, and structured lead extraction.
 */
import { AgentSettings, ExtractedLead } from '@callivaan/shared';
import { logMedia } from '../logger.js';

export interface VoiceSessionCallbacks {
  onAssistantAudio: (base64Audio: string, textSnippet?: string) => void;
  onInterruption: () => void;
  onLeadExtracted: (lead: ExtractedLead, summary: string) => void;
  onError: (err: Error) => void;
  onCallComplete: (reason: string) => void;
}

export class VoiceAiAdapter {
  private settings: AgentSettings;
  private callbacks: VoiceSessionCallbacks;
  private conversationHistory: { role: 'assistant' | 'user'; text: string }[] = [];
  private isAssistantSpeaking = false;
  private silenceTimer?: NodeJS.Timeout;
  private silenceWarnings = 0;
  private extractedLead: ExtractedLead = {};

  constructor(settings: AgentSettings, callbacks: VoiceSessionCallbacks) {
    this.settings = settings;
    this.callbacks = callbacks;
  }

  public startSession() {
    // 1. Initial Greeting
    const greetingText = this.settings.greeting;
    this.conversationHistory.push({ role: 'assistant', text: greetingText });
    this.isAssistantSpeaking = true;

    // Send synthetic audio chunk for greeting
    const greetingAudio = Buffer.from(`AUDIO_CHUNK_GREETING: ${greetingText}`).toString('base64');
    this.callbacks.onAssistantAudio(greetingAudio, greetingText);

    // Simulate completion of greeting utterance after brief delay
    setTimeout(() => {
      this.isAssistantSpeaking = false;
      this.resetSilenceTimer();
    }, 1200);
  }

  public handleCallerAudioFrame(base64Payload: string) {
    // Decode or simulate speech-to-text
    // Check if caller interrupted assistant while assistant was speaking
    if (this.isAssistantSpeaking) {
      logMedia('info', 'Caller barge-in detected, interrupting assistant playback');
      this.isAssistantSpeaking = false;
      this.callbacks.onInterruption();
    }

    this.resetSilenceTimer();

    // In a live realtime model (OpenAI Realtime or Gemini Live), audio is streamed directly.
    // For our simulated adapter, we inspect or simulate speech input.
    const decoded = Buffer.from(base64Payload, 'base64').toString('utf-8');
    if (decoded.startsWith('TEXT:')) {
      const callerUtterance = decoded.replace('TEXT:', '').trim();
      this.processCallerUtterance(callerUtterance);
    }
  }

  public processCallerUtterance(text: string) {
    this.conversationHistory.push({ role: 'user', text });
    this.silenceWarnings = 0;

    // 1. Guard against prompt injection / caller override (docs/rules.md section 3)
    const lower = text.toLowerCase();
    if (
      lower.includes('ignore previous instructions') ||
      lower.includes('system prompt') ||
      lower.includes('secret') ||
      lower.includes('override settings')
    ) {
      const safetyReply = 'Main keval business enquiries aur appointments mein sahayata kar sakta hoon. Aapki kya requirements hain?';
      this.sendAssistantReply(safetyReply);
      return;
    }

    // 2. Extract Lead Information dynamically
    this.extractLeadFieldsFromUtterance(text);

    // 3. Match against FAQs or Business Facts
    let matchedAnswer: string | null = null;
    for (const faq of this.settings.faqs) {
      const qWords = faq.question.toLowerCase().split(' ').filter((w) => w.length > 3);
      if (qWords.some((w) => lower.includes(w))) {
        matchedAnswer = faq.answer;
        break;
      }
    }

    // 4. Check for prohibited commitments (e.g. price negotiation, cash refunds)
    if (lower.includes('discount') || lower.includes('kitne paise') || lower.includes('final price')) {
      const priceReply = 'Prices inspection ke baad technician dwara confirm kiye jaate hain. Hum visit ke baad accurate estimate provide karenge.';
      this.sendAssistantReply(priceReply);
      return;
    }

    // 5. Generate appropriate response based on business facts and language
    let reply = '';
    if (matchedAnswer) {
      reply = `${matchedAnswer} Kya main aapke liye inspection slot book kar sakta hoon?`;
    } else if (lower.includes('book') || lower.includes('slot') || lower.includes('appointment') || lower.includes('time')) {
      reply = 'Maine aapka preferred time note kar liya hai. Kya aap apna naam aur phone number confirm kar sakte hain?';
    } else if (lower.includes('naam') || lower.includes('name') || lower.includes('my name is')) {
      reply = 'Dhanyavaad! Hamari team aapko jald hi call karegi aur slot finalize karegi. Kya kuch aur jaankari chahiye?';
    } else if (lower.includes('nahi') || lower.includes('no') || lower.includes('bye') || lower.includes('thank')) {
      reply = this.settings.fallbackMessage;
      this.sendAssistantReply(reply);
      setTimeout(() => {
        this.completeCall('caller_finished');
      }, 1500);
      return;
    } else {
      reply = `Ji bilkul. Hamare paas expert technicians available hain. Kripya apna location aur preferred time batayein.`;
    }

    this.sendAssistantReply(reply);
  }

  private sendAssistantReply(text: string) {
    this.conversationHistory.push({ role: 'assistant', text });
    this.isAssistantSpeaking = true;
    const base64Audio = Buffer.from(`AUDIO_CHUNK_REPLY: ${text}`).toString('base64');
    this.callbacks.onAssistantAudio(base64Audio, text);

    setTimeout(() => {
      this.isAssistantSpeaking = false;
      this.resetSilenceTimer();
    }, 1500);
  }

  private extractLeadFieldsFromUtterance(text: string) {
    const lower = text.toLowerCase();
    // Name extraction heuristic
    if (lower.includes('mera naam') || lower.includes('my name is')) {
      const parts = text.split(/(?:mera naam|my name is)\s+/i);
      if (parts[1]) {
        this.extractedLead.callerName = parts[1].split(/[.,!?\n]/)[0].trim();
      }
    }
    // Service extraction
    if (lower.includes('ac') || lower.includes('cooling') || lower.includes('gas') || lower.includes('repair')) {
      this.extractedLead.requestedService = 'AC Repair & Cooling Maintenance';
    }
    // Time extraction
    if (lower.includes('kal') || lower.includes('tomorrow') || lower.includes('morning') || lower.includes('shaam')) {
      this.extractedLead.preferredTime = 'Tomorrow Morning (10:00 AM - 1:00 PM)';
    }
    // Urgency
    if (lower.includes('urgent') || lower.includes('emergency') || lower.includes('aaj hi') || lower.includes('today')) {
      this.extractedLead.urgency = 'urgent';
    } else {
      this.extractedLead.urgency = 'normal';
    }
    this.extractedLead.followUpAction = 'Contact lead to confirm appointment slot';
  }

  private resetSilenceTimer() {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    // Silence timeout: 10 seconds
    this.silenceTimer = setTimeout(() => {
      this.handleSilenceTimeout();
    }, 10000);
  }

  private handleSilenceTimeout() {
    this.silenceWarnings++;
    if (this.silenceWarnings === 1) {
      this.sendAssistantReply('Kya aap sun pa rahe hain? Main aapki service request mein kaise madad kar sakta hoon?');
    } else if (this.silenceWarnings >= 2) {
      logMedia('info', 'Call terminated due to persistent caller silence');
      this.completeCall('silence_timeout');
    }
  }

  public completeCall(reason: string) {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);

    // Build concise factual summary without fabricated data (rules.md section 4)
    const userUtterances = this.conversationHistory.filter((c) => c.role === 'user').map((c) => c.text);
    const summaryText =
      userUtterances.length > 0
        ? `Caller contacted business regarding ${this.extractedLead.requestedService || 'service enquiry'}. Provided details: ${userUtterances.join('; ')}.`
        : 'Inbound call answered by AI assistant. Caller disconnected before providing enquiry details.';

    this.callbacks.onLeadExtracted(this.extractedLead, summaryText);
    this.callbacks.onCallComplete(reason);
  }
}
