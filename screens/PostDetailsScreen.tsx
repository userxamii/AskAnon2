import React, { useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme, FONTS, RADIUS, shadow } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetails'>;

const MOCK_POSTS: Record<string, { content: string; likes: number; timestamp: string }> = {
  '1':  { content: "I'm really stressed about school deadlines.", likes: 4, timestamp: '2h ago' },
  '2':  { content: 'Anyone else struggling with React Native? 😅', likes: 8, timestamp: '4h ago' },
  '3':  { content: 'Sometimes college feels overwhelming but then I remember how far I\'ve come.', likes: 12, timestamp: '6h ago' },
  '4':  { content: 'I finally talked to someone about my anxiety. It helped more than I expected.', likes: 31, timestamp: '1d ago' },
  '5':  { content: "Does anyone else feel like they're pretending to have it together?", likes: 47, timestamp: '2d ago' },
  't1': { content: 'Reminder: You are doing better than you think. 💙', likes: 89, timestamp: '3h ago' },
  't2': { content: "Failed my exam today. Don't know how to tell my parents.", likes: 23, timestamp: '5h ago' },
  't3': { content: 'I made a friend online who genuinely listens. It means more than they know.', likes: 62, timestamp: '8h ago' },
  't4': { content: "Can we normalize saying 'I don't know' without shame?", likes: 55, timestamp: '12h ago' },
};

interface Comment {
  id: string; text: string; timestamp: string; likes: number; likedByMe: boolean;
}

const INITIAL_COMMENTS: Comment[] = [
  { id: '1', text: "You're not alone. We all feel this way sometimes 💙", timestamp: '1h ago', likes: 3, likedByMe: false },
  { id: '2', text: 'I feel the same. Hang in there!', timestamp: '1h ago', likes: 1, likedByMe: false },
];

export default function PostDetailsScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const SHADOW = shadow(colors.isDark);
  const insets = useSafeAreaInsets();
  const { postId } = route.params;
  const post = MOCK_POSTS[postId] ?? { content: 'Post not found.', likes: 0, timestamp: '' };

  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [commentText, setCommentText] = useState('');
  const [postLikes, setPostLikes] = useState(post.likes);
  const [postLiked, setPostLiked] = useState(false);

  const addComment = () => {
    if (!commentText.trim()) return;
    setComments(p => [...p, {
      id: Date.now().toString(), text: commentText.trim(),
      timestamp: 'just now', likes: 0, likedByMe: false,
    }]);
    setCommentText('');
  };

  const likeComment = (id: string) =>
    setComments(p => p.map(c =>
      c.id === id ? { ...c, likes: c.likedByMe ? c.likes - 1 : c.likes + 1, likedByMe: !c.likedByMe } : c
    ));

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.backIcon, { color: colors.tealDark }]}>←</Text>
          <Text style={[styles.backText, { color: colors.tealDark }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Post</Text>
        <View style={{ width: 70 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          data={comments}
          keyExtractor={i => i.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <View style={[styles.postCard, SHADOW.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <View style={styles.anonRow}>
                  <View style={[styles.anonDot, { backgroundColor: colors.teal }]} />
                  <Text style={[styles.anonLabel, { color: colors.textSecondary }]}>Anonymous</Text>
                  <Text style={[styles.postTime, { color: colors.textMuted }]}>{post.timestamp}</Text>
                </View>
                <Text style={[styles.postContent, { color: colors.textPrimary }]}>{post.content}</Text>
                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, {
                      backgroundColor: postLiked ? colors.redDim : colors.bgSurface,
                      borderColor: postLiked ? colors.red + '55' : colors.border,
                    }]}
                    onPress={() => { setPostLikes(n => postLiked ? n - 1 : n + 1); setPostLiked(v => !v); }}
                  >
                    <Text style={styles.actionIcon}>{postLiked ? '❤️' : '🤍'}</Text>
                    <Text style={[styles.actionCount, { color: postLiked ? colors.red : colors.textSecondary }]}>{postLikes}</Text>
                  </TouchableOpacity>
                  <View style={[styles.actionBtn, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={[styles.actionCount, { color: colors.textSecondary }]}>{comments.length}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.commentsHeader}>
                <Text style={[styles.commentsTitle, { color: colors.textPrimary }]}>Comments</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.tealDim }]}>
                  <Text style={[styles.countText, { color: colors.teal }]}>{comments.length}</Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <View style={[styles.commentCard, SHADOW.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <View style={styles.commentTop}>
                <View style={styles.anonRow}>
                  <View style={[styles.anonDot, { backgroundColor: colors.teal }]} />
                  <Text style={[styles.anonLabel, { color: colors.textSecondary }]}>Anon</Text>
                </View>
                <Text style={[styles.postTime, { color: colors.textMuted }]}>{item.timestamp}</Text>
              </View>
              <Text style={[styles.commentText, { color: colors.textPrimary }]}>{item.text}</Text>
              <TouchableOpacity
                style={[styles.actionBtn, {
                  alignSelf: 'flex-start',
                  backgroundColor: item.likedByMe ? colors.redDim : colors.bgSurface,
                  borderColor: item.likedByMe ? colors.red + '55' : colors.border,
                }]}
                onPress={() => likeComment(item.id)}
              >
                <Text style={styles.actionIcon}>{item.likedByMe ? '❤️' : '🤍'}</Text>
                <Text style={[styles.actionCount, { color: item.likedByMe ? colors.red : colors.textSecondary }]}>{item.likes}</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <View style={[styles.inputBar, { backgroundColor: colors.bgCard, borderTopColor: colors.border, paddingBottom: insets.bottom + 10 }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgSurface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Write something supportive..."
            placeholderTextColor={colors.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            multiline maxLength={200}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: commentText.trim() ? colors.teal : colors.textMuted }]}
            onPress={addComment}
            disabled={!commentText.trim()}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, }, backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 70 }, backIcon: { fontSize: 20 }, backText: { fontSize: 15, ...FONTS.subheading }, headerTitle: { fontSize: 17, ...FONTS.heading }, listContent: { padding: 20, paddingBottom: 16 }, postCard: { borderRadius: RADIUS.lg, padding: 20, marginBottom: 24, borderWidth: 1 }, anonRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }, anonDot: { width: 8, height: 8, borderRadius: 4 }, anonLabel: { fontSize: 12, ...FONTS.caption, flex: 1 }, postTime: { fontSize: 11 }, postContent: { fontSize: 17, lineHeight: 27, marginBottom: 18 }, postActions: { flexDirection: 'row', gap: 10 }, actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1, }, actionIcon: { fontSize: 14 }, actionCount: { fontSize: 13, ...FONTS.caption }, commentsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }, commentsTitle: { fontSize: 17, ...FONTS.heading }, countBadge: { borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3 }, countText: { fontSize: 12, ...FONTS.subheading }, commentCard: { borderRadius: RADIUS.md, padding: 14, marginBottom: 10, borderWidth: 1 }, commentTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }, commentText: { fontSize: 14, lineHeight: 21, marginBottom: 10 }, inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, }, input: { flex: 1, borderRadius: RADIUS.lg, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100, }, sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }, sendIcon: { fontSize: 20, color: '#fff', ...FONTS.heading }, });