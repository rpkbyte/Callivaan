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

  const isAnnual = billingCycle === 'annual';
  const businessBasePrice = isAnnual ? 1199 : 1499;
  const teamBasePrice = isAnnual ? 3199 : 3999;

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
    { feature: 'TRAI Compliant Call Audio Waveform Player', trial: '7-Day Retention', business: '90-Day Ephemeral', team: '90-Day + Secure S3 Export' },
    { feature: 'Human Operator Escalation Fallback', trial: 'Manual', business: '1-Click Call Transfer', team: 'Multi-Department Queue' },
    { feature: 'WhatsApp Command Remote Control (/summary, /pause)', trial: 'Basic', business: 'Full Command Suite', team: 'Full Suite + Webhooks' },
    { feature: 'GST Input Tax Credit Invoice (18% ITC)', trial: 'N/A', business: 'Automatic Monthly PDF', team: 'Automatic Monthly PDF' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* HEADER SECTION - Clean, No Eyebrows */}
      <section className="pt-14 pb-12 border-b border-outline bg-surface-dim">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight">
            Simple, predictable pricing.
          </h1>
          <p className="text-sm sm:text-base text-tertiary max-w-xl mx-auto">
            All plans include standard Indian carrier forwarding, Hinglish speech recognition, and instant WhatsApp delivery.
          </p>

          {/* Simple Tab Switcher */}
          <div className="pt-4 inline-flex items-center p-1 rounded-md bg-surface border border-outline">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors duration-100 ${
                billingCycle === 'monthly'
                  ? 'bg-surface-container text-on-surface font-semibold'
                  : 'text-tertiary hover:text-on-surface'
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors duration-100 ${
                billingCycle === 'annual'
                  ? 'bg-surface-container text-on-surface font-semibold'
                  : 'text-tertiary hover:text-on-surface'
              }`}
            >
              Annual billing (20% off)
            </button>
          </div>
        </div>
      </section>

      {/* 3 SUBSCRIPTION TIERS CARDS */}
      <section className="py-12 border-b border-outline">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* TIER 1: FREE TRIAL */}
            <div className="border border-outline rounded-lg p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-on-surface">Free Trial</h3>
                  <p className="text-xs text-tertiary">14 days for testing on your personal phone</p>
                </div>

                <div>
                  <div className="text-3xl font-semibold text-on-surface font-tnums">₹0</div>
                  <div className="text-xs text-muted mt-0.5">Free for 14 days &bull; No card required</div>
                </div>

                <ul className="space-y-2 pt-4 text-xs text-tertiary border-t border-outline">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    <span>50 inclusive call minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    <span>1 Connected WhatsApp number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    <span>Hinglish, Hindi and English voice engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    <span>Carrier forwarding for Jio, Airtel, Vi</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => navigate('/auth')}
                className="w-full py-2 rounded-md border border-outline text-xs font-medium text-on-surface hover:bg-surface-dim transition-colors duration-100"
              >
                Start free trial
              </button>
            </div>

            {/* TIER 2: BUSINESS PRO */}
            <div className="border-2 border-primary rounded-lg p-6 flex flex-col justify-between space-y-6 bg-surface">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-on-surface">Business Pro</h3>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-primary-subtle text-primary font-medium">
                      Most popular
                    </span>
                  </div>
                  <p className="text-xs text-tertiary">For businesses receiving 10–30 calls/day</p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-on-surface font-tnums">
                      ₹{businessBasePrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-tertiary">/ month</span>
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {isAnnual ? 'Billed annually (₹14,388/yr)' : 'Billed monthly via UPI / Card'}
                  </div>
                </div>

                <ul className="space-y-2 pt-4 text-xs text-tertiary border-t border-outline">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    <span>500 inclusive call minutes (₹2.50/min overage)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    <span>Unlimited FAQ &amp; price catalog entries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    <span>One-tap WhatsApp callback dispatch</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    <span>TRAI 90-day ephemeral audio retention</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    <span>GST Tax Invoice (18% ITC claimable)</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => navigate('/auth')}
                className="w-full py-2 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors duration-100"
              >
                Activate Business Pro
              </button>
            </div>

            {/* TIER 3: TEAM / AGENCY */}
            <div className="border border-outline rounded-lg p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-on-surface">Team / Agency</h3>
                  <p className="text-xs text-tertiary">For clinics, dealerships, and multi-staff brokerages</p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-on-surface font-tnums">
                      ₹{teamBasePrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-tertiary">/ month</span>
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {isAnnual ? 'Billed annually (₹38,388/yr)' : 'Billed monthly via UPI / Card'}
                  </div>
                </div>

                <ul className="space-y-2 pt-4 text-xs text-tertiary border-t border-outline">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    <span>2,000 inclusive minutes (₹2.00/min overage)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    <span>Up to 3 forwarded phone numbers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    <span>Human operator call transfer queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    <span>Multi-agent WhatsApp broadcasting</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => navigate('/auth')}
                className="w-full py-2 rounded-md border border-outline text-xs font-medium text-on-surface hover:bg-surface-dim transition-colors duration-100"
              >
                Choose Team Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC CALL VOLUME ESTIMATOR */}
      <section className="py-12 bg-surface-dim border-b border-outline">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-on-surface">
              Call volume estimator
            </h2>
            <p className="text-xs text-tertiary">
              Adjust expected calls to check monthly minutes and costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start bg-surface p-6 rounded-lg border border-outline">
            {/* Sliders */}
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-medium text-on-surface mb-1.5">
                  <span>Calls per day</span>
                  <span className="font-mono text-primary font-semibold">{callsPerDay} calls</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={callsPerDay}
                  onChange={(e) => setCallsPerDay(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-surface-container rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-on-surface mb-1.5">
                  <span>Average duration</span>
                  <span className="font-mono text-primary font-semibold">{avgCallDuration} minutes</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={avgCallDuration}
                  onChange={(e) => setAvgCallDuration(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-surface-container rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded border border-outline bg-surface-dim">
                  <div className="text-tertiary">Monthly calls</div>
                  <div className="text-base font-semibold text-on-surface font-tnums">
                    {totalCallsPerMonth.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 rounded border border-outline bg-surface-dim">
                  <div className="text-tertiary">Monthly minutes</div>
                  <div className="text-base font-semibold text-primary font-tnums">
                    {totalMinutesPerMonth.toLocaleString('en-IN')} mins
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="p-4 rounded border border-outline bg-surface-dim space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-tertiary">Recommended tier:</span>
                <span className="font-semibold text-on-surface">{recommendedPlan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-tertiary">Base price:</span>
                <span className="font-mono text-on-surface">
                  ₹{(recommendedPlan === 'Team / Agency' ? teamBasePrice : recommendedPlan === 'Business Pro' ? businessBasePrice : 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-tertiary">Overage ({overageMinutes} mins):</span>
                <span className="font-mono text-on-surface">₹{Math.round(overageCost).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-outline pt-2 flex items-baseline justify-between font-semibold">
                <span>Total monthly estimate:</span>
                <span className="text-xl text-primary font-tnums">
                  ₹{estimatedMonthlyCost.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-tertiary"> + GST</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE COMPARISON TABLE - Clean 1px Borders, No Zebra Stripes */}
      <section className="py-12 border-b border-outline">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-4">
          <h2 className="text-lg font-semibold text-on-surface">
            Feature breakdown
          </h2>

          <div className="overflow-x-auto border border-outline rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-dim text-on-surface border-b border-outline font-semibold">
                <tr>
                  <th className="p-3 w-2/5">Feature</th>
                  <th className="p-3 w-1/5">Free Trial</th>
                  <th className="p-3 w-1/5 text-primary">Business Pro</th>
                  <th className="p-3 w-1/5">Team / Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline bg-surface text-tertiary">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-dim/40 transition-colors duration-100">
                    <td className="p-3 font-medium text-on-surface">{row.feature}</td>
                    <td className="p-3">{row.trial}</td>
                    <td className="p-3 font-medium text-primary">{row.business}</td>
                    <td className="p-3">{row.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
