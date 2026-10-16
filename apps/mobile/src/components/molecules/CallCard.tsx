import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CallRecord } from '../../types';
import { theme } from '../../theme';
import { StatusChip } from '../atoms/StatusChip';
import { TabularText } from '../atoms/TabularText';
import { WaveformBars } from '../atoms/WaveformBars';

export interface CallCardProps {
  readonly call: CallRecord;
  readonly onPress: (call: CallRecord) => void;
  readonly onCallback: (phoneNumber: string) => void;
}

export const CallCard: React.FC<CallCardProps> = ({
  call,
  onPress,
  onCallback,
}) => {
  const getStatusVariant = () => {
    switch (call.status) {
      case 'QUALIFIED':
        return 'success';
      case 'ESCALATED':
        return 'error';
      case 'INQUIRY':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  const isEscalated = call.status === 'ESCALATED';

  return (
    <Pressable
      onPress={() => onPress(call)}
      style={({ pressed }) => [
        styles.card,
        isEscalated && styles.escalatedCard,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Call from ${call.callerName}`}
    >
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.callerInfo}>
          <Text style={styles.callerName}>{call.callerName}</Text>
          <TabularText style={styles.callerNumber}>{call.callerNumber}</TabularText>
        </View>

        <View style={styles.badgesCol}>
          <StatusChip label={call.status} variant={getStatusVariant()} />
          <TabularText style={styles.timestamp}>{call.time}</TabularText>
        </View>
      </View>

      {/* Extracted Intent / Requirement */}
      <View style={styles.intentBox}>
        <Text style={styles.intentText} numberOfLines={2}>
          {call.intent}
        </Text>
      </View>

      {/* Audio Waveform & Metadata Bar */}
      <View style={styles.metaRow}>
        <View style={styles.audioPreview}>
          <WaveformBars progress={0.4} height={16} />
          <TabularText style={styles.durationText}>{call.duration}</TabularText>
          <View style={styles.langPill}>
            <Text style={styles.langText}>{call.language}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => onCallback(call.callerNumber)}
          style={({ pressed }) => [
            styles.callbackBtn,
            pressed && { opacity: 0.75 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Call back ${call.callerName}`}
        >
          <Text style={styles.callbackText}>Call Back</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  escalatedCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  pressed: {
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  callerInfo: {
    flex: 1,
  },
  callerName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  callerNumber: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  badgesCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    color: theme.colors.muted,
  },
  intentBox: {
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    marginVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  intentText: {
    fontSize: 12,
    color: theme.colors.tertiary,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  audioPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  durationText: {
    fontSize: 11,
    color: theme.colors.muted,
  },
  langPill: {
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radii.xs,
  },
  langText: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.onSurfaceVariant,
  },
  callbackBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radii.md,
  },
  callbackText: {
    color: theme.colors.onPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
});
