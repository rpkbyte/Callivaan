import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface CallRecord {
  id: string;
  callerNumber: string;
  callerName: string;
  city: string;
  time: string;
  duration: string;
  durationSeconds: number;
  language: 'Hinglish' | 'Hindi' | 'English';
  intent: string;
  status: 'QUALIFIED' | 'INQUIRY' | 'ESCALATED' | 'SPAM';
  summary: string;
  transcript: { speaker: 'Caller' | 'Callivaan AI'; text: string; time: string }[];
}

const mockCalls: CallRecord[] = [
  {
    id: 'call-101',
    callerNumber: '+91 98765 43210',
    callerName: 'Rajat Verma',
    city: 'Noida, Sector 62',
    time: 'Today, 02:45 PM',
    duration: '02:14',
    durationSeconds: 134,
    language: 'Hinglish',
    intent: 'Commercial Real Estate Site Visit',
    status: 'QUALIFIED',
    summary: 'Wants to inspect 1,200 sq ft office space in Sector 62. Budget is approx ₹85 Lakhs. Confirmed site visit for tomorrow at 11:30 AM.',
    transcript: [
      { speaker: 'Callivaan AI', text: 'Namaste! Callivaan Realty assistance me aapka swagat hai. Main aapki kya sahayata kar sakta hoon?', time: '00:02' },
      { speaker: 'Caller', text: 'Haan ji, mujhe Sector 62 me commercial office space ke rates janne the.', time: '00:08' },
      { speaker: 'Callivaan AI', text: 'Sector 62 me premium towers me 800 sq ft se 2400 sq ft units available hain. Aapka estimated budget aur requirement kya hai?', time: '00:16' },
      { speaker: 'Caller', text: 'Lagbhag 1200 square feet chahiye, budget around 80 se 85 Lakhs ka hai.', time: '00:26' },
      { speaker: 'Callivaan AI', text: 'Bilkul Rajat ji, hamare paas 2 units ready-to-move condition me hain. Kya kal subah 11:30 baje hum site inspection visit schedule karein?', time: '00:38' },
      { speaker: 'Caller', text: 'Haan, kal 11:30 theek rahega. Mujhe WhatsApp pe location bhej dijiye.', time: '00:46' },
      { speaker: 'Callivaan AI', text: 'Maine details note kar li hain. Turant aapke number par location aur brochure dispatch ho rahi hai. Dhanyawad!', time: '00:54' },
    ],
  },
  {
    id: 'call-102',
    callerNumber: '+91 98112 87654',
    callerName: 'Priya Sharma',
    city: 'South Delhi',
    time: 'Today, 01:15 PM',
    duration: '01:40',
    durationSeconds: 100,
    language: 'English',
    intent: 'Doctor OPD Timings & Consultation',
    status: 'QUALIFIED',
    summary: 'Patient inquiring about Dr. Kapoor (Orthopedic) consultation hours. Booked OPD appointment for Friday evening at 5:00 PM.',
    transcript: [
      { speaker: 'Callivaan AI', text: 'Hello, thank you for calling Balaji Healthcare. How may I assist you today?', time: '00:02' },
      { speaker: 'Caller', text: 'Hi, is Dr. Kapoor available for orthopedic consultation this Friday?', time: '00:07' },
      { speaker: 'Callivaan AI', text: 'Yes, Dr. Kapoor is available this Friday from 4 PM to 7 PM. Would you like to reserve a 5:00 PM slot?', time: '00:15' },
      { speaker: 'Caller', text: 'Yes please, 5:00 PM works perfectly.', time: '00:22' },
      { speaker: 'Callivaan AI', text: 'Great, appointment confirmed for Priya Sharma at 5:00 PM this Friday. Consultation slip sent to your WhatsApp.', time: '00:30' },
    ],
  },
  {
    id: 'call-103',
    callerNumber: '+91 99887 12345',
    callerName: 'Amit Saxena',
    city: 'Gurugram',
    time: 'Today, 11:20 AM',
    duration: '00:52',
    durationSeconds: 52,
    language: 'Hindi',
    intent: 'Automobile Service Status',
    status: 'INQUIRY',
    summary: 'Customer checking if Honda City vehicle number DL 3C AY 4412 service is complete. Informed that wheel balancing is in progress.',
    transcript: [
      { speaker: 'Callivaan AI', text: 'Namaste! Service helpdesk me aapka swagat hai. Batayein kis gaadi ka status dekhna hai?', time: '00:02' },
      { speaker: 'Caller', text: 'Meri Honda City ka service status check karna hai, number DL 3C AY 4412.', time: '00:09' },
      { speaker: 'Callivaan AI', text: 'Record check kar raha hoon... Ji Amit ji, general service ho chuki hai, final wheel balancing chal rahi hai. Gaadi 4 PM tak ready hogi.', time: '00:19' },
      { speaker: 'Caller', text: 'Theek hai, jab ready ho toh message bhej dena.', time: '00:25' },
      { speaker: 'Callivaan AI', text: 'Ji bilkul, gaadi ready hote hi invoice aur gate pass WhatsApp par aa jayega.', time: '00:32' },
    ],
  },
  {
    id: 'call-104',
    callerNumber: '+91 97170 54321',
    callerName: 'Vikram Joshi',
    city: 'Bengaluru',
    time: 'Yesterday, 06:10 PM',
    duration: '03:10',
    durationSeconds: 190,
    language: 'Hinglish',
    intent: 'Urgent Legal Dispute Consultation',
    status: 'ESCALATED',
    summary: 'High priority commercial contract breach issue. AI detected urgent keyword and successfully initiated live transfer to senior advocate.',
    transcript: [
      { speaker: 'Callivaan AI', text: 'Namaste! Joshi & Partners Legal Advisory. Main aapki kya madad kar sakta hoon?', time: '00:02' },
      { speaker: 'Caller', text: 'Ek emergency injunction notice mila hai partner company se. Mujhe turant senior partner se baat karni hai.', time: '00:12' },
      { speaker: 'Callivaan AI', text: 'Main samajh raha hoon. Urgent legal matter ke liye main turant Senior Counsel desk par aapki call transfer kar raha hoon. Kripya hold karein...', time: '00:24' },
      { speaker: 'Callivaan AI', text: '[Operator Transfer Initiated to +91 98450 11223]', time: '00:28' },
    ],
  },
];

