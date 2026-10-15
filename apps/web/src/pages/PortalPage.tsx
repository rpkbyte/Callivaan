import React, { useState } from 'react';

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
  const [selectedCall, setSelectedCall] = useState<CallRecord>(mockCalls[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1x' | '1.25x' | '1.5x'>('1x');
  const [audioProgress, setAudioProgress] = useState(35); // percentage
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Filtered calls
  const filteredCalls = mockCalls.filter((c) => {
    const matchesSearch =
      c.callerNumber.includes(searchQuery) ||
      c.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.intent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleResendWhatsApp = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* TOP PORTAL BAR WITH TENANT INFO & FORWARDING STATUS */}
      <section className="bg-surface border-b border-outline px-4 sm:px-6 md:px-12 py-3.5">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-sm">
              <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-on-surface">Shree Balaji Enterprises</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-container text-success border border-success/30">
                  LIVE TELEPHONY ACTIVE
                </span>
              </div>
              <div className="text-xs text-tertiary flex items-center gap-2">
                <span>Forwarded line: +91 98100 23456 (Reliance Jio)</span>
                <span>•</span>
                <span>Agent: Natural Hinglish</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/agent')}
              className="px-3 py-1.5 rounded-lg border border-outline bg-surface text-xs font-semibold text-on-surface hover:bg-surface-dim transition flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">tune</span>
              <span>Edit Prompts &amp; FAQs</span>
            </button>
            <button
              onClick={() => navigate('/telephony')}
              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">call_forward</span>
              <span>Forwarding Settings</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 PRIMARY KPI METRIC CARDS */}
      <section className="px-4 sm:px-6 md:px-12 py-6 border-b border-outline bg-surface-dim">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface rounded-xl border border-outline p-4 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-tertiary">
              <span>Total Inbound Calls</span>
              <span className="material-symbols-outlined text-primary text-[18px]">phone_in_talk</span>
            </div>
            <div className="text-2xl font-bold text-on-surface font-tnums">1,248</div>
            <div className="text-[11px] text-success flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
              <span>+14.2% vs previous week</span>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-outline p-4 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-tertiary">
              <span>Total Talk Duration</span>
              <span className="material-symbols-outlined text-primary text-[18px]">timelapse</span>
            </div>
            <div className="text-2xl font-bold text-on-surface font-tnums">48h 12m</div>
            <div className="text-[11px] text-tertiary">Avg 2m 19s per interaction</div>
          </div>

          <div className="bg-surface rounded-xl border border-outline p-4 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-tertiary">
              <span>Hot Leads Dispatched</span>
              <span className="material-symbols-outlined text-success text-[18px]">bolt</span>
            </div>
            <div className="text-2xl font-bold text-on-surface font-tnums">342</div>
            <div className="text-[11px] text-success flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">check</span>
              <span>100% delivered to WhatsApp</span>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-outline p-4 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs text-tertiary">
              <span>AI Lead Conversion</span>
              <span className="material-symbols-outlined text-primary text-[18px]">conversion_path</span>
            </div>
            <div className="text-2xl font-bold text-primary font-tnums">27.4%</div>
            <div className="text-[11px] text-muted">Qualified buyer intent</div>
          </div>
        </div>
      </section>

      {/* MAIN CALL LOG & SPLIT INSPECTION SECTION */}
      <section className="flex-1 px-4 sm:px-6 md:px-12 py-6">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Call History Table & Filters (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-tertiary text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search caller name, phone (+91), or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary placeholder:text-muted"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'QUALIFIED', 'INQUIRY', 'ESCALATED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      selectedStatus === st
                        ? 'bg-primary text-white shadow-xs'
                        : 'border border-outline bg-surface text-tertiary hover:bg-surface-dim'
                    }`}
                  >
                    {st === 'ALL' ? 'All Calls' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Inbound Call Records Table */}
            <div className="rounded-xl border border-outline overflow-hidden shadow-xs bg-surface">
              <div className="divide-y divide-outline">
                {filteredCalls.map((call) => {
                  const isSelected = selectedCall.id === call.id;
                  return (
                    <div
                      key={call.id}
                      onClick={() => setSelectedCall(call)}
                      className={`p-4 transition cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected ? 'bg-primary-fixed/20 border-l-4 border-primary' : 'hover:bg-surface-dim'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-on-surface font-tnums">
                            {call.callerName}
                          </span>
                          <span className="text-xs text-muted font-tnums">({call.callerNumber})</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-container text-tertiary">
                            {call.language}
                          </span>
                        </div>
                        <div className="text-xs text-tertiary truncate max-w-sm">
                          {call.intent}
                        </div>
                        <div className="text-[11px] text-muted flex items-center gap-2 font-tnums">
                          <span>{call.time}</span>
                          <span>•</span>
                          <span>Duration: {call.duration}</span>
                          <span>•</span>
                          <span>{call.city}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            call.status === 'QUALIFIED'
                              ? 'bg-success-container text-success border border-success/30'
                              : call.status === 'ESCALATED'
                              ? 'bg-error-container text-error border border-error/30'
                              : 'bg-surface-container text-tertiary border border-outline'
                          }`}
                        >
                          {call.status}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-primary">
                          <span className="material-symbols-outlined text-[14px]">graphic_eq</span>
                          <span>Audio</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredCalls.length === 0 && (
                  <div className="p-8 text-center text-sm text-tertiary">
                    No calls match your search query or filter.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Split Inspection Detail Panel (5 Columns) */}
          <div className="lg:col-span-5 bg-surface rounded-xl border border-outline p-5 shadow-xs space-y-5 sticky top-20">
            {/* Caller Header Card */}
            <div className="flex items-start justify-between border-b border-outline pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-on-surface font-tnums">
                    {selectedCall.callerName}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedCall.status === 'QUALIFIED'
                        ? 'bg-success-container text-success border border-success/30'
                        : selectedCall.status === 'ESCALATED'
                        ? 'bg-error-container text-error border border-error/30'
                        : 'bg-surface-container text-tertiary'
                    }`}
                  >
                    {selectedCall.status}
                  </span>
                </div>
                <div className="text-xs text-primary font-mono font-medium">{selectedCall.callerNumber}</div>
                <div className="text-xs text-tertiary">{selectedCall.city} • {selectedCall.time}</div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedCall.callerNumber}`}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold transition flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  <span>Callback</span>
                </a>
              </div>
            </div>

            {/* TRAI Compliance Notice */}
            <div className="p-2.5 rounded-lg bg-surface-dim border border-outline text-[11px] text-tertiary flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-success text-[15px]">verified</span>
                <span>TRAI Two-Party Recording Consent Verified</span>
              </div>
              <span className="text-muted font-tnums">86 Days Retention Left</span>
            </div>

            {/* Audio Waveform Player */}
            <div className="bg-surface-dim rounded-xl border border-outline p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-on-surface">
                <span>Inbound Call Recording ({selectedCall.duration})</span>
                <span className="text-muted text-[11px] font-mono">16kHz Linear PCM</span>
              </div>

              {/* Waveform Visualization Bars */}
              <div className="flex items-center gap-1 h-12 bg-surface rounded-lg p-2 border border-outline">
                {[12, 24, 40, 16, 28, 36, 18, 32, 22, 14, 28, 38, 20, 30, 24, 18, 34, 26, 16, 22, 12, 30, 20, 14].map(
                  (val, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 rounded-full transition-all duration-150 ${
                        idx < 8 ? 'bg-primary' : 'bg-outline'
                      }`}
                      style={{ height: `${val}px` }}
                    />
                  )
                )}
              </div>

              {/* Progress Scrub Bar */}
              <input
                type="range"
                min="0"
                max="100"
                value={audioProgress}
                onChange={(e) => setAudioProgress(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-surface-container rounded cursor-pointer"
              />

              {/* Player Controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isPlayingAudio ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  <span className="text-xs text-tertiary font-tnums">00:46 / {selectedCall.duration}</span>
                </div>

                {/* Speed Toggle */}
                <div className="flex items-center gap-1 text-xs">
                  {(['1x', '1.25x', '1.5x'] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                        playbackSpeed === spd ? 'bg-primary text-white' : 'text-tertiary hover:bg-surface'
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* WhatsApp Sync Card Preview */}
            <div className="bg-surface-container rounded-lg border border-outline p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-on-surface">
                  <span className="material-symbols-outlined text-success text-[16px]">chat</span>
                  <span>WhatsApp Lead Card Dispatched</span>
                </div>
                <button
                  onClick={handleResendWhatsApp}
                  className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                >
                  {copiedNotification ? 'Dispatched!' : 'Resend Alert'}
                </button>
              </div>
              <p className="text-xs text-tertiary leading-relaxed bg-surface p-2.5 rounded border border-outline">
                {selectedCall.summary}
              </p>
            </div>

            {/* Turn-by-Turn Bilingual Transcript */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center justify-between">
                <span>Call Transcript</span>
                <span className="text-muted text-[11px] normal-case font-normal">Hinglish Audio Transcription</span>
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedCall.transcript.map((line, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                      line.speaker === 'Caller'
                        ? 'bg-surface-dim border border-outline text-on-surface'
                        : 'bg-primary-fixed/20 border border-primary/20 text-on-surface'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-semibold ${line.speaker === 'Caller' ? 'text-tertiary' : 'text-primary'}`}>
                        {line.speaker}
                      </span>
                      <span className="text-[10px] text-muted font-tnums">{line.time}</span>
                    </div>
                    <div>{line.text}</div>
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
