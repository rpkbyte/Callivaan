/**
 * Authentication Modal (Sign In / Sign Up)
 * Zero emojis, clean Cobalt and White styling.
 */
import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api/client.js';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<'repair_service' | 'salon_spa' | 'property_agent' | 'clinic_healthcare'>('repair_service');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const res = await api.signup({
          email,
          password,
          fullName,
          businessName,
          category,
          phoneNumber,
        });
        api.setAuth(res.accessToken, res.tenant.id);
      } else {
        const res = await api.login({
          email,
          password,
        });
        api.setAuth(res.accessToken, res.tenant.id);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={mode === 'signin' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              onClick={() => { setMode('signin'); setError(null); }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === 'signup' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              onClick={() => { setMode('signup'); setError(null); }}
            >
              Start free trial
            </button>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{ background: 'none', border: 'none', color: '#667085', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <h3 id="auth-modal-title" style={{ marginBottom: '6px' }}>
          {mode === 'signup' ? 'Create your Callivaan account' : 'Welcome back'}
        </h3>
        <p style={{ fontSize: '14px', marginBottom: '20px' }}>
          {mode === 'signup'
            ? 'Set up your AI voice assistant in minutes. 30 free minutes included.'
            : 'Sign in to configure your agent and review call history.'}
        </p>

        {error && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              color: '#B91C1C',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Business Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. Sharma Appliances & Repair"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Business Category (Vertical Preset)</label>
                <select
                  className="select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="repair_service">Home & Appliance Repair Services</option>
                  <option value="salon_spa">Salon, Spa & Beauty Wellness</option>
                  <option value="property_agent">Real Estate & Property Consultant</option>
                  <option value="clinic_healthcare">Clinic & Healthcare Practice</option>
                </select>
                <span className="form-help">Pre-configures industry FAQs, Hindi/English greeting, and lead fields.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Work Email</label>
            <input
              type="email"
              required
              className="input"
              placeholder="owner@yourbusiness.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              minLength={8}
              className="input"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Sign in'}
          </button>

          {mode === 'signin' && (
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: '#667085' }}>
              <span>Demo credentials: </span>
              <strong style={{ color: '#172033' }}>owner@callivaan.demo</strong> / <strong style={{ color: '#172033' }}>password123</strong>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
