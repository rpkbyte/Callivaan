import React, { useState } from 'react';

interface PricingPageProps {
  navigate: (route: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ navigate }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [callsPerDay, setCallsPerDay] = useState<number>(20);
  const [avgCallDuration, setAvgCallDuration] = useState<number>(2); // in minutes

  // Calculate monthly estimates
  const totalCallsPerMonth = callsPerDay * 30;
  const totalMinutesPerMonth = totalCallsPerMonth * avgCallDuration;

  // Pricing calculations
  const isAnnual = billingCycle === 'annual';
  const businessBasePrice = isAnnual ? 1199 : 1499;
  const teamBasePrice = isAnnual ? 3199 : 3999;

  // Determine recommended plan based on slider
  let recommendedPlan = 'Business Pro';
  let estimatedMonthlyCost = businessBasePrice;
  let overageMinutes = 0;
  let overageCost = 0;

  if (totalMinutesPerMonth <= 50) {
    recommendedPlan = 'Free 14-Day Trial';
    estimatedMonthlyCost = 0;
  } else if (totalMinutesPerMonth <= 750) {
    recommendedPlan = 'Business Pro';
    if (totalMinutesPerMonth > 500) {
      overageMinutes = totalMinutesPerMonth - 500;
      overageCost = overageMinutes * 2.5;
    }
    estimatedMonthlyCost = businessBasePrice + Math.round(overageCost);
  } else {
    recommendedPlan = 'Team / Agency';
    if (totalMinutesPerMonth > 2000) {
      overageMinutes = totalMinutesPerMonth - 2000;
      overageCost = overageMinutes * 2.0;
    }
    estimatedMonthlyCost = teamBasePrice + Math.round(overageCost);
  }

