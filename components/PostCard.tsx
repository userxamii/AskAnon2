import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, FONTS, RADIUS, shadow } from '../context/ThemeContext';
import { Post, Comment, usePosts } from '../context/PostsContext';

export interface PostCardProps {
  post: Post;
  onPress: () => void;
  onLike: () => void;
}

// Tag pill colors
const TAG_COLORS: Record<string, string> = {
  Confession: '#7C3AED',
  Funny:      '#D97706',
  Wholesome:  '#059669',
  Vent:       '#DC2626',
  Advice:     '#2563EB',
  Discussion: '#0891B2',
  General:    '#6B7280',
};

export default function PostCard({ post, onPress, onLike }: PostCardProps) {
  const { colors } = useTheme();
  const S = shadow(colors.isDark);
  const { addComment, toggleCommentLike, hiddenIds, savedIds, toggleHide, toggleSave } = usePosts();

  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const isHidden = hiddenIds.includes(post.id);
  const isSaved  = savedIds.includes(post.id);

  // Don't render if hidden
  if (isHidden) return null;

  const tagColor = TAG_COLORS[post.tag] ?? '#6B7280';
  // Fake view count based on likes for realism
  const viewCount = Math.floor(post.likes * 6.5 + post.commentCount * 12);

  const handleSend = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim());
    setCommentText('');
  };

  return (
    <View style={[styles.card, S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>

      {/* ── Author row ── */}
      <View style={styles.authorRow}>
        <TouchableOpacity style={styles.authorLeft} onPress={onPress} activeOpacity={0.8}>
          <View style={[styles.avatar, { backgroundColor: colors.teal }]}>
            <Text style={styles.avatarEmoji}>{post.authorEmoji}</Text>
          </View>
          <View style={styles.authorMeta}>
            <Text style={[styles.authorName, { color: colors.textPrimary }]}>{post.author}</Text>
            <View style={styles.metaRow}>
              <Feather name="clock" size={11} color={colors.textMuted} />
              <Text style={[styles.timestamp, { color: colors.textMuted }]}>{post.timestamp}</Text>
              {/* Tag pill */}
              <View style={[styles.tagPill, { backgroundColor: tagColor + '22', borderColor: tagColor + '55' }]}>
                <Text style={[styles.tagText, { color: tagColor }]}>{post.tag}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* View count top-right */}
        <View style={styles.viewCount}>
          <Feather name="eye" size={13} color={colors.textMuted} />
          <Text style={[styles.viewText, { color: colors.textMuted }]}>{viewCount}</Text>
        </View>
      </View>

      {/* ── Content ── */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <Text style={[styles.content, { color: colors.textPrimary }]}>{post.content}</Text>
      </TouchableOpacity>

      {/* ── Action row ── */}
      <View style={styles.actionRow}>
        {/* Left: like + comment toggle */}
        <View style={styles.actionLeft}>
          {/* Like */}
          <TouchableOpacity style={styles.actionBtn} onPress={onLike} activeOpacity={0.7}>
            <Feather name="heart" size={17} color={post.likedByMe ? colors.red : colors.textSecondary} />
            <Text style={[styles.actionCount, { color: post.likedByMe ? colors.red : colors.textSecondary }]}>
              {post.likes}
            </Text>
          </TouchableOpacity>

          {/* Comment count + expand toggle */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setExpanded(e => !e)}
            activeOpacity={0.7}
          >
            <Feather name="message-circle" size={17} color={colors.textSecondary} />
            <Text style={[styles.actionCount, { color: colors.textSecondary }]}>
              {post.comments.length}
            </Text>
            <Feather
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Right: hide + bookmark */}
        <View style={styles.actionRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => toggleHide(post.id)}>
            <Feather name="eye-off" size={17} color={isHidden ? colors.red : colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => toggleSave(post.id)}>
            <Feather name="bookmark" size={17} color={isSaved ? colors.teal : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Inline comments section (expanded) ── */}
      {expanded && (
        <View style={[styles.commentsSection, { borderTopColor: colors.border }]}>
          {/* Comment input */}
          <View style={[styles.inputRow, { backgroundColor: colors.bgInput, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textPlaceholder}
              value={commentText}
              onChangeText={setCommentText}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!commentText.trim()}
              style={styles.sendBtn}
            >
              <Feather
                name="send"
                size={16}
                color={commentText.trim() ? colors.teal : colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Comment list */}
          {post.comments.length === 0 ? (
            <Text style={[styles.noComments, { color: colors.textMuted }]}>
              No comments yet. Be the first!
            </Text>
          ) : (
            post.comments.map(comment => (
              <CommentRow
                key={comment.id}
                comment={comment}
                postId={post.id}
                onLike={toggleCommentLike}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
}

// ── Inline comment row ────────────────────────────────────────────────────────

function CommentRow({
  comment, postId, onLike,
}: {
  comment: Comment;
  postId: string;
  onLike: (postId: string, commentId: string) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.commentRow}>
      {/* Small avatar */}
      <View style={[styles.commentAvatar, { backgroundColor: colors.teal }]}>
        <Text style={styles.commentAvatarEmoji}>{comment.authorEmoji}</Text>
      </View>

      <View style={styles.commentBody}>
        {/* Author + timestamp on same line */}
        <View style={styles.commentHeader}>
          <Text style={[styles.commentAuthor, { color: colors.textPrimary }]}>
            {comment.author ?? 'Anon'}
          </Text>
          <Text style={[styles.commentTime, { color: colors.textMuted }]}>{comment.timestamp}</Text>
        </View>

        {/* Comment text */}
        <Text style={[styles.commentText, { color: colors.textSecondary }]}>{comment.text}</Text>

        {/* Like */}
        <TouchableOpacity
          style={styles.commentLike}
          onPress={() => onLike(postId, comment.id)}
          activeOpacity={0.7}
        >
          <Feather name="heart" size={13} color={comment.likedByMe ? colors.red : colors.textMuted} />
          {comment.likes > 0 && (
            <Text style={[styles.commentLikeCount, { color: comment.likedByMe ? colors.red : colors.textMuted }]}>
              {comment.likes}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Author
  authorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 14,
    paddingBottom: 10,
  },
  authorLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarEmoji: { fontSize: 20 },
  authorMeta: { flex: 1 },
  authorName: { fontSize: 15, ...FONTS.subheading },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3, flexWrap: 'wrap' },
  timestamp: { fontSize: 12 },
  tagPill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1,
  },
  tagText: { fontSize: 11, ...FONTS.medium },
  viewCount: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  viewText: { fontSize: 12 },

  // Content
  content: {
    fontSize: 14, lineHeight: 22,
    paddingHorizontal: 14, paddingBottom: 12,
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  actionLeft: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  actionRight: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { fontSize: 14, ...FONTS.medium },
  iconBtn: { padding: 2 },

  // Expanded comments section
  commentsSection: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 42,
    marginBottom: 4,
  },
  input: { flex: 1, fontSize: 13, height: '100%' },
  sendBtn: { paddingLeft: 8, paddingVertical: 6 },
  noComments: { fontSize: 13, textAlign: 'center', paddingVertical: 8 },

  // Comment row
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  commentAvatar: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 2,
  },
  commentAvatarEmoji: { fontSize: 14 },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  commentAuthor: { fontSize: 13, ...FONTS.subheading },
  commentTime: { fontSize: 11 },
  commentText: { fontSize: 13, lineHeight: 19, marginBottom: 5 },
  commentLike: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentLikeCount: { fontSize: 12 },
});