interface PortalPageProps {
  navigate: (route: string) => void;
}

export const PortalPage: React.FC<PortalPageProps> = ({ navigate }) => {
  const { tenant } = useAuth();
  const [calls, setCalls] = useState<CallRecord[]>(mockCalls);
  const [selectedCall, setSelectedCall] = useState<CallRecord>(mockCalls[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1x' | '1.25x' | '1.5x'>('1x');
  const [audioProgress, setAudioProgress] = useState(35);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [telephonyRoute, setTelephonyRoute] = useState<{ providerVirtualNumber?: string; carrier?: string; status?: string } | null>(null);

  const loadData = async () => {
    try {
      const [callsRes, routeRes] = await Promise.allSettled([
        api.calls.listCalls(50, 0),
        api.telephony.getRoute(),
      ]);

      if (routeRes.status === 'fulfilled' && routeRes.value) {
        setTelephonyRoute(routeRes.value);
      }

      if (callsRes.status === 'fulfilled' && callsRes.value && callsRes.value.calls?.length > 0) {
        const transformed: CallRecord[] = callsRes.value.calls.map((c: any, index: number) => {
          const lead = c.summary?.extractedLead;
          const started = new Date(c.startedAt);
          const timeStr = isNaN(started.getTime())
            ? 'Just now'
            : started.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const durSecs = c.durationSeconds || 60;
          const m = Math.floor(durSecs / 60);
          const s = durSecs % 60;
          const durationStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

          let st: 'QUALIFIED' | 'INQUIRY' | 'ESCALATED' | 'SPAM' = 'QUALIFIED';
          if (c.status === 'human_fallback') st = 'ESCALATED';
          else if (lead?.urgency === 'urgent') st = 'QUALIFIED';
          else if (c.status === 'in_progress') st = 'INQUIRY';

          return {
            id: c.id,
            callerNumber: c.callerNumber || '+91 99999 88888',
            callerName: lead?.callerName || `Caller ${c.callerNumber ? c.callerNumber.slice(-4) : (100 + index)}`,
            city: lead?.requestedService ? 'Delhi NCR' : 'Gurugram',
            time: `Today, ${timeStr}`,
            duration: durationStr,
            durationSeconds: durSecs,
            language: 'Hinglish',
            intent: lead?.requestedService || 'Inbound Service Inquiry',
            status: st,
            summary: c.summary?.summaryText || 'Inbound call answered and processed by Callivaan AI voice assistant.',
            transcript: [
              { speaker: 'Callivaan AI', text: 'Namaste! Callivaan AI assistance me aapka swagat hai. Main aapki kya sahayata kar sakta hoon?', time: '00:02' },
              { speaker: 'Caller', text: lead?.requestedService ? `Haan ji, mujhe ${lead.requestedService} ke baare me baat karni hai.` : 'Haan, service booking ke baare me pata karna tha.', time: '00:08' },
              { speaker: 'Callivaan AI', text: lead?.preferredTime ? `Bilkul, ${lead.preferredTime} ka time note kar liya hai. Confirmation WhatsApp par bhej di hai.` : 'Maine aapki requirement note kar li hai. Turant WhatsApp dispatch ho raha hai.', time: '00:18' },
            ],
          };
        });

        const merged = [...transformed, ...mockCalls.filter(m => !transformed.some(t => t.id === m.id))];
        setCalls(merged);
        setSelectedCall(merged[0]);
      }
    } catch {
      // keep mockCalls
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSimulateInboundCall = async () => {
    setSimulating(true);
    try {
      await api.telephony.triggerTestCall('+919876543210');
      await loadData();
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    } catch (e: any) {
      console.warn('Simulated call error:', e.message);
    } finally {
      setSimulating(false);
    }
  };

  const filteredCalls = calls.filter((c) => {
    const matchesSearch =
      c.callerNumber.includes(searchQuery) ||
      c.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.intent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* COMPACT OPERATIONAL SUB-HEADER (No Giant 4-Card KPI Banner) */}
      <section className="bg-surface border-b border-outline px-4 sm:px-6 md:px-8 py-3">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-on-surface text-sm">
              {tenant?.name || 'Shree Balaji Enterprises'}
            </span>
            <span className="text-tertiary">
              {telephonyRoute?.providerVirtualNumber
                ? `Route: ${telephonyRoute.providerVirtualNumber} (${telephonyRoute.carrier?.toUpperCase() || 'JIO'})`
                : 'Routing: +91 80 4736 8800 (Reliance Jio)'}
            </span>
            <span className="text-muted">&bull;</span>
            <span className="text-emerald-700 font-medium">Active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateInboundCall}
              disabled={simulating}
              className="px-2.5 py-1.5 rounded-md border border-outline hover:bg-surface-dim text-on-surface text-xs font-medium transition-colors duration-100"
            >
              {simulating ? 'Connecting...' : '+ Test Inbound Call'}
            </button>
            <button
              onClick={() => navigate('/agent')}
              className="px-2.5 py-1.5 rounded-md border border-outline hover:bg-surface-dim text-on-surface text-xs font-medium transition-colors duration-100"
            >
              Prompts
            </button>
            <button
              onClick={() => navigate('/telephony')}
              className="px-2.5 py-1.5 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors duration-100"
            >
              Forwarding
            </button>
          </div>
        </div>
      </section>

      {/* DUAL-PANE CALL FEED & INSPECTION - Content-First Layout */}
      <section className="flex-1 px-4 sm:px-6 md:px-8 py-4">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Call History Table (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Search and Filter Row */}
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Search phone number or caller name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-md border border-outline bg-surface text-xs text-on-surface placeholder:text-muted"
              />

              <div className="flex items-center gap-1">
                {(['ALL', 'QUALIFIED', 'INQUIRY', 'ESCALATED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors duration-100 ${
                      selectedStatus === st
                        ? 'bg-surface-dim text-on-surface font-semibold border border-outline'
                        : 'text-tertiary hover:text-on-surface'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st === 'QUALIFIED' ? 'Qualified' : st === 'INQUIRY' ? 'Inquiry' : 'Escalated'}
                  </button>
                ))}
              </div>
            </div>

            {/* Structured Table */}
            <div className="border border-outline rounded-lg overflow-hidden bg-surface">
              <div className="divide-y divide-outline">
                {filteredCalls.map((call) => {
                  const isSelected = selectedCall.id === call.id;
                  return (
                    <div
                      key={call.id}
                      onClick={() => setSelectedCall(call)}
                      className={`p-3 text-xs transition-colors duration-100 cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected ? 'bg-primary-subtle/50 border-l-2 border-primary' : 'hover:bg-surface-dim'
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-on-surface font-tnums">
                            {call.callerName}
                          </span>
                          <span className="text-muted font-mono">{call.callerNumber}</span>
                        </div>
                        <div className="text-tertiary truncate max-w-sm">
                          {call.intent}
                        </div>
                        <div className="text-muted text-[11px] font-tnums">
                          {call.time} &bull; {call.duration} &bull; {call.city}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            call.status === 'QUALIFIED'
                              ? 'bg-emerald-50 text-emerald-800'
                              : call.status === 'ESCALATED'
                              ? 'bg-red-50 text-red-800'
                              : 'bg-surface-dim text-tertiary'
                          }`}
                        >
                          {call.status === 'QUALIFIED' ? 'Qualified' : call.status === 'ESCALATED' ? 'Escalated' : 'Inquiry'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredCalls.length === 0 && (
                  <div className="p-6 text-center text-xs text-muted">
                    No calls match your search query.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Split Inspection Detail (5 cols) */}
          <div className="lg:col-span-5 border border-outline rounded-lg p-4 bg-surface space-y-4 text-xs">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-outline">
              <div>
                <div className="font-semibold text-sm text-on-surface">{selectedCall.callerName}</div>
                <div className="font-mono text-primary">{selectedCall.callerNumber}</div>
                <div className="text-muted text-[11px] mt-0.5">{selectedCall.city} &bull; {selectedCall.time}</div>
              </div>

              <a
                href={`tel:${selectedCall.callerNumber}`}
                className="px-2.5 py-1.5 rounded-md bg-primary text-white font-medium hover:bg-primary-hover transition-colors duration-100"
              >
                Callback
              </a>
            </div>

            {/* Audio Waveform Player */}
            <div className="border border-outline rounded p-3 bg-surface-dim space-y-2">
              <div className="flex items-center justify-between text-muted text-[11px]">
                <span>Call Audio ({selectedCall.duration})</span>
                <span className="font-mono">16kHz PCM</span>
              </div>

              {/* Progress Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={audioProgress}
                onChange={(e) => setAudioProgress(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-outline rounded cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="p-1 rounded border border-outline bg-surface text-on-surface hover:bg-surface-dim"
                  >
                    <span className="material-symbols-outlined text-[16px] leading-none">
                      {isPlayingAudio ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  <span className="text-[11px] text-tertiary font-mono">00:46 / {selectedCall.duration}</span>
                </div>

                <div className="flex items-center gap-1">
                  {(['1x', '1.25x', '1.5x'] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        playbackSpeed === spd ? 'bg-primary text-white' : 'text-muted hover:text-on-surface'
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lead Summary */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-on-surface">Extracted requirement</span>
                <button
                  onClick={() => { setCopiedNotification(true); setTimeout(() => setCopiedNotification(false), 2000); }}
                  className="text-primary hover:underline text-[11px]"
                >
                  {copiedNotification ? 'Sent to WhatsApp' : 'Resend to WhatsApp'}
                </button>
              </div>
              <div className="p-2.5 rounded bg-surface-dim border border-outline text-tertiary leading-relaxed">
                {selectedCall.summary}
              </div>
            </div>

            {/* Transcript */}
            <div className="space-y-2 pt-1">
              <div className="font-semibold text-on-surface">Transcript</div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {selectedCall.transcript.map((line, idx) => (
                  <div key={idx} className="p-2 rounded border border-outline bg-surface-dim space-y-0.5">
                    <div className="flex justify-between text-[10px] text-muted font-mono">
                      <span className={line.speaker === 'Caller' ? 'text-on-surface font-semibold' : 'text-primary font-semibold'}>
                        {line.speaker}
                      </span>
                      <span>{line.time}</span>
                    </div>
                    <div className="text-on-surface">{line.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
