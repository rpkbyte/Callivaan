import React, { useState } from 'react';

interface LandingPageProps {
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [simulatedCallActive, setSimulatedCallActive] = useState(true);

  const faqs = [
    {
      q: 'How does Callivaan connect to my existing business mobile number?',
      a: 'Callivaan works with standard Indian mobile carrier call forwarding. You simply dial a standard USSD code on your Airtel, Jio, or Vi phone (e.g. *401*AgentNumber for Jio or **61*AgentNumber for Airtel). When your line is busy or unanswered after 15 seconds, the call automatically routes to your Callivaan AI Voice agent.',
    },
    {
      q: 'Does the voice agent speak natural Hindi, English, and Hinglish?',
      a: 'Yes. Callivaan is trained specifically on Indian conversational nuances and regional speech patterns. It understands bilingual code-switching (Hinglish), pure Hindi, and Indian English with high contextual accuracy and sub-400ms turn-taking latency.',
    },
    {
      q: 'How quickly are leads delivered to my WhatsApp?',
      a: 'Immediately upon call completion (under 3 seconds). Callivaan sends a structured WhatsApp alert containing the caller phone number, customer name, concise requirement summary, urgency level, and a one-tap callback button.',
    },
    {
      q: 'Is Callivaan compliant with TRAI and Indian telecom regulations?',
      a: 'Yes. Callivaan plays an initial two-party recording disclosure chime in compliance with TRAI and DoT guidelines. All call recordings are kept for an ephemeral 90-day retention period and are never used to train public foundation models.',
    },
    {
      q: 'Can I test Callivaan before purchasing a subscription?',
      a: 'Yes! Every business gets a 14-day free trial with 50 inclusive call minutes, full access to custom prompt tuning, carrier forwarding, and instant WhatsApp alerts. No credit card is required to sign up.',
    },
  ];

