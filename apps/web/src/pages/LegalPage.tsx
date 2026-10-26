import React, { useState } from 'react';

interface LegalPageProps {
  navigate: (route: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ navigate }) => {
  const [activeSection, setActiveSection] = useState<'terms' | 'privacy' | 'trai' | 'retention' | 'refunds' | 'grievance'>('trai');

  const navItems = [
    { id: 'trai', label: 'TRAI Telecom Compliance' },
    { id: 'privacy', label: 'Privacy & Audio Consent' },
    { id: 'retention', label: '90-Day Ephemeral Retention' },
    { id: 'terms', label: 'Terms of Service' },
    { id: 'refunds', label: 'UPI AutoPay & Refund Policy' },
    { id: 'grievance', label: 'Grievance Redressal Officer' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* HEADER SECTION */}
      <section className="bg-surface border-b border-outline px-4 sm:px-6 md:px-12 py-8">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-fixed text-primary border border-primary/20">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Regulatory &amp; Compliance Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
              Legal, Privacy &amp; Telecom Compliance
            </h1>
            <p className="text-xs sm:text-sm text-tertiary max-w-2xl">
              Strictly engineered in compliance with Telecom Regulatory Authority of India (TRAI), DoT regulations, and India's Digital Personal Data Protection (DPDP) Act.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-lg border border-outline bg-surface text-xs font-semibold text-on-surface hover:bg-surface-dim transition flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print Policy</span>
            </button>
            <button
              onClick={() => navigate('/portal')}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* TWO-COLUMN POLICY LAYOUT */}
      <section className="flex-1 px-4 sm:px-6 md:px-12 py-8">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sticky Left Navigation (4 cols) */}
          <div className="lg:col-span-4 bg-surface rounded-xl border border-outline p-4 shadow-xs space-y-2 sticky top-20">
            <div className="text-xs font-semibold text-muted px-3 py-1">
              Table of Contents
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                  activeSection === item.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-tertiary hover:bg-surface-dim hover:text-on-surface'
                }`}
              >
                <span>{item.label}</span>
                <span className="material-symbols-outlined text-[16px]">
                  {activeSection === item.id ? 'check' : 'chevron_right'}
                </span>
              </button>
            ))}

            <div className="pt-4 border-t border-outline px-3 space-y-2">
              <div className="text-[11px] font-bold text-on-surface">Compliance Certifications</div>
              <div className="text-[11px] text-tertiary space-y-1">
                <div>• TRAI 2-Party Consent Chime Verified</div>
                <div>• Zero Audio Training on Caller PII</div>
                <div>• 256-Bit TLS 1.3 &amp; AES In-Flight Encryption</div>
                <div>• Digital Personal Data Protection (DPDP) Aligned</div>
              </div>
            </div>
          </div>

          {/* Right Column: Policy Document Content (8 cols) */}
          <div className="lg:col-span-8 bg-surface rounded-xl border border-outline p-6 sm:p-8 shadow-xs space-y-8 leading-relaxed text-sm text-tertiary">
            {/* TRAI SECTION */}
            {activeSection === 'trai' && (
              <div className="space-y-4">
                <div className="border-b border-outline pb-4">
                  <h2 className="text-xl font-bold text-on-surface">TRAI &amp; DoT Telephony Regulations</h2>
                  <div className="text-xs text-muted mt-1">Last Updated: October 2026</div>
                </div>

                <div className="p-4 rounded-xl bg-surface-dim border border-outline space-y-2 text-xs">
                  <div className="font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">gavel</span>
                    <span>Regulatory Mandate Disclosure</span>
                  </div>
                  <p>
                    Callivaan operates under the guidelines set forth by the Telecom Regulatory Authority of India (TRAI) and the Department of Telecommunications (DoT) governing automated interactive voice response systems and artificial intelligence intermediaries.
                  </p>
                </div>

                <h3 className="text-base font-bold text-on-surface">1. Two-Party Recording Consent</h3>
                <p>
                  Every call handled by Callivaan plays an initial, audible, non-skippable acoustic disclosure informing the caller that the conversation is answered by an artificial intelligence telephony assistant and may be recorded for service records and quality verification.
                </p>

                <h3 className="text-base font-bold text-on-surface">2. Human Escalation Right</h3>
                <p>
                  Callers retain the unconditional right to request an immediate transfer to a human representative. When such intent is detected, Callivaan automatically bridges the call to the subscriber's designated operator number or logs an urgent priority callback request.
                </p>

                <h3 className="text-base font-bold text-on-surface">3. Prohibition of Unsolicited Commercial Calls (UCC)</h3>
                <p>
                  Callivaan is strictly an <strong>INBOUND</strong> call assistant platform. We do not provide automated cold-calling, robodialing, or mass outbound telemarketing tools that violate TRAI UCC regulations or the National Customer Preference Register (NCPR / DND).
                </p>
              </div>
            )}

            {/* PRIVACY & CONSENT */}
            {activeSection === 'privacy' && (
              <div className="space-y-4">
                <div className="border-b border-outline pb-4">
                  <h2 className="text-xl font-bold text-on-surface">Privacy Policy &amp; Audio Processing</h2>
                  <div className="text-xs text-muted mt-1">DPDP Act (India) Compliance</div>
                </div>

                <h3 className="text-base font-bold text-on-surface">1. Zero Model Training on Customer Audio</h3>
                <p>
                  We guarantee that raw caller voice audio recordings, transcript logs, and customer personal phone numbers are <strong>NEVER used to train, fine-tune, or improve public foundation models</strong>. Voice processing is strictly executed in isolated, tenant-partitioned execution enclaves.
                </p>

                <h3 className="text-base font-bold text-on-surface">2. Automated PII Redaction</h3>
                <p>
                  Inbound voice transcripts automatically detect and redact sensitive personal identifiers, including Aadhaar numbers, Permanent Account Numbers (PAN), credit/debit card numbers, UPI PINs, and passwords, before logs are saved or dispatched to WhatsApp.
                </p>

                <h3 className="text-base font-bold text-on-surface">3. Data Residency within India</h3>
                <p>
                  All audio processing pipelines, PostgreSQL databases, and WhatsApp dispatch webhooks are hosted in cloud data centers located within the Republic of India (Mumbai and Bengaluru regions) in compliance with national data localization norms.
                </p>
              </div>
            )}

            {/* RETENTION */}
            {activeSection === 'retention' && (
              <div className="space-y-4">
                <div className="border-b border-outline pb-4">
                  <h2 className="text-xl font-bold text-on-surface">90-Day Ephemeral Data Retention</h2>
                  <div className="text-xs text-muted mt-1">Automatic Deletion Policy</div>
                </div>

                <p>
                  To prevent unauthorized data accumulation and protect caller privacy, Callivaan enforces an automated 90-day ephemeral retention policy across all enterprise subscriptions:
                </p>

                <ul className="list-disc pl-5 space-y-2 text-xs">
                  <li>
                    <strong>Raw Call Audio Recordings:</strong> Automatically and permanently purged from cloud storage servers exactly 90 days following call completion.
                  </li>
                  <li>
                    <strong>Turn-by-Turn Transcripts:</strong> Redacted metadata (caller number, duration, lead intent) is retained for business billing verification, while detailed acoustic models are cleared.
                  </li>
                  <li>
                    <strong>Early Deletion Requests:</strong> Subscribers can purge any specific customer call recording at any moment from the Customer Portal with 1 click.
                  </li>
                </ul>
              </div>
            )}

            {/* TERMS */}
            {activeSection === 'terms' && (
              <div className="space-y-4">
                <div className="border-b border-outline pb-4">
                  <h2 className="text-xl font-bold text-on-surface">Terms of Service</h2>
                  <div className="text-xs text-muted mt-1">Callivaan Platform Terms</div>
                </div>

                <p>
                  By connecting your mobile number, dialing carrier USSD forwarding codes, or subscribing to Callivaan, you enter into a legally binding agreement with Callivaan Technologies Pvt. Ltd.
                </p>

                <h3 className="text-base font-bold text-on-surface">1. Permitted Use</h3>
                <p>
                  Callivaan is licensed solely for legitimate business call assistance, lead qualification, appointment booking, and customer inquiry handling. Any use for fraudulent impersonation, harassment, or unlawful surveillance results in immediate account termination.
                </p>

                <h3 className="text-base font-bold text-on-surface">2. Carrier Interconnect Availability</h3>
                <p>
                  Callivaan provides connectivity to Indian telecom operators (Jio, Airtel, Vi, BSNL) via standard SIP gateways. While our systems maintain 99.98% server uptime, underlying carrier network outages or USSD forwarding delays remain subject to carrier performance.
                </p>
              </div>
            )}

            {/* REFUNDS & AUTOPAY */}
            {activeSection === 'refunds' && (
              <div className="space-y-4">
                <div className="border-b border-outline pb-4">
                  <h2 className="text-xl font-bold text-on-surface">UPI AutoPay &amp; Refund Policy</h2>
                  <div className="text-xs text-muted mt-1">Transparent Billing Guidelines</div>
                </div>

                <p>
                  We believe in fair, predictable business billing without hidden clauses:
                </p>

                <h3 className="text-base font-bold text-on-surface">1. 14-Day Free Trial</h3>
                <p>
                  New business signups receive a 14-day free trial with 50 inclusive call minutes. No credit card or pre-authorization is required to start.
                </p>

                <h3 className="text-base font-bold text-on-surface">2. Cancellation &amp; Pause Anytime</h3>
                <p>
                  You can pause or cancel your subscription at any time via the Customer Portal or by messaging <code>/pause</code> on WhatsApp. UPI AutoPay mandates can be cancelled instantly directly from your PhonePe, Google Pay, or Paytm application with zero lock-in penalty.
                </p>

                <h3 className="text-base font-bold text-on-surface">3. Pro-Rata Refunds for System Downtime</h3>
                <p>
                  If Callivaan experiences verifiable service unavailability exceeding 2 consecutive hours during business hours, eligible subscribers receive proportional credit adjustments on their next billing cycle.
                </p>
              </div>
            )}

            {/* GRIEVANCE OFFICER */}
            {activeSection === 'grievance' && (
              <div className="space-y-4">
                <div className="border-b border-outline pb-4">
                  <h2 className="text-xl font-bold text-on-surface">Grievance Redressal Officer</h2>
                  <div className="text-xs text-muted mt-1">Rule 3(11) of Information Technology Rules</div>
                </div>

                <p>
                  In accordance with the Indian Information Technology Act, 2000 and the Digital Personal Data Protection Act, the name and contact details of the Grievance Officer are provided below:
                </p>

                <div className="p-4 rounded-xl bg-surface-dim border border-outline space-y-1.5 text-xs text-on-surface">
                  <div className="font-bold text-sm">Grievance Officer: Mr. Alok Narayan</div>
                  <div>Designation: Head of Regulatory &amp; Telephony Compliance</div>
                  <div>Callivaan Technologies Pvt. Ltd.</div>
                  <div>Indiranagar 100ft Road, Bengaluru, Karnataka - 560038, India</div>
                  <div>Email: <a href="mailto:grievance@callivaan.com" className="text-primary hover:underline">grievance@callivaan.com</a></div>
                  <div>Response Timeline: Acknowledgement within 24 hours; resolution within 15 working days.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
