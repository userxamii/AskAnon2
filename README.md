# AskAnon 👻

A mobile anonymous social confession app built with **React Native** and **Expo**. Users can post confessions anonymously under animal personas, browse by category, comment, like, save, and hide posts — all with a polished dark/light themed UI.

---

## 📁 Project Structure

```
askanon/
├── App.tsx                        # Root component, Supabase session check
├── babel.config.js                # Expo + Reanimated plugin config
├── tsconfig.json
│
├── lib/
│   └── supabase.ts                # Supabase client (auth + session persistence)
│
├── types/
│   └── navigation.ts              # RootStackParamList, TabParamList
│
├── context/
│   ├── ThemeContext.tsx            # Dark/light mode, colors, nickname, flashAnim
│   └── PostsContext.tsx           # Posts, comments, likes, hide, save — AsyncStorage
│
├── navigation/
│   └── AppNavigator.tsx           # Stack + Bottom Tab navigator, screen transitions
│
├── screens/
│   ├── SplashScreen.tsx           # 1.5s splash, auto-navigates to Auth
│   ├── AuthScreen.tsx             # Login / Sign Up with Supabase, anonymous entry
│   ├── DashboardScreen.tsx        # Home feed, category grid, blurred fixed header
│   ├── PostsScreen.tsx            # Filtered post list with search + tag chips
│   ├── PostDetailsScreen.tsx      # Single post view with full comment thread
│   ├── SavedScreen.tsx            # Bookmarked posts
│   └── ProfileScreen.tsx          # Stats, settings modals, logout
│
├── components/
│   ├── PostCard.tsx               # Post card with inline expandable comments
│   ├── StatCard.tsx               # Reusable stat display card
│   └── EmptyState.tsx             # Empty state with emoji + message
│
└── hooks/
    └── usePosts.ts                # Re-export shim from PostsContext
```

---

## 🧭 Navigation Architecture

```
Stack Navigator (RootStackParamList)
├── Splash
├── Auth
├── Main → Bottom Tab Navigator (TabParamList)
│   ├── Home        (DashboardScreen)
│   ├── Posts       (PostsScreen)  ← accepts { filterTag? }
│   ├── Saved       (SavedScreen)
│   └── Profile     (ProfileScreen)
└── PostDetails     ← accepts { postId }
```

**Typed navigation** is enforced through `RootStackParamList` and `TabParamList` in `types/navigation.ts`. Parameter passing is used in two places:
- `filterTag` — Dashboard category cards → PostsScreen
- `postId` — PostCard → PostDetailsScreen

**Transitions:**
- Splash → Auth → Main: `fade`
- PostDetails: `slide_from_right` with swipe-back gesture

---

## ✨ Features

### Authentication (Supabase)
- Sign Up with username + password (stored securely via Supabase Auth)
- Log In with credentials — specific error messages for wrong user vs wrong password
- Enter Anonymously — skips auth, enters as "Anonymous User"
- Session persisted via AsyncStorage — logged-in users skip Auth on reopen
- Logout clears Supabase session

### Posts & Feed
- Post confessions anonymously under randomly assigned animal personas
- 8 categories: General, Funny, Wholesome, Confession, Deep Thoughts, Advice, Vent, Work
- Pull-to-refresh on Dashboard
- Recent Activity shows the 8 most recent non-hidden posts

### Comments
- Inline expandable comments per post (tap comment count)
- Add comments — each gets a random anonymous author
- Like individual comments

### Save & Hide
- **Bookmark** any post — appears in the Saved tab
- **Hide** any post — disappears from all feeds instantly
- Hidden posts manageable from Profile → Hidden Posts modal (with Unhide button)
- Both states persisted in AsyncStorage across sessions

### Categories
- Horizontal scrollable cards with colored backgrounds and emoji watermarks
- Tapping navigates to PostsScreen filtered to that category
- Post counts shown per category in real time

### Profile
- Live stats: total posts, total likes, total comments
- **Privacy Settings** modal — toggles for online status, DMs, data sharing
- **Hidden Posts** modal — lists hidden posts with unhide option
- **App Settings** modal — notification and display toggles
- Dark/light mode toggle with flash animation

### UI / UX
- Dark and light theme with a single `ThemeContext` — defaults to light
- Blurred fixed header on Dashboard (`expo-blur`) with 95% opacity overlay
- FAB (`+` button) only appears after scrolling past the hero card
- Smooth screen transitions throughout
- Safe area handling on all screens
- Keyboard-avoiding views on all input screens

---

## 🪝 React Hooks Usage

### `useState`
Used in every screen and context to manage local and shared UI state:
- `PostsContext` — `posts`, `loading`, `hiddenIds`, `savedIds`
- `DashboardScreen` — `modalVisible`, `newPostText`, `fabVisible`, `refreshing`
- `AuthScreen` — `mode` (login/signup), `username`, `password`, `loading`
- `PostCard` — `expanded`, `commentText`
- `ProfileScreen` — `showPrivacy`, `showHidden`, `showAppSettings`

### `useEffect`
Used for side effects and lifecycle behavior:
- `PostsContext` — loads all AsyncStorage data on mount (posts, hiddenIds, savedIds)
- `PostsScreen` — syncs `activeTag` when `filterTag` param changes via navigation
- `SplashScreen` — auto-navigation timer with cleanup on unmount
- `App.tsx` — checks Supabase session on startup, subscribes to auth state changes

### Other Hooks
- `useRef` — `Animated.Value` refs in AuthScreen and DashboardScreen
- `useMemo` — filtered + searched post list in PostsScreen
- `useContext` — consumed via `useTheme()` and `usePosts()` custom hooks
- `useSafeAreaInsets` — bottom/top padding on all screens

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `expo` ~55.0.6 | Core Expo SDK |
| `react-native` 0.83.2 | React Native framework |
| `@react-navigation/native` | Navigation container |
| `@react-navigation/native-stack` | Stack navigator |
| `@react-navigation/bottom-tabs` | Tab navigator |
| `@react-native-async-storage/async-storage` | Local data persistence |
| `@expo/vector-icons` | Feather icon set |
| `expo-blur` | Blurred header effect |
| `react-native-safe-area-context` | Safe area insets |
| `react-native-screens` | Native screen optimization |
| `@supabase/supabase-js` | Authentication backend |
| `typescript` ~5.9.2 | Type safety |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Expo CLI
- A Supabase project ([supabase.com](https://supabase.com))

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/askanon.git
cd askanon

# Install dependencies
npm install

# Install Expo-managed packages
npx expo install expo-blur react-native-safe-area-context react-native-screens @supabase/supabase-js @react-native-async-storage/async-storage
```

### Configure Supabase

1. Go to your Supabase project → **Settings → API**
2. Copy your **Project URL** and **anon public key**
3. Open `lib/supabase.ts` and replace the placeholders:

```ts
const SUPABASE_URL      = 'https://your-project-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

4. In your Supabase dashboard → **Authentication → Settings**:
   - Turn **OFF** "Enable email confirmations"

### Run the app

```bash
npx expo start --clear
```

Scan the QR code with **Expo Go** on your phone, or press `i` for iOS simulator / `a` for Android emulator.

### babel.config.js

Make sure this file exists in your project root with **UTF-8 encoding** (not UTF-8 BOM):

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

---

## 👤 Author

Built as a midterm project for a React Native mobile development course.
