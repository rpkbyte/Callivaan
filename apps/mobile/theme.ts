/**
 * Callivaan Precision Voice Design Tokens for React Native Expo
 * Extracted from Google Stitch Design System (assets/d9df30dddc1548cf8c5f68333d7e0ca6)
 * Strict rules:
 * - Pure Light Mode only
 * - Cobalt Blue (#3157D5) and Canvas White (#FFFFFF)
 * - Zero emojis
 * - Tabular numerals for phone numbers, times, durations, and pricing
 */

export const theme = {
  colors: {
    primary: '#3157D5',
    primaryHover: '#2544B0',
    primaryActive: '#1D358C',
    primaryContainer: '#3157D5',
    primaryFixed: '#DDE1FF',
    primaryFixedDim: '#B7C4FF',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#D8DDFF',

    surface: '#FFFFFF',
    surfaceDim: '#F6F8FC',
    surfaceBright: '#FFFFFF',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerLow: '#F3F2FE',
    surfaceContainer: '#F1F4FA',
    surfaceContainerHigh: '#E8EDF5',
    surfaceContainerHighest: '#DEE5F0',

    onSurface: '#172033',
    onSurfaceVariant: '#667085',
    tertiary: '#475467',
    secondary: '#555E74',
    muted: '#8A94A6',

    outline: '#E4E8F0',
    outlineVariant: '#D0D5DD',

    success: '#15803D',
    successContainer: '#F0FDF4',
    successBorder: '#BBF7D0',

    error: '#D92D20',
    errorContainer: '#FEF2F2',
    errorBorder: '#FECACA',

    warning: '#B45309',
    warningContainer: '#FFFBEB',
    warningBorder: '#FDE68A',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    '3xl': 32,
  },
  radii: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 9999,
  },
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    tabularNums: {
      fontVariant: ['tabular-nums'] as const,
    },
  },
} as const;

export type Theme = typeof theme;
