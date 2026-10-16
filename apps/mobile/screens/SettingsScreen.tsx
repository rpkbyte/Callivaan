import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import { TabularText } from '../components/atoms/TabularText';

export interface SettingsScreenProps {
  readonly onUpgradePlan: () => void;
  readonly onChangeWhatsAppNumber: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onUpgradePlan,
  onChangeWhatsAppNumber,
}) => {
  const [instantCards, setInstantCards] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [traiAudioLinks, setTraiAudioLinks] = useState(false);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Row with Telemetry Badge */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Settings &amp; Account</Text>
          <Text style={styles.pageSubtitle}>Shree Balaji Motors</Text>
        </View>
        <View style={styles.versionBadge}>
          <View style={styles.pulseDot} />
          <TabularText style={styles.versionText}>Live v1.4</TabularText>
        </View>
      </View>

      {/* 2. Subscription & Monthly Minute Usage Meter Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.planSub}>ACTIVE PLAN</Text>
            <Text style={styles.planTitle}>Business Pro Plan</Text>
          </View>
          <View style={styles.activePill}>
            <Text style={styles.activeText}>ACTIVE</Text>
          </View>
        </View>

        {/* Meter Gauge Box */}
        <View style={styles.meterBox}>
          <View style={styles.meterNumbersRow}>
            <View style={styles.meterLeft}>
              <TabularText style={styles.meterMain}>248</TabularText>
              <TabularText style={styles.meterTotal}>/ 500 mins</TabularText>
            </View>
            <View style={styles.remainingPill}>
              <TabularText style={styles.remainingText}>
                252 mins remaining
              </TabularText>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '49.6%' }]} />
          </View>

          <View style={styles.meterFooter}>
            <Text style={styles.meterFooterText}>Quota resets 15 Nov 2026</Text>
            <TabularText style={styles.meterFooterText}>49.6% consumed</TabularText>
          </View>
        </View>

        {/* Ledger & Billing Notes */}
        <View style={styles.notesBox}>
          <Text style={styles.noteItem}>
            Overage: ₹2.50 per additional minute beyond quota
          </Text>
          <View style={styles.billingRow}>
            <Text style={styles.billingText}>
              Renews 15 Nov 2026 · ₹1,499/mo via UPI AutoPay (HDFC Bank ending 4012)
            </Text>
          </View>
        </View>

        {/* Upgrade Plan Button */}
        <Pressable
          onPress={onUpgradePlan}
          style={({ pressed }) => [
            styles.upgradeBtn,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Upgrade to Team Plan"
        >
          <Text style={styles.upgradeBtnText}>Upgrade to Team Plan (2,000 mins)</Text>
        </Pressable>
      </View>

      {/* 3. WhatsApp Lead Dispatch Hub Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.sectionHeading}>WhatsApp Lead Dispatch Hub</Text>
            <Text style={styles.sectionSub}>Automated caller transcripts and dispatch</Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>Meta API</Text>
          </View>
        </View>

        {/* Connected Handset Row */}
        <View style={styles.handsetRow}>
          <View>
            <TabularText style={styles.handsetNumber}>+91 98100 23456</TabularText>
            <Text style={styles.handsetDesc}>Principal Owner Handset</Text>
          </View>
          <Pressable
            onPress={onChangeWhatsAppNumber}
            style={({ pressed }) => [
              styles.changeBtn,
              pressed && { opacity: 0.75 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Change WhatsApp phone number"
          >
            <Text style={styles.changeBtnText}>Change</Text>
          </Pressable>
        </View>

        {/* Notification Toggles */}
        <View style={styles.toggleList}>
          {/* Toggle 1: Instant Lead Cards */}
          <View style={styles.toggleItem}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>Instant Lead Cards (&lt; 3s)</Text>
              <Text style={styles.toggleDesc}>
                Dispatched directly to owner handset upon call wrapup
              </Text>
            </View>
            <Switch
              value={instantCards}
              onValueChange={setInstantCards}
              trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>

          <View style={styles.divider} />

          {/* Toggle 2: Daily Summary Digest */}
          <View style={styles.toggleItem}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>Daily 8:00 PM Summary Digest</Text>
              <Text style={styles.toggleDesc}>
                Consolidated end-of-day audio duration and qualified leads ledger
              </Text>
            </View>
            <Switch
              value={dailyDigest}
              onValueChange={setDailyDigest}
              trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>

          <View style={styles.divider} />

          {/* Toggle 3: TRAI Audio Waveform Links */}
          <View style={styles.toggleItem}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>TRAI Audio Waveform Links</Text>
              <Text style={styles.toggleDesc}>
                Include secure 256-bit stream playback link in chat
              </Text>
            </View>
            <Switch
              value={traiAudioLinks}
              onValueChange={setTraiAudioLinks}
              trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
        </View>

        {/* Remote Command Cheat Sheet */}
        <View style={styles.cheatSheet}>
          <Text style={styles.cheatSheetTitle}>
            REMOTE CONTROL COMMANDS (SEND VIA WHATSAPP)
          </Text>
          <View style={styles.cmdGrid}>
            <View style={styles.cmdCard}>
              <Text style={styles.cmdCode}>/summary</Text>
              <Text style={styles.cmdDesc}>Today's call tally</Text>
            </View>
            <View style={styles.cmdCard}>
              <Text style={styles.cmdCode}>/pause</Text>
              <Text style={styles.cmdDesc}>Pause AI agent</Text>
            </View>
            <View style={styles.cmdCard}>
              <Text style={styles.cmdCode}>/resume</Text>
              <Text style={styles.cmdDesc}>Resume reception</Text>
            </View>
            <View style={styles.cmdCard}>
              <Text style={styles.cmdCode}>/hours 9am-8pm</Text>
              <Text style={styles.cmdDesc}>Update hours</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 4. Indian Telecom Regulatory & Compliance Section */}
      <View style={styles.complianceSection}>
        <Text style={styles.complianceHeader}>TELECOM REGULATORY &amp; COMPLIANCE</Text>

        <View style={styles.complianceCard}>
          <View style={styles.complianceRow}>
            <View style={styles.complianceLeft}>
              <Text style={styles.complianceTitle}>TRAI Two-Party Recording Consent</Text>
              <Text style={styles.complianceSub}>Standard Hindi/English caller pre-roll</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified Active</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.complianceRow}>
            <View style={styles.complianceLeft}>
              <Text style={styles.complianceTitle}>Data Retention Window</Text>
              <Text style={styles.complianceSub}>DPDP Act 2023 Compliant (90-day auto purge)</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>90 Days</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.complianceRow}>
            <View style={styles.complianceLeft}>
              <Text style={styles.complianceTitle}>Carrier Interconnect License</Text>
              <Text style={styles.complianceSub}>DoT Virtual Gateway Registered</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>DoT / TRAI</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surfaceDim,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 96,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.onSurface,
  },
  pageSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 1,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  planSub: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.muted,
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.onSurface,
    marginTop: 2,
  },
  activePill: {
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.primaryFixedDim,
  },
  activeText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  meterBox: {
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  meterNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: theme.spacing.xs,
  },
  meterLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  meterMain: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.onSurface,
  },
  meterTotal: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  remainingPill: {
    backgroundColor: theme.colors.successContainer,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.pill,
  },
  remainingText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.success,
  },
  progressTrack: {
    height: 8,
    backgroundColor: theme.colors.outlineVariant,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  meterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  meterFooterText: {
    fontSize: 10,
    color: theme.colors.muted,
  },
  notesBox: {
    gap: 4,
    marginBottom: theme.spacing.md,
  },
  noteItem: {
    fontSize: 11,
    color: theme.colors.muted,
  },
  billingRow: {
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  billingText: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 14,
  },
  upgradeBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeBtnText: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  sectionSub: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  metaBadge: {
    backgroundColor: theme.colors.successContainer,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.pill,
  },
  metaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.success,
  },
  handsetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.sm,
    marginVertical: theme.spacing.xs,
  },
  handsetNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  handsetDesc: {
    fontSize: 10,
    color: theme.colors.muted,
    marginTop: 1,
  },
  changeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  toggleList: {
    marginVertical: theme.spacing.sm,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  toggleTextCol: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  toggleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  toggleDesc: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.outline,
    marginVertical: 4,
  },
  cheatSheet: {
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  cheatSheetTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.tertiary,
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  cmdGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cmdCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xs,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: 6,
  },
  cmdCode: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.mono,
  },
  cmdDesc: {
    fontSize: 9,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  complianceSection: {
    marginTop: theme.spacing.xs,
  },
  complianceHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tertiary,
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: 2,
  },
  complianceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.md,
  },
  complianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  complianceLeft: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  complianceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  complianceSub: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    marginTop: 1,
  },
  verifiedBadge: {
    backgroundColor: theme.colors.successContainer,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.xs,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.success,
  },
});
