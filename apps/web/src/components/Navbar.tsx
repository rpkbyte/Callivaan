import React, { useState } from 'react';
import { PhoneCall, Download, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onNavigateSection?: (sectionId: string) => void;
  isAuthenticated: boolean;
  onGoToPortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onNavigateSection,
  isAuthenticated,
  onGoToPortal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigateSection?.(sectionId);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E4E8F0',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        {/* Brand Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
          onClick={() => handleNavClick('hero')}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#3157D5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <PhoneCall size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#172033',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Callivaan
            </span>
            <span style={{ fontSize: '11px', color: '#667085', fontWeight: 500 }}>
              AI Call Assistant
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links-desktop">
          <button
            onClick={() => handleNavClick('features')}
            className="btn-tertiary"
            style={{ fontSize: '14px', border: 'none', background: 'none', cursor: 'pointer', color: '#172033' }}
          >
            How it works
          </button>
          <button
            onClick={() => handleNavClick('verticals')}
            className="btn-tertiary"
            style={{ fontSize: '14px', border: 'none', background: 'none', cursor: 'pointer', color: '#172033' }}
          >
            Use cases
          </button>
          <button
            onClick={() => handleNavClick('pricing')}
            className="btn-tertiary"
            style={{ fontSize: '14px', border: 'none', background: 'none', cursor: 'pointer', color: '#172033' }}
          >
            Pricing
          </button>
          <button
            onClick={() => handleNavClick('apk')}
            className="btn-tertiary"
            style={{
              fontSize: '14px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#3157D5',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={15} />
            Android APK
          </button>
        </nav>

        {/* Desktop Actions */}
        <div className="nav-actions-desktop">
          {isAuthenticated ? (
            <button className="btn btn-primary btn-sm" onClick={onGoToPortal}>
              Open Portal
            </button>
          ) : (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenAuth('signin')}
              >
                Sign in
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onOpenAuth('signup')}
              >
                Start free trial
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <button
          onClick={() => handleNavClick('features')}
          className="btn-tertiary"
          style={{ fontSize: '14px', textAlign: 'left', padding: '10px 0' }}
        >
          How it works
        </button>
        <button
          onClick={() => handleNavClick('verticals')}
          className="btn-tertiary"
          style={{ fontSize: '14px', textAlign: 'left', padding: '10px 0' }}
        >
          Use cases
        </button>
        <button
          onClick={() => handleNavClick('pricing')}
          className="btn-tertiary"
          style={{ fontSize: '14px', textAlign: 'left', padding: '10px 0' }}
        >
          Pricing
        </button>
        <button
          onClick={() => handleNavClick('apk')}
          className="btn-tertiary"
          style={{
            fontSize: '14px',
            textAlign: 'left',
            padding: '10px 0',
            color: '#3157D5',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Download size={15} />
          Download Android APK
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid #E4E8F0' }}>
          {isAuthenticated ? (
            <button className="btn btn-primary" onClick={onGoToPortal}>
              Open Portal
            </button>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('signin'); }}
              >
                Sign in
              </button>
              <button
                className="btn btn-primary"
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('signup'); }}
              >
                Start free trial
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