  const industries = [
    {
      icon: 'directions_car',
      title: 'Automotive Dealerships & Service',
      desc: 'Handles routine test drive booking inquiries, vehicle service status checks, and repair estimates during peak showroom hours.',
      stat: '64% calls saved',
    },
    {
      icon: 'apartment',
      title: 'Real Estate Builders & Brokers',
      desc: 'Collects buyer budget, preferred locality (2BHK/3BHK), and scheduling property site visits with instant broker WhatsApp dispatch.',
      stat: '3.2x faster response',
    },
    {
      icon: 'local_hospital',
      title: 'Clinics & Diagnostic Centers',
      desc: 'Assists patients with doctor OPD timings, consultation fees, test prep instructions, and appointment requests 24/7.',
      stat: 'Zero missed patients',
    },
    {
      icon: 'account_balance',
      title: 'Legal & Financial Consultancies',
      desc: 'Gathers preliminary case requirements, tax filing inquiries, and schedules consultation slots without disrupting advisory meetings.',
      stat: '100% structured intake',
    },
    {
      icon: 'shopping_bag',
      title: 'D2C Brands & Local Retailers',
      desc: 'Answers product availability, shipping status, return policy queries, and orders tracking without needing a full-time support desk.',
      stat: '24/7 night coverage',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 border-b border-outline bg-gradient-to-b from-surface via-surface to-surface-dim">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Copy & Value Proposition */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              {/* Trust Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline text-tertiary text-xs font-medium w-fit">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-on-surface font-semibold">Autonomous Inbound Call Assistant for Indian SMBs</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface tracking-tight leading-tight">
                Never Lose Another Lead to an{' '}
                <span className="text-primary underline decoration-primary-fixed decoration-4 underline-offset-4">
                  Unanswered Call
                </span>
              </h1>

              {/* Subcopy */}
              <p className="text-base sm:text-lg text-tertiary max-w-xl leading-relaxed">
                Callivaan answers your customer phone calls 24/7 with a natural Hindi and English voice agent, collects caller requirements, and delivers structured lead summaries directly to your WhatsApp with one-tap callback.
              </p>

              {/* Action Group */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  onClick={() => navigate('/auth')}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-semibold text-sm shadow-xs transition duration-150 active:scale-98 cursor-pointer"
                >
                  <span>Start 14-Day Free Trial</span>
                  <span className="material-symbols-outlined ml-2 text-[18px]">arrow_forward</span>
                </button>
                <button
                  onClick={() => navigate('/portal')}
                  className="inline-flex items-center justify-center px-5 py-3.5 rounded-lg bg-surface border border-outline hover:bg-surface-container text-on-surface font-medium text-sm transition duration-150 active:scale-98 gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">play_circle</span>
                  <span>Explore Live Dashboard</span>
                </button>
              </div>

              {/* Micro-trust note */}
              <div className="flex items-center gap-2 text-xs text-tertiary pt-1">
                <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                <span>No credit card required. Works with Jio, Airtel, Vi, or cloud virtual numbers.</span>
              </div>

              {/* Live Tabular Metric Counter Bar */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-outline">
                <div className="space-y-0.5">
                  <div className="text-xl sm:text-2xl text-on-surface font-bold font-tnums">180,000+</div>
                  <div className="text-xs text-tertiary">Calls Handled</div>
                </div>
                <div className="space-y-0.5 border-l border-outline pl-4">
                  <div className="text-xl sm:text-2xl text-primary font-bold font-tnums">&lt; 400ms</div>
                  <div className="text-xs text-tertiary">Response Latency</div>
                </div>
                <div className="space-y-0.5 border-l border-outline pl-4">
                  <div className="text-xl sm:text-2xl text-on-surface font-bold font-tnums">94%</div>
                  <div className="text-xs text-tertiary">Hinglish Accuracy</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Simulated Telephony & WhatsApp Lead Capture Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-surface rounded-xl border border-outline shadow-sm p-5 space-y-4">
                {/* Live Inbound Call Component */}
                <div className="bg-surface-dim rounded-lg border border-outline p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${simulatedCallActive ? 'bg-error animate-ping' : 'bg-muted'}`}></span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-error">
                        {simulatedCallActive ? 'Live Inbound Call' : 'Call Completed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface border border-outline text-xs text-tertiary font-tnums">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      <span>00:48</span>
                    </div>
                  </div>

                  {/* Caller Info & Waveform */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-lg text-on-surface font-semibold font-tnums">+91 98765 43210</div>
                      <div className="text-xs text-tertiary">Rajat Verma (New Customer - Delhi)</div>
                    </div>
                    {/* Animated Waveform Bars */}
                    <div className="flex items-center gap-1 h-8 px-2 py-1 bg-surface rounded border border-outline">
                      <span className="w-1 bg-primary rounded-full wave-bar-1"></span>
                      <span className="w-1 bg-primary rounded-full wave-bar-2"></span>
                      <span className="w-1 bg-primary rounded-full wave-bar-3"></span>
                      <span className="w-1 bg-primary rounded-full wave-bar-4"></span>
                      <span className="w-1 bg-primary rounded-full wave-bar-5"></span>
                      <span className="w-1 bg-primary rounded-full wave-bar-6"></span>
                    </div>
                  </div>

                  {/* Real-Time Live Transcript Preview */}
                  <div className="bg-surface rounded p-3 text-xs space-y-2 border border-outline">
                    <div className="text-tertiary">
                      <span className="font-semibold text-on-surface">Caller:</span> "Mujhe commercial property ke rates janne the Sector 62 me."
                    </div>
                    <div className="text-primary font-medium">
                      <span className="font-semibold text-primary">Callivaan AI:</span> "Namaste Rajat ji! Sector 62 commercial towers me 800 sq ft se lekar 2400 sq ft ke options available hain. Kya aap site visit plan karna chahte hain?"
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-success">security</span>
                      TRAI Two-Party Consent Chime Verified
                    </span>
                    <button
                      onClick={() => setSimulatedCallActive(!simulatedCallActive)}
                      className="text-xs text-primary font-medium hover:underline cursor-pointer"
                    >
                      {simulatedCallActive ? 'Simulate Hangup' : 'Restart Call'}
                    </button>
                  </div>
                </div>

                {/* WhatsApp Instant Lead Sync Notification Card */}
                <div className="bg-surface-container rounded-lg border border-outline p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                      </div>
                      <span className="text-xs font-bold text-on-surface">WhatsApp Lead Dispatch Hub</span>
                    </div>
                    <span className="text-[11px] text-tertiary font-tnums">Just now</span>
                  </div>

                  <div className="bg-surface rounded-md p-3 text-xs border border-outline space-y-1.5">
                    <div className="flex items-center justify-between pb-1 border-b border-outline">
                      <span className="font-bold text-on-surface">New Inbound Lead: Rajat Verma</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-container text-success border border-success/30">
                        HIGH INTENT
                      </span>
                    </div>
                    <p className="text-tertiary">
                      <strong className="text-on-surface">Interest:</strong> Commercial Office Space, Sector 62 (approx 1,200 sq ft). Budget: ₹85 Lakhs.
                    </p>
                    <p className="text-tertiary">
                      <strong className="text-on-surface">Next Action:</strong> Requested callback tomorrow at 11:30 AM for site inspection.
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href="tel:+919876543210"
                        className="flex-1 py-1.5 px-3 rounded bg-primary text-white text-center font-semibold text-xs hover:bg-primary-hover transition"
                      >
                        Call Back (+91 98765 43210)
                      </a>
                      <button
                        onClick={() => navigate('/portal')}
                        className="py-1.5 px-3 rounded border border-outline bg-surface text-on-surface text-xs font-medium hover:bg-surface-dim transition"
                      >
                        View Audio
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-STEP SETUP WORKFLOW SECTION */}
      <section className="py-16 md:py-24 border-b border-outline bg-surface" id="how-it-works">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 md:mb-16">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary-fixed text-primary border border-primary/20">
              Zero Hardware Setup
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface tracking-tight">
              Live in Less than 3 Minutes on Any Indian Phone
            </h2>
            <p className="text-base text-tertiary">
              No complex PBX hardware, no complicated SIP trunks, and no technical expertise needed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-surface-dim rounded-xl border border-outline p-6 space-y-4 hover:border-primary transition duration-150">
              <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-lg font-tnums">
                01
              </div>
              <h3 className="text-lg font-semibold text-on-surface">Set Business Voice &amp; FAQs</h3>
              <p className="text-sm text-tertiary leading-relaxed">
                Type your business operating hours, service prices, address, and greeting style. Callivaan generates a polite, fluent voice persona instantly.
              </p>
              <div className="pt-2 text-xs font-medium text-primary flex items-center gap-1 cursor-pointer" onClick={() => navigate('/agent')}>
                <span>Configure Agent Prompts</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-dim rounded-xl border border-outline p-6 space-y-4 hover:border-primary transition duration-150">
              <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-lg font-tnums">
                02
              </div>
              <h3 className="text-lg font-semibold text-on-surface">Forward Jio/Airtel/Vi Calls</h3>
              <p className="text-sm text-tertiary leading-relaxed">
                Dial the standard carrier USSD code on your mobile phone to forward unanswered or busy calls to your assigned Callivaan AI line.
              </p>
              <div className="pt-2 text-xs font-medium text-primary flex items-center gap-1 cursor-pointer" onClick={() => navigate('/telephony')}>
                <span>View Carrier USSD Codes</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-dim rounded-xl border border-outline p-6 space-y-4 hover:border-primary transition duration-150">
              <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-lg font-tnums">
                03
              </div>
              <h3 className="text-lg font-semibold text-on-surface">Receive Leads on WhatsApp</h3>
              <p className="text-sm text-tertiary leading-relaxed">
                Whenever a customer calls, Callivaan handles the conversation and immediately delivers a structured lead card with one-touch callback to your WhatsApp.
              </p>
              <div className="pt-2 text-xs font-medium text-primary flex items-center gap-1 cursor-pointer" onClick={() => navigate('/whatsapp')}>
                <span>Pair WhatsApp Number</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHATSAPP REMOTE CONTROL HUB SHOWCASE */}
      <section className="py-16 md:py-20 border-b border-outline bg-surface-dim" id="control-hub">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary-fixed text-primary border border-primary/20">
                Remote WhatsApp Control
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                Control Your Voice Agent Directly from WhatsApp Chat
              </h2>
              <p className="text-sm sm:text-base text-tertiary leading-relaxed">
                You do not need to log in to a dashboard every hour. Simply message Callivaan commands on WhatsApp to pause call handling, query daily statistics, update operating hours, or inspect call recordings.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-outline">
                  <span className="font-mono text-xs px-2 py-1 rounded bg-surface-container font-semibold text-primary">/summary</span>
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">Daily Call &amp; Lead Report</h4>
                    <p className="text-xs text-tertiary">Get an executive recap of all calls answered today, qualified leads, and pending callbacks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-outline">
                  <span className="font-mono text-xs px-2 py-1 rounded bg-surface-container font-semibold text-primary">/pause</span>
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">Instant Agent Vacation Mode</h4>
                    <p className="text-xs text-tertiary">Temporarily pause AI handling for public holidays or meetings. AI resumes upon typing /resume.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-outline">
                  <span className="font-mono text-xs px-2 py-1 rounded bg-surface-container font-semibold text-primary">/hours</span>
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">Update Store Timings On the Fly</h4>
                    <p className="text-xs text-tertiary">Send "/hours 10am to 9pm" and your voice agent updates its responses to callers in real-time.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              {/* WhatsApp Interface Mockup */}
              <div className="w-full max-w-md bg-surface rounded-2xl border border-outline shadow-md overflow-hidden">
                {/* WhatsApp Chat Header */}
                <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                      CA
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Callivaan Voice Dispatcher</div>
                      <div className="text-[11px] text-white/80">Online | Verified Business AI</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-white text-[20px]">more_vert</span>
                </div>

                {/* Chat Messages */}
                <div className="p-4 bg-[#EFEAE2] space-y-3 min-h-[320px] text-xs">
                  {/* Incoming Lead Alert */}
                  <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-xs max-w-[90%] space-y-1.5 border-l-4 border-primary">
                    <div className="text-primary font-bold text-[11px]">INBOUND CALL LEAD SUMMARY</div>
                    <div className="text-on-surface font-semibold">Customer: Sunita Sharma (+91 98112 34567)</div>
                    <div className="text-tertiary">Call Duration: 01:24 | Language: Hinglish</div>
                    <p className="text-tertiary pt-1">
                      Wants quotation for 5-seat dental clinic management software. Wants a video demo on Thursday at 4 PM.
                    </p>
                    <div className="text-right text-[10px] text-muted">14:22</div>
                  </div>

                  {/* Owner Command */}
                  <div className="ml-auto bg-[#D9FDD3] p-2.5 rounded-lg rounded-tr-none shadow-xs max-w-[70%] space-y-0.5">
                    <span className="font-mono font-semibold text-primary">/summary</span>
                    <div className="text-right text-[10px] text-muted">14:25</div>
                  </div>

                  {/* Bot Response */}
                  <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-xs max-w-[90%] space-y-1">
                    <div className="font-bold text-on-surface">Today's Performance Recap (15 Oct 2026)</div>
                    <div className="text-tertiary">Total Inbound Calls: 18</div>
                    <div className="text-tertiary">Leads Dispatched: 6 (4 High-Priority)</div>
                    <div className="text-tertiary">Missed / Dropoffs: 0</div>
                    <div className="text-success font-medium pt-1">AI Agent Status: Active &amp; Listening</div>
                    <div className="text-right text-[10px] text-muted">14:25</div>
                  </div>
                </div>

                {/* Chat Input Bar */}
                <div className="p-2.5 bg-surface-dim border-t border-outline flex items-center gap-2">
                  <div className="flex-1 bg-surface px-3 py-1.5 rounded-full border border-outline text-xs text-muted flex items-center justify-between">
                    <span>Type /command...</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRY VERTICALS */}
      <section className="py-16 md:py-24 border-b border-outline bg-surface" id="solutions">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Tailored for Fast-Paced Indian Business Verticals
            </h2>
            <p className="text-sm sm:text-base text-tertiary">
              Whether you run a regional healthcare facility or a busy property brokerage, Callivaan adapts to your domain terminology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((ind, i) => (
              <div key={i} className="p-6 rounded-xl border border-outline bg-surface-dim hover:bg-surface hover:shadow-xs transition space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">{ind.icon}</span>
                </div>
                <h3 className="text-base font-bold text-on-surface">{ind.title}</h3>
                <p className="text-sm text-tertiary leading-relaxed">{ind.desc}</p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-success">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>{ind.stat}</span>
                </div>
              </div>
            ))}

            {/* Verticals CTA Card */}
            <div className="p-6 rounded-xl border border-dashed border-primary/40 bg-primary-fixed/20 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">tune</span>
                </div>
                <h3 className="text-base font-bold text-on-surface">Custom Enterprise Persona</h3>
                <p className="text-sm text-tertiary">
                  Need custom CRM integration with Zoho, LeadSquared, or proprietary billing APIs?
                </p>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="w-full py-2 px-3 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-hover transition cursor-pointer"
              >
                Explore Team Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DIRECT ANDROID APK DOWNLOAD SECTION */}
      <section className="py-16 md:py-20 border-b border-outline bg-surface-dim" id="apk-download">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="bg-surface rounded-2xl border border-outline p-8 lg:p-12 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline text-xs text-primary font-semibold">
                  <span className="material-symbols-outlined text-[16px]">android</span>
                  <span>Direct Signed APK (Android 9.0+)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
                  Download the Official Callivaan Companion App
                </h2>
                <p className="text-sm sm:text-base text-tertiary leading-relaxed max-w-2xl">
                  Manage your voice agents on the go, toggle carrier call forwarding with 1 tap, inspect live call transcripts, and listen to TRAI-compliant audio waveforms directly from your Android phone.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a
                    href="#download"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-semibold text-sm shadow-xs transition"
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    <span>Download Callivaan v1.0.apk (18.4 MB)</span>
                  </a>
                  <button
                    onClick={() => navigate('/telephony')}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-lg border border-outline bg-surface hover:bg-surface-dim text-on-surface text-sm font-medium transition cursor-pointer"
                  >
                    <span>Carrier Forwarding Setup</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
                <div className="text-xs text-muted font-mono pt-1">
                  SHA-256: 8f4d92a10c73b5e197d2e41a6b0c9f18a24c5b369e12f0a8d7123456789abcde
                </div>
              </div>

              {/* QR Code Card */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-surface-dim rounded-xl border border-outline text-center space-y-3">
                <div className="w-36 h-36 bg-white p-2 rounded-lg border border-outline flex items-center justify-center shadow-xs">
                  {/* SVG QR Code Simulation */}
                  <svg className="w-32 h-32 text-on-surface" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" fill="currentColor" />
                    <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" fill="currentColor" />
                    <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" fill="currentColor" />
                    <rect x="40" y="10" width="15" height="15" fill="currentColor" />
                    <rect x="45" y="40" width="20" height="20" fill="currentColor" />
                    <rect x="70" y="50" width="15" height="15" fill="currentColor" />
                    <rect x="40" y="70" width="20" height="15" fill="currentColor" />
                    <rect x="70" y="75" width="25" height="20" fill="currentColor" />
                  </svg>
                </div>
                <div className="text-xs font-semibold text-on-surface">Scan to Install on Mobile</div>
                <div className="text-[11px] text-muted">Point your phone camera to download directly</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 md:py-24 border-b border-outline bg-surface">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-tertiary">
              Everything you need to know about setting up Callivaan for your Indian business phone line.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-outline bg-surface-dim overflow-hidden transition"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left font-semibold text-sm sm:text-base text-on-surface flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-container transition"
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined text-tertiary text-[20px]">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-sm text-tertiary leading-relaxed border-t border-outline/50 bg-surface">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="py-16 md:py-20 bg-primary text-white">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Ready to Capture 100% of Your Inbound Customer Leads?
          </h2>
          <p className="text-base sm:text-lg text-primary-fixed max-w-2xl mx-auto leading-relaxed">
            Join hundreds of forward-thinking Indian businesses who answer every customer call on time, day or night.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white text-primary font-bold text-sm hover:bg-surface-dim transition shadow-sm cursor-pointer"
            >
              Start 14-Day Free Trial
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-lg border border-white/40 hover:bg-white/10 text-white font-medium text-sm transition cursor-pointer"
            >
              View Pricing &amp; Plans
            </button>
          </div>
          <div className="text-xs text-primary-fixed/80 pt-2">
            No credit card required. Instant 3-minute setup. Cancel anytime with zero lock-in.
          </div>
        </div>
      </section>
    </div>
  );
};
