import React, { useState } from 'react';

interface AuthPageProps {
  navigate: (route: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ navigate }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('register');
  const [phone, setPhone] = useState('98100 23456');
  const [businessName, setBusinessName] = useState('Shree Balaji Enterprises');
  const [city, setCity] = useState('Delhi NCR');
  const [industry, setIndustry] = useState('Automotive Dealership & Garage');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [optInWhatsApp, setOptInWhatsApp] = useState(true);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length >= 10) {
      setOtpStep(true);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful login and go to portal
    navigate('/portal');
  };

  const handleDemoSignIn = () => {
    navigate('/portal');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4 sm:px-6 md:px-12">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Brand Value Proposition & Telephony Waveform */}
        <div className="lg:col-span-6 space-y-6 lg:pr-8">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group w-fit"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white shadow-xs">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <rect x="3" y="7" width="2.5" height="10" rx="1.25" />
                <rect x="7.5" y="3" width="2.5" height="18" rx="1.25" />
                <rect x="12" y="5" width="2.5" height="14" rx="1.25" />
                <rect x="16.5" y="2" width="2.5" height="20" rx="1.25" />
                <rect x="21" y="6" width="2.5" height="12" rx="1.25" />
              </svg>
            </span>
            <span className="font-bold text-2xl tracking-tight text-on-surface">Callivaan</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed text-primary border border-primary/20">
              VOICE AI
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight leading-tight">
              Start Answering Every Customer Inbound Call Autonomously
            </h1>
            <p className="text-base text-tertiary leading-relaxed">
              Connect your existing business SIM or cloud virtual number in under 3 minutes. Never leave high-intent Indian customers waiting on hold.
            </p>
          </div>

          {/* Mini Live Preview Box */}
          <div className="p-4 rounded-xl bg-surface-dim border border-outline space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
                <span className="font-semibold text-on-surface">Live Telephony Gateway Active</span>
              </div>
              <span className="text-tertiary font-mono">16kHz HD Audio</span>
            </div>
            <div className="flex items-center gap-1 h-7 bg-surface rounded p-1 border border-outline">
              <span className="w-1 bg-primary rounded-full wave-bar-1"></span>
              <span className="w-1 bg-primary rounded-full wave-bar-2"></span>
              <span className="w-1 bg-primary rounded-full wave-bar-3"></span>
              <span className="w-1 bg-primary rounded-full wave-bar-4"></span>
              <span className="w-1 bg-primary rounded-full wave-bar-5"></span>
              <span className="w-1 bg-primary rounded-full wave-bar-6"></span>
            </div>
            <div className="text-[11px] text-muted flex items-center justify-between">
              <span>TRAI 2-Party Recording Consent Included</span>
              <span className="text-primary font-medium">94% Bilingual Accuracy</span>
            </div>
          </div>

          {/* Bullet points */}
          <div className="space-y-2.5 text-xs text-tertiary">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span>14-Day Free Trial with 50 Inclusive Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span>Works directly with Reliance Jio, Airtel, and Vi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span>Instant lead dispatch to your WhatsApp phone</span>
            </div>
          </div>
        </div>

        {/* Right Column: Auth Card */}
        <div className="lg:col-span-6 bg-surface rounded-2xl border border-outline p-6 sm:p-8 shadow-sm">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-surface-container p-1 border border-outline mb-6">
            <button
              onClick={() => { setAuthMode('register'); setOtpStep(false); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition cursor-pointer ${
                authMode === 'register' ? 'bg-surface text-on-surface shadow-xs' : 'text-tertiary hover:text-on-surface'
              }`}
            >
              Create Business Account
            </button>
            <button
              onClick={() => { setAuthMode('signin'); setOtpStep(false); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition cursor-pointer ${
                authMode === 'signin' ? 'bg-surface text-on-surface shadow-xs' : 'text-tertiary hover:text-on-surface'
              }`}
            >
              Sign In to Portal
            </button>
          </div>

          {!otpStep ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Business or Company Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Dental Clinic / Balaji Realtors"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary placeholder:text-muted"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">
                        City / Region
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Delhi NCR"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary placeholder:text-muted"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">
                        Industry
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary"
                      >
                        <option>Automotive Dealership &amp; Garage</option>
                        <option>Real Estate &amp; Construction</option>
                        <option>Healthcare Clinic &amp; OPD</option>
                        <option>Legal &amp; Tax Consulting</option>
                        <option>Retail &amp; D2C Store</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Indian Mobile Number (WhatsApp-enabled)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-outline bg-surface-dim text-xs font-semibold text-tertiary">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-r-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary font-mono placeholder:text-muted"
                  />
                </div>
                <div className="text-[11px] text-muted mt-1">
                  We send a 6-digit verification code to this phone number via SMS/WhatsApp.
                </div>
              </div>

              {authMode === 'register' && (
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="optin"
                    checked={optInWhatsApp}
                    onChange={(e) => setOptInWhatsApp(e.target.checked)}
                    className="w-4 h-4 accent-primary mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="optin" className="text-xs text-tertiary cursor-pointer">
                    Enable instant WhatsApp lead summaries and status updates on this number.
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {authMode === 'register' ? 'Get Verification Code' : 'Send One-Time Passcode'}
              </button>

              <div className="pt-3 border-t border-outline flex items-center justify-between text-xs">
                <span className="text-muted">Want to explore instantly?</span>
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Quick Demo Access →
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">sms</span>
                </div>
                <h3 className="text-sm font-bold text-on-surface">Enter 6-Digit Passcode</h3>
                <p className="text-xs text-tertiary">Sent to +91 {phone}</p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-mono py-2 rounded-lg border border-outline bg-surface text-on-surface focus:outline-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Verify &amp; Enter Portal
              </button>

              <div className="flex justify-between items-center text-xs text-tertiary pt-2">
                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="hover:underline cursor-pointer"
                >
                  Change phone number
                </button>
                <button
                  type="button"
                  onClick={() => alert('Code resent via SMS and WhatsApp.')}
                  className="text-primary font-medium hover:underline cursor-pointer"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-[11px] text-muted text-center leading-relaxed">
            By signing up, you agree to Callivaan's{' '}
            <button onClick={() => navigate('/legal')} className="text-primary hover:underline">
              Terms of Service
            </button>{' '}
            and{' '}
            <button onClick={() => navigate('/legal')} className="text-primary hover:underline">
              TRAI Telephony Privacy Policy
            </button>
            .
          </div>
        </div>
      </div>
    </div>
  );
};
