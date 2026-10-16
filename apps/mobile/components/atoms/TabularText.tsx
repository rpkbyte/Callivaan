import React from 'react';
import { Text, TextProps, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { theme } from '../../theme';

export interface TabularTextProps extends TextProps {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<TextStyle>;
}

export const TabularText: React.FC<TabularTextProps> = ({
  children,
  style,
  ...rest
}) => {
  return (
    <Text style={[styles.tabular, style]} {...rest}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  tabular: {
    fontVariant: ['tabular-nums'],
    color: theme.colors.onSurface,
  },
});
