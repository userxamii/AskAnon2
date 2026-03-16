import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, FONTS, RADIUS, shadow } from '../context/ThemeContext';
import { Post } from '../hooks/usePosts';

interface Props {
  post: Post;
  onPress: () => void;
  onLike: () => void;
}

export default function PostCard({ post, onPress, onLike }: Props) {
  const { colors } = useTheme();
  const S = shadow(colors.isDark);

  return (
    <TouchableOpacity
      style={[styles.card, S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Author row */}
      <View style={styles.authorRow}>
        <View style={[styles.avatar, { backgroundColor: colors.teal }]}>
          <Text style={styles.avatarEmoji}>{post.authorEmoji}</Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={[styles.authorName, { color: colors.textPrimary }]}>{post.author}</Text>
          <View style={styles.timeRow}>
            <Text style={[styles.clockIcon, { color: colors.textMuted }]}>⏱</Text>
            <Text style={[styles.timestamp, { color: colors.textMuted }]}>{post.timestamp}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <Text style={[styles.content, { color: colors.textPrimary }]}>{post.content}</Text>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onLike} activeOpacity={0.7}>
          <Text style={[styles.actionIcon, { color: post.likedByMe ? colors.red : colors.textSecondary }]}>
            {post.likedByMe ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionCount, { color: post.likedByMe ? colors.red : colors.textSecondary }]}>
            {post.likes}
          </Text>
        </TouchableOpacity>
        <View style={styles.actionBtn}>
          <Text style={[styles.actionIcon, { color: colors.textSecondary }]}>💬</Text>
          <Text style={[styles.actionCount, { color: colors.textSecondary }]}>{post.commentCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: { fontSize: 22 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 15, ...FONTS.subheading },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  clockIcon: { fontSize: 11 },
  timestamp: { fontSize: 12 },
  content: { fontSize: 14, lineHeight: 22, marginBottom: 14 },
  actions: { flexDirection: 'row', gap: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionIcon: { fontSize: 16 },
  actionCount: { fontSize: 14, ...FONTS.medium },
});