import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';

export interface ButtonProps {
  readonly title: string;
  readonly onPress: () => void;
  readonly variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly fullWidth?: boolean;
  readonly accessibilityLabel?: string;
  readonly icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
  icon,
}) => {
  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radii.md,
      gap: theme.spacing.xs,
    };

    if (fullWidth) {
      base.width = '100%';
    }

    switch (size) {
      case 'sm':
        base.paddingVertical = 6;
        base.paddingHorizontal = theme.spacing.md;
        break;
      case 'lg':
        base.paddingVertical = 14;
        base.paddingHorizontal = theme.spacing.xl;
        break;
      case 'md':
      default:
        base.paddingVertical = 10;
        base.paddingHorizontal = theme.spacing.lg;
        break;
    }

    switch (variant) {
      case 'outline':
        base.backgroundColor = theme.colors.surface;
        base.borderWidth = 1;
        base.borderColor = theme.colors.outline;
        break;
      case 'secondary':
        base.backgroundColor = theme.colors.surfaceContainer;
        base.borderWidth = 1;
        base.borderColor = theme.colors.outline;
        break;
      case 'danger':
        base.backgroundColor = theme.colors.error;
        break;
      case 'primary':
      default:
        base.backgroundColor = theme.colors.primary;
        break;
    }

    if (disabled) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    let base: TextStyle = {
      fontWeight: '600',
    };

    switch (size) {
      case 'sm':
        base.fontSize = 12;
        break;
      case 'lg':
        base.fontSize = 15;
        break;
      case 'md':
      default:
        base.fontSize = 13;
        break;
    }

    switch (variant) {
      case 'outline':
      case 'secondary':
        base.color = theme.colors.onSurface;
        break;
      case 'danger':
      case 'primary':
      default:
        base.color = theme.colors.onPrimary;
        break;
    }

    return base;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        getContainerStyle(),
        pressed && !disabled && { opacity: 0.8 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
    >
      {icon}
      <Text style={getTextStyle()}>{title}</Text>
    </Pressable>
  );
};
