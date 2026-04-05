import React, {
  createContext, useContext, useState,
  useEffect, useCallback, useMemo, ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  likes: number;
  likedByMe: boolean;
  authorEmoji: string;
}

export interface Post {
  id: string;
  userId: string | null;
  author: string;
  authorEmoji: string;
  content: string;
  likes: number;
  likedByMe: boolean;
  commentCount: number;
  timestamp: string;
  tag: string;
  comments: Comment[];
}

// ─── Derived counts type — always in sync with posts state ───────────────────

export interface UserStats {
  postCount:    number;   // number of posts this user made
  totalLikes:   number;   // sum of likes on their posts
  totalComments: number;  // sum of comments on their posts
}

// ─── Random-author fallback pools ─────────────────────────────────────────────

const ANIMAL_AUTHORS = [
  { author: 'Storm Eagle',  authorEmoji: '🦅' },
  { author: 'Vapor Panda',  authorEmoji: '🐼' },
  { author: 'Dusk Tiger',   authorEmoji: '🐯' },
  { author: 'Glitch Fox',   authorEmoji: '🦊' },
  { author: 'Void Penguin', authorEmoji: '🐧' },
  { author: 'Haze Raccoon', authorEmoji: '🦝' },
  { author: 'Nova Deer',    authorEmoji: '🦌' },
  { author: 'Cipher Wolf',  authorEmoji: '🐺' },
];

