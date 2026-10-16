import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { CallRecord } from '../types';
import { theme } from '../theme';
import { TabularText } from '../components/atoms/TabularText';
import { StatusChip } from '../components/atoms/StatusChip';
import { AudioPlayerCard } from '../components/molecules/AudioPlayerCard';

export interface CallDetailScreenProps {
  readonly call: CallRecord;
  readonly onBack: () => void;
  readonly onCallback: (phoneNumber: string) => void;
  readonly onWhatsApp: (phoneNumber: string) => void;
}

export const CallDetailScreen: React.FC<CallDetailScreenProps> = ({
  call,
  onBack,
  onCallback,
  onWhatsApp,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const handleCopy = (text: string) => {
    Alert.alert('Copied to Clipboard', text);
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Navigation Bar */}
        <View style={styles.topNav}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backBtn,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Back to activity stream"
          >
            <Text style={styles.backBtnText}>&larr; Activity</Text>
          </Pressable>

          <Pressable
            onPress={() => onWhatsApp(call.callerNumber)}
            style={({ pressed }) => [
              styles.shareBtn,
              pressed && { opacity: 0.75 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Share to WhatsApp"
          >
            <Text style={styles.shareBtnText}>Share to WhatsApp</Text>
          </Pressable>
        </View>

        {/* 2. Caller Identity Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{getInitials(call.callerName)}</Text>
            </View>

            <View style={styles.callerDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.callerName}>{call.callerName}</Text>
              </View>
              <Pressable
                onPress={() => handleCopy(call.callerNumber)}
                style={styles.phoneRow}
                accessibilityRole="button"
                accessibilityLabel={`Copy ${call.callerNumber}`}
              >
                <TabularText style={styles.callerPhone}>
                  {call.callerNumber}
                </TabularText>
                <Text style={styles.copyPill}>Copy</Text>
              </Pressable>
            </View>

            <View style={styles.simBadge}>
              <Text style={styles.simText}>SIM 1 · Jio</Text>
            </View>
          </View>

          {/* Location & Inbound Strip */}
          <View style={styles.locationStrip}>
            <Text style={styles.locationText}>
              {call.city} · Inbound Voice Gateway
            </Text>
          </View>

          {/* Metadata Chips Row */}
          <View style={styles.chipsRow}>
            <StatusChip
              label={call.status}
              variant={call.status === 'QUALIFIED' ? 'success' : 'primary'}
            />
            <View style={styles.chip}>
              <Text style={styles.chipText}>{call.language}</Text>
            </View>
            <View style={styles.chip}>
              <TabularText style={styles.chipText}>{call.time}</TabularText>
            </View>
            <View style={styles.chip}>
              <TabularText style={styles.chipText}>
                Duration {call.duration}
              </TabularText>
            </View>
          </View>
        </View>

        {/* 3. Audio Player Module */}
        <AudioPlayerCard durationText={call.duration} retentionDays={86} />

        {/* 4. AI Extracted Lead Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>AI Qualification Summary</Text>
            <View style={styles.intentPill}>
              <Text style={styles.intentText}>High Intent</Text>
            </View>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryContent}>{call.summary}</Text>
          </View>
        </View>

        {/* 5. Turn-by-Turn Bilingual Transcript */}
        <View style={styles.transcriptCard}>
          <View style={styles.transcriptHeader}>
            <Text style={styles.transcriptTitle}>Turn-by-Turn Transcript</Text>
            <TabularText style={styles.transcriptCount}>
              {call.transcript.length} turns
            </TabularText>
          </View>

          <View style={styles.transcriptStream}>
            {call.transcript.map((item, index) => {
              const isAi = item.speaker === 'Callivaan AI';
              return (
                <View
                  key={index}
                  style={[
                    styles.transcriptItem,
                    isAi ? styles.transcriptItemAi : styles.transcriptItemCaller,
                  ]}
                >
                  <View style={styles.speakerRow}>
                    <Text
                      style={[
                        styles.speakerName,
                        isAi && styles.speakerNameAi,
                      ]}
                    >
                      {item.speaker}
                    </Text>
                    <TabularText style={styles.speechTime}>{item.time}</TabularText>
                  </View>
                  <Text style={styles.speechText}>{item.text}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* 6. Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => onCallback(call.callerNumber)}
          style={({ pressed }) => [
            styles.callbackBtn,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Call back ${call.callerName}`}
        >
          <Text style={styles.callbackBtnText}>
            Call Back ({call.callerNumber})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onWhatsApp(call.callerNumber)}
          style={({ pressed }) => [
            styles.whatsappBtn,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Send WhatsApp to ${call.callerName}`}
        >
          <Text style={styles.whatsappBtnText}>WhatsApp</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.colors.surfaceDim,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 110,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  shareBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.successContainer,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.success,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  callerDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callerName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.onSurface,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  callerPhone: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  copyPill: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: theme.radii.xs,
  },
  simBadge: {
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.xs,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  simText: {
    fontSize: 10,
    color: theme.colors.muted,
  },
  locationStrip: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  locationText: {
    fontSize: 11,
    color: theme.colors.tertiary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: theme.spacing.sm,
  },
  chip: {
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  intentPill: {
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radii.pill,
  },
  intentText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  summaryBox: {
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.sm,
  },
  summaryContent: {
    fontSize: 12,
    color: theme.colors.onSurface,
    lineHeight: 18,
  },
  transcriptCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  transcriptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  transcriptCount: {
    fontSize: 11,
    color: theme.colors.muted,
  },
  transcriptStream: {
    gap: theme.spacing.xs,
  },
  transcriptItem: {
    padding: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  transcriptItemAi: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderColor: theme.colors.primaryFixedDim,
  },
  transcriptItemCaller: {
    backgroundColor: theme.colors.surface,
  },
  speakerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  speakerName: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  speakerNameAi: {
    color: theme.colors.primary,
  },
  speechTime: {
    fontSize: 10,
    color: theme.colors.muted,
  },
  speechText: {
    fontSize: 12,
    color: theme.colors.onSurface,
    lineHeight: 17,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    elevation: 10,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  callbackBtn: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callbackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
  whatsappBtn: {
    flex: 1,
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
});
