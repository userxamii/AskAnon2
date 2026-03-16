import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, TextInput, Modal, KeyboardAvoidingView,
  Platform, StatusBar, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, FONTS, RADIUS, shadow } from '../context/ThemeContext';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/PostCard';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['Confession', 'Funny', 'Wholesome', 'Vent', 'Advice', 'Discussion'];

export default function DashboardScreen({ navigation }: any) {
  const { colors, nickname } = useTheme();
  const S = shadow(colors.isDark);
  const insets = useSafeAreaInsets();
  const TAB_H = Platform.OS === 'ios' ? 82 : 64;
  const { posts, loading, addPost, toggleLike } = usePosts();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [selectedTag, setSelectedTag] = useState('Confession');

  const handlePost = () => {
    if (!newPostText.trim()) return;
    addPost(newPostText.trim(), selectedTag);
    setNewPostText('');
    setSelectedTag('Confession');
    setModalVisible(false);
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.teal} size="large" />
      </View>
    );
  }

  const recentPosts = posts.slice(0, 10);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      <FlatList
        data={recentPosts}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }}
            tintColor={colors.teal}
          />
        }
        contentContainerStyle={{ paddingBottom: TAB_H + 80 }}
        ListHeaderComponent={
          <>
            {/* Top bar */}
            <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
              <Text style={styles.brandWrap}>
                <Text style={[styles.brandA, { color: colors.teal }]}>Ask</Text>
                <Text style={[styles.brandB, { color: colors.isDark ? '#A78BFA' : '#7C3AED' }]}>Anon</Text>
              </Text>
              <Text style={[styles.heyText, { color: colors.textSecondary }]}>Hey, {nickname}</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatCard icon="💬" value={posts.length} label="Posts" />
              <StatCard icon="📈" value="312" label="Trending" />
              <StatCard icon="👤" value="Now" label="Active" />
            </View>

            {/* Section header */}
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Confessions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Posts')}>
                <Text style={[styles.viewAll, { color: colors.teal }]}>View All</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState emoji="🌬️" title="The wall is silent"
            subtitle="No confessions yet. Be the first to share something." />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <PostCard
              post={item}
              onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
              onLike={() => toggleLike(item.id)}
            />
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, S.card, { backgroundColor: colors.teal, bottom: TAB_H + 16 }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabIcon}>✏️</Text>
      </TouchableOpacity>

      {/* New Post Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          <View style={[styles.sheet, { backgroundColor: colors.bgCard, borderColor: colors.border, paddingBottom: insets.bottom + 20 }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>New Confession</Text>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.bgInput }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.closeX, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.textArea, { backgroundColor: colors.bgInput, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="What's your confession?"
              placeholderTextColor={colors.textPlaceholder}
              multiline
              value={newPostText}
              onChangeText={setNewPostText}
              maxLength={280}
              autoFocus
            />

            {/* Category chips */}
            <Text style={[styles.catLabel, { color: colors.textSecondary }]}>CATEGORY</Text>
            <FlatList
              horizontal
              data={CATEGORIES}
              keyExtractor={c => c}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
              renderItem={({ item }) => {
                const active = selectedTag === item;
                return (
                  <TouchableOpacity
                    style={[styles.chip, {
                      backgroundColor: active ? colors.teal : colors.bgInput,
                      borderColor: active ? colors.teal : colors.border,
                    }]}
                    onPress={() => setSelectedTag(item)}
                  >
                    <Text style={[styles.chipText, { color: active ? '#fff' : colors.textSecondary }]}>{item}</Text>
                  </TouchableOpacity>
                );
              }}
            />

            <View style={styles.sheetFooter}>
              <Text style={[styles.charCount, { color: colors.textMuted }]}>{newPostText.length}/280</Text>
              <TouchableOpacity
                style={[styles.postBtn, { backgroundColor: newPostText.trim() ? colors.teal : colors.bgSurface }]}
                onPress={handlePost}
                disabled={!newPostText.trim()}
              >
                <Text style={[styles.postBtnText, { color: newPostText.trim() ? '#fff' : colors.textMuted }]}>Post</Text>
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
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  brandWrap: { fontSize: 24, ...FONTS.heading },
  brandA: { fontSize: 24, ...FONTS.heading },
  brandB: { fontSize: 24, ...FONTS.heading },
  heyText: { fontSize: 14 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 24 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, ...FONTS.heading },
  viewAll: { fontSize: 13, ...FONTS.subheading },
  cardWrap: { paddingHorizontal: 20 },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  fabIcon: { fontSize: 22 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: 20, borderWidth: 1 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sheetTitle: { fontSize: 17, ...FONTS.heading },
  closeBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  closeX: { fontSize: 13 },
  textArea: { borderRadius: RADIUS.md, borderWidth: 1, padding: 14, fontSize: 14, minHeight: 100, textAlignVertical: 'top', marginBottom: 16 },
  catLabel: { fontSize: 11, ...FONTS.subheading, letterSpacing: 1, marginBottom: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1 },
  chipText: { fontSize: 12, ...FONTS.medium },
  sheetFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  charCount: { fontSize: 12 },
  postBtn: { borderRadius: RADIUS.md, paddingVertical: 10, paddingHorizontal: 26 },
  postBtnText: { fontSize: 14, ...FONTS.subheading },
});