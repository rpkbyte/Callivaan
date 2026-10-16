import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CarrierConfig } from '../../types';
import { theme } from '../../theme';
import { TabularText } from '../atoms/TabularText';

export interface CarrierUssdCardProps {
  readonly carrier: CarrierConfig;
  readonly onDial: (ussdCode: string) => void;
  readonly onCopy: (code: string) => void;
}

export const CarrierUssdCard: React.FC<CarrierUssdCardProps> = ({
  carrier,
  onDial,
  onCopy,
}) => {
  return (
    <View style={styles.card} accessibilityRole="none">
      <View style={styles.header}>
        <View>
          <Text style={styles.carrierName}>{carrier.name}</Text>
          <Text style={styles.conditionText}>{carrier.condition}</Text>
        </View>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>SIM SETUP</Text>
        </View>
      </View>

      {/* Code Box */}
      <View style={styles.codeBox}>
        <TabularText style={styles.codeText}>{carrier.ussdCode}</TabularText>
        <Pressable
          onPress={() => onCopy(carrier.ussdCode)}
          style={({ pressed }) => [
            styles.copyBtn,
            pressed && { opacity: 0.75 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Copy USSD code ${carrier.ussdCode}`}
        >
          <Text style={styles.copyBtnText}>Copy</Text>
        </Pressable>
      </View>

      {/* Dial Button */}
      <Pressable
        onPress={() => onDial(carrier.ussdCode)}
        style={({ pressed }) => [
          styles.dialBtn,
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Dial ${carrier.name} USSD on phone`}
      >
        <Text style={styles.dialBtnText}>Dial on Handset ({carrier.ussdCode.slice(0, 5)})</Text>
      </Pressable>

      {/* Deactivation Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Deactivate anytime: <TabularText style={styles.cancelCode}>{carrier.cancelCode}</TabularText>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  carrierName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  conditionText: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  tagPill: {
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radii.xs,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    marginBottom: theme.spacing.sm,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.mono,
  },
  copyBtn: {
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  dialBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.md,
  },
  dialBtnText: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    marginTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.muted,
  },
  cancelCode: {
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
});
