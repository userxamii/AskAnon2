import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// ─── Seed data ────────────────────────────────────────────────────────────────

const DEFAULT_POSTS: Post[] = [
  {
    id: '1', author: 'Shadow Fox', authorEmoji: '🦊',
    content: "I secretly enjoy pineapple on pizza and I'm not ashamed anymore. 🍕",
    likes: 24, likedByMe: false, timestamp: '1h ago', tag: 'Confession',
    comments: [
      { id: 'c1-1',
      author: 'Vapor Panda', text: 'Pineapple pizza is underrated, no shame!', timestamp: '45m ago', likes: 3, likedByMe: false, authorEmoji: '🐼' },
      { id: 'c1-2',
      author: 'Haze Raccoon', text: 'Finally someone said it 😂', timestamp: '30m ago', likes: 1, likedByMe: false, authorEmoji: '🦝' },
      { id: 'c1-3',
      author: 'Void Penguin', text: 'Welcome to the pineapple club 🍍', timestamp: '20m ago', likes: 2, likedByMe: false, authorEmoji: '🐧' },
    ],
    commentCount: 3,
  },
  {
    id: '2', author: 'Ghost Owl', authorEmoji: '🦉',
    content: "My boss thinks I'm a genius but honestly I just Google everything really fast.",
    likes: 89, likedByMe: false, timestamp: '2h ago', tag: 'Funny',
    comments: [
      { id: 'c2-1',
      author: 'Nova Deer', text: 'That IS the genius move though 😭', timestamp: '1h ago', likes: 12, likedByMe: false, authorEmoji: '🦌' },
      { id: 'c2-2',
      author: 'Dusk Tiger', text: 'Speed googling is a legitimate skill, respect.', timestamp: '55m ago', likes: 8, likedByMe: false, authorEmoji: '🐯' },
      { id: 'c2-3',
      author: 'Cipher Wolf', text: 'I thought I was the only one doing this lmao', timestamp: '40m ago', likes: 5, likedByMe: false, authorEmoji: '🐺' },
      { id: 'c2-4',
      author: 'Storm Eagle', text: 'The fastest Googler in the west', timestamp: '20m ago', likes: 3, likedByMe: false, authorEmoji: '🦅' },
    ],
    commentCount: 4,
  },
  {
    id: '3', author: 'Silent Wolf', authorEmoji: '🐺',
    content: "I've been pretending to understand cryptocurrency for 3 years. Still no idea what a blockchain actually does.",
    likes: 157, likedByMe: false, timestamp: '3h ago', tag: 'Confession',
    comments: [
      { id: 'c3-1',
      author: 'Lunar Cat', text: "I nod along in every crypto conversation. Solidarity.", timestamp: '2h ago', likes: 22, likedByMe: false, authorEmoji: '🐱' },
      { id: 'c3-2',
      author: 'Neon Rabbit', text: "Nobody actually knows. It's all a shared illusion.", timestamp: '1h ago', likes: 18, likedByMe: false, authorEmoji: '🐰' },
      { id: 'c3-3',
      author: 'Mystic Bear', text: 'The blockchain is just a fancy spreadsheet, apparently 😅', timestamp: '50m ago', likes: 9, likedByMe: false, authorEmoji: '🐻' },
      { id: 'c3-4',
      author: 'Glitch Fox', text: "Three years is rookie numbers. I've been faking it for five.", timestamp: '30m ago', likes: 14, likedByMe: false, authorEmoji: '🦊' },
      { id: 'c3-5',
      author: 'Vapor Panda', text: 'This comment section is therapy', timestamp: '10m ago', likes: 6, likedByMe: false, authorEmoji: '🐼' },
    ],
    commentCount: 5,
  },
  {
    id: '4', author: 'Mystic Bear', authorEmoji: '🐻',
    content: "Sometimes I reply to emails days later and pretend I never got them the first time.",
    likes: 61, likedByMe: false, timestamp: '4h ago', tag: 'Funny',
    comments: [
      { id: 'c4-1',
      author: 'Haze Raccoon', text: 'This is a valid life strategy actually', timestamp: '3h ago', likes: 7, likedByMe: false, authorEmoji: '🦝' },
      { id: 'c4-2',
      author: 'Void Penguin', text: 'My read receipts are off for exactly this reason', timestamp: '2h ago', likes: 4, likedByMe: false, authorEmoji: '🐧' },
      { id: 'c4-3',
      author: 'Nova Deer', text: '"Sorry just saw this!" — me, opening the email for the 4th time', timestamp: '1h ago', likes: 11, likedByMe: false, authorEmoji: '🦌' },
    ],
    commentCount: 3,
  },
  {
    id: '5', author: 'Lunar Cat', authorEmoji: '🐱',
    content: "I still sleep with the lights on. I'm 22. I'm not embarrassed.",
    likes: 43, likedByMe: false, timestamp: '5h ago', tag: 'Confession',
    comments: [
      { id: 'c5-1',
      author: 'Glitch Fox', text: "You shouldn't be! Comfort > everything.", timestamp: '4h ago', likes: 5, likedByMe: false, authorEmoji: '🦊' },
      { id: 'c5-2',
      author: 'Cipher Wolf', text: 'I do this too. The dark is scary, period.', timestamp: '3h ago', likes: 3, likedByMe: false, authorEmoji: '🐺' },
    ],
    commentCount: 2,
  },
  {
    id: '7', author: 'Storm Eagle', authorEmoji: '🦅',
    content: "Spent 3 hours today in a meeting that could have been an email. I smiled the whole time.",
    likes: 34, likedByMe: false, timestamp: '7h ago', tag: 'Work',
    comments: [
      { id: 'c7-1', author: 'Vapor Panda', text: 'Every. Single. Day.', timestamp: '6h ago', likes: 8, likedByMe: false, authorEmoji: '🐼' },
      { id: 'c7-2', author: 'Cipher Wolf', text: 'The smile is a survival mechanism', timestamp: '5h ago', likes: 5, likedByMe: false, authorEmoji: '🐺' },
    ],
    commentCount: 2,
  },
  {
    id: '8', author: 'Vapor Panda', authorEmoji: '🐼',
    content: "Does anyone else wonder if we're all just NPCs in someone else's game? Like... what if Tuesday doesn't exist when I'm not looking at it?",
    likes: 76, likedByMe: false, timestamp: '8h ago', tag: 'Deep Thoughts',
    comments: [
      { id: 'c8-1', author: 'Glitch Fox', text: 'I need to lie down after reading this', timestamp: '7h ago', likes: 11, likedByMe: false, authorEmoji: '🦊' },
      { id: 'c8-2', author: 'Nova Deer', text: 'Tuesday definitely gives off suspicious vibes', timestamp: '6h ago', likes: 9, likedByMe: false, authorEmoji: '🦌' },
      { id: 'c8-3', author: 'Lunar Cat', text: '3am thoughts hitting different', timestamp: '5h ago', likes: 7, likedByMe: false, authorEmoji: '🐱' },
    ],
    commentCount: 3,
  },
  {
    id: '6', author: 'Neon Rabbit', authorEmoji: '🐰',
    content: "I once cried watching a dog food commercial. The dog looked so happy.",
    likes: 210, likedByMe: false, timestamp: '6h ago', tag: 'Wholesome',
    comments: [
      { id: 'c6-1',
      author: 'Lunar Cat', text: 'That commercial gets me every time 😭', timestamp: '5h ago', likes: 24, likedByMe: false, authorEmoji: '🐱' },
      { id: 'c6-2',
      author: 'Mystic Bear', text: 'Happy dogs deserve happy tears', timestamp: '4h ago', likes: 18, likedByMe: false, authorEmoji: '🐻' },
      { id: 'c6-3',
      author: 'Storm Eagle', text: 'You have a good heart, never change', timestamp: '3h ago', likes: 12, likedByMe: false, authorEmoji: '🦅' },
      { id: 'c6-4',
      author: 'Vapor Panda', text: "I'm crying just reading this", timestamp: '2h ago', likes: 9, likedByMe: false, authorEmoji: '🐼' },
      { id: 'c6-5',
      author: 'Haze Raccoon', text: 'Same energy as crying at a Pixar movie', timestamp: '1h ago', likes: 7, likedByMe: false, authorEmoji: '🦝' },
      { id: 'c6-6',
      author: 'Dusk Tiger', text: 'Dogs are pure love and this is valid 🐶', timestamp: '30m ago', likes: 5, likedByMe: false, authorEmoji: '🐯' },
    ],
    commentCount: 6,
  },
];

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

