import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { isAuthenticated, tenant, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Product', route: '/' },
    { label: 'Pricing', route: '/pricing' },
    { label: 'Compliance', route: '/legal' },
  ];

  const handleNav = (route: string) => {
    navigate(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="bg-surface/95 backdrop-blur-md sticky top-0 z-50 border-b border-outline shadow-xs">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between h-16">
        {/* Brand Wordmark & 5-Bar Telephony Waveform Icon */}
        <div 
          onClick={() => handleNav('/')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white shadow-xs group-hover:scale-105 transition duration-150">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <rect x="3" y="7" width="2.5" height="10" rx="1.25" />
              <rect x="7.5" y="3" width="2.5" height="18" rx="1.25" />
              <rect x="12" y="5" width="2.5" height="14" rx="1.25" />
              <rect x="16.5" y="2" width="2.5" height="20" rx="1.25" />
              <rect x="21" y="6" width="2.5" height="12" rx="1.25" />
            </svg>
          </span>
          <span className="font-bold text-xl tracking-tight text-on-surface">Callivaan</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wider bg-primary-fixed text-primary border border-primary/20">
            VOICE AI
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            return (
              <button
                key={link.route}
                onClick={() => handleNav(link.route)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition duration-150 ${
                  isActive
                    ? 'text-primary bg-primary-fixed/40 font-semibold'
                    : 'text-tertiary hover:text-on-surface hover:bg-surface-dim'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => handleNav('/portal')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-hover text-on-primary transition duration-150 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                <span className="truncate max-w-[130px] sm:max-w-[200px]">{tenant?.name || 'Dashboard'}</span>
              </button>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="hidden sm:inline-flex items-center justify-center p-1.5 rounded-lg text-tertiary hover:text-error hover:bg-error-container/30 transition duration-150"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('/auth')}
                className={`hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-sm font-medium border transition duration-150 ${
                  currentRoute === '/auth'
                    ? 'bg-primary-fixed text-primary border-primary/30 font-semibold'
                    : 'text-on-surface border-outline hover:bg-surface-container'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('/auth')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-hover text-on-primary transition duration-150 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                <span>Dashboard</span>
              </button>
            </>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-tertiary hover:text-on-surface hover:bg-surface-container transition"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-outline bg-surface px-4 py-3 space-y-1 shadow-md">
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => handleNav(link.route)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition ${
                currentRoute === link.route
                  ? 'text-primary bg-primary-fixed/40 font-semibold'
                  : 'text-on-surface hover:bg-surface-dim'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-outline flex flex-col gap-2">
            <button
              onClick={() => handleNav('/auth')}
              className="w-full text-center py-2 text-sm font-medium rounded-lg border border-outline text-on-surface hover:bg-surface-dim"
            >
              Business Sign In / Register
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
