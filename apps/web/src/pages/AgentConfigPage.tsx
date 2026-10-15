import React, { useState } from 'react';

interface AgentConfigPageProps {
  navigate: (route: string) => void;
}

interface FaqItem {
  q: string;
  a: string;
}

export const AgentConfigPage: React.FC<AgentConfigPageProps> = ({ navigate }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  // Form states
  const [businessName, setBusinessName] = useState('Shree Balaji Motors & Services');
  const [industry, setIndustry] = useState('Automotive Dealership & Garage');
  const [tone, setTone] = useState<'respectful' | 'friendly' | 'efficient'>('respectful');
  const [languageMode, setLanguageMode] = useState<'hinglish' | 'hindi' | 'english'>('hinglish');
  const [greetingPrompt, setGreetingPrompt] = useState(
    'Namaste! Shree Balaji Motors me aapka swagat hai. Main aapka AI service assistant hoon. Aaj main aapki kya sahayata kar sakta hoon?'
  );
  const [hours, setHours] = useState('Mon - Sat: 9:00 AM to 8:00 PM | Sunday: Closed');
  const [faqs, setFaqs] = useState<FaqItem[]>([
    {
      q: 'Standard Hatchback/Sedan General Service Cost?',
      a: 'General routine service starts at ₹1,999 which includes engine oil change, oil filter replacement, and complete 40-point vehicle inspection.',
    },
    {
      q: 'Do you provide doorstep pickup and drop in Delhi NCR?',
      a: 'Yes, free vehicle pickup and drop is available within a 10 km radius for all full-service bookings.',
    },
    {
      q: 'Emergency breakdown towing support available?',
      a: 'Yes, 24/7 emergency roadside assistance and flatbed towing is available across Delhi, Noida, and Gurugram.',
    },
  ]);
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  const [requireName, setRequireName] = useState(true);
  const [requireRequirement, setRequireRequirement] = useState(true);
  const [requireBudget, setRequireBudget] = useState(true);
  const [requireCallbackTime, setRequireCallbackTime] = useState(true);

  const [escalationNumber, setEscalationNumber] = useState('+91 98110 55555');
  const [escalationKeywords, setEscalationKeywords] = useState('accident, emergency, legal, refund, manager, escalate');

  // Simulator state
  const [testInput, setTestInput] = useState('');
  const [simulationHistory, setSimulationHistory] = useState<{ speaker: 'You' | 'AI Agent'; text: string }[]>([
    { speaker: 'AI Agent', text: 'Namaste! Shree Balaji Motors me aapka swagat hai. Main aapka AI service assistant hoon. Aaj main aapki kya sahayata kar sakta hoon?' },
  ]);

  const handleAddFaq = () => {
    if (newFaqQ.trim() && newFaqA.trim()) {
      setFaqs([...faqs, { q: newFaqQ.trim(), a: newFaqA.trim() }]);
      setNewFaqQ('');
      setNewFaqA('');
    }
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleSimulateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const userText = testInput.trim();
    setSimulationHistory((prev) => [...prev, { speaker: 'You', text: userText }]);
    setTestInput('');

    setTimeout(() => {
      let botResponse = 'Ji main aapki baat samajh gaya. Kya aap apna naam aur pasandida samay share kar sakte hain?';
      if (userText.toLowerCase().includes('service') || userText.toLowerCase().includes('rate') || userText.toLowerCase().includes('price')) {
        botResponse = 'Hamara general routine service ₹1,999 se start hota hai jisme engine oil, filter aur 40-point checkup shamil hai. Kya kal subah ka slot book karein?';
      } else if (userText.toLowerCase().includes('pickup') || userText.toLowerCase().includes('location')) {
        botResponse = 'Ji haan, 10 km ke radius me free vehicle pickup aur drop available hai.';
      } else if (userText.toLowerCase().includes('manager') || userText.toLowerCase().includes('urgent')) {
        botResponse = 'Samajh gaya. Main turant hamare Senior Manager desk (+91 98110 55555) par transfer kar raha hoon.';
      }
      setSimulationHistory((prev) => [...prev, { speaker: 'AI Agent', text: botResponse }]);
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* HEADER SECTION */}
      <section className="bg-surface border-b border-outline px-4 sm:px-6 md:px-12 py-5">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-fixed text-primary border border-primary/20 mb-1">
              <span>Persona &amp; Knowledge Management</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Voice Agent Configuration</h1>
            <p className="text-xs sm:text-sm text-tertiary">
              Fine-tune the speech tone, prompt instructions, pricing knowledge, and escalation rules for your callers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/portal')}
              className="px-3.5 py-2 rounded-lg border border-outline bg-surface text-xs font-semibold text-on-surface hover:bg-surface-dim transition cursor-pointer"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Publish Configuration</span>
            </button>
          </div>
        </div>
      </section>

      {/* SAVED TOAST ALERT */}
      {savedNotification && (
        <div className="fixed top-20 right-6 z-50 bg-success text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Voice agent prompts successfully updated and published to telephony gateway!</span>
        </div>
      )}

      {/* STEP NAVIGATION PILLS */}
      <section className="bg-surface-dim border-b border-outline px-4 sm:px-6 md:px-12 py-3 overflow-x-auto">
        <div className="w-full max-w-7xl mx-auto flex items-center gap-2">
          {[
            { step: 1, label: '1. Identity & Tone' },
            { step: 2, label: '2. Language & Greeting' },
            { step: 3, label: '3. Operating Hours & FAQs' },
            { step: 4, label: '4. Lead Qualification' },
            { step: 5, label: '5. Human Escalation' },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeStep === s.step
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface text-tertiary border border-outline hover:bg-surface-container'
              }`}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* MAIN TWO-COLUMN CONFIG & LIVE TEST SIMULATOR */}
      <section className="flex-1 px-4 sm:px-6 md:px-12 py-8">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Wizards (7 cols) */}
          <div className="lg:col-span-7 bg-surface rounded-xl border border-outline p-6 space-y-6 shadow-xs">
            {/* STEP 1: IDENTITY & TONE */}
            {activeStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-on-surface">Step 1: Business Identity &amp; Voice Tone</h3>
                  <p className="text-xs text-tertiary">Define how your assistant identifies itself to callers.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Registered Business / Brand Name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Business Domain / Industry Category
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary"
                    >
                      <option>Automotive Dealership &amp; Garage</option>
                      <option>Real Estate Brokerage &amp; Construction</option>
                      <option>Medical Clinic &amp; Diagnostic Center</option>
                      <option>Legal &amp; Chartered Accountant Advisory</option>
                      <option>D2C Ecommerce &amp; Retail Store</option>
                      <option>Coaching Institute &amp; Education</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-2">
                      Voice Persona Tone
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'respectful', title: 'Respectful (Namaste ji)', desc: 'Formal, polite, high Indian cultural warmth' },
                        { id: 'friendly', title: 'Warm & Friendly', desc: 'Approachable, modern conversational style' },
                        { id: 'efficient', title: 'Direct & Rapid', desc: 'Short turns, prompt lead intake' },
                      ].map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setTone(t.id as any)}
                          className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                            tone === t.id
                              ? 'border-primary bg-primary-fixed/20'
                              : 'border-outline hover:bg-surface-dim'
                          }`}
                        >
                          <div className="font-bold text-xs text-on-surface">{t.title}</div>
                          <div className="text-[11px] text-tertiary mt-0.5">{t.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition cursor-pointer"
                  >
                    Proceed to Step 2: Language &amp; Greeting
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: LANGUAGE & GREETING */}
            {activeStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-on-surface">Step 2: Language Preference &amp; Welcome Greeting</h3>
                  <p className="text-xs text-tertiary">Select how your AI handles bilingual Indian code-switching.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-2">
                      Primary Language Mode
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'hinglish', name: 'Hinglish (Recommended)', desc: 'Natural mix of Hindi & English words' },
                        { id: 'hindi', name: 'Pure Hindi', desc: 'Shuddh Hindi vocabulary with polite honorifics' },
                        { id: 'english', name: 'Indian English', desc: 'Clear Indian English pronunciation' },
                      ].map((lm) => (
                        <div
                          key={lm.id}
                          onClick={() => setLanguageMode(lm.id as any)}
                          className={`p-3 rounded-lg border cursor-pointer transition ${
                            languageMode === lm.id
                              ? 'border-primary bg-primary-fixed/20'
                              : 'border-outline hover:bg-surface-dim'
                          }`}
                        >
                          <div className="font-bold text-xs text-on-surface">{lm.name}</div>
                          <div className="text-[11px] text-tertiary mt-0.5">{lm.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-on-surface">
                        Initial Welcome Greeting (Spoken when customer calls)
                      </label>
                      <span className="text-[11px] text-muted font-tnums">{greetingPrompt.length} chars</span>
                    </div>
                    <textarea
                      rows={4}
                      value={greetingPrompt}
                      onChange={(e) => setGreetingPrompt(e.target.value)}
                      className="w-full p-3 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary leading-relaxed"
                    />
                    <div className="text-[11px] text-muted mt-1">
                      The agent plays the TRAI recording chime first, then immediately speaks this greeting.
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    onClick={() => setActiveStep(1)}
                    className="px-3 py-1.5 rounded-lg border border-outline text-xs text-tertiary hover:bg-surface-dim transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition cursor-pointer"
                  >
                    Proceed to Step 3: Hours &amp; FAQs
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: OPERATING HOURS & FAQS */}
            {activeStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-on-surface">Step 3: Operating Hours &amp; Knowledge Catalog</h3>
                  <p className="text-xs text-tertiary">Teach the AI agent your service costs, address, and timings.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Store / Clinic Operating Hours
                    </label>
                    <input
                      type="text"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-on-surface">
                      FAQ &amp; Pricing Knowledge Catalog ({faqs.length} entries)
                    </label>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {faqs.map((faq, i) => (
                        <div key={i} className="p-3 rounded-lg border border-outline bg-surface-dim text-xs space-y-1 relative group">
                          <button
                            onClick={() => handleRemoveFaq(i)}
                            className="absolute top-2 right-2 text-tertiary hover:text-error transition"
                            title="Delete FAQ"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                          <div className="font-bold text-on-surface pr-6">{faq.q}</div>
                          <div className="text-tertiary">{faq.a}</div>
                        </div>
                      ))}
                    </div>

                    {/* Add FAQ Sub-form */}
                    <div className="p-3 rounded-lg border border-dashed border-outline bg-surface space-y-2">
                      <div className="text-xs font-semibold text-primary">Add Knowledge Question &amp; Answer</div>
                      <input
                        type="text"
                        placeholder="e.g. Consultation fee / Rate per sq ft?"
                        value={newFaqQ}
                        onChange={(e) => setNewFaqQ(e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-outline bg-surface text-xs"
                      />
                      <textarea
                        rows={2}
                        placeholder="e.g. Consultation is ₹800. Online payment accepted via UPI."
                        value={newFaqA}
                        onChange={(e) => setNewFaqA(e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-outline bg-surface text-xs"
                      />
                      <button
                        onClick={handleAddFaq}
                        className="px-3 py-1.5 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition cursor-pointer"
                      >
                        + Add to Knowledge Catalog
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-3 py-1.5 rounded-lg border border-outline text-xs text-tertiary hover:bg-surface-dim transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveStep(4)}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition cursor-pointer"
                  >
                    Proceed to Step 4: Lead Qualification
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: LEAD QUALIFICATION */}
            {activeStep === 4 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-on-surface">Step 4: Lead Qualification Information Capture</h3>
                  <p className="text-xs text-tertiary">Select mandatory questions the agent asks before ending the call.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Caller Full Name', desc: 'Ask caller name politely for greeting and WhatsApp contact creation', val: requireName, setVal: setRequireName },
                    { label: 'Specific Requirement / Inquiry', desc: 'Identify car model, property type, or medical ailment', val: requireRequirement, setVal: setRequireRequirement },
                    { label: 'Budget / Price Expectations', desc: 'Capture customer spending range to calculate lead quality score', val: requireBudget, setVal: setRequireBudget },
                    { label: 'Preferred Callback Window', desc: 'Ask whether morning, afternoon, or evening callback is suitable', val: requireCallbackTime, setVal: setRequireCallbackTime },
                  ].map((field, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-outline bg-surface-dim flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-on-surface">{field.label}</div>
                        <div className="text-[11px] text-tertiary">{field.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={field.val}
                        onChange={(e) => field.setVal(e.target.checked)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    onClick={() => setActiveStep(3)}
                    className="px-3 py-1.5 rounded-lg border border-outline text-xs text-tertiary hover:bg-surface-dim transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveStep(5)}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition cursor-pointer"
                  >
                    Proceed to Step 5: Human Escalation
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: HUMAN ESCALATION */}
            {activeStep === 5 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-on-surface">Step 5: Operator Fallback &amp; Human Transfer</h3>
                  <p className="text-xs text-tertiary">Configure live call bridging to a human phone number when required.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Emergency Live Transfer Phone Number
                    </label>
                    <input
                      type="text"
                      value={escalationNumber}
                      onChange={(e) => setEscalationNumber(e.target.value)}
                      placeholder="+91 98XXX XXXXX"
                      className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs text-on-surface font-mono focus:outline-primary"
                    />
                    <div className="text-[11px] text-muted mt-1">
                      When caller insists on speaking to a manager, Callivaan initiates carrier bridging to this number.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Trigger Keywords for Automatic Transfer (comma separated)
                    </label>
                    <textarea
                      rows={3}
                      value={escalationKeywords}
                      onChange={(e) => setEscalationKeywords(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-outline bg-surface text-xs text-on-surface font-mono focus:outline-primary"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    onClick={() => setActiveStep(4)}
                    className="px-3 py-1.5 rounded-lg border border-outline text-xs text-tertiary hover:bg-surface-dim transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Save &amp; Activate Agent</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Interactive Browser Simulator (5 cols) */}
          <div className="lg:col-span-5 bg-surface rounded-xl border border-outline p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-outline">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></span>
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Live Browser Call Simulator
                </span>
              </div>
              <span className="text-[11px] text-muted">Test in real-time</span>
            </div>

            {/* Simulator Chat Transcript Window */}
            <div className="bg-surface-dim rounded-lg border border-outline p-3.5 space-y-3 min-h-[320px] max-h-[380px] overflow-y-auto text-xs">
              {simulationHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg leading-relaxed ${
                    msg.speaker === 'You'
                      ? 'ml-auto bg-primary text-white max-w-[85%]'
                      : 'mr-auto bg-surface border border-outline text-on-surface max-w-[85%]'
                  }`}
                >
                  <div className="text-[10px] font-semibold opacity-80 mb-0.5">{msg.speaker}</div>
                  <div>{msg.text}</div>
                </div>
              ))}
            </div>

            {/* Simulator Input Form */}
            <form onSubmit={handleSimulateMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Type customer question (e.g., service rate?)..."
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary placeholder:text-muted"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition cursor-pointer"
              >
                Send
              </button>
            </form>

            {/* WhatsApp Remote Control Cheat Sheet */}
            <div className="p-3 rounded-lg bg-surface-container border border-outline space-y-2 text-xs">
              <div className="font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-success text-[16px]">chat</span>
                <span>WhatsApp Remote Commands</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-tertiary">
                <div className="p-1.5 bg-surface rounded border border-outline">
                  <span className="text-primary font-bold">/hours 10am-8pm</span>
                </div>
                <div className="p-1.5 bg-surface rounded border border-outline">
                  <span className="text-primary font-bold">/pause</span>
                </div>
                <div className="p-1.5 bg-surface rounded border border-outline">
                  <span className="text-primary font-bold">/resume</span>
                </div>
                <div className="p-1.5 bg-surface rounded border border-outline">
                  <span className="text-primary font-bold">/summary</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
