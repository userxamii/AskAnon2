import React, { useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme, FONTS, RADIUS, shadow } from '../context/ThemeContext';
import { usePosts } from '../context/PostsContext';

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetails'>;

export default function PostDetailsScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const S = shadow(colors.isDark);
  const insets = useSafeAreaInsets();
  const { posts, toggleLike, addComment, toggleCommentLike } = usePosts();

  const post = posts.find(p => p.id === route.params.postId);
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || !post) return;
    addComment(post.id, text.trim());
    setText('');
  };

  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.textPrimary, padding: 20 }}>Post not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* Header */}
      <View style={[styles.header, {
        paddingTop: insets.top + 12,
        backgroundColor: colors.bgCard,
        borderBottomColor: colors.border,
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Confession</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={post.comments}
          keyExtractor={c => c.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
          ListHeaderComponent={
            <>
              {/* Post card */}
              <View style={[styles.postCard, S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <View style={styles.authorRow}>
                  <View style={[styles.avatar, { backgroundColor: colors.teal }]}>
                    <Text style={styles.avatarEmoji}>{post.authorEmoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.authorName, { color: colors.textPrimary }]}>{post.author}</Text>
                    <View style={styles.timeRow}>
                      <Feather name="clock" size={11} color={colors.textMuted} />
                      <Text style={[styles.timestamp, { color: colors.textMuted }]}>{post.timestamp}</Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.postContent, { color: colors.textPrimary }]}>{post.content}</Text>

                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(post.id)}>
                    <Feather name="heart" size={16} color={post.likedByMe ? colors.red : colors.textSecondary} />
                    <Text style={[styles.actionCount, { color: post.likedByMe ? colors.red : colors.textSecondary }]}>
                      {post.likes}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.actionBtn}>
                    <Feather name="message-circle" size={16} color={colors.textSecondary} />
                    {/* Always reflects the real comment count */}
                    <Text style={[styles.actionCount, { color: colors.textSecondary }]}>
                      {post.comments.length}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Comments heading */}
              <Text style={[styles.commentsLabel, { color: colors.textPrimary }]}>
                Comments{' '}
                <Text style={{ color: colors.teal }}>({post.comments.length})</Text>
              </Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.noComments}>
              <Feather name="message-circle" size={32} color={colors.textMuted} />
              <Text style={[styles.noCommentsText, { color: colors.textMuted }]}>
                No comments yet. Be the first!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.commentCard, S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <View style={styles.commentTop}>
                <View style={[styles.commentAvatar, { backgroundColor: colors.teal }]}>
                  <Text style={styles.commentAvatarEmoji}>{item.authorEmoji}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Feather name="clock" size={10} color={colors.textMuted} />
                  <Text style={[styles.timestamp, { color: colors.textMuted }]}>{item.timestamp}</Text>
                </View>
              </View>
              <Text style={[styles.commentText, { color: colors.textPrimary }]}>{item.text}</Text>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => toggleCommentLike(post.id, item.id)}
              >
                <Feather name="heart" size={14} color={item.likedByMe ? colors.red : colors.textSecondary} />
                <Text style={[styles.actionCount, { color: item.likedByMe ? colors.red : colors.textSecondary }]}>
                  {item.likes}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Input bar */}
        <View style={[styles.inputBar, {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + 8,
        }]}>
          <TextInput
            style={[styles.inputField, {
              backgroundColor: colors.bgInput,
              borderColor: colors.border,
              color: colors.textPrimary,
            }]}
            placeholder="Write something supportive..."
            placeholderTextColor={colors.textPlaceholder}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.teal : colors.bgSurface }]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Feather name="send" size={18} color={text.trim() ? '#fff' : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 17, ...FONTS.heading },
  postCard: { borderRadius: RADIUS.lg, padding: 16, marginBottom: 20, borderWidth: 1 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarEmoji: { fontSize: 22 },
  authorName: { fontSize: 15, ...FONTS.subheading },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  timestamp: { fontSize: 12 },
  postContent: { fontSize: 15, lineHeight: 24, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: 14, ...FONTS.medium },
  commentsLabel: { fontSize: 16, ...FONTS.heading, marginBottom: 14 },
  noComments: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  noCommentsText: { fontSize: 14 },
  commentCard: { borderRadius: RADIUS.md, padding: 14, marginBottom: 10, borderWidth: 1 },
  commentTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 8,
  },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  commentAvatarEmoji: { fontSize: 14 },
  commentText: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1,
  },
  inputField: {
    flex: 1, borderRadius: RADIUS.lg, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, maxHeight: 90,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
});