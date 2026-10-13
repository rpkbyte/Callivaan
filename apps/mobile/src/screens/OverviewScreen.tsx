/**
 * Mobile Overview Dashboard Screen
 */
import React, { useState, useEffect } from 'react';
import { mobileColors, mobileSpacing, mobileRadii } from '../theme/tokens.js';
import { mobileApi } from '../api/mobile-client.js';
import { maskPhoneNumber } from '@callivaan/shared';

interface OverviewScreenProps {
  onNavigateTab: (tab: string) => void;
  onSelectCall: (call: any) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({ onNavigateTab, onSelectCall }) => {
  const [activeConfig, setActiveConfig] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [calls, setCalls] = useState<any[]>([]);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cfg = await mobileApi.getActiveConfig().catch(() => null);
      setActiveConfig(cfg);
      const r = await mobileApi.getRoute().catch(() => null);
      setRoute(r);
      const c = await mobileApi.listCalls(10).catch(() => ({ calls: [] }));
      setCalls(c.calls);
      const u = await mobileApi.getUsage().catch(() => null);
      setUsage(u);
    } catch {
      // Ignored
    }
  };

  const handleTestCall = async () => {
    setLoading(true);
    try {
      await mobileApi.triggerTestCall();
      alert('Test call completed! See summary in Call History.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Test call failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: `${mobileSpacing.md}px`, backgroundColor: mobileColors.white }}>
      {/* Route Status Card */}
      {route && (
        <div
          style={{
            padding: `${mobileSpacing.md}px`,
            backgroundColor: mobileColors.surfaceSubtle,
            border: `1px solid ${mobileColors.border}`,
            borderRadius: `${mobileRadii.md}px`,
            marginBottom: `${mobileSpacing.md}px`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', color: mobileColors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
              Cloud Virtual Number
            </span>
            <div style={{ fontSize: '18px', fontWeight: 700, color: mobileColors.cobalt }}>
              {route.providerVirtualNumber}
            </div>
          </div>
          <span
            style={{
              padding: '4px 8px',
              backgroundColor: '#F0FDF4',
              color: mobileColors.statusSuccess,
              borderRadius: `${mobileRadii.pill}px`,
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            ACTIVE ROUTE
          </span>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: `${mobileSpacing.md}px`, marginBottom: `${mobileSpacing.md}px` }}>
        <div
          style={{
            padding: `${mobileSpacing.md}px`,
            border: `1px solid ${mobileColors.border}`,
            borderRadius: `${mobileRadii.md}px`,
          }}
        >
          <span style={{ fontSize: '12px', color: mobileColors.textSecondary }}>Total Calls</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: mobileColors.textPrimary, marginTop: '2px' }}>
            {calls.length}
          </div>
          <span style={{ fontSize: '11px', color: mobileColors.statusSuccess }}>98.5% Answered</span>
        </div>

        <div
          style={{
            padding: `${mobileSpacing.md}px`,
            border: `1px solid ${mobileColors.border}`,
            borderRadius: `${mobileRadii.md}px`,
          }}
        >
          <span style={{ fontSize: '12px', color: mobileColors.textSecondary }}>Minutes Used</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: mobileColors.textPrimary, marginTop: '2px' }}>
            {usage ? usage.usage.telephonyMinutesUsed : 24}
          </div>
          <span style={{ fontSize: '11px', color: mobileColors.textMuted }}>
            of {usage ? usage.plan.includedMinutes : 150} mins
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleTestCall}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: mobileColors.cobalt,
          color: mobileColors.white,
          border: 'none',
          borderRadius: `${mobileRadii.md}px`,
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: `${mobileSpacing.lg}px`,
        }}
      >
        {loading ? 'Calling...' : 'Trigger Test Call'}
      </button>

      {/* Recent Calls List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: `${mobileSpacing.sm}px` }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: mobileColors.textPrimary }}>Recent Inbound Calls</h3>
          <button
            onClick={() => onNavigateTab('calls')}
            style={{ background: 'none', border: 'none', color: mobileColors.cobalt, fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
          >
            See all
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: `${mobileSpacing.sm}px` }}>
          {calls.slice(0, 5).map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCall(c)}
              style={{
                padding: '12px',
                border: `1px solid ${mobileColors.border}`,
                borderRadius: `${mobileRadii.md}px`,
                backgroundColor: mobileColors.white,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ fontSize: '14px', color: mobileColors.textPrimary }}>
                  {maskPhoneNumber(c.callerNumber)}
                </strong>
                <span style={{ fontSize: '12px', color: mobileColors.textSecondary }}>{c.durationSeconds}s</span>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: mobileColors.textSecondary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  margin: 0,
                }}
              >
                {c.summary?.summaryText || 'Call completed. Lead summary ready.'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
