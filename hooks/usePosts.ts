import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

const STORAGE_KEY = 'askanon_posts_v2';

const DEFAULT_POSTS: Post[] = [
  { id: '1', author: 'Shadow Fox',   authorEmoji: '🦊', content: "I secretly enjoy pineapple on pizza and I'm not ashamed anymore. 🍕",       likes: 24,  likedByMe: false, commentCount: 8,  timestamp: '1h ago', tag: 'Confession' },
  { id: '2', author: 'Ghost Owl',    authorEmoji: '🦉', content: "My boss thinks I'm a genius but honestly I just Google everything really fast.", likes: 89,  likedByMe: false, commentCount: 23, timestamp: '2h ago', tag: 'Funny' },
  { id: '3', author: 'Silent Wolf',  authorEmoji: '🐺', content: "I've been pretending to understand cryptocurrency for 3 years. Still no idea what a blockchain actually does.", likes: 157, likedByMe: false, commentCount: 45, timestamp: '3h ago', tag: 'Confession' },
  { id: '4', author: 'Mystic Bear',  authorEmoji: '🐻', content: "Sometimes I reply to emails days later and pretend I never got them the first time.", likes: 61, likedByMe: false, commentCount: 17, timestamp: '4h ago', tag: 'Funny' },
  { id: '5', author: 'Lunar Cat',    authorEmoji: '🐱', content: "I still sleep with the lights on. I'm 22. I'm not embarrassed.", likes: 43, likedByMe: false, commentCount: 12, timestamp: '5h ago', tag: 'Confession' },
  { id: '6', author: 'Neon Rabbit',  authorEmoji: '🐰', content: "I once cried watching a dog food commercial. The dog looked so happy.", likes: 210, likedByMe: false, commentCount: 38, timestamp: '6h ago', tag: 'Wholesome' },
];

const ANIMAL_AUTHORS = [
  { author: 'Storm Eagle',   authorEmoji: '🦅' },
  { author: 'Vapor Panda',   authorEmoji: '🐼' },
  { author: 'Dusk Tiger',    authorEmoji: '🐯' },
  { author: 'Glitch Fox',    authorEmoji: '🦊' },
  { author: 'Void Penguin',  authorEmoji: '🐧' },
  { author: 'Haze Raccoon',  authorEmoji: '🦝' },
  { author: 'Nova Deer',     authorEmoji: '🦌' },
  { author: 'Cipher Wolf',   authorEmoji: '🐺' },
];

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        setPosts(stored ? JSON.parse(stored) : DEFAULT_POSTS);
        if (!stored) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
      } catch {
        setPosts(DEFAULT_POSTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async (updated: Post[]) => {
    setPosts(updated);
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  };

  const addPost = (content: string, tag: string) => {
    const pick = ANIMAL_AUTHORS[Math.floor(Math.random() * ANIMAL_AUTHORS.length)];
    save([{
      id: Date.now().toString(),
      author: pick.author,
      authorEmoji: pick.authorEmoji,
      content, tag,
      likes: 0, likedByMe: false,
      commentCount: 0,
      timestamp: 'just now',
    }, ...posts]);
  };

  const toggleLike = (id: string) =>
    save(posts.map(p =>
      p.id === id
        ? { ...p, likes: p.likedByMe ? p.likes - 1 : p.likes + 1, likedByMe: !p.likedByMe }
        : p
    ));

  return { posts, loading, addPost, toggleLike };
}