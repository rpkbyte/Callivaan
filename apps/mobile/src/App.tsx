/**
 * Main Mobile Application Container
 * Light mode, cobalt & white, zero emojis.
 */
import React, { useState } from 'react';
import { mobileColors, mobileSpacing } from './theme/tokens.js';
import { LoginScreen } from './screens/LoginScreen.js';
import { OverviewScreen } from './screens/OverviewScreen.js';

export const MobileApp: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'calls' | 'agent' | 'whatsapp' | 'usage'>('overview');
  const [selectedCall, setSelectedCall] = useState<any>(null);

  if (!user) {
    return (
      <LoginScreen
        onLoginSuccess={(u, t) => {
          setUser(u);
          setTenant(t);
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: mobileColors.white,
        fontFamily: 'Inter, -apple-system, sans-serif',
      }}
    >
      {/* Mobile App Bar */}
      <div
        style={{
          height: '56px',
          borderBottom: `1px solid ${mobileColors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${mobileSpacing.md}px`,
          backgroundColor: mobileColors.white,
        }}
      >
        <div>
          <strong style={{ fontSize: '16px', color: mobileColors.textPrimary }}>
            {tenant?.name || 'Callivaan'}
          </strong>
          <span style={{ fontSize: '11px', color: mobileColors.textSecondary, display: 'block' }}>
            AI Call Assistant
          </span>
        </div>

        <button
          onClick={() => setUser(null)}
          style={{
            background: 'none',
            border: `1px solid ${mobileColors.border}`,
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            color: mobileColors.textSecondary,
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Screen Content */}
      <div style={{ flex: 1, paddingBottom: '60px' }}>
        {activeTab === 'overview' && (
          <OverviewScreen
            onNavigateTab={(t) => setActiveTab(t as any)}
            onSelectCall={(c) => setSelectedCall(c)}
          />
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '56px',
          borderTop: `1px solid ${mobileColors.border}`,
          backgroundColor: mobileColors.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'calls', label: 'Calls' },
          { id: 'agent', label: 'Agent' },
          { id: 'whatsapp', label: 'WhatsApp' },
          { id: 'usage', label: 'Usage' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: 'none',
                border: 'none',
                color: isActive ? mobileColors.cobalt : mobileColors.textSecondary,
                fontWeight: isActive ? 600 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
