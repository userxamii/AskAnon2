export const COLORS = {
  // Primary palette
  bg: '#0F0F1A',
  bgCard: '#1A1A2E',
  bgCardAlt: '#16213E',
  bgSurface: '#1E1E35',

  // Accent
  accent: '#7C5CFC',
  accentLight: '#9B7EFE',
  accentDim: '#7C5CFC22',

  // Secondary accents
  teal: '#00C9A7',
  tealDim: '#00C9A720',
  rose: '#FF6B8A',
  roseDim: '#FF6B8A20',
  amber: '#FFB830',
  amberDim: '#FFB83020',

  // Text
  textPrimary: '#F0EEFF',
  textSecondary: '#8A87A8',
  textMuted: '#4A4870',

  // Borders
  border: '#2A2A45',
  borderLight: '#333360',
};

export const FONTS = {
  heading: { fontWeight: '700' as const },
  subheading: { fontWeight: '600' as const },
  body: { fontWeight: '400' as const },
  caption: { fontWeight: '500' as const },
};

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  accent: {
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
};