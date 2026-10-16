import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../theme';
import { TabularText } from '../atoms/TabularText';

export interface AudioPlayerCardProps {
  readonly durationText: string;
  readonly retentionDays?: number;
}

const WAVE_BARS = [12, 22, 34, 16, 28, 40, 20, 32, 14, 26, 36, 18, 30, 24, 14, 28, 16, 10, 24, 32, 18, 26, 14, 20];

export const AudioPlayerCard: React.FC<AudioPlayerCardProps> = ({
  durationText,
  retentionDays = 86,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<'1x' | '1.25x' | '1.5x'>('1x');
  const [progress, setProgress] = useState(0.35);

  const activeBarsCount = Math.floor(WAVE_BARS.length * progress);

  return (
    <View style={styles.card} accessibilityRole="none">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Call Audio Recording</Text>
          <View style={styles.traiBadge}>
            <Text style={styles.traiBadgeText}>TRAI Consent Active</Text>
          </View>
        </View>
        <TabularText style={styles.formatText}>16kHz Linear PCM</TabularText>
      </View>

      {/* Waveform Visualization Bars */}
      <View style={styles.waveformContainer}>
        {WAVE_BARS.map((h, i) => {
          const isActive = i <= activeBarsCount;
          return (
            <Pressable
              key={i}
              onPress={() => setProgress(i / WAVE_BARS.length)}
              style={styles.barTouch}
            >
              <View
                style={[
                  styles.bar,
                  {
                    height: h,
                    backgroundColor: isActive ? theme.colors.primary : theme.colors.outline,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      {/* Time & Progress Scrub Row */}
      <View style={styles.progressRow}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <TabularText style={styles.timeText}>00:46 / {durationText}</TabularText>
          <TabularText style={styles.retentionText}>
            {retentionDays} Days Retention Left
          </TabularText>
        </View>
      </View>

      {/* Controls Row */}
      <View style={styles.controlsRow}>
        {/* Play/Pause Button */}
        <Pressable
          onPress={() => setIsPlaying(!isPlaying)}
          style={({ pressed }) => [
            styles.playBtn,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          <Text style={styles.playBtnText}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </Pressable>

        {/* Speed Selector */}
        <View style={styles.speedGroup}>
          {(['1x', '1.25x', '1.5x'] as const).map((s) => {
            const isActive = speed === s;
            return (
              <Pressable
                key={s}
                onPress={() => setSpeed(s)}
                style={[styles.speedBtn, isActive && styles.speedBtnActive]}
                accessibilityRole="button"
                accessibilityLabel={`Speed ${s}`}
              >
                <Text
                  style={[
                    styles.speedBtnText,
                    isActive && styles.speedBtnTextActive,
                  ]}
                >
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>
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
    marginBottom: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  traiBadge: {
    backgroundColor: theme.colors.successContainer,
    borderColor: theme.colors.successBorder,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radii.pill,
  },
  traiBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.success,
  },
  formatText: {
    fontSize: 10,
    color: theme.colors.muted,
    marginTop: 2,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    paddingHorizontal: 8,
    marginVertical: theme.spacing.xs,
  },
  barTouch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
  progressRow: {
    marginVertical: 4,
  },
  track: {
    height: 4,
    backgroundColor: theme.colors.outline,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  retentionText: {
    fontSize: 11,
    color: theme.colors.muted,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  playBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 8,
    borderRadius: theme.radii.md,
  },
  playBtnText: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  speedGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  speedBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceContainer,
  },
  speedBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  speedBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.tertiary,
  },
  speedBtnTextActive: {
    color: theme.colors.onPrimary,
  },
});
