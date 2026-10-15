import React, { useState } from 'react';

interface WhatsAppHubPageProps {
  navigate: (route: string) => void;
}

export const WhatsAppHubPage: React.FC<WhatsAppHubPageProps> = ({ navigate }) => {
  const [pairingCode] = useState('749-102');
  const [isPaired, setIsPaired] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('+91 98100 23456');

  // Notification Toggles
  const [optLeadCards, setOptLeadCards] = useState(true);
  const [optDailyDigest, setOptDailyDigest] = useState(true);
  const [optAudioLink, setOptAudioLink] = useState(false);
  const [optEscalation, setOptEscalation] = useState(true);

  // Command Sandbox
  const [commandInput, setCommandInput] = useState('/summary');
  const [sandboxMessages, setSandboxMessages] = useState<{ sender: 'user' | 'bot'; text: string; time: string }[]>([
    { sender: 'user', text: '/status', time: '16:04' },
    { sender: 'bot', text: 'Callivaan Status: ACTIVE\nCarrier Line: Reliance Jio (*401*)\nCalls Handled Today: 18\nLeads Delivered: 6', time: '16:04' },
  ]);

  const handleSendCommand = (cmd: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSandboxMessages((prev) => [...prev, { sender: 'user', text: cmd, time }]);

    setTimeout(() => {
      let botResp = '';
      if (cmd.startsWith('/summary')) {
        botResp = 'Today’s Lead Summary (15 Oct 2026):\n• 18 Inbound Calls Answered\n• 6 Qualified Buyer Leads\n• 4 High-Intent Appointments Scheduled\n• Average Turn Latency: 380ms';
      } else if (cmd.startsWith('/pause')) {
        botResp = 'Callivaan has been PAUSED. Incoming calls will now ring through to your voicemail or normal carrier tone. Send /resume to restart AI answering.';
      } else if (cmd.startsWith('/resume')) {
        botResp = 'Callivaan AI Voice Assistant is now RESUMED and answering calls 24/7.';
      } else if (cmd.startsWith('/hours')) {
        botResp = 'Operating hours updated in AI agent knowledge base. Spoken to callers: ' + cmd.replace('/hours', '').trim();
      } else {
        botResp = 'Unknown command. Supported commands: /summary, /status, /pause, /resume, /hours [timings]';
      }
      setSandboxMessages((prev) => [...prev, { sender: 'bot', text: botResp, time }]);
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* HEADER SECTION */}
      <section className="bg-surface border-b border-outline px-4 sm:px-6 md:px-12 py-8">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success-container text-success border border-success/30">
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>WhatsApp Cloud API Dispatcher</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
              WhatsApp Connection &amp; Dispatch Hub
            </h1>
            <p className="text-xs sm:text-sm text-tertiary max-w-2xl">
              Link your WhatsApp phone number to receive instant lead cards, real-time call audio links, and control your AI assistant remotely via text commands.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/portal')}
              className="px-3.5 py-2 rounded-lg border border-outline bg-surface text-xs font-semibold text-on-surface hover:bg-surface-dim transition cursor-pointer"
            >
              View Inbound Calls
            </button>
            <button
              onClick={() => navigate('/agent')}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Configure Prompts
            </button>
          </div>
        </div>
      </section>

      {/* PAIRING STATUS CARD */}
      <section className="px-4 sm:px-6 md:px-12 py-6 bg-surface-dim border-b border-outline">
        <div className="w-full max-w-7xl mx-auto bg-surface rounded-2xl border border-outline p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success-container text-success flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[26px]">check_circle</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-xs text-tertiary">Connected WhatsApp Phone Number</div>
              <div className="text-2xl font-bold text-on-surface font-tnums tracking-tight">
                {whatsappNumber}
              </div>
              <div className="text-[11px] text-success flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                <span>Active &amp; Verified • End-to-End Encrypted Cloud API</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Test alert sent to ' + whatsappNumber)}
              className="px-4 py-2.5 rounded-lg border border-outline bg-surface hover:bg-surface-dim text-xs font-semibold text-on-surface transition flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-success">send</span>
              <span>Send Test Lead Alert</span>
            </button>
            <button
              onClick={() => setIsPaired(!isPaired)}
              className="px-4 py-2.5 rounded-lg border border-error/30 text-error hover:bg-error-container text-xs font-semibold transition cursor-pointer"
            >
              {isPaired ? 'Disconnect WhatsApp' : 'Pair WhatsApp'}
            </button>
          </div>
        </div>
      </section>

      {/* TWO-COLUMN SETTINGS & COMMAND CONSOLE */}
      <section className="flex-1 px-4 sm:px-6 md:px-12 py-8">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Notification Channels & Pairing Instructions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Notification Preference Toggles */}
            <div className="bg-surface rounded-xl border border-outline p-6 shadow-xs space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-on-surface">WhatsApp Notification Preferences</h3>
                <p className="text-xs text-tertiary">Select what Callivaan sends to your WhatsApp chat in real-time.</p>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    title: 'Instant Inbound Lead Cards (< 3s)',
                    desc: 'Delivers caller name, phone number, qualification summary, and one-tap callback link immediately upon call hangup.',
                    checked: optLeadCards,
                    toggle: () => setOptLeadCards(!optLeadCards),
                  },
                  {
                    title: 'Daily Call & Performance Digest',
                    desc: 'Sends a consolidated executive report at 8:00 PM every evening with total calls, conversion rate, and pending tasks.',
                    checked: optDailyDigest,
                    toggle: () => setOptDailyDigest(!optDailyDigest),
                  },
                  {
                    title: 'TRAI Compliant Audio Recording Snippet Link',
                    desc: 'Includes an encrypted direct link to listen to the caller conversation audio recording in the browser.',
                    checked: optAudioLink,
                    toggle: () => setOptAudioLink(!optAudioLink),
                  },
                  {
                    title: 'Urgent Human Operator Escalation Ping',
                    desc: 'Sends a high-priority red alert if a caller demands to speak with a human or reports an emergency.',
                    checked: optEscalation,
                    toggle: () => setOptEscalation(!optEscalation),
                  },
                ].map((item, i) => (
                  <div key={i} className="p-3.5 rounded-lg border border-outline bg-surface-dim flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-on-surface">{item.title}</div>
                      <div className="text-[11px] text-tertiary leading-relaxed">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={item.toggle}
                      className="w-4 h-4 accent-primary cursor-pointer shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Pairing Code Card */}
            <div className="bg-surface rounded-xl border border-outline p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-on-surface">Pairing via Dynamic 6-Digit Code</h3>
              <p className="text-xs text-tertiary leading-relaxed">
                If connecting a secondary sales agent or moving to a different mobile device, use this dynamic PIN:
              </p>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-dim border border-outline">
                <div className="text-3xl font-mono font-bold tracking-widest text-primary font-tnums">
                  {pairingCode}
                </div>
                <div className="text-xs text-muted">
                  Send this 6-digit code to <strong>+91 80 4736 8800</strong> from your WhatsApp.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive WhatsApp Command Console (5 cols) */}
          <div className="lg:col-span-5 bg-surface rounded-xl border border-outline p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-outline">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[14px]">terminal</span>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  WhatsApp Command Sandbox
                </h3>
              </div>
              <span className="text-[11px] text-muted">Interactive Demo</span>
            </div>

            <p className="text-xs text-tertiary leading-relaxed">
              Test how Callivaan responds when you send commands directly on WhatsApp:
            </p>

            {/* Interactive Mock Chat Bubble */}
            <div className="bg-[#EFEAE2] rounded-xl p-3.5 space-y-3 min-h-[260px] max-h-[320px] overflow-y-auto text-xs">
              {sandboxMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg shadow-xs leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'ml-auto bg-[#D9FDD3] text-on-surface max-w-[80%]'
                      : 'mr-auto bg-white text-on-surface max-w-[85%] border-l-4 border-primary'
                  }`}
                >
                  <div>{m.text}</div>
                  <div className="text-right text-[10px] text-muted mt-1 font-tnums">{m.time}</div>
                </div>
              ))}
            </div>

            {/* Quick Action Command Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['/summary', '/status', '/pause', '/resume'].map((c) => (
                <button
                  key={c}
                  onClick={() => handleSendCommand(c)}
                  className="px-2.5 py-1 rounded bg-surface-dim hover:bg-surface-container border border-outline text-[11px] font-mono font-semibold text-primary transition cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Manual input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (commandInput.trim()) {
                  handleSendCommand(commandInput.trim());
                  setCommandInput('');
                }
              }}
              className="flex gap-2 pt-1"
            >
              <input
                type="text"
                placeholder="Type command like /summary or /hours 9am-6pm..."
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary placeholder:text-muted"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
