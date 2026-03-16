import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme, FONTS, RADIUS, shadow } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export default function AuthScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const S = shadow(colors.isDark);
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [userFocus, setUserFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const btnScale = useRef(new Animated.Value(1)).current;
  const { setNickname } = useTheme();

  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const handleLogin = () => {
    setNickname(username.trim() || 'Anonymous User');
    navigation.replace('Main', { screen: 'Posts' });
  };

  const handleAnon = () => {
    setNickname('Anonymous User');
    navigation.replace('Main', { screen: 'Home' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={[styles.logoBox, { backgroundColor: colors.teal }]}>
            <Text style={styles.logoIcon}>🙈</Text>
          </View>
          <Text style={styles.brandWrap}>
            <Text style={[styles.brandA, { color: colors.teal }]}>Ask</Text>
            <Text style={[styles.brandB, { color: colors.isDark ? '#A78BFA' : '#7C3AED' }]}>Anon</Text>
          </Text>
          <Text style={[styles.welcome, { color: colors.textSecondary }]}>Welcome back, stranger</Text>
        </View>

        {/* Inputs */}
        <View style={styles.form}>
          <View style={[
            styles.inputWrap,
            { backgroundColor: colors.bgInput, borderColor: userFocus ? colors.teal : colors.border },
          ]}>
            <Text style={[styles.inputIcon, { color: colors.textMuted }]}>👤</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Choose a username"
              placeholderTextColor={colors.textPlaceholder}
              value={username}
              onChangeText={setUsername}
              onFocus={() => setUserFocus(true)}
              onBlur={() => setUserFocus(false)}
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          <View style={[
            styles.inputWrap,
            { backgroundColor: colors.bgInput, borderColor: passFocus ? colors.teal : colors.border },
          ]}>
            <Text style={[styles.inputIcon, { color: colors.textMuted }]}>🔒</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Password"
              placeholderTextColor={colors.textPlaceholder}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPassFocus(true)}
              onBlur={() => setPassFocus(false)}
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPass(v => !v)}>
              <Text style={[styles.inputIcon, { color: colors.textMuted }]}>{showPass ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: colors.teal }]}
              onPress={handleLogin}
              onPressIn={pressIn}
              onPressOut={pressOut}
              activeOpacity={1}
            >
              <Text style={styles.loginBtnText}>Log In  →</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Anonymous button */}
          <TouchableOpacity
            style={[styles.anonBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            onPress={handleAnon}
          >
            <Text style={styles.anonIcon}>🕵️</Text>
            <Text style={[styles.anonText, { color: colors.textPrimary }]}>Enter Anonymously</Text>
          </TouchableOpacity>

          {/* Sign up link */}
          <View style={styles.signupRow}>
            <Text style={[styles.signupText, { color: colors.textSecondary }]}>Don't have an account?  </Text>
            <TouchableOpacity>
              <Text style={[styles.signupLink, { color: colors.teal }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logoBox: { width: 72, height: 72, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoIcon: { fontSize: 34 },
  brandWrap: { fontSize: 32, ...FONTS.heading, marginBottom: 6 },
  brandA: { fontSize: 32, ...FONTS.heading },
  brandB: { fontSize: 32, ...FONTS.heading },
  welcome: { fontSize: 14 },
  form: { gap: 14 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: RADIUS.md, borderWidth: 1,
    paddingHorizontal: 14, height: 52,
  },
  inputIcon: { fontSize: 18 },
  input: { flex: 1, fontSize: 15, height: '100%' },
  loginBtn: {
    borderRadius: RADIUS.md, height: 52,
    justifyContent: 'center', alignItems: 'center',
  },
  loginBtnText: { color: '#fff', fontSize: 16, ...FONTS.subheading, letterSpacing: 0.3 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, ...FONTS.medium },
  anonBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: RADIUS.md, height: 52, borderWidth: 1,
  },
  anonIcon: { fontSize: 20 },
  anonText: { fontSize: 15, ...FONTS.subheading },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  signupText: { fontSize: 13 },
  signupLink: { fontSize: 13, ...FONTS.subheading },
});