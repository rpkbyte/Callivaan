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
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentRoute,
  navigate,
  children,
}) => {
  const { user, tenant, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [testCallActive, setTestCallActive] = useState(false);

  const operationsNav: NavItem[] = [
    { label: 'Call Logs', route: '/portal', icon: 'call' },
    { label: 'Voice Agent Setup', route: '/agent', icon: 'tune' },
    { label: 'Carrier Forwarding', route: '/telephony', icon: 'settings_phone' },
    { label: 'WhatsApp Dispatch', route: '/whatsapp', icon: 'chat' },
    { label: 'Compliance & Legal', route: '/legal', icon: 'verified_user' },
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
        return 'Call logs';
      case '/agent':
      case '/settings':
        return 'Voice agent setup';
      case '/telephony':
      case '/forwarding':
        return 'Carrier forwarding';
      case '/whatsapp':
      case '/dispatch':
        return 'WhatsApp dispatch';
      case '/legal':
      case '/compliance':
        return 'Compliance';
      default:
        return 'Operations';
    }
  };

  const isNavActive = (route: string) => {
    if (currentRoute === '/dashboard' && route === '/portal') return true;
    return currentRoute === route;
  };

  const handleSimulateTestCall = async () => {
    setTestCallActive(true);
    try {
      await api.telephony.triggerTestCall();
      window.dispatchEvent(new CustomEvent('callivaan_new_call'));
    } catch {
      // ignore
    } finally {
      setTimeout(() => {
        setTestCallActive(false);
      }, 2500);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface font-sans text-on-surface">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* Fixed Sidebar - 240px, Solid bg, 1px border-right, No floating shells */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-surface-dim border-r border-outline flex flex-col justify-between transition-transform duration-150 ease-in-out lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 p-3">
          {/* Brand Wordmark - Clean, No Pill Badge */}
          <div className="flex items-center justify-between pb-3 px-2 border-b border-outline">
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
              <span className="font-semibold text-sm tracking-tight text-on-surface">Callivaan</span>
            </div>
          </div>

          {/* Business Workspace Context */}
          <div className="my-3 px-2 py-2 rounded border border-outline bg-surface space-y-0.5">
            <div className="font-medium text-xs text-on-surface truncate">
              {tenant?.name || 'Shree Balaji Motors'}
            </div>
            <div className="text-[11px] font-mono text-tertiary truncate">
              +91 80 4736 8800
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5">
            {operationsNav.map((item) => {
              const active = isNavActive(item.route);
              return (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.route)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors duration-100 ${
                    active
                      ? 'bg-surface text-on-surface font-semibold border border-outline shadow-xs'
                      : 'text-tertiary hover:bg-surface hover:text-on-surface'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[17px] ${active ? 'text-primary' : 'text-muted'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Simple Minutes Meter (Clean, No Slop) */}
          <div className="mt-auto pt-4 border-t border-outline px-2 space-y-1.5">
            <div className="flex justify-between text-[11px] text-tertiary">
              <span>Minutes used</span>
              <span className="font-mono text-on-surface">342 / 500m</span>
            </div>
            <div className="w-full bg-outline rounded-full h-1 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-transform duration-200 origin-left w-full"
                style={{ transform: 'scaleX(0.684)' }}
              />
            </div>
          </div>
        </div>

        {/* User Account / Sign Out */}
        <div className="p-3 border-t border-outline flex items-center justify-between text-xs">
          <div className="truncate min-w-0 pr-2">
            <div className="font-medium text-on-surface truncate">{user?.fullName || 'Rajesh Sharma'}</div>
            <div className="text-[11px] text-muted truncate">Admin</div>
          </div>
          <button
            onClick={() => { logout(); handleNav('/auth'); }}
            title="Sign out"
            className="p-1 rounded text-tertiary hover:text-on-surface hover:bg-surface"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-12 bg-surface border-b border-outline px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1 rounded text-tertiary hover:bg-surface-dim"
              aria-label="Open sidebar"
            >
              <span className="material-symbols-outlined text-[18px]">menu</span>
            </button>
            <div className="text-xs font-semibold text-on-surface capitalize">
              {getBreadcrumbTitle()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateTestCall}
              disabled={testCallActive}
              className="px-2.5 py-1 rounded text-xs font-medium border border-outline hover:bg-surface-dim transition-colors duration-100"
            >
              {testCallActive ? 'Simulating...' : '+ Test Call'}
            </button>
            <button
              onClick={() => handleNav('/')}
              className="px-2 py-1 rounded text-xs text-tertiary hover:text-on-surface"
            >
              Website
            </button>
          </div>
        </header>

        {/* Child Content */}
        <main className="flex-1 overflow-y-auto bg-surface">
          {children}
        </main>
      </div>
    </div>
  );
};
