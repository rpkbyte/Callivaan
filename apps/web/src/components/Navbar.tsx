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
    { label: 'Overview', route: '/' },
    { label: 'Pricing', route: '/pricing' },
    { label: 'Compliance', route: '/legal' },
  ];

  const handleNav = (route: string) => {
    navigate(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="bg-surface border-b border-outline sticky top-0 z-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between h-14">
        {/* Brand Wordmark - Clean, No Decorative Pill */}
        <div 
          onClick={() => handleNav('/')}
          className="flex items-center gap-2 cursor-pointer select-none rounded focus-visible:outline-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNav('/'); }}
        >
          <span className="flex items-center justify-center w-7 h-7 rounded bg-primary text-white">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <rect x="3" y="7" width="2" height="10" rx="1" />
              <rect x="7.5" y="3" width="2" height="18" rx="1" />
              <rect x="12" y="5" width="2" height="14" rx="1" />
              <rect x="16.5" y="2" width="2" height="20" rx="1" />
              <rect x="21" y="6" width="2" height="12" rx="1" />
            </svg>
          </span>
          <span className="font-semibold text-base text-on-surface tracking-tight">Callivaan</span>
        </div>

        {/* Desktop Navigation Links - Simple, Solid, Human */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            return (
              <button
                key={link.route}
                onClick={() => handleNav(link.route)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors duration-100 ${
                  isActive
                    ? 'text-on-surface font-semibold bg-surface-dim'
                    : 'text-tertiary hover:text-on-surface hover:bg-surface-dim'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Actions - Standard Solid/Outlined Buttons, 6px Radius, No Pills */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => handleNav('/portal')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors duration-100"
              >
                <span className="material-symbols-outlined text-[16px]">dashboard</span>
                <span className="truncate max-w-[140px]">{tenant?.name || 'Dashboard'}</span>
              </button>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-1.5 rounded-md text-tertiary hover:text-on-surface hover:bg-surface-dim transition-colors duration-100"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('/auth')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-100 ${
                  currentRoute === '/auth'
                    ? 'text-on-surface bg-surface-dim font-semibold'
                    : 'text-tertiary hover:text-on-surface hover:bg-surface-dim'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('/auth')}
                className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-md text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors duration-100"
              >
                Get Started
              </button>
            </>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-md text-tertiary hover:text-on-surface hover:bg-surface-dim transition-colors duration-100"
            aria-label="Toggle navigation"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-outline bg-surface px-4 py-2 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => handleNav(link.route)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                currentRoute === link.route
                  ? 'text-on-surface font-semibold bg-surface-dim'
                  : 'text-tertiary hover:text-on-surface'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-outline flex flex-col gap-2">
            <button
              onClick={() => handleNav('/auth')}
              className="w-full text-center py-2 text-sm font-medium rounded-md border border-outline text-on-surface hover:bg-surface-dim"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
