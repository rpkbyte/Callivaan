export type TabName = 'calls' | 'leads' | 'telephony' | 'agent' | 'settings';

export type CallStatus = 'QUALIFIED' | 'INQUIRY' | 'ESCALATED' | 'MISSED';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'CONVERTED';

export interface TranscriptLine {
  readonly speaker: 'Caller' | 'Callivaan AI';
  readonly text: string;
  readonly time: string;
}

export interface CallRecord {
  readonly id: string;
  readonly callerName: string;
  readonly callerNumber: string;
  readonly city: string;
  readonly time: string;
  readonly duration: string;
  readonly durationSeconds: number;
  readonly language: 'Hinglish' | 'Hindi' | 'English';
  readonly intent: string;
  readonly status: CallStatus;
  readonly summary: string;
  readonly transcript: readonly TranscriptLine[];
}

export interface LeadRecord {
  readonly id: string;
  readonly customerName: string;
  readonly phone: string;
  readonly city: string;
  readonly timestamp: string;
  readonly requirement: string;
  readonly budget: string;
  readonly nextAction: string;
  readonly status: LeadStatus;
  readonly priority: 'HIGH' | 'MEDIUM';
  readonly deliveredWhatsApp: boolean;
}

export interface CarrierConfig {
  readonly id: 'jio' | 'airtel' | 'vi' | 'bsnl';
  readonly name: string;
  readonly condition: string;
  readonly ussdCode: string;
  readonly cancelCode: string;
}

export interface AgentPersona {
  readonly businessName: string;
  readonly industry: string;
  readonly tone: 'respectful' | 'friendly' | 'efficient';
  readonly languageMode: 'hinglish' | 'hindi' | 'english';
  readonly greeting: string;
  readonly hours: string;
  readonly escalationNumber: string;
}
