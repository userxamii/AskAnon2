import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SplashScreen      from '../screens/SplashScreen';
import AuthScreen        from '../screens/AuthScreen';
import DashboardScreen   from '../screens/DashboardScreen';
import PostsScreen       from '../screens/PostsScreen';
import ProfileScreen     from '../screens/ProfileScreen';
import PostDetailsScreen from '../screens/PostDetailsScreen';

import { RootStackParamList, TabParamList } from '../types/navigation';
import { useTheme, FONTS } from '../context/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

function TabIcon({ label, icon, focused, colors }: {
  label: string; icon: string; focused: boolean; colors: any;
}) {
  return (
    <View style={styles.tabIconWrap}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.4 }]}>{icon}</Text>
      <Text style={[styles.tabLabel, { color: focused ? colors.teal : colors.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

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
            <TabIcon label="Home" icon="📈" focused={focused} colors={colors} />
          ),
        }}
      />
      <Tab.Screen
        name="Posts"
        component={PostsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Posts" icon="☰" focused={focused} colors={colors} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Profile" icon="👤" focused={focused} colors={colors} />
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
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash"      component={SplashScreen} />
        <Stack.Screen name="Auth"        component={AuthScreen} />
        <Stack.Screen name="Main"        component={MainTabs} />
        <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabEmoji:   { fontSize: 20 },
  tabLabel:   { fontSize: 11, ...FONTS.medium },
});