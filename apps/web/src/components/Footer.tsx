import React from 'react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const handleNav = (route: string) => {
    navigate(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-surface-dim border-t border-outline text-tertiary text-sm mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Regulatory Column */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => handleNav('/')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white shadow-xs">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <rect x="3" y="7" width="2.5" height="10" rx="1.25" />
                  <rect x="7.5" y="3" width="2.5" height="18" rx="1.25" />
                  <rect x="12" y="5" width="2.5" height="14" rx="1.25" />
                  <rect x="16.5" y="2" width="2.5" height="20" rx="1.25" />
                  <rect x="21" y="6" width="2.5" height="12" rx="1.25" />
                </svg>
              </span>
              <span className="font-bold text-xl tracking-tight text-on-surface">Callivaan</span>
            </div>
            <p className="text-sm text-tertiary leading-relaxed max-w-md">
              Autonomous AI Inbound Voice Telephony &amp; WhatsApp Assistant engineered for Indian enterprises, clinics, dealerships, and fast-growing small businesses.
            </p>
            
            {/* Regulatory Badge */}
            <div className="p-3 rounded-lg bg-surface border border-outline space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>TRAI &amp; DoT Telephony Compliant</span>
              </div>
              <p className="text-xs text-muted">
                Meets Indian Telecom Regulatory guidelines with two-party recording consent chime, 90-day ephemeral retention, and zero model training on caller voice data.
              </p>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">Product &amp; Setup</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => handleNav('/')} className="hover:text-primary transition">
                  Overview &amp; Features
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/portal')} className="hover:text-primary transition">
                  Inbound Call Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/agent')} className="hover:text-primary transition">
                  Voice Agent Persona Setup
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/telephony')} className="hover:text-primary transition">
                  Carrier Forwarding Guide
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/whatsapp')} className="hover:text-primary transition">
                  WhatsApp Dispatch Hub
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/pricing')} className="hover:text-primary transition">
                  Pricing &amp; Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Telecom Carriers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">Carrier USSD</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                <span>Reliance Jio (*401*)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                <span>Bharti Airtel (**61*)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                <span>Vodafone Idea Vi (**67*)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                <span>BSNL Mobile (**61*)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>Virtual Cloud DID</span>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">Legal &amp; Trust</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => handleNav('/legal')} className="hover:text-primary transition">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/legal')} className="hover:text-primary transition">
                  Privacy Policy &amp; Audio Consent
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/legal')} className="hover:text-primary transition">
                  TRAI Telecom Compliance
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/legal')} className="hover:text-primary transition">
                  Data Retention &amp; PII Redaction
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/legal')} className="hover:text-primary transition">
                  Cancellation &amp; Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/legal')} className="hover:text-primary transition">
                  Grievance Officer
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-outline flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© 2026 Callivaan Technologies Pvt. Ltd. Bengaluru, Karnataka, India. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-success">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              All Telephony Gateways Operational
            </span>
            <span>Made for Indian Businesses</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
