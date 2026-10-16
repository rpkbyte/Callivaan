import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export interface WaveformBarsProps {
  readonly progress?: number; // 0 to 1
  readonly height?: number;
}

const BAR_HEIGHTS = [8, 16, 24, 12, 18, 26, 14, 22, 10, 20, 28, 16, 24, 18, 12, 22, 14, 8];

export const WaveformBars: React.FC<WaveformBarsProps> = ({
  progress = 0.35,
  height = 32,
}) => {
  const activeCount = Math.floor(BAR_HEIGHTS.length * progress);

  return (
    <View style={[styles.container, { height }]} accessibilityRole="image" accessibilityLabel="Audio waveform preview">
      {BAR_HEIGHTS.map((barHeight, idx) => {
        const isActive = idx <= activeCount;
        return (
          <View
            key={idx}
            style={[
              styles.bar,
              {
                height: (barHeight / 28) * height,
                backgroundColor: isActive ? theme.colors.primary : theme.colors.outline,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  bar: {
    width: 3,
    borderRadius: theme.radii.pill,
  },
});
