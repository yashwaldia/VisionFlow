/**
 * VisionFlow AI - Bottom Tab Navigator (100% ERROR-FREE)
 * Main app tabs
 * * @module navigation/TabNavigator
 */

import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Theme } from '../constants/theme';
import { Icon } from '../components';
// FIXED: Import correct type definition
import { MainTabParamList } from '../types/navigation.types';

// FIXED: Import Stack Navigators (Plural names to match file system)
import { RemindersStackNavigator } from './RemindersStackNavigator';
import { PatternsStackNavigator } from './PatternsStackNavigator';
import { ProjectsStackNavigator } from './ProjectsStackNavigator';
import { HomeStackNavigator } from './HomeStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';

// FIXED: Use MainTabParamList instead of TabParamList
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * TabNavigator Component
 * Bottom tabs for main app navigation
 */
export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary[500],
        tabBarInactiveTintColor: Theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: Theme.colors.background.primary,
          borderTopColor: Theme.colors.border.light,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: Theme.typography.fontSize.caption,
          fontWeight: Theme.typography.fontWeight.medium,
          marginTop: 4,
        },
      }}
    >
      {/* Home Tab */}
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator} // FIXED: Use Stack, not Screen
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size as any} color={color} />
          ),
        }}
      />

      {/* Reminders Tab */}
      <Tab.Screen
        name="RemindersTab"
        component={RemindersStackNavigator} // FIXED: Corrected component name
        options={{
          tabBarLabel: 'Reminders',
          tabBarIcon: ({ color, size }) => (
            <Icon name="notifications-outline" size={size as any} color={color} />
          ),
        }}
      />

      {/* Patterns Tab */}
      <Tab.Screen
        name="PatternsTab"
        component={PatternsStackNavigator} // FIXED: Corrected component name
        options={{
          tabBarLabel: 'Patterns',
          tabBarIcon: ({ color, size }) => (
            <Icon name="grid-outline" size={size as any} color={color} />
          ),
        }}
      />

      {/* Projects Tab */}
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsStackNavigator} // FIXED: Corrected component name
        options={{
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <Icon name="folder-outline" size={size as any} color={color} />
          ),
        }}
      />

      {/* Settings Tab */}
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator} // FIXED: Use Stack, not Screen
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings-outline" size={size as any} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}