const COMMENT_AUTHORS = [
  ...ANIMAL_AUTHORS,
  { author: 'Lunar Cat',   authorEmoji: '🐱' },
  { author: 'Neon Rabbit', authorEmoji: '🐰' },
  { author: 'Mystic Bear', authorEmoji: '🐻' },
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rowToPost(
  row: any,
  likedPostIds: Set<string>,
  commentRows: any[],
  likedCommentIds: Set<string>,
): Post {
  const comments: Comment[] = commentRows
    .filter(c => c.post_id === row.id)
    .map(c => ({
      id:          c.id,
      author:      c.author,
      authorEmoji: c.author_emoji,
      text:        c.text,
      timestamp:   friendlyDate(c.created_at),
      likes:       c.likes ?? 0,
      likedByMe:   likedCommentIds.has(c.id),
    }));

  return {
    id:           row.id,
    userId:       row.user_id ?? null,
    author:       row.author,
    authorEmoji:  row.author_emoji,
    content:      row.content,
    tag:          row.tag,
    likes:        row.likes ?? 0,
    likedByMe:    likedPostIds.has(row.id),
    // always derive commentCount from the actual comments array
    // so it stays in sync with optimistic inserts
    commentCount: comments.length,
    timestamp:    friendlyDate(row.created_at),
    comments,
  };
}

function friendlyDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Context type ─────────────────────────────────────────────────────────────

type PostsContextType = {
  posts:        Post[];
  myPosts:      Post[];
  myStats:      UserStats;      // ← live counts, always in sync
  myUserId:     string | null;
  loading:      boolean;
  hiddenIds:    string[];
  savedIds:     string[];
  addPost:           (content: string, tag: string) => Promise<void>;
  toggleLike:        (postId: string) => Promise<void>;
  addComment:        (postId: string, text: string) => Promise<void>;
  toggleCommentLike: (postId: string, commentId: string) => Promise<void>;
  toggleHide:        (postId: string) => void;
  toggleSave:        (postId: string) => Promise<void>;
  refreshPosts:      () => Promise<void>;
};

const PostsContext = createContext<PostsContextType>({
  posts: [], myPosts: [], myStats: { postCount: 0, totalLikes: 0, totalComments: 0 },
  myUserId: null, loading: true, hiddenIds: [], savedIds: [],
  addPost: async () => {}, toggleLike: async () => {},
  addComment: async () => {}, toggleCommentLike: async () => {},
  toggleHide: () => {}, toggleSave: async () => {},
  refreshPosts: async () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts,     setPosts]     = useState<Post[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [savedIds,  setSavedIds]  = useState<string[]>([]);
  const [myUserId,  setMyUserId]  = useState<string | null>(null);

  // ── Derived values — recompute instantly on every posts state change ──────────

  const myPosts = useMemo(
    () => posts.filter(p => p.userId === myUserId),
    [posts, myUserId],
  );

  // myStats is always computed from myPosts, so every optimistic update
  // (new post, new comment, like toggle) automatically updates the counts.
  const myStats = useMemo<UserStats>(() => ({
    postCount:     myPosts.length,
    totalLikes:    myPosts.reduce((sum, p) => sum + p.likes, 0),
    totalComments: myPosts.reduce((sum, p) => sum + p.commentCount, 0),
  }), [myPosts]);

  // ── Core fetch ───────────────────────────────────────────────────────────────

  const refreshPosts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id ?? null;
      setMyUserId(userId);

      const [
        { data: postRows     },
        { data: commentRows  },
        { data: postLikes    },
        { data: savedRows    },
        { data: commentLikes },
      ] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('comments').select('*').order('created_at', { ascending: true }),
        userId
          ? supabase.from('post_likes').select('post_id').eq('user_id', userId)
          : Promise.resolve({ data: [] }),
        userId
          ? supabase.from('saved_posts').select('post_id').eq('user_id', userId)
          : Promise.resolve({ data: [] }),
        userId
          ? supabase.from('comment_likes').select('comment_id').eq('user_id', userId)
          : Promise.resolve({ data: [] }),
      ]);

      const likedPostIds    = new Set((postLikes    ?? []).map((r: any) => r.post_id));
      const likedCommentIds = new Set((commentLikes ?? []).map((r: any) => r.comment_id));
      const savedPostIds    = new Set((savedRows    ?? []).map((r: any) => r.post_id));

      setSavedIds(Array.from(savedPostIds) as string[]);
      setPosts(
        (postRows ?? []).map((row: any) =>
          rowToPost(row, likedPostIds, commentRows ?? [], likedCommentIds)
        )
      );
    } catch (err) {
      console.error('refreshPosts error:', err);
    }
  }, []);

  // ── Initial load ─────────────────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true);
    refreshPosts().finally(() => setLoading(false));
  }, [refreshPosts]);

  // ── Realtime — handles changes from OTHER users/devices ───────────────────────

  useEffect(() => {
    const channel = supabase
      .channel('public-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' },    () => refreshPosts())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' },    () => refreshPosts())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => refreshPosts())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comments' }, () => refreshPosts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refreshPosts]);

  // ── Re-fetch on auth change ───────────────────────────────────────────────────

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshPosts();
    });
    return () => subscription.unsubscribe();
  }, [refreshPosts]);

  // ── Actions ───────────────────────────────────────────────────────────────────

  const addPost = async (content: string, tag: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname, avatar_emoji')
      .eq('id', user.id)
      .single();

    const fallback    = pick(ANIMAL_AUTHORS);
    const author      = profile?.nickname     ?? fallback.author;
    const authorEmoji = profile?.avatar_emoji ?? fallback.authorEmoji;

    // 1 — Optimistic insert → postCount goes up immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticPost: Post = {
      id: tempId, userId: user.id,
      author, authorEmoji, content, tag,
      likes: 0, likedByMe: false, commentCount: 0,
      timestamp: 'just now', comments: [],
    };
    setPosts(prev => [optimisticPost, ...prev]);

    // 2 — Write to DB
    const { data: inserted, error } = await supabase
      .from('posts')
      .insert({ user_id: user.id, author, author_emoji: authorEmoji, content, tag, likes: 0, comment_count: 0 })
      .select()
      .single();

    if (error) {
      setPosts(prev => prev.filter(p => p.id !== tempId)); // roll back
      console.error('addPost error:', error);
      return;
    }

    // 3 — Swap temp with real DB row
    setPosts(prev =>
      prev.map(p =>
        p.id === tempId
          ? { ...optimisticPost, id: inserted.id, timestamp: friendlyDate(inserted.created_at) }
          : p
      )
    );
  };

  const toggleLike = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const delta = post.likedByMe ? -1 : 1;

    // Optimistic → totalLikes in myStats updates immediately if it's the user's own post
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes: p.likes + delta, likedByMe: !p.likedByMe }
        : p
    ));

    if (post.likedByMe) {
      await supabase.from('post_likes').delete().eq('user_id', user.id).eq('post_id', postId);
      await supabase.from('posts').update({ likes: post.likes - 1 }).eq('id', postId);
    } else {
      await supabase.from('post_likes').insert({ user_id: user.id, post_id: postId });
      await supabase.from('posts').update({ likes: post.likes + 1 }).eq('id', postId);
    }
  };

  const addComment = async (postId: string, text: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname, avatar_emoji')
      .eq('id', user.id)
      .single();

    const fallback    = pick(COMMENT_AUTHORS);
    const author      = profile?.nickname     ?? fallback.author;
    const authorEmoji = profile?.avatar_emoji ?? fallback.authorEmoji;

    // 1 — Optimistic insert → commentCount on the post goes up immediately,
    //     which also updates totalComments in myStats if it's the user's post
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: Comment = {
      id: tempId, author, authorEmoji, text,
      timestamp: 'just now', likes: 0, likedByMe: false,
    };

    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, comments: [...p.comments, optimisticComment], commentCount: p.commentCount + 1 }
        : p
    ));

    // 2 — Write to DB
    const { data: inserted, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: user.id, author, author_emoji: authorEmoji, text, likes: 0 })
      .select()
      .single();

    if (error) {
      // Roll back
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, comments: p.comments.filter(c => c.id !== tempId), commentCount: p.commentCount - 1 }
          : p
      ));
      console.error('addComment error:', error);
      return;
    }

    // 3 — Swap temp comment with real DB row
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            comments: p.comments.map(c =>
              c.id === tempId
                ? { ...optimisticComment, id: inserted.id, timestamp: friendlyDate(inserted.created_at) }
                : c
            ),
          }
        : p
    ));

    // 4 — Sync comment_count column in DB
    const post = posts.find(p => p.id === postId);
    if (post) {
      await supabase.from('posts')
        .update({ comment_count: post.commentCount + 1 })
        .eq('id', postId);
    }
  };

  const toggleCommentLike = async (postId: string, commentId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const post    = posts.find(p => p.id === postId);
    const comment = post?.comments.find(c => c.id === commentId);
    if (!comment) return;

    const delta = comment.likedByMe ? -1 : 1;

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            comments: p.comments.map(c =>
              c.id === commentId
                ? { ...c, likes: c.likes + delta, likedByMe: !c.likedByMe }
                : c
            ),
          }
        : p
    ));

    if (comment.likedByMe) {
      await supabase.from('comment_likes').delete().eq('user_id', user.id).eq('comment_id', commentId);
      await supabase.from('comments').update({ likes: comment.likes - 1 }).eq('id', commentId);
    } else {
      await supabase.from('comment_likes').insert({ user_id: user.id, comment_id: commentId });
      await supabase.from('comments').update({ likes: comment.likes + 1 }).eq('id', commentId);
    }
  };

  const toggleHide = (postId: string) => {
    setHiddenIds(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const toggleSave = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isSaved = savedIds.includes(postId);

    setSavedIds(prev =>
      isSaved ? prev.filter(id => id !== postId) : [...prev, postId]
    );

    if (isSaved) {
      await supabase.from('saved_posts').delete().eq('user_id', user.id).eq('post_id', postId);
    } else {
      await supabase.from('saved_posts').insert({ user_id: user.id, post_id: postId });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <PostsContext.Provider value={{
      posts, myPosts, myStats, myUserId,
      loading, hiddenIds, savedIds,
      addPost, toggleLike, addComment, toggleCommentLike,
      toggleHide, toggleSave, refreshPosts,
    }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  return useContext(PostsContext);
}