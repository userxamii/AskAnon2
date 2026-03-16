import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, StatusBar, ScrollView, Switch, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONTS, RADIUS, shadow } from '../context/ThemeContext';
import { usePosts } from '../hooks/usePosts';
import { RootStackParamList } from '../types/navigation';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const { colors, mode, toggleTheme, nickname, flashAnim } = useTheme();
  const S = shadow(colors.isDark);
  const insets = useSafeAreaInsets();
  const TAB_H = Platform.OS === 'ios' ? 82 : 64;
  const { posts } = usePosts();

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    toggleTheme();
  };

  // Log out: navigate to Auth using the ROOT stack navigator
  const handleLogOut = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const settingsRows = [
    {
      icon: '🌙',
      label: 'Dark Mode',
      hint: 'Toggle light and dark theme',
      right: (
        <Switch
          value={mode === 'dark'}
          onValueChange={handleToggle}
          trackColor={{ false: colors.border, true: colors.teal + 'AA' }}
          thumbColor={mode === 'dark' ? colors.teal : colors.textMuted}
        />
      ),
    },
    {
      icon: '🛡️',
      label: 'Privacy Settings',
      hint: 'Manage your anonymity',
      right: <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>,
    },
    {
      icon: '👁',
      label: 'Hidden Posts',
      hint: "Posts you've hidden",
      right: <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>,
    },
    {
      icon: '⚙️',
      label: 'App Settings',
      hint: 'Notifications & more',
      right: <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* Flash overlay for theme transition */}
      <Animated.View
        pointerEvents="none"
        style={[styles.flash, { opacity: flashAnim, backgroundColor: colors.isDark ? '#fff' : '#000' }]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: TAB_H + 32 }}
      >
        {/* Header */}
        <View style={[styles.pageHeader, { borderBottomColor: colors.border }]}>
          <View style={{ width: 24 }} />
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.teal }]}>
            <Text style={styles.avatarEmoji}>🎭</Text>
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{nickname}</Text>
          <Text style={[styles.nameHint, { color: colors.textSecondary }]}>Your identity is safe with us</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.statIcon, { color: colors.teal }]}>💬</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{posts.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
          </View>
          <View style={[styles.statBox, S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.statIcon, { color: colors.teal }]}>🤍</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {posts.reduce((s, p) => s + p.likes, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Likes</Text>
          </View>
          <View style={[styles.statBox, S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.statIcon, { color: colors.teal }]}>💬</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {posts.reduce((s, p) => s + p.commentCount, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Comments</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={[styles.settingsCard, S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          {settingsRows.map((row, i) => (
            <View key={row.label}>
              <View style={styles.settingRow}>
                <View style={[styles.iconBox, { backgroundColor: colors.bgInput }]}>
                  <Text style={styles.rowIcon}>{row.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{row.label}</Text>
                  <Text style={[styles.rowHint, { color: colors.textSecondary }]}>{row.hint}</Text>
                </View>
                {row.right}
              </View>
              {i < settingsRows.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: 64 }]} />
              )}
            </View>
          ))}
        </View>

        {/* Log out */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.red + '66', backgroundColor: colors.redDim }]}
          onPress={handleLogOut}
        >
          <Text style={styles.logoutIcon}>↪</Text>
          <Text style={[styles.logoutText, { color: colors.red }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flash: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },
  pageHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  pageTitle: { fontSize: 18, ...FONTS.heading },
  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatarEmoji: { fontSize: 46 },
  name: { fontSize: 22, ...FONTS.heading, marginBottom: 4 },
  nameHint: { fontSize: 13 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20 },
  statBox: { flex: 1, borderRadius: RADIUS.md, paddingVertical: 14, alignItems: 'center', marginHorizontal: 4, borderWidth: 1 },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 18, ...FONTS.heading },
  statLabel: { fontSize: 12 },
  settingsCard: { marginHorizontal: 16, borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: 20 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconBox: { width: 38, height: 38, borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  rowIcon: { fontSize: 18 },
  rowLabel: { fontSize: 14, ...FONTS.subheading },
  rowHint: { fontSize: 12, marginTop: 1 },
  chevron: { fontSize: 24 },
  divider: { height: 1 },
  logoutBtn: {
    marginHorizontal: 16, borderRadius: RADIUS.md, borderWidth: 1,
    paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  logoutIcon: { fontSize: 16, color: '#F85149' },
  logoutText: { fontSize: 15, ...FONTS.subheading },
});