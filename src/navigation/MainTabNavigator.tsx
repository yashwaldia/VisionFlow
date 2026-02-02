/**
 * VisionFlow AI - Main Tab Navigator
 * Bottom tab navigation for primary app sections
 * 
 * @module navigation/MainTabNavigator
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import { MainTabParamList } from '../types/navigation.types';
import { Theme } from '../constants/theme';

// Stack Navigators
import { HomeStackNavigator } from './HomeStackNavigator';
import { RemindersStackNavigator } from './RemindersStackNavigator';
import { PatternsStackNavigator } from './PatternsStackNavigator';
import { ProjectsStackNavigator } from './ProjectsStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * MainTabNavigator Component
 * 
 * Tab Structure:
 * 1. Home - Dashboard with overview
 * 2. Reminders - List of all reminders
 * 3. Patterns - Pattern library
 * 4. Projects - Project management
 * 5. Settings - App settings
 */
export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Theme.colors.primary[500],
        tabBarInactiveTintColor: Theme.colors.text.tertiary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'RemindersTab':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'PatternsTab':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'ProjectsTab':
              iconName = focused ? 'folder' : 'folder-outline';
              break;
            case 'SettingsTab':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />

      <Tab.Screen
        name="RemindersTab"
        component={RemindersStackNavigator}
        options={{
          tabBarLabel: 'Reminders',
          tabBarAccessibilityLabel: 'Reminders tab',
        }}
      />

      <Tab.Screen
        name="PatternsTab"
        component={PatternsStackNavigator}
        options={{
          tabBarLabel: 'Patterns',
          tabBarAccessibilityLabel: 'Patterns tab',
        }}
      />

      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsStackNavigator}
        options={{
          tabBarLabel: 'Projects',
          tabBarAccessibilityLabel: 'Projects tab',
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Settings',
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Theme.colors.background.secondary,
    borderTopColor: Theme.colors.border.light,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
    ...Theme.shadows.lg,
  },
  tabBarLabel: {
    fontSize: Theme.typography.fontSize.caption,
    fontWeight: Theme.typography.fontWeight.medium,
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
});
