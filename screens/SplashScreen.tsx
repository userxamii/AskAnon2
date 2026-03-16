import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme, FONTS } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const scaleAnim   = useRef(new Animated.Value(0.8)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const ring1Anim   = useRef(new Animated.Value(0.6)).current;
  const ring2Anim   = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ring1Anim, { toValue: 1,   duration: 2000, useNativeDriver: true }),
        Animated.timing(ring1Anim, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(ring2Anim, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
        Animated.timing(ring2Anim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    const t = setTimeout(() => navigation.replace('Auth'), 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* Concentric rings (visible in light mode) */}
      <Animated.View style={[styles.ring, styles.ring2, { borderColor: colors.teal, opacity: ring2Anim }]} />
      <Animated.View style={[styles.ring, styles.ring1, { borderColor: colors.teal, opacity: ring1Anim }]} />

      <Animated.View style={{ alignItems: 'center', opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        {/* Logo */}
        <View style={[styles.logoBox, { backgroundColor: colors.teal }]}>
          <Text style={styles.logoIcon}>👁</Text>
        </View>

        {/* Title with gradient-like effect using two colors */}
        <Text style={styles.titleWrap}>
          <Text style={[styles.titleA, { color: colors.teal }]}>Ask</Text>
          <Text style={[styles.titleB, { color: colors.isDark ? '#A78BFA' : '#7C3AED' }]}>Anon</Text>
        </Text>

        <Text style={[styles.tagline, { color: colors.textSecondary }]}>Speak freely. Stay hidden.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ring: { position: 'absolute', borderRadius: 9999, borderWidth: 1 },
  ring1: { width: 260, height: 260 },
  ring2: { width: 380, height: 380 },
  logoBox: {
    width: 80, height: 80, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: { fontSize: 38 },
  titleWrap: { fontSize: 38, ...FONTS.heading, marginBottom: 10 },
  titleA: { fontSize: 38, ...FONTS.heading },
  titleB: { fontSize: 38, ...FONTS.heading },
  tagline: { fontSize: 15 },
});