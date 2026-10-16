import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export interface WaveformLogoProps {
  readonly size?: number;
  readonly color?: string;
}

export const WaveformLogo: React.FC<WaveformLogoProps> = ({
  size = 24,
  color = theme.colors.primary,
}) => {
  const barWidth = size * 0.12;
  const barRadius = barWidth / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]} accessibilityLabel="Callivaan Voice Logo" accessibilityRole="image">
      <View style={[styles.bar, { width: barWidth, height: size * 0.5, borderRadius: barRadius, backgroundColor: color }]} />
      <View style={[styles.bar, { width: barWidth, height: size * 0.85, borderRadius: barRadius, backgroundColor: color }]} />
      <View style={[styles.bar, { width: barWidth, height: size * 0.65, borderRadius: barRadius, backgroundColor: color }]} />
      <View style={[styles.bar, { width: barWidth, height: size, borderRadius: barRadius, backgroundColor: color }]} />
      <View style={[styles.bar, { width: barWidth, height: size * 0.55, borderRadius: barRadius, backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bar: {
    backgroundColor: theme.colors.primary,
  },
});
