import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface DashboardLayoutProps {
  currentRoute: string;
  navigate: (route: string) => void;
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentRoute,
  navigate,
  children,
}) => {
  const { user, tenant, role, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [testCallActive, setTestCallActive] = useState(false);
  const [testCallSuccess, setTestCallSuccess] = useState<string | null>(null);

  const operationsNav: NavItem[] = [
    {
      label: 'Call Logs',
      route: '/portal',
      icon: 'call',
      badge: '3 Ongoing',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      label: 'Lead Pipeline',
      route: '/portal',
      icon: 'filter_alt',
      badge: '18 Hot',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
  ];

  const voiceSetupNav: NavItem[] = [
    {
      label: 'Voice Agent Setup',
      route: '/agent',
      icon: 'record_voice_over',
    },
    {
      label: 'Telephony Gateway',
      route: '/telephony',
      icon: 'settings_phone',
    },
    {
      label: 'WhatsApp Dispatch',
      route: '/whatsapp',
      icon: 'chat',
    },
    {
      label: 'TRAI Compliance',
      route: '/legal',
      icon: 'verified_user',
    },
  ];

  const handleNav = (route: string) => {
    navigate(route);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBreadcrumbTitle = () => {
    switch (currentRoute) {
      case '/portal':
      case '/dashboard':
        return 'Operations / Inbound Calls Live Feed';
      case '/agent':
      case '/settings':
        return 'Configuration / Voice Agent Persona & Prompts';
      case '/telephony':
      case '/forwarding':
        return 'Telephony / Virtual Gateway & Carrier Forwarding';
      case '/whatsapp':
      case '/dispatch':
        return 'WhatsApp / Handset Pairing & Instant Lead Dispatch';
      case '/legal':
      case '/compliance':
        return 'Compliance / TRAI Consent & Indian Data Sovereignty';
      default:
        return 'Operations / Inbound Calls Live Feed';
    }
  };

  const isNavActive = (route: string, label?: string) => {
    if (label === 'Lead Pipeline') return false;
    if (currentRoute === '/dashboard' && route === '/portal') return true;
    return currentRoute === route;
  };

  const handleSimulateTestCall = async () => {
    setTestCallActive(true);
    setTestCallSuccess(null);
    try {
      const res = await api.telephony.triggerTestCall();
      setTestCallSuccess(res.message || 'Test call simulation completed successfully');
      window.dispatchEvent(new CustomEvent('callivaan_new_call'));
    } catch {
      setTestCallSuccess('Simulation completed (local demo mode)');
    } finally {
      setTimeout(() => {
        setTestCallActive(false);
      }, 3500);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-dim font-sans text-on-surface">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* ========================================================================= */}
      {/* 1. PERSISTENT LEFT SIDEBAR NAVIGATION (Desktop & Drawer for Mobile)        */}
      {/* ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-outline flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto p-4">
          {/* Top Brand Logo & Wordmark */}
          <div className="flex items-center justify-between pb-4 border-b border-outline">
            <div
              onClick={() => handleNav('/')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="flex items-center gap-[3px] h-6 px-1.5 py-1 bg-primary-fixed rounded">
                <span className="w-[3px] h-3 bg-primary rounded-full"></span>
                <span className="w-[3px] h-5 bg-primary-container rounded-full"></span>
                <span className="w-[3px] h-6 bg-primary rounded-full"></span>
                <span className="w-[3px] h-4 bg-primary-container rounded-full"></span>
                <span className="w-[3px] h-2 bg-primary rounded-full"></span>
              </div>
              <span className="font-bold text-xl tracking-tight text-on-surface group-hover:text-primary transition-colors">
                Callivaan
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-primary-fixed text-primary border border-primary/20">
              VOICE AI
            </span>
          </div>

          {/* Business Tenant Switcher Card */}
          <div className="mt-3 mb-4 p-3 rounded-lg bg-surface-dim border border-outline hover:border-primary/40 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center">
                  SB
                </div>
                <div>
                  <div className="font-semibold text-xs text-on-surface group-hover:text-primary transition-colors leading-tight">
                    Shree Balaji Motors
                  </div>
                  <div className="text-[11px] text-tertiary flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Routing Active</span>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-tertiary text-base">expand_more</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-outline flex items-center justify-between text-[11px]">
              <span className="text-tertiary">Virtual Gateway</span>
              <span className="font-mono text-on-surface font-medium">+91 80 4736 8800</span>
            </div>
          </div>

          {/* Section 1: DAILY OPERATIONS */}
          <div className="mb-4">
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-tertiary">
              Daily Operations
            </p>
            <div className="space-y-1">
              {operationsNav.map((item) => {
                const active = isNavActive(item.route, item.label);
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item.route)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition duration-150 ${
                      active
                        ? 'bg-primary-fixed text-primary font-semibold shadow-xs'
                        : 'text-on-surface hover:bg-surface-dim hover:text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`material-symbols-outlined text-[19px] ${
                          active ? 'text-primary' : 'text-tertiary'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: VOICE & AGENT SETUP */}
          <div className="mb-4">
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-tertiary">
              Voice & Agent Setup
            </p>
            <div className="space-y-1">
              {voiceSetupNav.map((item) => {
                const active = isNavActive(item.route);
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item.route)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition duration-150 ${
                      active
                        ? 'bg-primary-fixed text-primary font-semibold shadow-xs'
                        : 'text-on-surface hover:bg-surface-dim hover:text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`material-symbols-outlined text-[19px] ${
                          active ? 'text-primary' : 'text-tertiary'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: REAL-TIME USAGE METER */}
          <div className="mt-auto pt-2 pb-3">
            <div className="p-3 rounded-lg bg-surface-dim border border-outline">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-on-surface">Plan Minutes</span>
                <span className="font-mono text-primary font-bold text-[11px]">342 / 500m</span>
              </div>
              <div className="w-full bg-outline rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: '68.4%' }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-tertiary">
                <span>Renews in 12 days</span>
                <button
                  onClick={() => handleNav('/pricing')}
                  className="text-primary hover:underline font-semibold"
                >
                  + Add Mins
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Business Administrator Card & Logout */}
        <div className="p-3 border-t border-outline bg-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  {(user?.fullName || 'RS')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>
              <div className="min-w-0 truncate">
                <div className="font-semibold text-xs text-on-surface leading-tight truncate">
                  {user?.fullName || 'Rajesh Sharma'}
                </div>
                <div className="text-[10px] text-tertiary truncate">
                  {tenant?.name || 'Balaji Motors Admin'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                handleNav('/auth');
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-tertiary hover:text-error hover:bg-error-container/30 transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. TOP UTILITY BAR & MAIN VIEW WORKSPACE                                  */}
      {/* ========================================================================= */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Utility Header */}
        <header className="h-14 bg-surface border-b border-outline px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-tertiary hover:bg-surface-dim transition-colors"
              aria-label="Open Navigation Sidebar"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-tertiary hidden sm:inline">
                {getBreadcrumbTitle().split(' / ')[0]}
              </span>
              <span className="text-outline hidden sm:inline">/</span>
              <span className="font-semibold text-on-surface truncate">
                {getBreadcrumbTitle().split(' / ')[1]}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Feed</span>
              </span>
            </div>
          </div>

          {/* Search bar & Live Telephony Telemetry */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-dim border border-outline text-xs w-64 text-tertiary">
              <span className="material-symbols-outlined text-[16px]">search</span>
              <input
                type="text"
                placeholder="Search phone, caller..."
                className="bg-transparent border-none outline-none text-on-surface w-full text-xs placeholder:text-tertiary"
              />
            </div>

            {/* Carrier Status Pill */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-dim border border-outline text-[11px] text-tertiary">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Jio Gateway Active</span>
            </div>

            {/* Quick Test Voice Agent CTA */}
            <button
              onClick={handleSimulateTestCall}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">ring_volume</span>
              <span className="hidden sm:inline">
                {testCallActive ? 'Connecting Agent...' : '+ Test Voice Agent'}
              </span>
              <span className="sm:hidden">Test</span>
            </button>

            {/* Public Website Switcher */}
            <button
              onClick={() => handleNav('/')}
              title="Return to Public Website"
              className="p-1.5 rounded-lg text-tertiary hover:text-on-surface hover:bg-surface-dim transition-colors text-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">public</span>
              <span className="hidden sm:inline text-xs font-medium">Public Site</span>
            </button>
          </div>
        </header>

        {/* Live Audio / Test banner toast when test clicked */}
        {testCallActive && (
          <div className="bg-primary text-white text-xs px-4 py-2 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
              <span>Connecting virtual inbound call to +91 80 4736 8800 (Pooja Hinglish Voice Agent)...</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">SIMULATION OK</span>
          </div>
        )}

        {/* Scrollable Child Content Area */}
        <main className="flex-1 overflow-y-auto bg-surface-dim">
          {children}
        </main>
      </div>
    </div>
  );
};
