import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Platform, StatusBar, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, FONTS, RADIUS } from '../context/ThemeContext';
import { usePosts } from '../context/PostsContext';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';

const ALL_TAGS = ['All', 'General', 'Confession', 'Funny', 'Wholesome', 'Vent', 'Advice', 'Deep Thoughts', 'Work'];

export default function PostsScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const TAB_H = Platform.OS === 'ios' ? 82 : 64;
  const { posts, toggleLike, hiddenIds } = usePosts();

  // Read filterTag passed from Dashboard category grid
  const incomingTag = route?.params?.filterTag;
  const [activeTag, setActiveTag] = useState<string>(incomingTag ?? 'All');
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  // Update active tag if navigated to with a new filterTag
  useEffect(() => {
    if (incomingTag) {
      setActiveTag(incomingTag);
    }
  }, [incomingTag]);

  const filtered = useMemo(() =>
    posts
      .filter(p => !hiddenIds.includes(p.id))
      .filter(p => activeTag === 'All' || p.tag === activeTag)
      .filter(p =>
        query.trim() === '' ||
        p.content.toLowerCase().includes(query.toLowerCase()) ||
        p.author.toLowerCase().includes(query.toLowerCase()) ||
        p.tag.toLowerCase().includes(query.toLowerCase())
      ),
    [posts, activeTag, query]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>All Confessions</Text>
        <Text style={[styles.postCount, { color: colors.textSecondary }]}>{filtered.length} posts</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_H + 24, paddingTop: 16 }}
        ListHeaderComponent={
          <>
            {/* Search bar */}
            <View style={[
              styles.searchWrap,
              { backgroundColor: colors.bgInput, borderColor: focused ? colors.teal : colors.border },
            ]}>
              <Feather name="search" size={16} color={colors.textMuted} />
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
                  <Feather name="x" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Tag filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
            >
              {ALL_TAGS.map(tag => {
                const isActive = activeTag === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.chip, {
                      backgroundColor: isActive ? colors.teal : colors.bgCard,
                      borderColor: isActive ? colors.teal : colors.border,
                    }]}
                    onPress={() => setActiveTag(tag)}
                  >
                    <Text style={[styles.chipText, { color: isActive ? '#fff' : colors.textSecondary }]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          query.trim() !== '' ? (
            <EmptyState emoji="🔎" title="No results"
              subtitle={`Nothing matches "${query}". Try another keyword.`} />
          ) : (
            <EmptyState emoji="🌬️" title="Nothing here yet"
              subtitle="No posts in this category yet." />
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
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 36 },
  headerTitle: { fontSize: 18, ...FONTS.heading },
  postCount: { fontSize: 13, ...FONTS.medium },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: RADIUS.md, borderWidth: 1,
    paddingHorizontal: 14, height: 46, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, height: '100%' },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  chipText: { fontSize: 13, ...FONTS.medium },
});