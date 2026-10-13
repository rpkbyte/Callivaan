/**
 * Main Web Application
 */
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { LandingPage } from './pages/LandingPage.js';
import { AuthModal } from './components/AuthModal.js';
import { PortalView } from './pages/portal/PortalView.js';
import { api } from './api/client.js';
import { X, Shield } from 'lucide-react';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(api.isAuthenticated());
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [activePolicyModal, setActivePolicyModal] = useState<'privacy' | 'terms' | 'retention' | 'refund' | null>(null);

  useEffect(() => {
    const handleExpired = () => setIsAuthenticated(false);
    window.addEventListener('auth_expired', handleExpired);
    return () => window.removeEventListener('auth_expired', handleExpired);
  }, []);

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    api.clearAuth();
    setIsAuthenticated(false);
  };

  const handleNavigateSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {isAuthenticated ? (
        <PortalView onLogout={handleLogout} />
      ) : (
        <>
          <Navbar
            onOpenAuth={handleOpenAuth}
            onNavigateSection={handleNavigateSection}
            isAuthenticated={isAuthenticated}
            onGoToPortal={() => setIsAuthenticated(true)}
          />
          <main style={{ flex: 1 }}>
            <LandingPage onOpenAuth={handleOpenAuth} />
          </main>
          <Footer onOpenPolicyModal={(policy) => setActivePolicyModal(policy)} />
          <AuthModal
            isOpen={authModalOpen}
            initialMode={authModalMode}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={handleAuthSuccess}
          />
        </>
      )}

      {/* Trust & Legal Policy Modal */}
      {activePolicyModal && (
        <div className="modal-overlay" onClick={() => setActivePolicyModal(null)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#3157D5" />
                <h3 style={{ fontSize: '18px' }}>
                  {activePolicyModal === 'privacy' && 'Privacy Policy'}
                  {activePolicyModal === 'terms' && 'Terms of Service'}
                  {activePolicyModal === 'retention' && 'Data Retention & Deletion Schedule'}
                  {activePolicyModal === 'refund' && 'Subscription, Cancellation & Refund Terms'}
                </h3>
              </div>
              <button onClick={() => setActivePolicyModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667085' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '14px', color: '#172033', lineHeight: '1.7', maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
              {activePolicyModal === 'privacy' && (
                <div>
                  <p><strong>1. Audio and Recording Privacy:</strong> Raw call audio recording and full transcript storage are disabled by default. The service extracts only factual lead parameters necessary for follow-up.</p>
                  <p style={{ marginTop: '10px' }}><strong>2. Tenant Isolation:</strong> Every customer record is access-controlled by tenant membership. No cross-tenant access is permitted.</p>
                  <p style={{ marginTop: '10px' }}><strong>3. WhatsApp Messaging:</strong> Summary messages are sent exclusively to numbers that have explicitly paired and opted into notifications.</p>
                </div>
              )}

              {activePolicyModal === 'terms' && (
                <div>
                  <p><strong>1. Telephony Route:</strong> The service processes calls reaching an enabled, supported cloud telephony route. It does not promise answering ordinary SIM calls without carrier forwarding setup.</p>
                  <p style={{ marginTop: '10px' }}><strong>2. AI Agent Behavior:</strong> The assistant follows verified business facts. It does not fabricate pricing or commit binding bookings without connected system confirmation.</p>
                  <p style={{ marginTop: '10px' }}><strong>3. Fair Usage:</strong> Unbounded calling campaigns or abusive automated traffic are prohibited.</p>
                </div>
              )}

              {activePolicyModal === 'retention' && (
                <div>
                  <p><strong>Standard Retention Window:</strong> Call history, metadata, and extracted lead summaries are retained for 90 days by default.</p>
                  <p style={{ marginTop: '10px' }}><strong>Customer-Directed Deletion:</strong> Account owners can delete any call record directly from the web portal, which removes all associated lead summaries immediately.</p>
                </div>
              )}

              {activePolicyModal === 'refund' && (
                <div>
                  <p><strong>Billing Cycle:</strong> Subscriptions renew monthly or annually based on selected checkout frequency.</p>
                  <p style={{ marginTop: '10px' }}><strong>Included Minutes & Overages:</strong> Each plan states included minutes clearly. Extra usage is billed at the disclosed overage rate per minute.</p>
                  <p style={{ marginTop: '10px' }}><strong>Cancellation:</strong> Customers can cancel subscriptions anytime from the billing tab. Access remains active until the end of the paid billing period.</p>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #E4E8F0', paddingTop: '16px', marginTop: '16px', textAlign: 'right' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setActivePolicyModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