  const comparisonRows = [
    { feature: 'Inclusive Inbound Call Minutes', trial: '50 mins', business: '500 mins', team: '2,000 mins' },
    { feature: 'Overage Rate (per additional minute)', trial: 'N/A', business: '₹2.50 / min', team: '₹2.00 / min' },
    { feature: 'Connected Phone Numbers', trial: '1 Number', business: '1 Number', team: '3 Numbers' },
    { feature: 'WhatsApp Lead Alert Cards', trial: 'Standard', business: 'Instant (<3 sec)', team: 'Instant + Multi-Agent' },
    { feature: 'Bilingual Voice Engine (Hinglish/Hindi/English)', trial: 'Standard', business: 'High Accuracy', team: 'Custom Domain Fine-Tuned' },
    { feature: 'Custom Business Prompt & FAQ Catalog', trial: '5 FAQs', business: 'Unlimited FAQs', team: 'Unlimited + Catalog API' },
    { feature: 'TRAI Compliant Call Audio Waveform Player', trial: '7-Day Retention', business: '90-Day Ephemeral', businessRetention: true, team: '90-Day + Secure S3 Export' },
    { feature: 'Human Operator Escalation Fallback', trial: 'Manual', business: '1-Click Call Transfer', team: 'Multi-Department Queue' },
    { feature: 'WhatsApp Command Remote Control (/summary, /pause)', trial: 'Basic', business: 'Full Command Suite', team: 'Full Suite + Webhooks' },
    { feature: 'GST Input Tax Credit Invoice (18% ITC)', trial: 'N/A', business: 'Automatic Monthly PDF', team: 'Automatic Monthly PDF' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* HEADER SECTION */}
      <section className="pt-12 pb-14 border-b border-outline bg-gradient-to-b from-surface via-surface to-surface-dim text-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-primary text-xs font-semibold mb-4 border border-primary/20">
            <span>Simple, Predictable Telephony Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface tracking-tight">
            Transparent Pricing for Growing Indian Businesses
          </h1>
          <p className="text-base sm:text-lg text-tertiary mt-3 max-w-2xl mx-auto leading-relaxed">
            No expensive setup charges. No PBX hardware contracts. Start free with 50 minutes, then scale as your business receives more calls.
          </p>

          {/* Monthly vs Annual Toggle */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-xl bg-surface-container border border-outline">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-surface text-on-surface shadow-xs'
                  : 'text-tertiary hover:text-on-surface'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-tertiary hover:text-on-surface'
              }`}
            >
              <span>Annual Billing</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                billingCycle === 'annual' ? 'bg-white text-primary' : 'bg-success-container text-success'
              }`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 3 SUBSCRIPTION TIERS CARDS */}
      <section className="py-14 sm:py-16 border-b border-outline">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* TIER 1: FREE TRIAL */}
            <div className="bg-surface rounded-2xl border border-outline p-7 flex flex-col justify-between shadow-xs hover:border-outline-variant transition">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-on-surface">14-Day Free Trial</h3>
                  <p className="text-xs text-tertiary">Ideal for testing AI call handling on your personal mobile</p>
                </div>

                <div className="pt-2">
                  <div className="text-4xl font-extrabold text-on-surface font-tnums">₹0</div>
                  <div className="text-xs text-muted">Free for 14 days • No credit card needed</div>
                </div>

                <ul className="space-y-2.5 pt-4 text-xs text-tertiary border-t border-outline">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span><strong>50 inclusive</strong> inbound call minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>1 Connected WhatsApp number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>Natural Hinglish, Hindi &amp; English AI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>Instant WhatsApp lead notifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>Carrier forwarding for Jio, Airtel &amp; Vi</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full py-3 rounded-lg border border-outline bg-surface hover:bg-surface-dim text-on-surface text-sm font-semibold transition cursor-pointer"
                >
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* TIER 2: BUSINESS PRO (HIGHLIGHTED) */}
            <div className="bg-surface rounded-2xl border-2 border-primary p-7 flex flex-col justify-between shadow-md relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-[11px] font-bold tracking-wide uppercase shadow-xs">
                Most Popular for Indian SMBs
              </div>

              <div className="space-y-4">
                <div className="space-y-1 pt-1">
                  <h3 className="text-xl font-bold text-on-surface">Business Pro</h3>
                  <p className="text-xs text-tertiary">For single-location businesses receiving 10-30 calls/day</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-on-surface font-tnums">
                      ₹{businessBasePrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-tertiary">/ month</span>
                  </div>
                  <div className="text-xs text-muted">
                    {isAnnual ? 'Billed annually (₹14,388/yr)' : 'Billed monthly via UPI AutoPay'}
                  </div>
                </div>

                <ul className="space-y-2.5 pt-4 text-xs text-tertiary border-t border-outline">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span><strong>500 inclusive</strong> inbound call minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>Affordable overage: <strong>₹2.50 / min</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>Unlimited FAQ &amp; price catalog entries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>One-tap WhatsApp callback dispatch</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>Full WhatsApp command hub (/summary, /pause)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>TRAI-compliant 90-day audio waveform player</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>GST Tax Invoice (18% ITC claimable)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-sm font-bold shadow-xs transition cursor-pointer"
                >
                  Activate Business Pro
                </button>
              </div>
            </div>

            {/* TIER 3: TEAM / AGENCY */}
            <div className="bg-surface rounded-2xl border border-outline p-7 flex flex-col justify-between shadow-xs hover:border-outline-variant transition">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-on-surface">Team / Agency</h3>
                  <p className="text-xs text-tertiary">For clinics, dealerships, and multi-staff brokerages</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-on-surface font-tnums">
                      ₹{teamBasePrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-tertiary">/ month</span>
                  </div>
                  <div className="text-xs text-muted">
                    {isAnnual ? 'Billed annually (₹38,388/yr)' : 'Billed monthly via UPI AutoPay'}
                  </div>
                </div>

                <ul className="space-y-2.5 pt-4 text-xs text-tertiary border-t border-outline">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span><strong>2,000 inclusive</strong> inbound call minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>Lowest overage: <strong>₹2.00 / min</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span><strong>Up to 3 phone numbers</strong> managed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>Live Human Operator Call Transfer routing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>Multi-Agent WhatsApp lead broadcasting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>Custom domain prompt tuning &amp; CRM webhook</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>Dedicated WhatsApp Priority Support</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full py-3 rounded-lg border border-outline bg-surface hover:bg-surface-dim text-on-surface text-sm font-semibold transition cursor-pointer"
                >
                  Choose Team Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC CALL VOLUME & OVERAGE CALCULATOR */}
      <section className="py-14 sm:py-16 bg-surface-dim border-b border-outline">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="bg-surface rounded-2xl border border-outline p-6 sm:p-10 shadow-xs space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary-fixed text-primary border border-primary/20">
                Interactive Estimate
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
                Dynamic Call Volume &amp; Cost Calculator
              </h2>
              <p className="text-xs sm:text-sm text-tertiary">
                Adjust your expected daily customer call load to see the recommended plan and total monthly cost.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
              {/* Sliders Column */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs sm:text-sm font-semibold text-on-surface">
                      Expected Customer Calls per Day
                    </label>
                    <span className="text-base font-bold text-primary font-tnums">
                      {callsPerDay} calls / day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={callsPerDay}
                    onChange={(e) => setCallsPerDay(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-muted mt-1 font-tnums">
                    <span>5 calls</span>
                    <span>50 calls</span>
                    <span>100 calls/day</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs sm:text-sm font-semibold text-on-surface">
                      Average Duration per Call
                    </label>
                    <span className="text-base font-bold text-primary font-tnums">
                      {avgCallDuration} minutes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={avgCallDuration}
                    onChange={(e) => setAvgCallDuration(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-muted mt-1 font-tnums">
                    <span>1 min</span>
                    <span>3 mins</span>
                    <span>5 mins</span>
                  </div>
                </div>

                {/* Calculation summary pills */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-surface-dim border border-outline">
                    <div className="text-[11px] text-tertiary">Monthly Calls</div>
                    <div className="text-lg font-bold text-on-surface font-tnums">
                      {totalCallsPerMonth.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-dim border border-outline">
                    <div className="text-[11px] text-tertiary">Monthly Minutes</div>
                    <div className="text-lg font-bold text-primary font-tnums">
                      {totalMinutesPerMonth.toLocaleString('en-IN')} mins
                    </div>
                  </div>
                </div>
              </div>

              {/* Result Preview Box */}
              <div className="p-6 rounded-xl bg-surface-container border border-outline space-y-4">
                <div className="text-xs font-semibold text-tertiary uppercase tracking-wider">
                  Recommended Tier For Your Business
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-on-surface">{recommendedPlan}</div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                    Optimal Fit
                  </span>
                </div>

                <div className="border-t border-outline pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-tertiary">
                    <span>Base Subscription ({billingCycle})</span>
                    <span className="font-tnums font-medium text-on-surface">
                      ₹{(recommendedPlan === 'Team / Agency' ? teamBasePrice : recommendedPlan === 'Business Pro' ? businessBasePrice : 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-tertiary">
                    <span>Estimated Overage Minutes ({overageMinutes} mins)</span>
                    <span className="font-tnums font-medium text-on-surface">
                      ₹{Math.round(overageCost).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="border-t border-outline pt-2 flex justify-between items-baseline font-bold">
                    <span className="text-sm text-on-surface">Estimated Total Monthly Cost</span>
                    <span className="text-2xl text-primary font-tnums">
                      ₹{estimatedMonthlyCost.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-tertiary"> + GST</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/auth')}
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold transition cursor-pointer"
                >
                  Start 14-Day Free Trial on this Tier
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE COMPARISON MATRIX */}
      <section className="py-14 sm:py-16 border-b border-outline">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
              Detailed Plan Feature Matrix
            </h2>
            <p className="text-xs sm:text-sm text-tertiary">
              Complete capability breakdown across all Callivaan editions.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-outline">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-surface-dim text-on-surface border-b border-outline font-semibold">
                <tr>
                  <th className="p-4 w-2/5">Platform Feature</th>
                  <th className="p-4 w-1/5">Free Trial</th>
                  <th className="p-4 w-1/5 text-primary">Business Pro</th>
                  <th className="p-4 w-1/5">Team / Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline bg-surface text-tertiary">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-dim/50 transition">
                    <td className="p-4 font-medium text-on-surface">{row.feature}</td>
                    <td className="p-4">{row.trial}</td>
                    <td className="p-4 font-semibold text-primary">{row.business}</td>
                    <td className="p-4">{row.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* INDIAN PAYMENTS & TRUST BADGES */}
      <section className="py-10 bg-surface-dim border-b border-outline">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-12 flex flex-wrap items-center justify-between gap-6 text-xs text-tertiary">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">account_balance_wallet</span>
            <span className="font-semibold text-on-surface">Supported Payments:</span>
            <span>UPI AutoPay (Google Pay, PhonePe, Paytm), Razorpay, Net Banking, Rupay, Visa &amp; Mastercard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-success">receipt_long</span>
              <span>18% GST Invoicing with ITC</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-success">lock</span>
              <span>256-Bit Encrypted Telephony</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
