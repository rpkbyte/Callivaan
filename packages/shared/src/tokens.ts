/**
 * Callivaan Design Tokens
 * Strictly following docs/design.md:
 * - Light mode ONLY (no dark theme)
 * - Two brand colors: White (#FFFFFF) and Cobalt Blue (#3157D5)
 * - Neutral grays for text, borders, subtle surfaces
 * - Zero emoji anywhere in the UI or copy
 */

export const colors = {
  brand: {
    white: '#FFFFFF',
    cobalt: '#3157D5',
    cobaltHover: '#2544B0',
    cobaltActive: '#1D358C',
    cobaltLight: '#EEF2FC',
  },
  text: {
    primary: '#172033',
    secondary: '#667085',
    muted: '#8A94A6',
    onCobalt: '#FFFFFF',
  },
  border: {
    default: '#E4E8F0',
    subtle: '#EEF2F6',
    focus: '#3157D5',
  },
  surface: {
    base: '#FFFFFF',
    subtle: '#F6F8FC',
    card: '#FFFFFF',
    disabled: '#F0F2F5',
  },
  status: {
    success: '#15803D',
    successBg: '#F0FDF4',
    warning: '#B45309',
    warningBg: '#FFFBEB',
    error: '#B91C1C',
    errorBg: '#FEF2F2',
    info: '#3157D5',
    infoBg: '#EEF2FC',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const radii = {
  xs: 4,
  sm: 6,
  md: 8,      // inputs, buttons
  lg: 12,     // cards, panels
  pill: 9999, // status chips
} as const;

export const typography = {
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    hindi: '"Noto Sans Devanagari", sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  scale: {
    display: { fontSize: '32px', lineHeight: '40px', fontWeight: '600' },
    h1: { fontSize: '28px', lineHeight: '36px', fontWeight: '600' },
    h2: { fontSize: '22px', lineHeight: '28px', fontWeight: '600' },
    h3: { fontSize: '18px', lineHeight: '24px', fontWeight: '600' },
    body: { fontSize: '16px', lineHeight: '24px', fontWeight: '400' },
    bodySmall: { fontSize: '14px', lineHeight: '20px', fontWeight: '400' },
    label: { fontSize: '13px', lineHeight: '18px', fontWeight: '500' },
    caption: { fontSize: '12px', lineHeight: '16px', fontWeight: '400' },
  },
} as const;

export const shadows = {
  none: 'none',
  card: '0 1px 3px rgba(23, 32, 51, 0.05)',
  elevated: '0 4px 12px rgba(23, 32, 51, 0.08)',
  dropdown: '0 8px 24px rgba(23, 32, 51, 0.12)',
} as const;
