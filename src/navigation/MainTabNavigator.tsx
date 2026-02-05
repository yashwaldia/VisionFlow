/**
 * VisionFlow AI - Main Tab Navigator (v2.2 FINAL FIX)
 * Floating "Command Deck" navigation
 * 
 * @module navigation/MainTabNavigator
 * 
 * FIX: Used tabBarItemStyle for proper React Navigation centering
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
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
 * "The Command Deck"
 */
export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // Floating HUD Style
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem, // 🔧 KEY FIX: Control individual tab item layout
        tabBarShowLabel: false,
        tabBarActiveTintColor: Theme.colors.primary[500],
        tabBarInactiveTintColor: Theme.colors.text.tertiary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          // Icon Mapping
          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'terminal' : 'terminal-outline';
              break;
            case 'RemindersTab':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'PatternsTab':
              iconName = focused ? 'scan' : 'scan-outline';
              break;
            case 'ProjectsTab':
              iconName = focused ? 'layers' : 'layers-outline';
              break;
            case 'SettingsTab':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'square-outline';
          }

          // Active Glow Effect Wrapper
          return (
            <View style={[
              styles.iconContainer, 
              focused && styles.activeIconContainer
            ]}>
              <Ionicons 
                name={iconName} 
                size={24} 
                color={color} 
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tab.Screen name="RemindersTab" component={RemindersStackNavigator} />
      <Tab.Screen name="PatternsTab" component={PatternsStackNavigator} />
      <Tab.Screen name="ProjectsTab" component={ProjectsStackNavigator} />
      <Tab.Screen name="SettingsTab" component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    elevation: 0,
    backgroundColor: 'rgba(8, 8, 10, 0.9)', // Deep dark glass
    borderRadius: 32,
    height: 70,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    paddingBottom: 0,
    paddingTop: 0,
  },
  // 🔧 CRITICAL FIX: This controls each individual tab button
  tabBarItem: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 14,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)', // Subtle blue highlight
  },
  activeDot: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.primary[500],
    shadowColor: Theme.colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  }
});