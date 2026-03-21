import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, StatusBar, ScrollView, Switch, Animated,
  Modal, TextInput, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONTS, RADIUS, shadow } from '../context/ThemeContext';
import { usePosts } from '../context/PostsContext';
import { RootStackParamList } from '../types/navigation';
import PostCard from '../components/PostCard';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// ─── Privacy Settings Modal ───────────────────────────────────────────────────
function PrivacyModal({ visible, onClose, colors, S }: any) {
  const [showOnline, setShowOnline] = useState(true);
  const [allowDMs, setAllowDMs]     = useState(false);
  const [dataShare, setDataShare]   = useState(false);

  const rows = [
    { label: 'Show online status', hint: 'Let others see when you are active', value: showOnline, setter: setShowOnline },
    { label: 'Allow direct messages', hint: 'Receive messages from other users', value: allowDMs, setter: setAllowDMs },
    { label: 'Anonymous data sharing', hint: 'Help improve the app (no personal data)', value: dataShare, setter: setDataShare },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={[modal.sheet, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={[modal.handle, { backgroundColor: colors.border }]} />
          <View style={modal.titleRow}>
            <View style={[modal.iconBox, { backgroundColor: colors.tealDim }]}>
              <Feather name="shield" size={18} color={colors.teal} />
            </View>
            <Text style={[modal.title, { color: colors.textPrimary }]}>Privacy Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[modal.section, { color: colors.textMuted }]}>ANONYMITY</Text>

          {rows.map((row, i) => (
            <View key={row.label}>
              <View style={modal.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[modal.rowLabel, { color: colors.textPrimary }]}>{row.label}</Text>
                  <Text style={[modal.rowHint, { color: colors.textSecondary }]}>{row.hint}</Text>
                </View>
                <Switch
                  value={row.value}
                  onValueChange={row.setter}
                  trackColor={{ false: colors.border, true: colors.teal + 'AA' }}
                  thumbColor={row.value ? colors.teal : colors.textMuted}
                />
              </View>
              {i < rows.length - 1 && <View style={[modal.divider, { backgroundColor: colors.border }]} />}
            </View>
          ))}

          <Text style={[modal.section, { color: colors.textMuted, marginTop: 20 }]}>ACCOUNT</Text>
          <TouchableOpacity
            style={[modal.dangerBtn, { borderColor: colors.red + '66', backgroundColor: colors.redDim }]}
            onPress={() => Alert.alert('Delete Account', 'This will permanently delete your account and all your posts. This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => {} },
            ])}
          >
            <Feather name="trash-2" size={16} color={colors.red} />
            <Text style={[modal.dangerText, { color: colors.red }]}>Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[modal.saveBtn, { backgroundColor: colors.teal }]}
            onPress={onClose}
          >
            <Text style={modal.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Hidden Posts Modal ───────────────────────────────────────────────────────
function HiddenPostsModal({ visible, onClose, colors, S }: any) {
  const { posts, hiddenIds, toggleLike, toggleHide } = usePosts();
  const hiddenPosts = posts.filter(p => hiddenIds.includes(p.id));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={[modal.sheet, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={[modal.handle, { backgroundColor: colors.border }]} />
          <View style={modal.titleRow}>
            <View style={[modal.iconBox, { backgroundColor: colors.tealDim }]}>
              <Feather name="eye-off" size={18} color={colors.teal} />
            </View>
            <Text style={[modal.title, { color: colors.textPrimary }]}>Hidden Posts</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {hiddenPosts.length === 0 ? (
            <View style={modal.emptyState}>
              <Feather name="eye-off" size={40} color={colors.textMuted} />
              <Text style={[modal.emptyTitle, { color: colors.textPrimary }]}>No hidden posts</Text>
              <Text style={[modal.emptyHint, { color: colors.textSecondary }]}>
                Posts you hide will appear here. Tap the eye icon on any post to hide it.
              </Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              {hiddenPosts.map(post => (
                <View key={post.id} style={[modal.hiddenRow, { borderColor: colors.border, backgroundColor: colors.bgInput }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }]}>{post.author}</Text>
                    <Text style={[{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }]} numberOfLines={2}>{post.content}</Text>
                  </View>
                  <TouchableOpacity
                    style={[modal.unhideBtn, { backgroundColor: colors.tealDim }]}
                    onPress={() => toggleHide(post.id)}
                  >
                    <Feather name="eye" size={14} color={colors.teal} />
                    <Text style={[{ color: colors.teal, fontSize: 12, fontWeight: '600' }]}>Unhide</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            style={[modal.saveBtn, { backgroundColor: colors.teal }]}
            onPress={onClose}
          >
            <Text style={modal.saveBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── App Settings Modal ───────────────────────────────────────────────────────
function AppSettingsModal({ visible, onClose, colors }: any) {
  const [notifPosts, setNotifPosts]         = useState(true);
  const [notifComments, setNotifComments]   = useState(true);
  const [notifLikes, setNotifLikes]         = useState(false);
  const [compactMode, setCompactMode]       = useState(false);
  const [autoPlayGifs, setAutoPlayGifs]     = useState(true);

  const rows = [
    {
      section: 'NOTIFICATIONS',
      items: [
        { label: 'New posts nearby', hint: 'Get notified about trending confessions', value: notifPosts, setter: setNotifPosts },
        { label: 'Comments on your posts', hint: 'When someone replies to your confession', value: notifComments, setter: setNotifComments },
        { label: 'Likes on your posts', hint: 'When someone likes your confession', value: notifLikes, setter: setNotifLikes },
      ],
    },
    {
      section: 'DISPLAY',
      items: [
        { label: 'Compact mode', hint: 'Show more posts with less spacing', value: compactMode, setter: setCompactMode },
        { label: 'Auto-play GIFs', hint: 'Automatically animate GIF images', value: autoPlayGifs, setter: setAutoPlayGifs },
      ],
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={[modal.sheet, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={[modal.handle, { backgroundColor: colors.border }]} />
          <View style={modal.titleRow}>
            <View style={[modal.iconBox, { backgroundColor: colors.tealDim }]}>
              <Feather name="settings" size={18} color={colors.teal} />
            </View>
            <Text style={[modal.title, { color: colors.textPrimary }]}>App Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 340 }}>
            {rows.map(group => (
              <View key={group.section}>
                <Text style={[modal.section, { color: colors.textMuted }]}>{group.section}</Text>
                <View style={[modal.groupCard, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
                  {group.items.map((item, i) => (
                    <View key={item.label}>
                      <View style={modal.row}>
                        <View style={{ flex: 1 }}>
                          <Text style={[modal.rowLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                          <Text style={[modal.rowHint, { color: colors.textSecondary }]}>{item.hint}</Text>
                        </View>
                        <Switch
                          value={item.value}
                          onValueChange={item.setter}
                          trackColor={{ false: colors.border, true: colors.teal + 'AA' }}
                          thumbColor={item.value ? colors.teal : colors.textMuted}
                        />
                      </View>
                      {i < group.items.length - 1 && (
                        <View style={[modal.divider, { backgroundColor: colors.border }]} />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[modal.saveBtn, { backgroundColor: colors.teal }]}
            onPress={onClose}
          >
            <Text style={modal.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Profile Screen ──────────────────────────────────────────────────────
export default function ProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const { colors, mode, toggleTheme, nickname, flashAnim } = useTheme();
  const S = shadow(colors.isDark);
  const insets = useSafeAreaInsets();
  const TAB_H = Platform.OS === 'ios' ? 82 : 64;
  const { posts } = usePosts();

  const [showPrivacy, setShowPrivacy]         = useState(false);
  const [showHidden, setShowHidden]           = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    toggleTheme();
  };

  const handleLogOut = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
  };

  const settingsRows = [
    {
      featherName: mode === 'dark' ? 'moon' : 'sun',
      label: 'Dark Mode',
      hint: 'Toggle light and dark theme',
      onPress: null,
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
      featherName: 'shield',
      label: 'Privacy Settings',
      hint: 'Manage your anonymity',
      onPress: () => setShowPrivacy(true),
      right: <Feather name="chevron-right" size={20} color={colors.textMuted} />,
    },
    {
      featherName: 'eye-off',
      label: 'Hidden Posts',
      hint: "Posts you've hidden",
      onPress: () => setShowHidden(true),
      right: <Feather name="chevron-right" size={20} color={colors.textMuted} />,
    },
    {
      featherName: 'settings',
      label: 'App Settings',
      hint: 'Notifications & more',
      onPress: () => setShowAppSettings(true),
      right: <Feather name="chevron-right" size={20} color={colors.textMuted} />,
    },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      <Animated.View
        pointerEvents="none"
        style={[styles.flash, { opacity: flashAnim, backgroundColor: colors.isDark ? '#fff' : '#000' }]}
      />

      {/* Modals */}
      <PrivacyModal
        visible={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        colors={colors}
        S={S}
      />
      <HiddenPostsModal
        visible={showHidden}
        onClose={() => setShowHidden(false)}
        colors={colors}
        S={S}
      />
      <AppSettingsModal
        visible={showAppSettings}
        onClose={() => setShowAppSettings(false)}
        colors={colors}
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
            <Feather name="user" size={44} color="#fff" />
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{nickname}</Text>
          <Text style={[styles.nameHint, { color: colors.textSecondary }]}>Your identity is safe with us</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'message-circle', value: posts.length, label: 'Posts' },
            { icon: 'heart',          value: posts.reduce((s, p) => s + p.likes, 0), label: 'Likes' },
            { icon: 'message-square', value: posts.reduce((s, p) => s + p.commentCount, 0), label: 'Comments' },
          ].map(stat => (
            <View key={stat.label} style={[styles.statBox, S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Feather name={stat.icon as any} size={20} color={colors.teal} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={[styles.settingsCard, S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          {settingsRows.map((row, i) => (
            <View key={row.label}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={row.onPress ?? undefined}
                activeOpacity={row.onPress ? 0.7 : 1}
              >
                <View style={[styles.iconBox, { backgroundColor: colors.bgInput }]}>
                  <Feather name={row.featherName} size={18} color={colors.teal} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{row.label}</Text>
                  <Text style={[styles.rowHint, { color: colors.textSecondary }]}>{row.hint}</Text>
                </View>
                {row.right}
              </TouchableOpacity>
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
          <Feather name="log-out" size={18} color={colors.red} />
          <Text style={[styles.logoutText, { color: colors.red }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─── Main Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  flash: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  pageTitle: { fontSize: 18, ...FONTS.heading },
  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  name: { fontSize: 22, ...FONTS.heading, marginBottom: 4 },
  nameHint: { fontSize: 13 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20 },
  statBox: { flex: 1, borderRadius: RADIUS.md, paddingVertical: 14, alignItems: 'center', marginHorizontal: 4, borderWidth: 1 },
  statIcon: { marginBottom: 6 },
  statValue: { fontSize: 18, ...FONTS.heading },
  statLabel: { fontSize: 12 },
  settingsCard: { marginHorizontal: 16, borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: 20 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconBox: { width: 38, height: 38, borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: 14, ...FONTS.subheading },
  rowHint: { fontSize: 12, marginTop: 1 },
  divider: { height: 1 },
  logoutBtn: { marginHorizontal: 16, borderRadius: RADIUS.md, borderWidth: 1, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  logoutText: { fontSize: 15, ...FONTS.subheading },
});

// ─── Modal Styles (shared) ────────────────────────────────────────────────────
const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: 20, paddingBottom: 36, borderWidth: 1,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconBox: { width: 38, height: 38, borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  title: { flex: 1, fontSize: 17, ...FONTS.heading },
  section: { fontSize: 11, ...FONTS.subheading, letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  rowLabel: { fontSize: 14, ...FONTS.subheading },
  rowHint: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginLeft: 0 },
  groupCard: { borderRadius: RADIUS.md, borderWidth: 1, paddingHorizontal: 14, marginBottom: 8 },
  saveBtn: { borderRadius: RADIUS.md, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 15, ...FONTS.subheading },
  dangerBtn: { borderRadius: RADIUS.md, borderWidth: 1, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8 },
  dangerText: { fontSize: 14, ...FONTS.subheading },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyTitle: { fontSize: 16, ...FONTS.subheading },
  emptyHint: { fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
  hiddenRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  unhideBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
});