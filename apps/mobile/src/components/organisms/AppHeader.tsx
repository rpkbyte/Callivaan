import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../theme';
import { WaveformLogo } from '../atoms/WaveformLogo';

export interface AppHeaderProps {
  readonly businessName?: string;
  readonly isLive?: boolean;
  readonly onTestCall?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  businessName = 'Shree Balaji Motors',
  isLive = true,
  onTestCall,
}) => {
  return (
    <View style={styles.header} accessibilityRole="header">
      {/* Brand & Business Row */}
      <View style={styles.brandRow}>
        <View style={styles.brandLeft}>
          <View style={styles.logoBox}>
            <WaveformLogo size={20} color={theme.colors.onPrimary} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>Callivaan</Text>
              <View style={styles.voicePill}>
                <Text style={styles.voiceText}>VOICE AI</Text>
              </View>
            </View>
            <Text style={styles.businessSubtitle}>{businessName}</Text>
          </View>
        </View>

        {/* Action Button */}
        {onTestCall ? (
          <Pressable
            onPress={onTestCall}
            style={({ pressed }) => [
              styles.testCallBtn,
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Test call AI voice agent"
          >
            <Text style={styles.testCallText}>Test Call</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Live Telemetry Status Banner */}
      <View style={styles.telemetryBanner}>
        <View style={styles.statusLeft}>
          <View style={[styles.pulseDot, isLive ? styles.pulseGreen : styles.pulseMuted]} />
          <Text style={styles.statusText}>
            {isLive ? 'Live Forwarding Active (Reliance Jio *401*)' : 'Forwarding Paused'}
          </Text>
        </View>
        <Text style={styles.telemetryTag}>320ms Latency</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.onSurface,
    letterSpacing: -0.2,
  },
  voicePill: {
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: theme.radii.pill,
  },
  voiceText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  businessSubtitle: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 1,
  },
  testCallBtn: {
    backgroundColor: theme.colors.primaryFixed,
    borderWidth: 1,
    borderColor: theme.colors.primaryFixedDim,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radii.md,
  },
  testCallText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  telemetryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  pulseGreen: {
    backgroundColor: theme.colors.success,
  },
  pulseMuted: {
    backgroundColor: theme.colors.muted,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  telemetryTag: {
    fontSize: 10,
    color: theme.colors.muted,
    fontVariant: ['tabular-nums'],
  },
});
