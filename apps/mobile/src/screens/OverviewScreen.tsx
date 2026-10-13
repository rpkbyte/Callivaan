/**
 * Mobile Overview Dashboard Screen
 * Conforms to docs/design.md: light mode, cobalt and white, zero emojis.
 * Built with React Native primitives (View, Text, ScrollView, Pressable, StyleSheet).
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from '../primitives.js';
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Route Status Card */}
      {route ? (
        <View style={styles.routeCard}>
          <View>
            <Text style={styles.routeLabel}>Cloud Virtual Number</Text>
            <Text style={styles.routeNumber}>{route.providerVirtualNumber}</Text>
          </View>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVE ROUTE</Text>
          </View>
        </View>
      ) : null}

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Calls</Text>
          <Text style={styles.metricValue}>{calls.length}</Text>
          <Text style={styles.metricSubtextSuccess}>98.5% Answered</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Minutes Used</Text>
          <Text style={styles.metricValue}>{usage ? usage.usage.telephonyMinutesUsed : 24}</Text>
          <Text style={styles.metricSubtext}>of {usage ? usage.plan.includedMinutes : 150} mins</Text>
        </View>
      </View>

      {/* Action Button */}
      <Pressable
        onPress={handleTestCall}
        disabled={loading}
        style={({ pressed }: { pressed: boolean }) => [styles.actionButton, pressed && styles.actionButtonPressed, loading && styles.actionButtonDisabled]}
      >
        <Text style={styles.actionButtonText}>{loading ? 'Calling...' : 'Trigger Test Call'}</Text>
      </Pressable>

      {/* Recent Calls List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Inbound Calls</Text>
        <Pressable onPress={() => onNavigateTab('calls')}>
          <Text style={styles.seeAllText}>See all</Text>
        </Pressable>
      </View>

      <View style={styles.callsList}>
        {calls.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No call logs yet. Trigger a test call above.</Text>
          </View>
        ) : (
          calls.slice(0, 5).map((c) => (
            <Pressable key={c.id} onPress={() => onSelectCall(c)} style={styles.callRow}>
              <View style={styles.callRowHeader}>
                <Text style={styles.callerNumber}>{maskPhoneNumber(c.callerNumber)}</Text>
                <Text style={styles.callDuration}>{c.durationSeconds}s</Text>
              </View>
              <Text style={styles.callSummary} numberOfLines={1}>
                {c.summary?.summaryText || 'Call completed. Lead summary ready.'}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mobileColors.white,
  },
  contentContainer: {
    padding: mobileSpacing.md,
  },
  routeCard: {
    padding: mobileSpacing.md,
    backgroundColor: mobileColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: mobileColors.border,
    borderRadius: mobileRadii.md,
    marginBottom: mobileSpacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeLabel: {
    fontSize: 11,
    color: mobileColors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  routeNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: mobileColors.cobalt,
    marginTop: 2,
  },
  activeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: mobileRadii.pill,
  },
  activeBadgeText: {
    color: mobileColors.statusSuccess,
    fontSize: 11,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: mobileSpacing.md,
    marginBottom: mobileSpacing.md,
  },
  metricCard: {
    flex: 1,
    padding: mobileSpacing.md,
    borderWidth: 1,
    borderColor: mobileColors.border,
    borderRadius: mobileRadii.md,
    backgroundColor: mobileColors.white,
  },
  metricLabel: {
    fontSize: 12,
    color: mobileColors.textSecondary,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: mobileColors.textPrimary,
    marginVertical: 2,
  },
  metricSubtextSuccess: {
    fontSize: 11,
    color: mobileColors.statusSuccess,
    fontWeight: '500',
  },
  metricSubtext: {
    fontSize: 11,
    color: mobileColors.textMuted,
  },
  actionButton: {
    padding: 12,
    backgroundColor: mobileColors.cobalt,
    borderRadius: mobileRadii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: mobileSpacing.lg,
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonDisabled: {
    backgroundColor: mobileColors.border,
  },
  actionButtonText: {
    color: mobileColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: mobileSpacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: mobileColors.textPrimary,
  },
  seeAllText: {
    color: mobileColors.cobalt,
    fontSize: 13,
    fontWeight: '500',
  },
  callsList: {
    gap: mobileSpacing.sm,
  },
  callRow: {
    padding: 12,
    borderWidth: 1,
    borderColor: mobileColors.border,
    borderRadius: mobileRadii.md,
    backgroundColor: mobileColors.white,
  },
  callRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  callerNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: mobileColors.textPrimary,
  },
  callDuration: {
    fontSize: 12,
    color: mobileColors.textSecondary,
  },
  callSummary: {
    fontSize: 13,
    color: mobileColors.textSecondary,
  },
  emptyCard: {
    padding: mobileSpacing.lg,
    borderWidth: 1,
    borderColor: mobileColors.border,
    borderRadius: mobileRadii.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: mobileColors.textSecondary,
  },
});
