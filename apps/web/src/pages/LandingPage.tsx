import React, { useState } from 'react';

interface LandingPageProps {
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeCarrier, setActiveCarrier] = useState<'jio' | 'airtel' | 'vi'>('jio');

  const carrierCodes = {
    jio: { name: 'Reliance Jio', activate: '*401*+918047368800', deactivate: '*402', type: 'Immediate / Busy Forwarding' },
    airtel: { name: 'Bharti Airtel', activate: '**61*+918047368800#', deactivate: '##61#', type: 'Forward when unanswered (15s)' },
    vi: { name: 'Vodafone Idea', activate: '**67*+918047368800#', deactivate: '##67#', type: 'Forward when busy / declined' },
  };

  const faqs = [
    {
      q: 'How does Callivaan connect to an existing business mobile number?',
      a: 'Callivaan connects via standard Indian telecom carrier call forwarding (USSD). You dial the carrier code once on your phone (e.g. *401*AgentNumber on Jio or **61*AgentNumber on Airtel). Unanswered or busy calls automatically route to your assigned Callivaan telephony line.',
    },
    {
      q: 'Which languages does the voice agent support?',
      a: 'Callivaan supports Hindi, Indian English, and mixed conversational Hinglish. The agent recognizes regional terminology, Indian names, addresses, and budget amounts with sub-400ms turn-taking latency.',
    },
    {
      q: 'How are leads delivered to WhatsApp?',
      a: 'Immediately after the call ends, Callivaan parses the caller audio, extracts customer requirements, and sends a structured message to your paired WhatsApp number with caller details and a callback link.',
    },
    {
      q: 'Does this comply with TRAI regulations?',
      a: 'Yes. Every call plays an initial two-party recording disclosure chime in accordance with TRAI and DoT guidelines. Recordings are stored securely for 90 days and are never used to train public models.',
    },
    {
      q: 'What is included in the free trial?',
      a: '14 days access, 50 inclusive call minutes, carrier forwarding setup, custom business prompt configuration, and direct WhatsApp lead delivery. No credit card is required.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* HERO SECTION - Direct, Honest, No Fluff */}
      <section className="pt-14 pb-16 md:pt-20 md:pb-24 border-b border-outline">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Direct Value */}
            <div className="lg:col-span-7 space-y-5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-on-surface tracking-tight leading-tight">
                Inbound call assistant for Indian businesses.
              </h1>

              <p className="text-base sm:text-lg text-tertiary max-w-xl leading-relaxed">
                When your phone is busy or unanswered, Callivaan picks up, speaks with the customer in natural Hindi or English, extracts their inquiry, and sends a structured summary to your WhatsApp.
              </p>

              {/* Action Buttons: Solid, 6px Radius, No Pills */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/auth')}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors duration-100"
                >
                  Start 14-day free trial
                </button>
                <button
                  onClick={() => navigate('/portal')}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-md border border-outline bg-surface text-on-surface font-medium text-sm hover:bg-surface-dim transition-colors duration-100"
                >
                  View demo dashboard
                </button>
              </div>

              {/* Functional Carrier Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-tertiary">
                <span className="font-medium text-on-surface">Supported carriers:</span>
                <span>Reliance Jio (*401*)</span>
                <span>Bharti Airtel (**61*)</span>
                <span>Vodafone Idea (**67*)</span>
                <span>BSNL (**61*)</span>
              </div>
            </div>

            {/* Right Column: Real Telephony Inspection Console (No Cartoon Phone Mockup) */}
            <div className="lg:col-span-5 bg-surface-dim rounded-lg border border-outline p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-outline text-tertiary font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span className="font-medium text-on-surface">Session #CAL-8924</span>
                </div>
                <span className="font-mono text-[11px] text-muted">02m 14s &bull; Jio SIP</span>
              </div>

              {/* Caller Meta */}
              <div className="bg-surface rounded border border-outline p-3 font-sans space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-on-surface">+91 98765 43210</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    High Intent
                  </span>
                </div>
                <div className="text-xs text-tertiary">Rajat Verma &bull; Noida, Sector 62</div>
              </div>

              {/* Verbatim Transcript */}
              <div className="space-y-2 py-1 font-sans">
                <div className="p-2.5 rounded bg-surface border border-outline space-y-0.5">
                  <div className="text-[11px] text-muted font-mono">00:08 &bull; Caller (Hinglish)</div>
                  <div className="text-xs text-on-surface">
                    "Mujhe commercial office space ke rates janne the Sector 62 me, approx 1200 sq ft."
                  </div>
                </div>
                <div className="p-2.5 rounded bg-surface border border-outline space-y-0.5">
                  <div className="text-[11px] text-primary font-mono">00:16 &bull; Callivaan AI</div>
                  <div className="text-xs text-on-surface">
                    "Sector 62 me 800 se 2400 sq ft units available hain. Kya kal subah 11:30 baje site visit plan karein?"
                  </div>
                </div>
              </div>

              {/* WhatsApp Lead Payload Delivered */}
              <div className="p-2.5 rounded bg-emerald-50/50 border border-emerald-200 font-sans space-y-1">
                <div className="text-[11px] font-semibold text-emerald-900 flex items-center justify-between">
                  <span>WhatsApp Lead Dispatched</span>
                  <span className="font-mono text-[10px] text-emerald-700">Latency: 2.1s</span>
                </div>
                <p className="text-xs text-emerald-950">
                  Buyer confirmed site inspection for tomorrow at 11:30 AM. Budget ₹85L.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SETUP WORKFLOW - Functional, Linear, No Giant 01/02 Numbers */}
      <section className="py-14 sm:py-16 border-b border-outline bg-surface">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-2xl mb-10 space-y-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-on-surface">
              Setup workflow
            </h2>
            <p className="text-sm text-tertiary">
              Three steps to connect your existing business phone number.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-outline rounded-lg p-5 space-y-2">
              <div className="text-xs font-mono text-tertiary">Step 1</div>
              <h3 className="text-base font-semibold text-on-surface">Define business hours and services</h3>
              <p className="text-sm text-tertiary leading-relaxed">
                Enter your operating timings, service pricing, and greeting preferences. Callivaan configures your AI voice persona.
              </p>
            </div>

            <div className="border border-outline rounded-lg p-5 space-y-2">
              <div className="text-xs font-mono text-tertiary">Step 2</div>
              <h3 className="text-base font-semibold text-on-surface">Dial carrier forwarding code</h3>
              <p className="text-sm text-tertiary leading-relaxed">
                Dial a USSD code on your mobile phone to forward unanswered calls to your assigned Callivaan gateway number.
              </p>
            </div>

            <div className="border border-outline rounded-lg p-5 space-y-2">
              <div className="text-xs font-mono text-tertiary">Step 3</div>
              <h3 className="text-base font-semibold text-on-surface">Receive leads on WhatsApp</h3>
              <p className="text-sm text-tertiary leading-relaxed">
                When a call concludes, caller requirements and a one-tap callback link arrive on your WhatsApp in under 3 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CARRIER USSD REFERENCE MATRIX */}
      <section className="py-14 sm:py-16 border-b border-outline bg-surface-dim">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-2xl mb-8 space-y-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-on-surface">
              Carrier forwarding codes
            </h2>
            <p className="text-sm text-tertiary">
              Dial these codes directly on your handset to toggle Callivaan routing.
            </p>
          </div>

          {/* Carrier Switcher Tabs */}
          <div className="flex border-b border-outline mb-6">
            {(['jio', 'airtel', 'vi'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setActiveCarrier(c)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors duration-100 ${
                  activeCarrier === c
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-tertiary hover:text-on-surface'
                }`}
              >
                {carrierCodes[c].name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface rounded-lg border border-outline p-4 space-y-1">
              <div className="text-xs text-muted">Activation USSD Code</div>
              <div className="text-base font-mono font-semibold text-primary">
                {carrierCodes[activeCarrier].activate}
              </div>
              <div className="text-xs text-tertiary">{carrierCodes[activeCarrier].type}</div>
            </div>

            <div className="bg-surface rounded-lg border border-outline p-4 space-y-1">
              <div className="text-xs text-muted">Deactivation Code</div>
              <div className="text-base font-mono font-semibold text-on-surface">
                {carrierCodes[activeCarrier].deactivate}
              </div>
              <div className="text-xs text-tertiary">Restores standard phone voicemail / ringing</div>
            </div>

            <div className="bg-surface rounded-lg border border-outline p-4 space-y-1">
              <div className="text-xs text-muted">Routing Latency</div>
              <div className="text-base font-semibold text-on-surface">Sub-400ms SIP handoff</div>
              <div className="text-xs text-tertiary">TRAI ephemeral 90-day retention</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHATSAPP REMOTE COMMANDS */}
      <section className="py-14 sm:py-16 border-b border-outline bg-surface">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-2xl mb-8 space-y-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-on-surface">
              WhatsApp remote commands
            </h2>
            <p className="text-sm text-tertiary">
              Manage your assistant without opening a computer by messaging your bot.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-outline rounded-lg p-4 space-y-1.5">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-dim font-medium text-primary">/summary</span>
              <h3 className="text-sm font-semibold text-on-surface pt-1">Daily call report</h3>
              <p className="text-xs text-tertiary">Recap of all calls answered today, qualified leads, and pending callbacks.</p>
            </div>

            <div className="border border-outline rounded-lg p-4 space-y-1.5">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-dim font-medium text-primary">/pause</span>
              <h3 className="text-sm font-semibold text-on-surface pt-1">Pause assistant</h3>
              <p className="text-xs text-tertiary">Temporarily halts AI call answering during holidays. Send /resume to restart.</p>
            </div>

            <div className="border border-outline rounded-lg p-4 space-y-1.5">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-dim font-medium text-primary">/hours</span>
              <h3 className="text-sm font-semibold text-on-surface pt-1">Update timings</h3>
              <p className="text-xs text-tertiary">Send "/hours 10am to 8pm" to instantly change the agent's answers to callers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-14 sm:py-16 border-b border-outline bg-surface-dim">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-8 space-y-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-on-surface">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border border-outline rounded-lg bg-surface overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-medium text-sm text-on-surface flex items-center justify-between gap-4 hover:bg-surface-dim transition-colors duration-100"
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-sm text-tertiary leading-relaxed border-t border-outline">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL ACTION SECTION */}
      <section className="py-14 sm:py-16 bg-surface">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-on-surface tracking-tight">
            Start answering customer calls autonomously.
          </h2>
          <p className="text-sm sm:text-base text-tertiary max-w-lg mx-auto">
            14-day free trial with 50 inclusive minutes. No credit card required.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/auth')}
              className="px-5 py-2.5 rounded-md bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors duration-100"
            >
              Start 14-day free trial
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
