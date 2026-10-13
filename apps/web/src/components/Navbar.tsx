/**
 * Public Navbar Component
 * Zero emojis, restrained cobalt & white styling.
 */
import React from 'react';
import { PhoneCall, Download } from 'lucide-react';

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
          onClick={() => onNavigateSection?.('hero')}
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

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <button
            onClick={() => onNavigateSection?.('features')}
            className="btn-tertiary"
            style={{ fontSize: '14px', border: 'none', background: 'none', cursor: 'pointer', color: '#172033' }}
          >
            How it works
          </button>
          <button
            onClick={() => onNavigateSection?.('verticals')}
            className="btn-tertiary"
            style={{ fontSize: '14px', border: 'none', background: 'none', cursor: 'pointer', color: '#172033' }}
          >
            Use cases
          </button>
          <button
            onClick={() => onNavigateSection?.('pricing')}
            className="btn-tertiary"
            style={{ fontSize: '14px', border: 'none', background: 'none', cursor: 'pointer', color: '#172033' }}
          >
            Pricing
          </button>
          <button
            onClick={() => onNavigateSection?.('apk')}
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

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
      </div>
    </header>
  );
};
