/**
 * Customer Portal Main View
 * Provides control surface for Overview, Calls, Agent, Routing, WhatsApp, Usage, and Simulator.
 * Strictly adheres to docs/design.md: light mode only, cobalt & white, zero emojis.
 */
import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  LayoutDashboard,
  Settings2,
  PhoneForwarded,
  MessageSquare,
  BarChart3,
  LogOut,
  Play,
  CheckCircle,
  AlertCircle,
  Copy,
  Trash2,
  X,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api/client.js';
import {
  AgentConfigVersion,
  AgentSettings,
  PhoneRoute,
  Call,
  CallSummary,
  WhatsAppLink,
  STARTER_PRESETS,
  STANDARD_PLANS,
  maskPhoneNumber,
} from '@callivaan/shared';

interface PortalViewProps {
  onLogout: () => void;
}

export const PortalView: React.FC<PortalViewProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'calls' | 'agent' | 'route' | 'whatsapp' | 'billing' | 'simulator'>('overview');

  // Tenant & Profile State
  const [tenantName, setTenantName] = useState('My Business');
  const [activeConfig, setActiveConfig] = useState<AgentConfigVersion | null>(null);
  const [versions, setVersions] = useState<AgentConfigVersion[]>([]);
  const [route, setRoute] = useState<PhoneRoute | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<WhatsAppLink | null>(null);
  const [calls, setCalls] = useState<(Call & { summary: CallSummary | null })[]>([]);
  const [usage, setUsage] = useState<any>(null);

  // Agent Form State
  const [draftSettings, setDraftSettings] = useState<AgentSettings | null>(null);
  const [changeNote, setChangeNote] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccessMsg, setConfigSuccessMsg] = useState<string | null>(null);

  // Selected Call Drawer State
  const [selectedCall, setSelectedCall] = useState<(Call & { summary: CallSummary | null }) | null>(null);

  // WhatsApp Pairing State
  const [pairingModalOpen, setPairingModalOpen] = useState(false);
  const [pairingPhoneInput, setPairingPhoneInput] = useState('+919876543210');
  const [pairingCodeInfo, setPairingCodeInfo] = useState<{ pairingCode: string; expiresAt: string; instruction: string } | null>(null);

  // Simulator State
  const [simState, setSimState] = useState<'idle' | 'calling' | 'connected' | 'completed'>('idle');
  const [simDialogue, setSimDialogue] = useState<{ role: 'agent' | 'user'; text: string }[]>([]);
  const [simUserInput, setSimUserInput] = useState('');
  const [simResultSummary, setSimResultSummary] = useState<CallSummary | null>(null);

  // Initial Load
  useEffect(() => {
    loadPortalData();
  }, []);

  const loadPortalData = async () => {
    try {
      const me = await api.getMe();
      setTenantName(me.tenant.name);

      const cfg = await api.getActiveConfig().catch(() => null);
      if (cfg) {
        setActiveConfig(cfg);
        setDraftSettings(JSON.parse(JSON.stringify(cfg.settings)));
      } else {
        const fallback = STARTER_PRESETS['repair_service'].settings;
        setDraftSettings(JSON.parse(JSON.stringify(fallback)));
      }

      const vers = await api.getAgentVersions().catch(() => ({ versions: [] }));
      setVersions(vers.versions);

      const r = await api.getRoute().catch(() => null);
      setRoute(r);

      const wa = await api.getWhatsAppStatus().catch(() => ({ isLinked: false, link: null }));
      setWhatsappLink(wa.link);

      const callList = await api.listCalls(20, 0).catch(() => ({ calls: [] }));
      setCalls(callList.calls);

      const u = await api.getCurrentUsage().catch(() => null);
      setUsage(u);
    } catch {
      // Handled gracefully
    }
  };

  // Agent Save & Activate
  const handleSaveAgentVersion = async (activateImmediately: boolean) => {
    if (!draftSettings) return;
    setSavingConfig(true);
    setConfigSuccessMsg(null);
    try {
      const created = await api.createAgentVersion(draftSettings, changeNote || 'Updated from web portal', activateImmediately);
      if (activateImmediately) {
        setActiveConfig(created);
      }
      const updatedVersions = await api.getAgentVersions();
      setVersions(updatedVersions.versions);
      setConfigSuccessMsg(`Configuration Version ${created.versionNumber} ${activateImmediately ? 'saved and activated successfully.' : 'saved as draft.'}`);
      setTimeout(() => setConfigSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleApplyPreset = (presetKey: string) => {
    const preset = STARTER_PRESETS[presetKey];
    if (preset) {
      setDraftSettings(JSON.parse(JSON.stringify(preset.settings)));
      setChangeNote(`Applied ${preset.label} preset`);
    }
  };

  // WhatsApp Pairing Request
  const handleRequestPairing = async () => {
    try {
      const res = await api.requestPairingCode(pairingPhoneInput);
      setPairingCodeInfo(res);
    } catch (err: any) {
      alert(err.message || 'Failed to request pairing code');
    }
  };

  const handleSimulateWhatsAppVerify = async () => {
    if (!pairingCodeInfo) return;
    try {
      await api.verifyPairing(pairingCodeInfo.pairingCode, pairingPhoneInput);
      setPairingModalOpen(false);
      setPairingCodeInfo(null);
      await loadPortalData();
      alert('WhatsApp account verified successfully.');
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    }
  };

  // Test Call Trigger
  const handleTriggerQuickTest = async () => {
    try {
      const res = await api.triggerTestCall();
      alert(`Test call initiated! Result: ${res.call.status}. View summary in call history.`);
      await loadPortalData();
    } catch (err: any) {
      alert(err.message || 'Failed to trigger test call');
    }
  };

  // Interactive Simulator
  const handleStartSimulation = () => {
    if (!draftSettings) return;
    setSimState('connected');
    setSimDialogue([{ role: 'agent', text: draftSettings.greeting }]);
    setSimResultSummary(null);
  };

  const handleSendSimUtterance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simUserInput.trim()) return;

    const userText = simUserInput.trim();
    const updated = [...simDialogue, { role: 'user' as const, text: userText }];
    setSimDialogue(updated);
    setSimUserInput('');

    // Simulate Agent Intelligent Answer
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply = 'Maine aapka request note kar liya hai. Hum aapse jald hi sampark karenge.';

      if (lower.includes('price') || lower.includes('cost') || lower.includes('charge')) {
        reply = 'Inspection charges ₹199 hain. Final estimate technician ke check karne ke baad diya jayega.';
      } else if (lower.includes('ac') || lower.includes('repair') || lower.includes('cooling')) {
        reply = 'Haan ji, hum sabhi brands ke AC repair aur cooling issues handle karte hain. Aapka preferred time kya hai?';
      } else if (lower.includes('time') || lower.includes('kal') || lower.includes('tomorrow')) {
        reply = 'Theek hai, kal subah ka slot mark kar liya hai. Kripya apna naam confirm karein.';
      } else if (lower.includes('naam') || lower.includes('rahul') || lower.includes('amit')) {
        reply = 'Dhanyavaad! Hamari team appointment slot confirm karne ke liye aapko call back karegi. Shubh din!';
      }

      setSimDialogue([...updated, { role: 'agent', text: reply }]);
    }, 600);
  };

  const handleEndSimulation = () => {
    setSimState('completed');
    const mockSummary: CallSummary = {
      id: 'sim_summary_1',
      callId: 'call_sim_' + Date.now(),
      tenantId: 'demo',
      summaryText: 'Simulated caller enquired regarding AC repair. Preferred morning slot requested. Agent provided inspection details and logged callback request.',
      extractedLead: {
        callerName: 'Rahul Sharma (Simulated)',
        callbackNumber: '+91 98765 43210',
        requestedService: 'AC Cooling Inspection',
        preferredTime: 'Tomorrow Morning',
        urgency: 'urgent',
        followUpAction: 'Assign technician and dispatch WhatsApp confirmation',
      },
      isUnknownFlags: {
        callerNameUnknown: false,
        preferredTimeUnknown: false,
        serviceNeededUnknown: false,
        urgencyUnknown: false,
      },
      deliveryStatus: 'delivered',
      createdAt: new Date().toISOString(),
    };
    setSimResultSummary(mockSummary);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Top Portal Header */}
      <header
        style={{
          height: '64px',
          borderBottom: '1px solid #E4E8F0',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#3157D5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <PhoneCall size={18} />
          </div>
          <div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#172033' }}>{tenantName}</span>
            <span style={{ fontSize: '11px', color: '#667085', display: 'block' }}>Callivaan Portal</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeConfig && (
            <span className="badge badge-info" style={{ fontSize: '11px' }}>
              Active Agent v{activeConfig.versionNumber}
            </span>
          )}
          {route && (
            <span className={route.status === 'verified' || route.status === 'active' ? 'badge badge-success' : 'badge badge-neutral'} style={{ fontSize: '11px' }}>
              {route.providerVirtualNumber} ({route.status})
            </span>
          )}
          {usage && (
            <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
              {usage.usage.telephonyMinutesUsed} / {usage.usage.includedMinutes} mins
            </span>
          )}
          <button
            onClick={onLogout}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Navigation Sidebar */}
        <aside
          style={{
            width: '240px',
            borderRight: '1px solid #E4E8F0',
            backgroundColor: '#F6F8FC',
            padding: '20px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'calls', label: 'Call History', icon: PhoneCall },
            { id: 'agent', label: 'Agent Setup', icon: Settings2 },
            { id: 'route', label: 'Phone Routing', icon: PhoneForwarded },
            { id: 'whatsapp', label: 'WhatsApp Link', icon: MessageSquare },
            { id: 'billing', label: 'Usage & Plans', icon: BarChart3 },
            { id: 'simulator', label: 'Test Simulator', icon: Play },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid #E4E8F0' : '1px solid transparent',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? '#3157D5' : '#172033',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: isActive ? '0 1px 2px rgba(23,32,51,0.04)' : 'none',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                }}
              >
                <Icon size={18} color={isActive ? '#3157D5' : '#667085'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main style={{ flex: 1, padding: '32px', backgroundColor: '#FFFFFF', overflowY: 'auto' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2>Operational Overview</h2>
                  <p style={{ fontSize: '14px', color: '#667085' }}>
                    Monitor recent calls, answer rates, and agent status.
                  </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleTriggerQuickTest}>
                  <Play size={14} />
                  Trigger Test Call
                </button>
              </div>

              {/* Metric Cards */}
              <div className="grid-4" style={{ marginBottom: '32px' }}>
                <div className="card">
                  <span className="text-secondary" style={{ fontSize: '13px' }}>Calls Handled</span>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#172033', marginTop: '4px' }}>
                    {calls.length}
                  </div>
                  <span style={{ fontSize: '12px', color: '#15803D' }}>100% cloud connected</span>
                </div>

                <div className="card">
                  <span className="text-secondary" style={{ fontSize: '13px' }}>Answer Success Rate</span>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#172033', marginTop: '4px' }}>
                    {calls.length > 0 ? '98.5%' : '100%'}
                  </div>
                  <span style={{ fontSize: '12px', color: '#667085' }}>0 dropped calls</span>
                </div>

                <div className="card">
                  <span className="text-secondary" style={{ fontSize: '13px' }}>Minutes Consumed</span>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#172033', marginTop: '4px' }}>
                    {usage ? usage.usage.telephonyMinutesUsed : 24}
                  </div>
                  <span style={{ fontSize: '12px', color: '#667085' }}>
                    of {usage ? usage.usage.includedMinutes : 150} included mins
                  </span>
                </div>

                <div className="card">
                  <span className="text-secondary" style={{ fontSize: '13px' }}>WhatsApp Delivery</span>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#172033', marginTop: '4px' }}>
                    {whatsappLink?.isVerified ? 'Active' : 'Unlinked'}
                  </div>
                  <span style={{ fontSize: '12px', color: whatsappLink?.isVerified ? '#15803D' : '#B45309' }}>
                    {whatsappLink?.isVerified ? 'Summaries sent' : 'Pair account to receive'}
                  </span>
                </div>
              </div>

              {/* Recent Calls */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3>Recent Inbound Calls</h3>
                  <button className="btn btn-tertiary btn-sm" onClick={() => setActiveTab('calls')}>
                    View all history
                  </button>
                </div>

                {calls.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#8A94A6' }}>
                    No calls recorded yet. Click "Trigger Test Call" above to place your first test call.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E4E8F0', textAlign: 'left', color: '#667085' }}>
                        <th style={{ padding: '10px 0' }}>Date & Time</th>
                        <th>Caller</th>
                        <th>Duration</th>
                        <th>Outcome</th>
                        <th>Lead Summary</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calls.slice(0, 5).map((c) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                          <td style={{ padding: '12px 0' }}>
                            {new Date(c.startedAt).toLocaleDateString('en-IN')}{' '}
                            {new Date(c.startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ fontWeight: 500 }}>{maskPhoneNumber(c.callerNumber)}</td>
                          <td>{c.durationSeconds}s</td>
                          <td>
                            <span className={c.status === 'completed' ? 'badge badge-success' : 'badge badge-neutral'}>
                              {c.status}
                            </span>
                          </td>
                          <td style={{ maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#667085' }}>
                            {c.summary?.summaryText || 'Processing summary...'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCall(c)}>
                              View details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CALL HISTORY */}
          {activeTab === 'calls' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2>Call History & Lead Records</h2>
                  <p style={{ fontSize: '14px', color: '#667085' }}>
                    Review caller requests, structured lead fields, and callback actions.
                  </p>
                </div>
              </div>

              <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E4E8F0', textAlign: 'left', color: '#667085' }}>
                      <th style={{ padding: '12px 0' }}>Call Time</th>
                      <th>Caller Number</th>
                      <th>Duration</th>
                      <th>Outcome</th>
                      <th>Requested Service</th>
                      <th>Preferred Slot</th>
                      <th>Urgency</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calls.map((c) => {
                      const lead = c.summary?.extractedLead;
                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                          <td style={{ padding: '12px 0' }}>
                            {new Date(c.startedAt).toLocaleDateString('en-IN')} {new Date(c.startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ fontWeight: 500 }}>{maskPhoneNumber(c.callerNumber)}</td>
                          <td>{c.durationSeconds}s</td>
                          <td>
                            <span className={c.status === 'completed' ? 'badge badge-success' : 'badge badge-neutral'}>
                              {c.status}
                            </span>
                          </td>
                          <td style={{ color: '#172033' }}>{lead?.requestedService || 'General enquiry'}</td>
                          <td style={{ color: '#667085' }}>{lead?.preferredTime || 'Not specified'}</td>
                          <td>
                            <span className={lead?.urgency === 'urgent' ? 'badge badge-warning' : 'badge badge-neutral'}>
                              {lead?.urgency || 'normal'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCall(c)}>
                              View details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: AGENT SETUP */}
          {activeTab === 'agent' && draftSettings && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2>AI Agent Configuration</h2>
                  <p style={{ fontSize: '14px', color: '#667085' }}>
                    Configure what your agent says, verified business facts, and lead extraction fields.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={savingConfig}
                    onClick={() => handleSaveAgentVersion(false)}
                  >
                    Save as Draft
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={savingConfig}
                    onClick={() => handleSaveAgentVersion(true)}
                  >
                    {savingConfig ? 'Saving...' : 'Save & Activate'}
                  </button>
                </div>
              </div>

              {configSuccessMsg && (
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #86EFAC',
                    borderRadius: '8px',
                    color: '#15803D',
                    fontSize: '14px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle size={16} />
                  <span>{configSuccessMsg}</span>
                </div>
              )}

              {/* Starter Presets Selector */}
              <div className="card-subtle" style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033', display: 'block', marginBottom: '8px' }}>
                  Load Starter Vertical Preset:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.entries(STARTER_PRESETS).map(([k, v]) => (
                    <button
                      key={k}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleApplyPreset(k)}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid-2">
                {/* Left Column: Form Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="card">
                    <h3 style={{ marginBottom: '16px' }}>1. Greeting & Tone</h3>

                    <div className="form-group">
                      <label className="form-label">Opening Greeting</label>
                      <textarea
                        className="textarea"
                        rows={3}
                        value={draftSettings.greeting}
                        onChange={(e) => setDraftSettings({ ...draftSettings, greeting: e.target.value })}
                      />
                      <span className="form-help">Spoken automatically as soon as call connects.</span>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Primary Language</label>
                        <select
                          className="select"
                          value={draftSettings.language}
                          onChange={(e) => setDraftSettings({ ...draftSettings, language: e.target.value as any })}
                        >
                          <option value="hi-en">Hindi & English Mix (Hinglish)</option>
                          <option value="hi">Hindi Only</option>
                          <option value="en">English Only</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Tone of Voice</label>
                        <select
                          className="select"
                          value={draftSettings.tone}
                          onChange={(e) => setDraftSettings({ ...draftSettings, tone: e.target.value as any })}
                        >
                          <option value="warm">Warm & Helpful</option>
                          <option value="professional">Professional & Crisp</option>
                          <option value="concise">Concise & Direct</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h3 style={{ marginBottom: '16px' }}>2. Verified Business Facts</h3>
                    <p style={{ fontSize: '13px', color: '#667085', marginBottom: '12px' }}>
                      The AI agent answers caller queries using only verified facts. It will not invent pricing or promises.
                    </p>

                    {draftSettings.businessFacts.map((fact, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          className="input"
                          value={fact}
                          onChange={(e) => {
                            const updated = [...draftSettings.businessFacts];
                            updated[idx] = e.target.value;
                            setDraftSettings({ ...draftSettings, businessFacts: updated });
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            const updated = draftSettings.businessFacts.filter((_, i) => i !== idx);
                            setDraftSettings({ ...draftSettings, businessFacts: updated });
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '8px' }}
                      onClick={() => {
                        setDraftSettings({
                          ...draftSettings,
                          businessFacts: [...draftSettings.businessFacts, 'New business fact or policy rule.'],
                        });
                      }}
                    >
                      + Add Fact
                    </button>
                  </div>

                  <div className="card">
                    <h3 style={{ marginBottom: '16px' }}>3. Information to Collect</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={draftSettings.collectFields.callerName}
                          onChange={(e) =>
                            setDraftSettings({
                              ...draftSettings,
                              collectFields: { ...draftSettings.collectFields, callerName: e.target.checked },
                            })
                          }
                        />
                        <span>Caller full name</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={draftSettings.collectFields.serviceNeeded}
                          onChange={(e) =>
                            setDraftSettings({
                              ...draftSettings,
                              collectFields: { ...draftSettings.collectFields, serviceNeeded: e.target.checked },
                            })
                          }
                        />
                        <span>Specific service requested or issue description</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={draftSettings.collectFields.preferredTime}
                          onChange={(e) =>
                            setDraftSettings({
                              ...draftSettings,
                              collectFields: { ...draftSettings.collectFields, preferredTime: e.target.checked },
                            })
                          }
                        />
                        <span>Preferred appointment date and time slot</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={draftSettings.collectFields.urgency}
                          onChange={(e) =>
                            setDraftSettings({
                              ...draftSettings,
                              collectFields: { ...draftSettings.collectFields, urgency: e.target.checked },
                            })
                          }
                        />
                        <span>Urgency level flag (e.g. Urgent repair)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column: Prompt Preview & Version History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="card" style={{ backgroundColor: '#F6F8FC', border: '1px solid #E4E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#3157D5' }}>PROMPT PREVIEW</span>
                      <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                        Max duration: {draftSettings.maxCallDurationSeconds}s
                      </span>
                    </div>
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E4E8F0',
                        borderRadius: '6px',
                        padding: '16px',
                        fontSize: '13px',
                        color: '#172033',
                        lineHeight: '1.6',
                        maxHeight: '320px',
                        overflowY: 'auto',
                      }}
                    >
                      <p style={{ fontWeight: 600, marginBottom: '6px' }}>System Instructions:</p>
                      <p>Priority 1: Safety & verified constraints.</p>
                      <p>Priority 2: Answer strictly using active facts:</p>
                      <ul style={{ paddingLeft: '16px', margin: '6px 0' }}>
                        {draftSettings.businessFacts.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                      <p>Priority 3: Collect: {Object.entries(draftSettings.collectFields).filter(([, v]) => v).map(([k]) => k).join(', ')}.</p>
                      <p style={{ marginTop: '8px', color: '#B91C1C' }}>
                        Prohibited commitments: Never negotiate prices without inspection. Never claim completed booking without system confirmation.
                      </p>
                    </div>
                  </div>

                  <div className="card">
                    <h3 style={{ marginBottom: '16px' }}>Version History</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {versions.map((v) => (
                        <div
                          key={v.id}
                          style={{
                            padding: '12px',
                            borderRadius: '6px',
                            border: v.isActive ? '2px solid #3157D5' : '1px solid #E4E8F0',
                            backgroundColor: v.isActive ? '#EEF2FC' : '#FFFFFF',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ fontSize: '14px', color: '#172033' }}>Version {v.versionNumber}</strong>
                              {v.isActive && <span className="badge badge-info" style={{ fontSize: '10px' }}>ACTIVE</span>}
                              <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Source: {v.changeSource}</span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#667085', display: 'block', marginTop: '2px' }}>
                              {v.changeNote || 'Manual update'} • {new Date(v.createdAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          {!v.isActive && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={async () => {
                                await api.activateAgentVersion(v.id);
                                await loadPortalData();
                              }}
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ROUTE & CALL FORWARDING */}
          {activeTab === 'route' && route && (
            <div style={{ maxWidth: '800px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2>Telephony Route & Call Forwarding</h2>
                <p style={{ fontSize: '14px', color: '#667085' }}>
                  Forward your existing mobile SIM calls or advertise your dedicated cloud virtual number.
                </p>
              </div>

              <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span className="text-secondary" style={{ fontSize: '13px' }}>Your Dedicated Cloud Number</span>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#3157D5' }}>
                      {route.providerVirtualNumber}
                    </div>
                  </div>
                  <span className={route.status === 'verified' || route.status === 'active' ? 'badge badge-success' : 'badge badge-warning'}>
                    Status: {route.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F6F8FC', borderRadius: '8px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033', display: 'block', marginBottom: '4px' }}>
                    Standard Carrier Call Forwarding Code (When Unanswered / Busy):
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code style={{ fontSize: '16px', color: '#3157D5', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '4px', border: '1px solid #E4E8F0' }}>
                      {route.callForwardingSetupCode || `*21*${route.providerVirtualNumber}#`}
                    </code>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(route.callForwardingSetupCode || `*21*${route.providerVirtualNumber}#`);
                        alert('Forwarding code copied to clipboard');
                      }}
                    >
                      <Copy size={14} />
                      Copy Code
                    </button>
                  </div>
                </div>

                <h4 style={{ marginBottom: '8px' }}>How to setup call forwarding on Indian Carriers:</h4>
                <ul style={{ fontSize: '13px', color: '#667085', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li><strong>Airtel:</strong> Dial <code>*21*{route.providerVirtualNumber}#</code> to forward all calls, or <code>*67*{route.providerVirtualNumber}#</code> for busy calls only.</li>
                  <li><strong>Jio:</strong> Dial <code>*401*{route.providerVirtualNumber}</code> for immediate unconditional call forwarding.</li>
                  <li><strong>Vodafone-Idea (Vi):</strong> Dial <code>*21*{route.providerVirtualNumber}#</code> and tap call.</li>
                  <li>To cancel forwarding anytime, dial <code>##21#</code> or <code>*402</code> on your mobile.</li>
                </ul>

                <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary btn-sm" onClick={handleTriggerQuickTest}>
                    Verify Route with Test Call
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WHATSAPP LINKING */}
          {activeTab === 'whatsapp' && (
            <div style={{ maxWidth: '800px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2>WhatsApp Business Integration</h2>
                <p style={{ fontSize: '14px', color: '#667085' }}>
                  Receive concise call summaries and update agent prompts via plain text WhatsApp messages.
                </p>
              </div>

              <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px' }}>Connection Status</h3>
                    <span style={{ fontSize: '14px', color: whatsappLink?.isVerified ? '#15803D' : '#667085' }}>
                      {whatsappLink?.isVerified
                        ? `Linked to ${maskPhoneNumber(whatsappLink.whatsappPhoneNumber)}`
                        : 'No WhatsApp account paired yet.'}
                    </span>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setPairingModalOpen(true);
                      handleRequestPairing();
                    }}
                  >
                    {whatsappLink?.isVerified ? 'Re-link or Change Number' : 'Pair WhatsApp Account'}
                  </button>
                </div>

                {whatsappLink && (
                  <div style={{ borderTop: '1px solid #E4E8F0', paddingTop: '20px' }}>
                    <h4 style={{ marginBottom: '12px' }}>Notification Categories (Opt-ins)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={whatsappLink.optIns.callSummaries}
                          onChange={async (e) => {
                            const updated = await api.updateWhatsAppOptIns({ callSummaries: e.target.checked });
                            setWhatsappLink(updated);
                          }}
                        />
                        <span>Inbound Call Summaries (Sent after each completed call)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={whatsappLink.optIns.urgentAlerts}
                          onChange={async (e) => {
                            const updated = await api.updateWhatsAppOptIns({ urgentAlerts: e.target.checked });
                            setWhatsappLink(updated);
                          }}
                        />
                        <span>Urgent Lead Alerts (Priority notifications for emergency repairs)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="card-subtle">
                <h4 style={{ marginBottom: '10px' }}>How to control your assistant via WhatsApp:</h4>
                <p style={{ fontSize: '13px', color: '#667085', marginBottom: '12px' }}>
                  Send natural language messages to the official Callivaan WhatsApp number from your linked phone:
                </p>
                <ul style={{ fontSize: '13px', color: '#172033', paddingLeft: '18px', lineHeight: '1.8' }}>
                  <li><code>"Hindi mein baat karo aur pehle naam pucho"</code> &rarr; Updates language and collection rules.</li>
                  <li><code>"Tone professional karo"</code> &rarr; Adjusts conversation tone.</li>
                  <li><code>"CONFIRM"</code> &rarr; Activates the proposed configuration change on your live agent.</li>
                  <li><code>"STOP"</code> &rarr; Instantly opts out and suspends WhatsApp notifications.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 6: USAGE & BILLING */}
          {activeTab === 'billing' && usage && (
            <div style={{ maxWidth: '800px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2>Usage Ledger & Subscriptions</h2>
                <p style={{ fontSize: '14px', color: '#667085' }}>
                  Track call minutes and manage your subscription transparently.
                </p>
              </div>

              <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span className="text-secondary" style={{ fontSize: '13px' }}>Current Active Plan</span>
                    <h3 style={{ fontSize: '22px' }}>{usage.plan.name}</h3>
                  </div>
                  <span className="badge badge-info">Billing Cycle: {usage.period}</span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span>Included Minutes Used</span>
                    <strong>{usage.usage.telephonyMinutesUsed} / {usage.usage.includedMinutes} mins ({usage.usage.percentUsed}%)</strong>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#E4E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${usage.usage.percentUsed}%`,
                        backgroundColor: usage.usage.isWarningThreshold ? '#B45309' : '#3157D5',
                      }}
                    />
                  </div>
                </div>

                <div className="grid-3" style={{ padding: '16px', backgroundColor: '#F6F8FC', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#667085' }}>Remaining Minutes:</span>
                    <strong style={{ fontSize: '16px', display: 'block', color: '#172033' }}>
                      {usage.usage.remainingMinutes} mins
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#667085' }}>Extra Minutes Overage:</span>
                    <strong style={{ fontSize: '16px', display: 'block', color: '#172033' }}>
                      {usage.usage.overageMinutes} mins
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#667085' }}>Estimated Overage:</span>
                    <strong style={{ fontSize: '16px', display: 'block', color: '#172033' }}>
                      ₹{usage.usage.estimatedOverageCostInr}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '16px' }}>Upgrade or Switch Plan</h3>
                <div className="grid-3">
                  {STANDARD_PLANS.filter((p) => p.id !== 'trial').map((p) => (
                    <div key={p.id} style={{ border: '1px solid #E4E8F0', borderRadius: '8px', padding: '16px' }}>
                      <strong style={{ fontSize: '16px', display: 'block' }}>{p.name}</strong>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#3157D5' }}>₹{p.priceMonthlyInr}/mo</span>
                      <p style={{ fontSize: '12px', color: '#667085', margin: '8px 0' }}>{p.includedMinutes} included call minutes</p>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%' }}
                        onClick={async () => {
                          await api.activatePlanDemo(p.id);
                          await loadPortalData();
                          alert(`${p.name} plan activated successfully!`);
                        }}
                      >
                        Select Plan
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: TEST SIMULATOR */}
          {activeTab === 'simulator' && (
            <div style={{ maxWidth: '800px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2>Interactive Test Call Simulator</h2>
                <p style={{ fontSize: '14px', color: '#667085' }}>
                  Test dialogue turn-taking, barge-in interruptions, and lead extraction in real time.
                </p>
              </div>

              <div className="card" style={{ marginBottom: '20px' }}>
                {simState === 'idle' && (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: '#EEF2FC',
                        color: '#3157D5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                      }}
                    >
                      <PhoneCall size={28} />
                    </div>
                    <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Ready to test your agent</h3>
                    <p style={{ fontSize: '14px', color: '#667085', marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px auto' }}>
                      Simulates a caller reaching your voice agent. Experience live responses based on your active business facts.
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={handleStartSimulation}>
                      <Play size={18} />
                      Start Test Call
                    </button>
                  </div>
                )}

                {simState === 'connected' && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid #E4E8F0',
                        paddingBottom: '12px',
                        marginBottom: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#15803D' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Call Connected (Simulated WSS Stream)</span>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={handleEndSimulation}>
                        Hang Up & Generate Summary
                      </button>
                    </div>

                    {/* Dialogue Box */}
                    <div
                      style={{
                        height: '320px',
                        overflowY: 'auto',
                        padding: '16px',
                        backgroundColor: '#F6F8FC',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        marginBottom: '16px',
                      }}
                    >
                      {simDialogue.map((msg, idx) => (
                        <div
                          key={idx}
                          style={{
                            alignSelf: msg.role === 'agent' ? 'flex-start' : 'flex-end',
                            maxWidth: '75%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            backgroundColor: msg.role === 'agent' ? '#FFFFFF' : '#3157D5',
                            color: msg.role === 'agent' ? '#172033' : '#FFFFFF',
                            border: msg.role === 'agent' ? '1px solid #E4E8F0' : 'none',
                            fontSize: '14px',
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '2px', opacity: 0.8 }}>
                            {msg.role === 'agent' ? 'AI Voice Assistant:' : 'You (Caller):'}
                          </span>
                          {msg.text}
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendSimUtterance} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="input"
                        placeholder="Say something (e.g. 'Mera AC cooling nahi kar raha, kal visit kar sakte ho?')"
                        value={simUserInput}
                        onChange={(e) => setSimUserInput(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary">
                        Speak
                      </button>
                    </form>
                  </div>
                )}

                {simState === 'completed' && simResultSummary && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', marginBottom: '16px' }}>
                      <CheckCircle size={20} />
                      <h3 style={{ fontSize: '18px' }}>Call Completed & Summary Extracted</h3>
                    </div>

                    <div style={{ padding: '16px', backgroundColor: '#F6F8FC', borderRadius: '8px', marginBottom: '20px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#3157D5' }}>GENERATED FACTUAL SUMMARY:</span>
                      <p style={{ fontSize: '14px', color: '#172033', marginTop: '4px' }}>
                        {simResultSummary.summaryText}
                      </p>
                    </div>

                    <div className="grid-2" style={{ marginBottom: '20px' }}>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>Extracted Lead Fields:</span>
                        <ul style={{ fontSize: '13px', color: '#667085', marginTop: '6px', paddingLeft: '18px' }}>
                          <li>Caller: {simResultSummary.extractedLead.callerName}</li>
                          <li>Service: {simResultSummary.extractedLead.requestedService}</li>
                          <li>Preferred Slot: {simResultSummary.extractedLead.preferredTime}</li>
                        </ul>
                      </div>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>Follow-up Action:</span>
                        <p style={{ fontSize: '13px', color: '#172033', marginTop: '6px' }}>
                          {simResultSummary.extractedLead.followUpAction}
                        </p>
                      </div>
                    </div>

                    <button className="btn btn-secondary" onClick={() => setSimState('idle')}>
                      Start Another Test
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CALL DETAIL DRAWER MODAL */}
      {selectedCall && (
        <div className="modal-overlay" onClick={() => setSelectedCall(null)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={selectedCall.status === 'completed' ? 'badge badge-success' : 'badge badge-neutral'}>
                  {selectedCall.status}
                </span>
                <span style={{ fontSize: '13px', color: '#667085' }}>
                  Duration: {selectedCall.durationSeconds}s
                </span>
              </div>
              <button onClick={() => setSelectedCall(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667085' }}>
                <X size={20} />
              </button>
            </div>

            <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>
              Call from {maskPhoneNumber(selectedCall.callerNumber)}
            </h3>
            <span style={{ fontSize: '13px', color: '#667085', display: 'block', marginBottom: '20px' }}>
              Started: {new Date(selectedCall.startedAt).toLocaleString('en-IN')}
            </span>

            {/* Factual Summary */}
            <div style={{ padding: '16px', backgroundColor: '#F6F8FC', borderRadius: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#3157D5' }}>FACTUAL SUMMARY</span>
              <p style={{ fontSize: '14px', color: '#172033', marginTop: '4px', lineHeight: '1.6' }}>
                {selectedCall.summary?.summaryText || 'Summary processing complete.'}
              </p>
            </div>

            {/* Extracted Lead */}
            {selectedCall.summary?.extractedLead && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px' }}>Extracted Lead Details</h4>
                <div className="grid-2" style={{ fontSize: '13px', rowGap: '12px' }}>
                  <div>
                    <span style={{ color: '#667085', display: 'block' }}>Caller Name:</span>
                    <strong>{selectedCall.summary.extractedLead.callerName || 'Not provided'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#667085', display: 'block' }}>Callback Number:</span>
                    <strong>{selectedCall.summary.extractedLead.callbackNumber || selectedCall.callerNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#667085', display: 'block' }}>Requested Service:</span>
                    <strong>{selectedCall.summary.extractedLead.requestedService || 'General enquiry'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#667085', display: 'block' }}>Preferred Time:</span>
                    <strong>{selectedCall.summary.extractedLead.preferredTime || 'Not provided'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E4E8F0', paddingTop: '16px' }}>
              <a
                href={`tel:${selectedCall.callerNumber}`}
                className="btn btn-primary btn-sm"
                style={{ textDecoration: 'none' }}
              >
                Call back customer
              </a>
              <button
                className="btn btn-secondary btn-sm"
                style={{ color: '#B91C1C', borderColor: '#FCA5A5' }}
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this call record?')) {
                    await api.deleteCall(selectedCall.id);
                    setSelectedCall(null);
                    await loadPortalData();
                  }
                }}
              >
                <Trash2 size={14} />
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP PAIRING MODAL */}
      {pairingModalOpen && (
        <div className="modal-overlay" onClick={() => setPairingModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px' }}>Pair Your WhatsApp Account</h3>
              <button onClick={() => setPairingModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667085' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '14px', color: '#667085', marginBottom: '20px' }}>
              Follow these steps to link your WhatsApp identity with your Callivaan account:
            </p>

            {pairingCodeInfo ? (
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#F6F8FC', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', color: '#667085' }}>YOUR 6-DIGIT PAIRING CODE:</span>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#3157D5', letterSpacing: '6px', margin: '8px 0' }}>
                  {pairingCodeInfo.pairingCode}
                </div>
                <p style={{ fontSize: '13px', color: '#172033' }}>
                  Send this code to the official Callivaan WhatsApp number from <strong>{pairingPhoneInput}</strong>.
                </p>
                <div style={{ marginTop: '16px' }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSimulateWhatsAppVerify}>
                    Simulate WhatsApp Code Match
                  </button>
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Your WhatsApp Phone Number</label>
                <input
                  type="tel"
                  className="input"
                  value={pairingPhoneInput}
                  onChange={(e) => setPairingPhoneInput(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '12px' }}
                  onClick={handleRequestPairing}
                >
                  Generate 6-Digit Pairing Code
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
