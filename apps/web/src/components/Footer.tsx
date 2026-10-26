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
    <footer className="bg-surface border-t border-outline text-tertiary text-xs mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Regulatory */}
          <div className="space-y-3 md:col-span-1">
            <div 
              onClick={() => handleNav('/')}
              className="flex items-center gap-2 cursor-pointer select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNav('/'); }}
            >
              <span className="flex items-center justify-center w-6 h-6 rounded bg-primary text-white">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <rect x="3" y="7" width="2" height="10" rx="1" />
                  <rect x="7.5" y="3" width="2" height="18" rx="1" />
                  <rect x="12" y="5" width="2" height="14" rx="1" />
                  <rect x="16.5" y="2" width="2" height="20" rx="1" />
                  <rect x="21" y="6" width="2" height="12" rx="1" />
                </svg>
              </span>
              <span className="font-semibold text-sm text-on-surface">Callivaan</span>
            </div>
            <p className="text-tertiary leading-relaxed text-xs">
              Inbound voice agent and telephony forwarding platform for Indian small businesses.
            </p>
            <div className="pt-1 text-muted text-[11px]">
              Compliant with TRAI two-party recording disclosure and ephemeral 90-day retention guidelines.
            </div>
          </div>

          {/* Product */}
          <div className="space-y-2.5">
            <div className="font-medium text-on-surface">Product</div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => handleNav('/')} className="hover:text-on-surface transition-colors duration-100">
                  Overview
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/pricing')} className="hover:text-on-surface transition-colors duration-100">
                  Pricing &amp; calculator
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/portal')} className="hover:text-on-surface transition-colors duration-100">
                  Call dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Carrier Forwarding */}
          <div className="space-y-2.5">
            <div className="font-medium text-on-surface">Carriers</div>
            <ul className="space-y-1.5 text-xs text-tertiary">
              <li>Reliance Jio (*401*)</li>
              <li>Bharti Airtel (**61*)</li>
              <li>Vodafone Idea (**67*)</li>
              <li>BSNL Mobile (**61*)</li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-2.5">
            <div className="font-medium text-on-surface">Compliance &amp; Trust</div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => handleNav('/legal')} className="hover:text-on-surface transition-colors duration-100">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/legal')} className="hover:text-on-surface transition-colors duration-100">
                  Privacy Policy &amp; Consent
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/legal')} className="hover:text-on-surface transition-colors duration-100">
                  TRAI Telephony Rules
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-outline flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
          <div>&copy; 2026 Callivaan Technologies Pvt. Ltd. Bengaluru, India.</div>
          <div>All Indian telephony routes active.</div>
        </div>
      </div>
    </footer>
  );
};
