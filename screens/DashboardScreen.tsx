import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  RefreshControl, TextInput, Modal, KeyboardAvoidingView,
  Platform, StatusBar, ActivityIndicator, ScrollView,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, FONTS, RADIUS, shadow } from '../context/ThemeContext';
import { usePosts } from '../context/PostsContext';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'General',       emoji: '💬', color: '#8B5CF6' },
  { name: 'Funny',         emoji: '😂', color: '#F59E0B' },
  { name: 'Wholesome',     emoji: '💖', color: '#EC4899' },
  { name: 'Confession',    emoji: '🤫', color: '#3B82F6' },
  { name: 'Deep Thoughts', emoji: '🧠', color: '#EF4444' },
  { name: 'Advice',        emoji: '💡', color: '#10B981' },
  { name: 'Vent',          emoji: '😤', color: '#F97316' },
  { name: 'Work',          emoji: '💼', color: '#6366F1' },
];

// How far the user must scroll before the FAB appears
const FAB_SHOW_THRESHOLD = 200;

export default function DashboardScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const S = shadow(colors.isDark);
  const insets = useSafeAreaInsets();
  const TAB_H = Platform.OS === 'ios' ? 82 : 64;
  const { posts, loading, addPost, toggleLike, hiddenIds } = usePosts();

  const [refreshing, setRefreshing]     = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostText, setNewPostText]   = useState('');
  const [selectedTag, setSelectedTag]   = useState('General');
  const [fabVisible, setFabVisible]     = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (e: any) => {
        const y = e.nativeEvent.contentOffset.y;
        const shouldShow = y > FAB_SHOW_THRESHOLD;
        if (shouldShow !== fabVisible) {
          setFabVisible(shouldShow);
          Animated.spring(fabAnim, {
            toValue: shouldShow ? 1 : 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        }
      },
    }
  );

  const handlePost = () => {
    if (!newPostText.trim()) return;
    addPost(newPostText.trim(), selectedTag);
    setNewPostText('');
    setSelectedTag('General');
    setModalVisible(false);
  };

  const countForCategory = (name: string) => posts.filter(p => p.tag === name).length;

  // Header height = safe area top + header content
  const HEADER_H = insets.top + 56;

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.teal} size="large" />
      </View>
    );
  }

  const recentPosts = posts.filter(p => !hiddenIds.includes(p.id)).slice(0, 8);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />

      {/* ── Blurred fixed header ── */}
      <View style={[styles.headerWrap, { height: HEADER_H }]}>
        <BlurView
          intensity={isDark ? 100 : 100}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        {/* Solid overlay to ensure ~95% opacity — BlurView alone is translucent */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isDark ? 'rgba(13,17,23,0.92)' : 'rgba(240,244,248,0.92)' },
          ]}
        />
        {/* Subtle bottom border */}
        <View
          style={[
            styles.headerBorder,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' },
          ]}
        />
        {/* Brand text pinned to bottom of header */}
        <View style={[styles.headerContent, { marginTop: insets.top }]}>
          <Text style={styles.brandWrap}>
            <Text style={[styles.brandA, { color: colors.teal }]}>Ask</Text>
            <Text style={[styles.brandB, { color: isDark ? '#A78BFA' : '#7C3AED' }]}>Anon</Text>
          </Text>
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }}
            tintColor={colors.teal}
            progressViewOffset={HEADER_H}
          />
        }
        contentContainerStyle={{ paddingTop: HEADER_H + 16, paddingBottom: TAB_H + 60 }}
      >
        {/* ── Hero card ── */}
        <View style={[styles.heroCard, { marginHorizontal: 20 }]}>
          <Text style={styles.heroDecor}>👻</Text>
          <View style={styles.heroLabelRow}>
            <Feather name="zap" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.heroLabel}>DASHBOARD</Text>
          </View>
          <Text style={styles.heroTitle}>What's on your{'\n'}mind today?</Text>
          <Text style={styles.heroSub}>Share anonymously. No judgement. Just vibes.</Text>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={16} color={colors.teal} />
            <Text style={[styles.heroBtnText, { color: colors.teal }]}>New Confession</Text>
          </TouchableOpacity>
        </View>

        {/* ── Browse by Category ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Browse by Category</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {CATEGORIES.map(cat => {
            const count = countForCategory(cat.name);
            return (
              <TouchableOpacity
                key={cat.name}
                activeOpacity={0.82}
                style={[styles.catCard, { backgroundColor: cat.color }]}
                onPress={() => navigation.navigate('Posts', { filterTag: cat.name })}
              >
                <Text style={styles.catWatermark}>{cat.emoji}</Text>
                <View style={styles.catContent}>
                  <View style={styles.catBadge}>
                    <Text style={styles.catBadgeText}>{count} posts</Text>
                  </View>
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <View style={styles.catArrow}>
                    <Feather name="arrow-right" size={13} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Recent Activity ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
          <TouchableOpacity
            style={styles.viewAllRow}
            onPress={() => navigation.navigate('Posts')}
          >
            <Text style={[styles.viewAll, { color: colors.teal }]}>View All</Text>
            <Feather name="arrow-right" size={14} color={colors.teal} />
          </TouchableOpacity>
        </View>

        {recentPosts.length === 0 ? (
          <EmptyState
            emoji="🌬️"
            title="The wall is silent"
            subtitle="No confessions yet. Be the first to share!"
          />
        ) : (
          recentPosts.map(item => (
            <View key={item.id} style={styles.cardWrap}>
              <PostCard
                post={item}
                onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
                onLike={() => toggleLike(item.id)}
              />
            </View>
          ))
        )}
      </Animated.ScrollView>

      {/* ── FAB — only visible after scrolling past hero ── */}
      <Animated.View
        style={[
          styles.fab,
          {
            backgroundColor: colors.teal,
            bottom: TAB_H + 16,
            opacity: fabAnim,
            transform: [{ scale: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
            pointerEvents: fabVisible ? 'auto' : 'none',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fabInner}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={26} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* ── New Post Modal ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          <View style={[
            styles.sheet,
            { backgroundColor: colors.bgCard, borderColor: colors.border, paddingBottom: insets.bottom + 20 },
          ]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>New Confession</Text>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.bgInput }]}
                onPress={() => setModalVisible(false)}
              >
                <Feather name="x" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.textArea, {
                backgroundColor: colors.bgInput,
                borderColor: colors.border,
                color: colors.textPrimary,
              }]}
              placeholder="What's your confession?"
              placeholderTextColor={colors.textPlaceholder}
              multiline
              value={newPostText}
              onChangeText={setNewPostText}
              maxLength={280}
              autoFocus
            />

            <Text style={[styles.catLabel, { color: colors.textSecondary }]}>CATEGORY</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
            >
              {CATEGORIES.map(cat => {
                const active = selectedTag === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.name}
                    style={[styles.chip, {
                      backgroundColor: active ? colors.teal : colors.bgInput,
                      borderColor: active ? colors.teal : colors.border,
                    }]}
                    onPress={() => setSelectedTag(cat.name)}
                  >
                    <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.chipText, { color: active ? '#fff' : colors.textSecondary }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.sheetFooter}>
              <Text style={[styles.charCount, { color: colors.textMuted }]}>{newPostText.length}/280</Text>
              <TouchableOpacity
                style={[styles.postBtn, {
                  backgroundColor: newPostText.trim() ? colors.teal : colors.bgInput,
                }]}
                onPress={handlePost}
                disabled={!newPostText.trim()}
              >
                <Text style={[styles.postBtnText, { color: newPostText.trim() ? '#fff' : colors.textMuted }]}>
                  Post
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading:   { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Fixed blurred header
  headerWrap: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  headerBorder: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
  },
  headerContent: {
    flex: 1, justifyContent: 'center', paddingHorizontal: 20,
  },
  brandWrap: { fontSize: 26, ...FONTS.heading },
  brandA:    { fontSize: 26, ...FONTS.heading },
  brandB:    { fontSize: 26, ...FONTS.heading },

  // Hero card
  heroCard: {
    borderRadius: RADIUS.xl,
    backgroundColor: '#00B4A0',
    padding: 22, marginBottom: 28,
    overflow: 'hidden', minHeight: 170,
  },
  heroDecor: {
    position: 'absolute', right: 14, bottom: 10,
    fontSize: 80, opacity: 0.18,
  },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  heroLabel:    { fontSize: 11, color: 'rgba(255,255,255,0.85)', ...FONTS.subheading, letterSpacing: 1.2 },
  heroTitle:    { fontSize: 22, ...FONTS.heading, color: '#fff', marginBottom: 6, lineHeight: 30 },
  heroSub:      { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 18, lineHeight: 19 },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start', backgroundColor: '#fff',
    borderRadius: RADIUS.full, paddingVertical: 9, paddingHorizontal: 18,
  },
  heroBtnText: { fontSize: 14, ...FONTS.subheading },

  // Sections
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, ...FONTS.heading },
  viewAllRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAll:      { fontSize: 13, ...FONTS.subheading },

  // Category cards
  catScroll: { paddingLeft: 20, paddingRight: 8, gap: 12, marginBottom: 28 },
  catCard: {
    width: 140, height: 160,
    borderRadius: 20, overflow: 'hidden',
    padding: 14, justifyContent: 'flex-end',
  },
  catWatermark: {
    position: 'absolute', top: -6, right: 4,
    fontSize: 72, opacity: 0.22,
    transform: [{ rotate: '15deg' }],
  },
  catContent: { gap: 4 },
  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3,
    marginBottom: 4,
  },
  catBadgeText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  catEmoji:     { fontSize: 28, marginBottom: 2 },
  catName: {
    fontSize: 14, color: '#fff', fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  catArrow: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    marginTop: 6, alignSelf: 'flex-start',
  },

  // Posts
  cardWrap: { paddingHorizontal: 20 },

  // FAB
  fab: {
    position: 'absolute', right: 20,
    width: 56, height: 56, borderRadius: 28,
    shadowColor: '#00B4A0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 10,
    overflow: 'hidden',
  },
  fabInner: {
    width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center',
  },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: 20, borderWidth: 1,
  },
  handle:      { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sheetTitle:  { fontSize: 17, ...FONTS.heading },
  closeBtn:    { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  textArea: {
    borderRadius: RADIUS.md, borderWidth: 1, padding: 14,
    fontSize: 14, minHeight: 100, textAlignVertical: 'top', marginBottom: 16,
  },
  catLabel:    { fontSize: 11, ...FONTS.subheading, letterSpacing: 1, marginBottom: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  chipEmoji:   { fontSize: 14 },
  chipText:    { fontSize: 12, ...FONTS.medium },
  sheetFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  charCount:   { fontSize: 12 },
  postBtn:     { borderRadius: RADIUS.md, paddingVertical: 10, paddingHorizontal: 26 },
  postBtnText: { fontSize: 14, ...FONTS.subheading },
});