const ANIMAL_EMOJIS = ['🐻','🦊','🐺','🦁','🐯','🐼','🐨','🦝','🐧','🦅','🦌','🐱'];
const COMMENT_AUTHORS = [
  { author: 'Storm Eagle',  authorEmoji: '🦅' },
  { author: 'Vapor Panda',  authorEmoji: '🐼' },
  { author: 'Dusk Tiger',   authorEmoji: '🐯' },
  { author: 'Glitch Fox',   authorEmoji: '🦊' },
  { author: 'Void Penguin', authorEmoji: '🐧' },
  { author: 'Haze Raccoon', authorEmoji: '🦝' },
  { author: 'Nova Deer',    authorEmoji: '🦌' },
  { author: 'Cipher Wolf',  authorEmoji: '🐺' },
  { author: 'Lunar Cat',    authorEmoji: '🐱' },
  { author: 'Neon Rabbit',  authorEmoji: '🐰' },
  { author: 'Mystic Bear',  authorEmoji: '🐻' },
];

const STORAGE_KEY = 'askanon_posts_v5';

// ─── Context ──────────────────────────────────────────────────────────────────

type PostsContextType = {
  posts: Post[];
  loading: boolean;
  hiddenIds: string[];
  savedIds: string[];
  addPost: (content: string, tag: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  toggleCommentLike: (postId: string, commentId: string) => void;
  toggleHide: (postId: string) => void;
  toggleSave: (postId: string) => void;
};

const PostsContext = createContext<PostsContextType>({
  posts: [], loading: true,
  hiddenIds: [], savedIds: [],
  addPost: () => {}, toggleLike: () => {},
  addComment: () => {}, toggleCommentLike: () => {},
  toggleHide: () => {}, toggleSave: () => {},
});

const HIDDEN_KEY = 'askanon_hidden_v1';
const SAVED_KEY  = 'askanon_saved_v1';

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [savedIds, setSavedIds]   = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [stored, hiddenRaw, savedRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(HIDDEN_KEY),
          AsyncStorage.getItem(SAVED_KEY),
        ]);
        if (hiddenRaw) setHiddenIds(JSON.parse(hiddenRaw));
        if (savedRaw)  setSavedIds(JSON.parse(savedRaw));
        if (stored) {
          const parsed: Post[] = JSON.parse(stored);
          // migration: ensure every post has comments array
          setPosts(parsed.map(p => ({
            ...p,
            comments: p.comments ?? [],
            commentCount: p.comments ? p.comments.length : p.commentCount,
          })));
        } else {
          setPosts(DEFAULT_POSTS);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
        }
      } catch {
        setPosts(DEFAULT_POSTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = (updated: Post[]) => {
    setPosts(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const addPost = (content: string, tag: string) => {
    const pick = ANIMAL_AUTHORS[Math.floor(Math.random() * ANIMAL_AUTHORS.length)];
    const newPost: Post = {
      id: Date.now().toString(),
      author: pick.author,
      authorEmoji: pick.authorEmoji,
      content, tag,
      likes: 0, likedByMe: false,
      commentCount: 0,
      timestamp: 'just now',
      comments: [],
    };
    save([newPost, ...posts]);
  };

  const toggleLike = (postId: string) =>
    save(posts.map(p =>
      p.id === postId
        ? { ...p, likes: p.likedByMe ? p.likes - 1 : p.likes + 1, likedByMe: !p.likedByMe }
        : p
    ));

  const addComment = (postId: string, text: string) => {
    const pick = COMMENT_AUTHORS[Math.floor(Math.random() * COMMENT_AUTHORS.length)];
    const newComment: Comment = {
      id: `${postId}-${Date.now()}`,
      author: pick.author,
      text,
      timestamp: 'just now',
      likes: 0,
      likedByMe: false,
      authorEmoji: pick.authorEmoji,
    };
    save(posts.map(p =>
      p.id === postId
        ? { ...p, comments: [...p.comments, newComment], commentCount: p.comments.length + 1 }
        : p
    ));
  };

  const toggleCommentLike = (postId: string, commentId: string) =>
    save(posts.map(p =>
      p.id === postId
        ? {
            ...p,
            comments: p.comments.map(c =>
              c.id === commentId
                ? { ...c, likes: c.likedByMe ? c.likes - 1 : c.likes + 1, likedByMe: !c.likedByMe }
                : c
            ),
          }
        : p
    ));

  const toggleHide = (postId: string) => {
    setHiddenIds(prev => {
      const next = prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId];
      AsyncStorage.setItem(HIDDEN_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const toggleSave = (postId: string) => {
    setSavedIds(prev => {
      const next = prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId];
      AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  return (
    <PostsContext.Provider value={{ posts, loading, hiddenIds, savedIds, addPost, toggleLike, addComment, toggleCommentLike, toggleHide, toggleSave }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  return useContext(PostsContext);
}