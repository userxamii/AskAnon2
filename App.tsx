import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './context/ThemeContext';
import { PostsProvider } from './context/PostsContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PostsProvider>
          <AppNavigator />
        </PostsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}