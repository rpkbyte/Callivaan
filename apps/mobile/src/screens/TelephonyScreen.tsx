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
import { CarrierConfig } from '../types';
import { theme } from '../theme';
import { TabularText } from '../components/atoms/TabularText';
import { CarrierUssdCard } from '../components/molecules/CarrierUssdCard';

export interface TelephonyScreenProps {
  readonly gatewayNumber: string;
  readonly carrierConfigs: readonly CarrierConfig[];
  readonly onDialCode: (code: string) => void;
  readonly onCopyCode: (code: string) => void;
  readonly onTestCall: () => void;
}

type ForwardingMode = 'CONDITIONAL' | 'UNCONDITIONAL';

export const TelephonyScreen: React.FC<TelephonyScreenProps> = ({
  gatewayNumber,
  carrierConfigs,
  onDialCode,
  onCopyCode,
  onTestCall,
}) => {
  const [isForwardingActive, setIsForwardingActive] = useState(true);
  const [forwardingMode, setForwardingMode] = useState<ForwardingMode>('CONDITIONAL');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Master Forwarding Status Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>Forward Unanswered Calls to AI</Text>
            <Text style={styles.heroSubtitle}>
              Captures customer queries when lines are busy or out of reach
            </Text>
          </View>
          <Switch
            value={isForwardingActive}
            onValueChange={setIsForwardingActive}
            trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>

        {/* Assigned Virtual Gateway Number */}
        <View style={styles.gatewayBox}>
          <View>
            <Text style={styles.gatewayLabel}>Assigned Agent Virtual Gateway</Text>
            <TabularText style={styles.gatewayNumber}>{gatewayNumber}</TabularText>
          </View>
          <Pressable
            onPress={() => onCopyCode(gatewayNumber)}
            style={({ pressed }) => [
              styles.copyBtn,
              pressed && { opacity: 0.75 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Copy virtual gateway phone number"
          >
            <Text style={styles.copyBtnText}>Copy</Text>
          </Pressable>
        </View>

        {/* Real-time Telemetry Status Strip */}
        <View style={styles.telemetryRow}>
          <View
            style={[
              styles.pulseDot,
              isForwardingActive ? styles.pulseGreen : styles.pulseMuted,
            ]}
          />
          <Text style={styles.telemetryText}>
            SIP Gateway Operational · Latency:{' '}
            <TabularText style={styles.telemetryValue}>320ms</TabularText> · TRAI Consent Active
          </Text>
        </View>
      </View>

      {/* 2. Forwarding Routing Logic Selector */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>FORWARDING ROUTING LOGIC</Text>
        <Text style={styles.sectionSubtitle}>Smart AI Filter</Text>
      </View>

      {/* Option A: Conditional Forwarding */}
      <Pressable
        onPress={() => setForwardingMode('CONDITIONAL')}
        style={[
          styles.logicOption,
          forwardingMode === 'CONDITIONAL' && styles.logicOptionActive,
        ]}
        accessibilityRole="radio"
        accessibilityState={{ selected: forwardingMode === 'CONDITIONAL' }}
        accessibilityLabel="Conditional Forwarding"
      >
        <View style={styles.radioRow}>
          <View
            style={[
              styles.radioCircle,
              forwardingMode === 'CONDITIONAL' && styles.radioCircleActive,
            ]}
          >
            {forwardingMode === 'CONDITIONAL' ? (
              <View style={styles.radioInner} />
            ) : null}
          </View>
          <View style={styles.optionContent}>
            <View style={styles.optionTitleRow}>
              <Text style={styles.optionTitle}>Conditional Forwarding</Text>
              <View style={styles.recomPill}>
                <Text style={styles.recomText}>RECOMMENDED</Text>
              </View>
            </View>
            <Text style={styles.optionDescription}>
              Forwards only when your line is busy or unanswered after 15 seconds.
              You keep taking direct calls normally on your mobile.
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Option B: Unconditional Forwarding */}
      <Pressable
        onPress={() => setForwardingMode('UNCONDITIONAL')}
        style={[
          styles.logicOption,
          forwardingMode === 'UNCONDITIONAL' && styles.logicOptionActive,
        ]}
        accessibilityRole="radio"
        accessibilityState={{ selected: forwardingMode === 'UNCONDITIONAL' }}
        accessibilityLabel="Unconditional Forwarding"
      >
        <View style={styles.radioRow}>
          <View
            style={[
              styles.radioCircle,
              forwardingMode === 'UNCONDITIONAL' && styles.radioCircleActive,
            ]}
          >
            {forwardingMode === 'UNCONDITIONAL' ? (
              <View style={styles.radioInner} />
            ) : null}
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Unconditional Forwarding</Text>
            <Text style={styles.optionDescription}>
              Forwards 100% of incoming calls immediately 24/7 directly to AI.
              Ideal for weekends, off-duty hours, or peak sale events.
            </Text>
          </View>
        </View>
      </Pressable>

      {/* 3. Carrier USSD Instructions Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>SELECT YOUR MOBILE CARRIER</Text>
        <Text style={styles.sectionSubtitle}>1-Tap USSD Dial</Text>
      </View>

      {carrierConfigs.map((carrier) => (
        <CarrierUssdCard
          key={carrier.id}
          carrier={carrier}
          onDial={onDialCode}
          onCopy={onCopyCode}
        />
      ))}

      {/* 4. Test Dial Action Button */}
      <Pressable
        onPress={onTestCall}
        style={({ pressed }) => [
          styles.testDialBtn,
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Test call voice AI gateway"
      >
        <Text style={styles.testDialText}>Test Dial AI Voice Gateway</Text>
      </Pressable>
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
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  heroTextCol: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onSurface,
    lineHeight: 22,
  },
  heroSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 16,
  },
  gatewayBox: {
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  gatewayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.muted,
    letterSpacing: 0.5,
  },
  gatewayNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.onSurface,
    marginTop: 2,
  },
  copyBtn: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radii.sm,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pulseGreen: {
    backgroundColor: theme.colors.success,
  },
  pulseMuted: {
    backgroundColor: theme.colors.muted,
  },
  telemetryText: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  telemetryValue: {
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tertiary,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  logicOption: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  logicOptionActive: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: theme.colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCircleActive: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  recomPill: {
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radii.pill,
  },
  recomText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  optionDescription: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 17,
  },
  testDialBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  testDialText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
});
