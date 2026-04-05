import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
  Animated, Alert, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme, FONTS, RADIUS } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function usernameToEmail(username: string): Promise<string> {
  const normalized = username.trim().toLowerCase();

  let hex: string;
  try {
    const encoded    = new TextEncoder().encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    hex = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    let h = 5381;
    for (let i = 0; i < normalized.length; i++) {
      h = ((h << 5) + h) ^ normalized.charCodeAt(i);
      h = h >>> 0;
    }
    hex = h.toString(16).padStart(8, '0').repeat(8);
  }

  const uuid = [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');

  return `${uuid}@auth.askanon.app`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AuthScreen({ navigation }: Props) {
  const { colors, setNickname } = useTheme();
  const insets = useSafeAreaInsets();

  // ── Mode toggle ───────────────────────────────────────────────────────────────
  const [isSignUp, setIsSignUp] = useState(false);

  // ── Form state ────────────────────────────────────────────────────────────────
  const [username,    setUsername]    = useState('');
  const [password,    setPassword]    = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userFocus,   setUserFocus]   = useState(false);
  const [passFocus,   setPassFocus]   = useState(false);
  const [confFocus,   setConfFocus]   = useState(false);
  const [loading,     setLoading]     = useState(false);

  // Animation for the mode-switch slide
  const slideAnim = useRef(new Animated.Value(0)).current;
  const btnScale  = useRef(new Animated.Value(1)).current;

  const pressIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const switchMode = (toSignUp: boolean) => {
    // Slide the active indicator
    Animated.spring(slideAnim, {
      toValue:  toSignUp ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
    setIsSignUp(toSignUp);
    // Clear fields when switching so there's no stale data
    setPassword('');
    setConfirmPass('');
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const name = username.trim();

    if (!name) {
      Alert.alert('Username required', 'Please enter a username.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Password must be at least 6 characters.');
      return;
    }
    if (isSignUp && password !== confirmPass) {
      Alert.alert('Passwords do not match', 'Please make sure both passwords are the same.');
      return;
    }

    setLoading(true);
    try {
      const email = await usernameToEmail(name);

      if (isSignUp) {
        // ── Sign Up path ────────────────────────────────────────────────────────
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nickname: name },
            emailRedirectTo: undefined,
          },
        });

        if (signUpError) {
          // Username (derived email) is already registered
          if (signUpError.message.toLowerCase().includes('already registered')) {
            Alert.alert(
              'Username taken',
              'That username already has an account. Try logging in instead.',
            );
          } else {
            Alert.alert('Sign-up failed', signUpError.message);
          }
          return;
        }

        // If email confirmation is still on, session will be null — sign in immediately
        if (!signUpData.session) {
          const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
          if (retryError) {
            Alert.alert('One more step', 'Account created! Please tap "Log In" to continue.');
            switchMode(false);
            return;
          }
        }
      } else {
        // ── Log In path ─────────────────────────────────────────────────────────
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
          const msg = signInError.message.toLowerCase();
          if (msg.includes('invalid login credentials') || msg.includes('user not found')) {
            Alert.alert(
              'Account not found',
              'No account exists for that username. Want to sign up instead?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Up', onPress: () => switchMode(true) },
              ],
            );
          } else if (msg.includes('wrong password') || msg.includes('invalid password')) {
            Alert.alert('Wrong password', 'That password is incorrect. Please try again.');
          } else {
            Alert.alert('Login failed', signInError.message);
          }
          return;
        }
      }

      // ── Upsert profile row ──────────────────────────────────────────────────
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
          id:           user.id,
          nickname:     name.toLowerCase(),
          avatar_emoji: '👤',
        });
      }
      setNickname(name.toLowerCase());
      navigation.replace('Main');
    } catch (err: any) {
      Alert.alert('Unexpected error', err?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnon = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        Alert.alert('Error', error.message);
        return;
      }
      if (data.user) {
        await supabase.from('profiles').upsert({
          id:           data.user.id,
          nickname:     'Anonymous User',
          avatar_emoji: '👤',
        });
      }
      setNickname('Anonymous User');
      navigation.replace('Main');
    } catch (err: any) {
      Alert.alert('Unexpected error', err?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived UI values ─────────────────────────────────────────────────────────

  const tabIndicatorX = slideAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '50%'],
  });

  // ── UI ────────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* ── Logo ── */}
        <View style={styles.logoWrap}>
          <View style={[styles.logoBox, { backgroundColor: colors.teal }]}>
            <Feather name="eye-off" size={32} color="#fff" />
          </View>
          <Text style={styles.brandWrap}>
            <Text style={[styles.brandA, { color: colors.teal }]}>Ask</Text>
            <Text style={[styles.brandB, { color: colors.isDark ? '#A78BFA' : '#7C3AED' }]}>Anon</Text>
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Speak freely. Stay hidden.
          </Text>
        </View>

        {/* ── Mode toggle tabs ── */}
        <View style={[styles.tabWrap, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
          {/* Sliding active indicator */}
          <Animated.View
            style={[
              styles.tabIndicator,
              { backgroundColor: colors.teal, transform: [{ translateX: tabIndicatorX }] },
            ]}
          />
          <TouchableOpacity
            style={styles.tab}
            onPress={() => switchMode(false)}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={[styles.tabText, { color: !isSignUp ? '#fff' : colors.textMuted }]}>
              Log In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => switchMode(true)}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={[styles.tabText, { color: isSignUp ? '#fff' : colors.textMuted }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Form ── */}
        <View style={styles.form}>

          {/* Username */}
          <View style={[
            styles.inputWrap,
            { backgroundColor: colors.bgInput, borderColor: userFocus ? colors.teal : colors.border },
          ]}>
            <Feather name="user" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Username"
              placeholderTextColor={colors.textPlaceholder}
              value={username}
              onChangeText={setUsername}
              onFocus={() => setUserFocus(true)}
              onBlur={() => setUserFocus(false)}
              autoCapitalize="none"
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* Password */}
          <View style={[
            styles.inputWrap,
            { backgroundColor: colors.bgInput, borderColor: passFocus ? colors.teal : colors.border },
          ]}>
            <Feather name="lock" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Password (min 6 chars)"
              placeholderTextColor={colors.textPlaceholder}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPassFocus(true)}
              onBlur={() => setPassFocus(false)}
              secureTextEntry={!showPass}
              returnKeyType={isSignUp ? 'next' : 'done'}
              onSubmitEditing={isSignUp ? undefined : handleSubmit}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPass(v => !v)} disabled={loading}>
              <Feather name={showPass ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Confirm Password — only shown in Sign Up mode */}
          {isSignUp && (
            <View style={[
              styles.inputWrap,
              { backgroundColor: colors.bgInput, borderColor: confFocus ? colors.teal : colors.border },
            ]}>
              <Feather name="lock" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Confirm password"
                placeholderTextColor={colors.textPlaceholder}
                value={confirmPass}
                onChangeText={setConfirmPass}
                onFocus={() => setConfFocus(true)}
                onBlur={() => setConfFocus(false)}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                editable={!loading}
              />
              {/* Live match indicator */}
              {confirmPass.length > 0 && (
                <Feather
                  name={password === confirmPass ? 'check' : 'x'}
                  size={16}
                  color={password === confirmPass ? colors.teal : colors.red}
                />
              )}
              <TouchableOpacity onPress={() => setShowConfirm(v => !v)} disabled={loading}>
                <Feather name={showConfirm ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Submit button */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.teal, opacity: loading ? 0.7 : 1 }]}
              onPress={handleSubmit}
              onPressIn={pressIn}
              onPressOut={pressOut}
              activeOpacity={1}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {isSignUp ? 'Create Account' : 'Log In'}
                  </Text>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </>
              )}
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
            style={[
              styles.anonBtn,
              { backgroundColor: colors.bgCard, borderColor: colors.border, opacity: loading ? 0.7 : 1 },
            ]}
            onPress={handleAnon}
            disabled={loading}
          >
            <Feather name="user-x" size={20} color={colors.textPrimary} />
            <Text style={[styles.anonText, { color: colors.textPrimary }]}>Enter Anonymously</Text>
          </TouchableOpacity>

          {/* Info note */}
          <Text style={[styles.infoNote, { color: colors.textMuted }]}>
            No email needed. Your identity stays hidden.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:    { flex: 1 },
  inner:        { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },

  // Logo
  logoWrap:     { alignItems: 'center', marginBottom: 28 },
  logoBox:      { width: 72, height: 72, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  brandWrap:    { fontSize: 32, fontWeight: '700', marginBottom: 4 },
  brandA:       { fontSize: 32, fontWeight: '700' },
  brandB:       { fontSize: 32, fontWeight: '700' },
  tagline:      { fontSize: 13 },

  // Tab toggle
  tabWrap: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    height: 46,
  },
  tabIndicator: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: '50%',
    borderRadius: RADIUS.md - 1,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: { fontSize: 14, ...FONTS.subheading },

  // Form
  form:         { gap: 12 },
  inputWrap:    { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: RADIUS.md, borderWidth: 1, paddingHorizontal: 14, height: 52 },
  input:        { flex: 1, fontSize: 15, height: '100%' },

  // Submit
  submitBtn:     { borderRadius: RADIUS.md, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, ...FONTS.subheading },

  // Divider
  dividerRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine:  { flex: 1, height: 1 },
  dividerText:  { fontSize: 12, ...FONTS.medium },

  // Anon
  anonBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: RADIUS.md, height: 52, borderWidth: 1 },
  anonText:     { fontSize: 15, ...FONTS.subheading },

  // Note
  infoNote:     { fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 2 },
});