import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Platform, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, FONTS, RADIUS } from '../context/ThemeContext';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';

export default function PostsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const TAB_H = Platform.OS === 'ios' ? 82 : 64;
  const { posts, toggleLike } = usePosts();

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const filtered = useMemo(() =>
    posts.filter(p =>
      query.trim() === '' ||
      p.content.toLowerCase().includes(query.toLowerCase()) ||
      p.author.toLowerCase().includes(query.toLowerCase()) ||
      p.tag.toLowerCase().includes(query.toLowerCase())
    ),
    [posts, query]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.backArrow, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>All Confessions</Text>
        <Text style={[styles.postCount, { color: colors.textSecondary }]}>{posts.length} posts</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_H + 24, paddingTop: 16 }}
        ListHeaderComponent={
          <View style={[
            styles.searchWrap,
            { backgroundColor: colors.bgInput, borderColor: focused ? colors.teal : colors.border },
          ]}>
            <Text style={[styles.searchIcon, { color: colors.textMuted }]}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search confessions..."
              placeholderTextColor={colors.textPlaceholder}
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={[styles.clearBtn, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          query.trim() !== '' ? (
            <EmptyState emoji="🔎" title="No results"
              subtitle={`Nothing matches "${query}". Try another keyword.`} />
          ) : (
            <EmptyState emoji="🌬️" title="Nothing here yet"
              subtitle="Be the first to post a confession." />
          )
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36 },
  backArrow: { fontSize: 22, ...FONTS.heading },
  headerTitle: { fontSize: 18, ...FONTS.heading },
  postCount: { fontSize: 13, ...FONTS.medium },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: RADIUS.md, borderWidth: 1,
    paddingHorizontal: 14, height: 46,
    marginBottom: 16,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, height: '100%' },
  clearBtn: { fontSize: 14, padding: 4 },
});