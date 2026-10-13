/**
 * React Native Component Primitives & StyleSheet API
 * Provides React Native native abstraction layer (View, Text, Pressable, TextInput, ScrollView, StyleSheet).
 * In standalone React Native, these map 1:1 to 'react-native'.
 */
import React from 'react';

export interface ViewProps extends React.HTMLAttributes<HTMLDivElement> {
  style?: any;
  children?: React.ReactNode;
}

export const View: React.FC<ViewProps> = ({ style, children, ...props }) => {
  const flattened = StyleSheet.flatten(style);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', boxSizing: 'border-box', ...flattened }} {...props}>
      {children}
    </div>
  );
};

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  style?: any;
  numberOfLines?: number;
  children?: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({ style, children, ...props }) => {
  const flattened = StyleSheet.flatten(style);
  return (
    <span style={{ fontFamily: 'Inter, -apple-system, sans-serif', color: '#172033', ...flattened }} {...props}>
      {children}
    </span>
  );
};

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  style?: any;
  value?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  onChangeText?: (text: string) => void;
}

export const TextInput: React.FC<TextInputProps> = ({
  style,
  value,
  placeholder,
  secureTextEntry,
  keyboardType,
  onChangeText,
  ...props
}) => {
  const flattened = StyleSheet.flatten(style);
  return (
    <input
      type={secureTextEntry ? 'password' : keyboardType === 'email-address' ? 'email' : keyboardType === 'phone-pad' ? 'tel' : 'text'}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChangeText?.(e.target.value)}
      style={{
        boxSizing: 'border-box',
        fontFamily: 'Inter, -apple-system, sans-serif',
        outline: 'none',
        ...flattened,
      }}
      {...props}
    />
  );
};

export interface PressableProps {
  style?: any | ((state: { pressed: boolean }) => any);
  onPress?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Pressable: React.FC<PressableProps> = ({ style, onPress, disabled, children }) => {
  const [pressed, setPressed] = React.useState(false);
  const resolvedStyle = typeof style === 'function' ? style({ pressed }) : style;
  const flattened = StyleSheet.flatten(resolvedStyle);

  return (
    <button
      disabled={disabled}
      onClick={onPress}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxSizing: 'border-box',
        ...flattened,
      }}
    >
      {children}
    </button>
  );
};

export const TouchableOpacity = Pressable;

export interface ScrollViewProps extends React.HTMLAttributes<HTMLDivElement> {
  style?: any;
  contentContainerStyle?: any;
  children?: React.ReactNode;
}

export const ScrollView: React.FC<ScrollViewProps> = ({ style, contentContainerStyle, children, ...props }) => {
  const flattened = StyleSheet.flatten(style);
  const containerFlattened = StyleSheet.flatten(contentContainerStyle);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1, ...flattened }} {...props}>
      <div style={{ display: 'flex', flexDirection: 'column', ...containerFlattened }}>{children}</div>
    </div>
  );
};

export const SafeAreaView: React.FC<ViewProps> = (props) => <View {...props} />;

export const StatusBar = {
  setBarStyle: (_style: 'default' | 'light-content' | 'dark-content') => {},
  setBackgroundColor: (_color: string) => {},
};

export const Platform = {
  OS: 'android',
  select: <T extends unknown>(obj: { ios?: T; android?: T; default?: T }): T => (obj.android || obj.default) as T,
};

export const StyleSheet = {
  create<T extends Record<string, any>>(styles: T): T {
    return styles;
  },
  flatten(style: any): any {
    if (!style) return {};
    if (Array.isArray(style)) {
      return style.reduce((acc, s) => ({ ...acc, ...StyleSheet.flatten(s) }), {});
    }
    return style;
  },
};
