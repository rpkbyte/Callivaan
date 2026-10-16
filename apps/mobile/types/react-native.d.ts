import React from 'react';

declare module 'react-native' {
  export type DimensionValue = number | string;

  export interface ViewStyle {
    flex?: number;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    alignContent?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around';
    flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: DimensionValue;
    gap?: number;
    rowGap?: number;
    columnGap?: number;
    width?: DimensionValue;
    height?: DimensionValue;
    minWidth?: DimensionValue;
    maxWidth?: DimensionValue;
    minHeight?: DimensionValue;
    maxHeight?: DimensionValue;
    margin?: DimensionValue;
    marginHorizontal?: DimensionValue;
    marginVertical?: DimensionValue;
    marginTop?: DimensionValue;
    marginBottom?: DimensionValue;
    marginLeft?: DimensionValue;
    marginRight?: DimensionValue;
    padding?: DimensionValue;
    paddingHorizontal?: DimensionValue;
    paddingVertical?: DimensionValue;
    paddingTop?: DimensionValue;
    paddingBottom?: DimensionValue;
    paddingLeft?: DimensionValue;
    paddingRight?: DimensionValue;
    backgroundColor?: string;
    borderRadius?: number;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
    borderWidth?: number;
    borderTopWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
    borderRightWidth?: number;
    borderColor?: string;
    borderTopColor?: string;
    borderBottomColor?: string;
    borderLeftColor?: string;
    borderRightColor?: string;
    borderStyle?: 'solid' | 'dotted' | 'dashed';
    opacity?: number;
    overflow?: 'visible' | 'hidden' | 'scroll';
    position?: 'absolute' | 'relative';
    top?: DimensionValue;
    bottom?: DimensionValue;
    left?: DimensionValue;
    right?: DimensionValue;
    zIndex?: number;
    elevation?: number;
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
    transform?: any[];
  }

  export interface TextStyle extends ViewStyle {
    color?: string;
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: 'normal' | 'italic';
    fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    fontVariant?: readonly ('small-caps' | 'oldstyle-nums' | 'lining-nums' | 'tabular-nums' | 'proportional-nums')[];
    letterSpacing?: number;
    lineHeight?: number;
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
    textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed';
    textDecorationColor?: string;
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  }

  export type StyleProp<T> = T | false | null | undefined | readonly StyleProp<T>[];

  export interface AccessibilityProps {
    accessibilityRole?: string;
    accessibilityLabel?: string;
    accessibilityState?: { selected?: boolean; checked?: boolean | 'mixed'; disabled?: boolean; expanded?: boolean; busy?: boolean };
    accessibilityHint?: string;
  }

  export interface ViewProps extends AccessibilityProps {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
  }

  export const View: React.FC<ViewProps>;
  export const SafeAreaView: React.FC<ViewProps>;

  export interface TextProps extends AccessibilityProps {
    style?: StyleProp<TextStyle>;
    numberOfLines?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
    children?: React.ReactNode;
  }

  export const Text: React.FC<TextProps>;

  export interface PressableStateCallbackType {
    pressed: boolean;
  }

  export interface PressableProps extends AccessibilityProps {
    onPress?: () => void;
    style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
    children?: React.ReactNode | ((state: PressableStateCallbackType) => React.ReactNode);
    disabled?: boolean;
  }

  export const Pressable: React.FC<PressableProps>;

  export interface ScrollViewProps extends ViewProps {
    contentContainerStyle?: StyleProp<ViewStyle>;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    horizontal?: boolean;
  }

  export const ScrollView: React.FC<ScrollViewProps>;

  export interface TextInputProps extends AccessibilityProps {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    placeholderTextColor?: string;
    style?: StyleProp<TextStyle>;
    multiline?: boolean;
    numberOfLines?: number;
    maxLength?: number;
    clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad';
    textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
  }

  export const TextInput: React.FC<TextInputProps>;

  export interface SwitchProps extends AccessibilityProps {
    value?: boolean;
    onValueChange?: (val: boolean) => void;
    trackColor?: { false?: string; true?: string };
    thumbColor?: string;
    disabled?: boolean;
  }

  export const Switch: React.FC<SwitchProps>;

  export interface StatusBarProps {
    barStyle?: 'default' | 'light-content' | 'dark-content';
    backgroundColor?: string;
    translucent?: boolean;
    hidden?: boolean;
  }

  export const StatusBar: React.FC<StatusBarProps>;

  export interface AlertButton {
    text?: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }

  export interface AlertOptions {
    cancelable?: boolean;
    onDismiss?: () => void;
  }

  export class Alert {
    static alert(
      title: string,
      message?: string,
      buttons?: AlertButton[],
      options?: AlertOptions
    ): void;
  }

  export class Linking {
    static canOpenURL(url: string): Promise<boolean>;
    static openURL(url: string): Promise<any>;
    static getInitialURL(): Promise<string | null>;
  }

  export class AppRegistry {
    static registerComponent(appKey: string, componentProvider: () => React.ComponentType<any>): void;
    static getAppKeys(): string[];
  }

  export namespace StyleSheet {
    type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle };
    export function create<T extends NamedStyles<T> | NamedStyles<any>>(styles: T | NamedStyles<T>): T;
  }
}
