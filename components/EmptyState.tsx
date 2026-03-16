import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme, FONTS, RADIUS } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';

interface Props {
  emoji: string;
  title: string;
  subtitle: string;
}

export default function EmptyState({ emoji, title, subtitle }: Props) {
  const { colors } = useTheme();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1400, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,  duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.wrap, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.bubble, { backgroundColor: COLORS.bgCard, borderColor: colors.border, transform: [{ translateY: floatAnim }] }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </Animated.View>
      <Text style={[styles.title, { color: COLORS.textPrimary }]}>{title}</Text>
      <Text style={[styles.sub, { color: COLORS.textSecondary }]}>{subtitle}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  bubble: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 20 },
  emoji: { fontSize: 42 },
  title: { fontSize: 18, ...FONTS.heading, textAlign: 'center', marginBottom: 8 },
  sub:   { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});