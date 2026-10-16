import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export interface StatusChipProps {
  readonly label: string;
  readonly variant?: 'success' | 'error' | 'primary' | 'warning' | 'neutral';
}

export const StatusChip: React.FC<StatusChipProps> = ({
  label,
  variant = 'neutral',
}) => {
  const getBadgeStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: theme.colors.successContainer,
          border: theme.colors.successBorder,
          text: theme.colors.success,
        };
      case 'error':
        return {
          bg: theme.colors.errorContainer,
          border: theme.colors.errorBorder,
          text: theme.colors.error,
        };
      case 'primary':
        return {
          bg: theme.colors.primaryFixed,
          border: theme.colors.primaryFixedDim,
          text: theme.colors.primary,
        };
      case 'warning':
        return {
          bg: theme.colors.warningContainer,
          border: theme.colors.warningBorder,
          text: theme.colors.warning,
        };
      case 'neutral':
      default:
        return {
          bg: theme.colors.surfaceContainer,
          border: theme.colors.outline,
          text: theme.colors.onSurfaceVariant,
        };
    }
  };

  const badgeStyle = getBadgeStyles();

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: badgeStyle.bg,
          borderColor: badgeStyle.border,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <Text style={[styles.text, { color: badgeStyle.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
