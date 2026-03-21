import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import SplashScreen      from '../screens/SplashScreen';
import AuthScreen        from '../screens/AuthScreen';
import DashboardScreen   from '../screens/DashboardScreen';
import PostsScreen       from '../screens/PostsScreen';
import SavedScreen       from '../screens/SavedScreen';
import ProfileScreen     from '../screens/ProfileScreen';
import PostDetailsScreen from '../screens/PostDetailsScreen';

import { RootStackParamList, TabParamList } from '../types/navigation';
import { useTheme, FONTS } from '../context/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const { colors } = useTheme();
  const TAB_H = Platform.OS === 'ios' ? 82 : 64;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: TAB_H,
          backgroundColor: colors.bgCard,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: colors.isDark ? 0.3 : 0.06,
          shadowRadius: 10,
          elevation: 16,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Feather name="trending-up" size={22} color={focused ? colors.teal : colors.textMuted} />
              <Text style={[styles.tabLabel, { color: focused ? colors.teal : colors.textMuted }]}>Home</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Posts"
        component={PostsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Feather name="list" size={22} color={focused ? colors.teal : colors.textMuted} />
              <Text style={[styles.tabLabel, { color: focused ? colors.teal : colors.textMuted }]}>Posts</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Feather name="bookmark" size={22} color={focused ? colors.teal : colors.textMuted} />
              <Text style={[styles.tabLabel, { color: focused ? colors.teal : colors.textMuted }]}>Saved</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Feather name="user" size={22} color={focused ? colors.teal : colors.textMuted} />
              <Text style={[styles.tabLabel, { color: focused ? colors.teal : colors.textMuted }]}>Profile</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          // Smooth fade+slide transition for all stack screens
          animation: 'fade_from_bottom',
          animationDuration: 280,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="PostDetails"
          component={PostDetailsScreen}
          options={{
            animation: 'slide_from_right',
            animationDuration: 260,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabItem:  { alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabLabel: { fontSize: 11, ...FONTS.medium },
});