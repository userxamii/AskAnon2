import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Animated } from 'react-native';

export type ThemeColors = {
  bg: string;
  bgCard: string;
  bgInput: string;
  bgSurface: string;
  teal: string;
  tealDim: string;
  tealDark: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textPlaceholder: string;
  border: string;
  borderLight: string;
  red: string;
  redDim: string;
  statusBar: 'light-content' | 'dark-content';
  isDark: boolean;
};

export const DARK: ThemeColors = {
  bg:              '#0D1117',
  bgCard:          '#161B22',
  bgInput:         '#1C2128',
  bgSurface:       '#21262D',
  teal:            '#00C9B1',
  tealDim:         '#00C9B120',
  tealDark:        '#00A896',
  textPrimary:     '#E6EDF3',
  textSecondary:   '#8B949E',
  textMuted:       '#484F58',
  textPlaceholder: '#484F58',
  border:          '#30363D',
  borderLight:     '#21262D',
  red:             '#F85149',
  redDim:          '#F8514920',
  statusBar:       'light-content',
  isDark:          true,
};

export const LIGHT: ThemeColors = {
  bg:              '#F0F4F8',
  bgCard:          '#FFFFFF',
  bgInput:         '#EEF2F7',
  bgSurface:       '#E8EDF4',
  teal:            '#00A896',
  tealDim:         '#00A89618',
  tealDark:        '#008F80',
  textPrimary:     '#0D1117',
  textSecondary:   '#57606A',
  textMuted:       '#8C959F',
  textPlaceholder: '#9EA3A9',
  border:          '#D0D7DE',
  borderLight:     '#EEF2F7',
  red:             '#CF222E',
  redDim:          '#CF222E15',
  statusBar:       'dark-content',
  isDark:          false,
};

export const FONTS = {
  heading:    { fontWeight: '700' as const },
  subheading: { fontWeight: '600' as const },
  medium:     { fontWeight: '500' as const },
  body:       { fontWeight: '400' as const },
  caption:    { fontWeight: '300' as const },
};

export const RADIUS = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   18,
  xl:   24,
  full: 9999,
};

export const shadow = (isDark: boolean) => ({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isDark ? 4 : 2 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: isDark ? 12 : 8,
    elevation: isDark ? 8 : 3,
  },
});

type ThemeMode = 'dark' | 'light';

type ThemeContextType = {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  flashAnim: Animated.Value;
  nickname: string;
  setNickname: (n: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  colors: DARK,
  isDark: true,
  toggleTheme: () => {},
  flashAnim: new Animated.Value(0),
  nickname: 'Anonymous User',
  setNickname: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [nickname, setNickname] = useState('Anonymous User');
  const flashAnim = useRef(new Animated.Value(0)).current;

  const isDark = mode === 'dark';
  const colors = isDark ? DARK : LIGHT;

  const toggleTheme = () => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
    setMode(m => m === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ mode, colors, isDark, toggleTheme, flashAnim, nickname, setNickname }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}