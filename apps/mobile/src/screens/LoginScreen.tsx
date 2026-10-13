/**
 * Mobile Login Screen
 * Conforms to docs/design.md: light mode, cobalt and white, zero emojis.
 */
import React, { useState } from 'react';
import { mobileColors, mobileSpacing, mobileRadii } from '../theme/tokens.js';
import { mobileApi } from '../api/mobile-client.js';

interface LoginScreenProps {
  onLoginSuccess: (user: any, tenant: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('owner@callivaan.demo');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await mobileApi.login(email, password);
      onLoginSuccess(res.user, res.tenant);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: `${mobileSpacing.xl}px`,
        backgroundColor: mobileColors.white,
        minHeight: '100vh',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: `${mobileSpacing.xl}px` }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: `${mobileRadii.md}px`,
            backgroundColor: mobileColors.cobalt,
            margin: '0 auto 12px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: mobileColors.white,
            fontWeight: 700,
            fontSize: '20px',
          }}
        >
          C
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: mobileColors.textPrimary }}>
          Callivaan
        </h1>
        <p style={{ fontSize: '14px', color: mobileColors.textSecondary, marginTop: '4px' }}>
          AI Voice Assistant Control Surface
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: `${mobileSpacing.md}px`,
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: `${mobileRadii.md}px`,
            color: mobileColors.statusError,
            fontSize: '13px',
            marginBottom: `${mobileSpacing.md}px`,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: `${mobileSpacing.md}px` }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 500, color: mobileColors.textPrimary, display: 'block', marginBottom: '4px' }}>
            Work Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: `${mobileRadii.md}px`,
              border: `1px solid ${mobileColors.border}`,
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: 500, color: mobileColors.textPrimary, display: 'block', marginBottom: '4px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: `${mobileRadii.md}px`,
              border: `1px solid ${mobileColors.border}`,
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: `${mobileRadii.md}px`,
            backgroundColor: mobileColors.cobalt,
            color: mobileColors.white,
            border: 'none',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: `${mobileSpacing.sm}px`,
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: `${mobileSpacing.xl}px`, fontSize: '12px', color: mobileColors.textMuted }}>
        Light mode direct distribution release • Version 1.0.0
      </div>
    </div>
  );
};
