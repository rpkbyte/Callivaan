/**
 * Public Footer Component
 * Conforms to docs/rules.md section 9: Terms, privacy, pricing, cancellation/refund, support contact reachable.
 * Zero emojis.
 */
import React from 'react';
import { ShieldCheck, Mail, Phone } from 'lucide-react';

interface FooterProps {
  onOpenPolicyModal?: (policyName: 'privacy' | 'terms' | 'retention' | 'refund') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicyModal }) => {
  return (
    <footer
      style={{
        backgroundColor: '#F6F8FC',
        borderTop: '1px solid #E4E8F0',
        padding: '56px 0 32px 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '32px',
            marginBottom: '48px',
          }}
        >
          {/* Col 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#172033' }}>Callivaan</span>
            <p style={{ fontSize: '14px', color: '#667085', lineHeight: '1.6' }}>
              Intelligent 24/7 AI voice call assistant designed for Indian businesses. Answers customer calls, qualifies leads, and delivers summaries directly to WhatsApp.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#667085', fontSize: '13px', marginTop: '8px' }}>
              <ShieldCheck size={16} color="#3157D5" />
              <span>Tenant-isolated cloud telephony</span>
            </div>
          </div>

          {/* Col 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>Product & Setup</span>
            <a href="#features" style={{ fontSize: '14px', color: '#667085', textDecoration: 'none' }}>
              How it works
            </a>
            <a href="#verticals" style={{ fontSize: '14px', color: '#667085', textDecoration: 'none' }}>
              Vertical presets
            </a>
            <a href="#pricing" style={{ fontSize: '14px', color: '#667085', textDecoration: 'none' }}>
              Plans and minutes
            </a>
            <a href="#apk" style={{ fontSize: '14px', color: '#3157D5', textDecoration: 'none' }}>
              Download Android APK
            </a>
          </div>

          {/* Col 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>Trust & Legal</span>
            <button
              onClick={() => onOpenPolicyModal?.('privacy')}
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '14px', color: '#667085', cursor: 'pointer' }}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenPolicyModal?.('terms')}
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '14px', color: '#667085', cursor: 'pointer' }}
            >
              Terms of Service
            </button>
            <button
              onClick={() => onOpenPolicyModal?.('refund')}
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '14px', color: '#667085', cursor: 'pointer' }}
            >
              Cancellation and Refunds
            </button>
            <button
              onClick={() => onOpenPolicyModal?.('retention')}
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '14px', color: '#667085', cursor: 'pointer' }}
            >
              Data Retention Policy
            </button>
          </div>

          {/* Col 4 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>Customer Support</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#667085', fontSize: '14px' }}>
              <Mail size={16} />
              <span>support@callivaan.demo</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#667085', fontSize: '14px' }}>
              <Phone size={16} />
              <span>+91 80 4719 2000</span>
            </div>
            <span style={{ fontSize: '12px', color: '#8A94A6', marginTop: '6px' }}>
              Assistance available Monday to Saturday, 9:00 AM to 7:00 PM IST
            </span>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #E4E8F0',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: '#8A94A6',
          }}
        >
          <span>2026 Callivaan Technologies. All rights reserved. Direct release distribution.</span>
          <span>Light theme design standard. No audio recording by default.</span>
        </div>
      </div>
    </footer>
  );
};
