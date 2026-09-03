import { Platform } from 'react-native';

export const theme = {
  colors: {
    // Warm neutral background & surface palette
    background: '#FAF7F2', // Soft off-white / warm cream
    backgroundGradientStart: '#FAF7F2',
    backgroundGradientEnd: '#F3EDE2',
    surface: '#FFFFFF', // Clean white card surface
    surfaceAlt: '#FFFDF9', // Soft warm cream lifted card
    border: '#E8E2D8', // Subtle warm border
    borderSelected: '#2C3E50', // Muted navy border state

    // Accent & Brand Colors
    primary: '#2C3E50', // Muted, confident navy primary
    primaryPressed: '#1A252F',
    primaryLight: '#EBF1F5',
    accentGold: '#9C8B5E', // Muted gold for streak/quiet acknowledgment

    // Text Colors
    textPrimary: '#2A2A2A', // Near-black soft text
    textSecondary: '#6B6B6B', // Muted warm gray
    textMuted: '#9B9B9B',
    textOnPrimary: '#FFFFFF',

    // Status / System
    errorBg: '#FDF2F2',
    errorBorder: '#F8CECE',
    errorText: '#9B2C2C',
  },

  typography: {
    // Fonts (Fallback system font stack gracefully handled across web & native)
    fontFamilyHeadline: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: 'Georgia, "Times New Roman", serif',
      default: 'serif',
    }),
    fontFamilyBody: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'sans-serif',
    }),

    sizes: {
      screenTitle: 28,
      cardTitle: 20,
      body: 16,
      secondary: 14,
      caption: 12,
    },

    lineHeights: {
      screenTitle: 36,
      cardTitle: 28,
      body: 26,
      secondary: 22,
      caption: 18,
    },
  },

  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },

  shadows: {
    card: Platform.select({
      ios: {
        shadowColor: '#2C3E50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 4px 16px rgba(44, 62, 80, 0.04), 0px 1px 3px rgba(0, 0, 0, 0.02)',
      },
    }),
    button: Platform.select({
      ios: {
        shadowColor: '#2C3E50',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 3px 10px rgba(44, 62, 80, 0.08)',
      },
    }),
  },
};

export type Theme = typeof theme;
