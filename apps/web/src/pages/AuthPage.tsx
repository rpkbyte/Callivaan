import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  navigate: (route: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ navigate }) => {
  const { login, signup, loginAsDemo } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  
  // Sign In state
  const [email, setEmail] = useState('owner@callivaan.demo');
  const [password, setPassword] = useState('password123');

  // Register state
  const [fullName, setFullName] = useState('Rajesh Sharma');
  const [businessName, setBusinessName] = useState('Sharma Appliances & Repair');
  const [phone, setPhone] = useState('9876543210');
  const [category, setCategory] = useState('repair_service');
  const [regEmail, setRegEmail] = useState('sharma.appliances@gmail.com');
  const [regPassword, setRegPassword] = useState('password123');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(email, password);
      navigate('/portal');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;
      await signup({
        email: regEmail,
        password: regPassword,
        fullName,
        businessName,
        category,
        phoneNumber: formattedPhone,
      });
      navigate('/portal');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check the fields and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginAsDemo();
      navigate('/portal');
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
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
              Never lose a sales inquiry or service booking again. Set up bilingual Hindi-English voice handling in under 10 minutes with zero hardware required.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-outline bg-surface-container-low">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                <span>Sub-450ms Turn</span>
              </div>
              <p className="text-xs text-muted mt-1">Real-time turn taking with intelligent caller barge-in detection.</p>
            </div>
            <div className="p-4 rounded-xl border border-outline bg-surface-container-low">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">shield</span>
                <span>TRAI & DPDPA</span>
              </div>
              <p className="text-xs text-muted mt-1">Indian data sovereignty with automatic 90-day ephemeral call retention.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-primary">DL</div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-emerald-700">MH</div>
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-amber-700">KA</div>
            </div>
            <span className="text-xs text-tertiary font-medium">Trusted by Indian dealerships, service centers, and clinics.</span>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-6 bg-surface border border-outline rounded-2xl shadow-sm p-6 sm:p-8">
          {/* Segmented Mode Switcher */}
          <div className="flex bg-surface-container-low p-1 rounded-xl mb-6 border border-outline">
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition cursor-pointer ${
                authMode === 'signin' ? 'bg-surface text-on-surface shadow-xs' : 'text-tertiary hover:text-on-surface'
              }`}
            >
              Sign In to Portal
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition cursor-pointer ${
                authMode === 'register' ? 'bg-surface text-on-surface shadow-xs' : 'text-tertiary hover:text-on-surface'
              }`}
            >
              Register New Business
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {authMode === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="owner@yourbusiness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary placeholder:text-muted"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary font-mono placeholder:text-muted"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </button>

              <div className="pt-4 border-t border-outline flex items-center justify-between text-xs">
                <span className="text-muted">Instant Pilot Demo:</span>
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  disabled={loading}
                  className="text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">play_circle</span>
                  <span>1-Click Demo Login</span>
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Business / Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Dental Clinic / Sharma Repair"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary placeholder:text-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary placeholder:text-muted"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Business Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary"
                  >
                    <option value="repair_service">Repair &amp; Service Center</option>
                    <option value="automotive_dealership">Automotive &amp; Garage</option>
                    <option value="real_estate">Real Estate Consulting</option>
                    <option value="hospital_clinic">Clinic &amp; Healthcare OPD</option>
                    <option value="salon_spa">Salon &amp; Spa Care</option>
                    <option value="general">General Commerce</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Indian Mobile Number (WhatsApp Alerts)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-outline bg-surface-dim text-xs font-semibold text-tertiary">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-3 py-2 rounded-r-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary font-mono placeholder:text-muted"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="owner@business.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary placeholder:text-muted"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Create Password (minimum 8 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline bg-surface text-xs text-on-surface focus:outline-primary font-mono placeholder:text-muted"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Creating Tenant Account...</span>
                  </>
                ) : (
                  <span>Register &amp; Start 14-Day Trial</span>
                )}
              </button>

              <div className="pt-3 border-t border-outline flex items-center justify-between text-xs">
                <span className="text-muted">Already registered?</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Sign In →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
