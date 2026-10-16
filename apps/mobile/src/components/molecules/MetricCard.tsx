import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { TabularText } from '../atoms/TabularText';

export interface MetricCardProps {
  readonly value: string;
  readonly label: string;
  readonly subtext?: string;
  readonly isPrimary?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  subtext,
  isPrimary = false,
}) => {
  return (
    <View style={styles.card} accessibilityRole="none">
      <TabularText style={[styles.value, isPrimary && styles.valuePrimary]}>
        {value}
      </TabularText>
      <Text style={styles.label}>{label}</Text>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.onSurface,
  },
  valuePrimary: {
    color: theme.colors.primary,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.tertiary,
    marginTop: 2,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 10,
    color: theme.colors.muted,
    marginTop: 1,
  },
});
