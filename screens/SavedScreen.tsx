import React from 'react';
import { View, Text, StyleSheet, FlatList, Platform, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, FONTS, RADIUS } from '../context/ThemeContext';
import { usePosts } from '../context/PostsContext';
import PostCard from '../components/PostCard';

export default function SavedScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const TAB_H = Platform.OS === 'ios' ? 82 : 64;
  const { posts, savedIds, toggleLike } = usePosts();

  const savedPosts = posts.filter(p => savedIds.includes(p.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Saved</Text>
        <View style={[styles.badge, { backgroundColor: colors.tealDim }]}>
          <Text style={[styles.badgeText, { color: colors.teal }]}>{savedPosts.length}</Text>
        </View>
      </View>

      <FlatList
        data={savedPosts}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: TAB_H + 24,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Feather name="bookmark" size={32} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No saved posts yet</Text>
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
              Tap the bookmark icon on any post to save it here for later.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
            onLike={() => toggleLike(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, ...FONTS.heading },
  badge: {
    borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3,
  },
  badgeText: { fontSize: 13, ...FONTS.subheading },
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 80, gap: 12,
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, ...FONTS.subheading },
  emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 32 },
});