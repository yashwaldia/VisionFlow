/**
 * VisionFlow AI - Main Tab Navigator (v3.1 - Tab Bar Visibility Control)
 * Floating "Command Deck" navigation with conditional visibility
 * 
 * @module navigation/MainTabNavigator
 * 
 * CHANGELOG v3.1:
 * - ✅ ADDED: Hide tab bar on detail screens (PatternDetail, ReminderDetail, etc.)
 * - ✅ FIXED: TypeScript literal type error for display property
 * - ✅ FIXED: Tab bar collision with system navigation buttons (Android)
 * - ✅ FIXED: Universal safe area handling for all devices
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
 * "The Command Deck" - Now with conditional visibility and universal safe area protection
 */
export function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  
  // Calculate dynamic bottom position
  const tabBarBottom = Math.max(insets.bottom + 10, 30);

  // 🔧 FIXED: Helper function with proper return type
  const getTabBarStyle = (route: any): ViewStyle | { display: 'none' } => {
    const routeName = getFocusedRouteNameFromRoute(route);
    
    // Hide tab bar on these screens
    const hideTabBarScreens = [
      'PatternDetail',
      'ReminderDetail',
      'ProjectDetail',
      'EditReminder',
      'CreateReminder',
      'EditProject',
      'CreateProject',
      'ProjectAnalytics',
    ];
    
    if (routeName && hideTabBarScreens.includes(routeName)) {
      return { display: 'none' as const }; // 🔧 FIXED: Use 'as const' for literal type
    }
    
    // Show tab bar with floating style
    return {
      position: 'absolute',
      bottom: tabBarBottom,
      left: 20,
      right: 20,
      elevation: 0,
      backgroundColor: 'rgba(8, 8, 10, 0.9)',
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
    } as ViewStyle;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarItemStyle: styles.tabBarItem,
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
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator}
        options={({ route }) => ({
          tabBarStyle: getTabBarStyle(route) as any, // 🔧 FIXED: Cast to 'any' for React Navigation compatibility
        })}
      />
      
      <Tab.Screen 
        name="RemindersTab" 
        component={RemindersStackNavigator}
        options={({ route }) => ({
          tabBarStyle: getTabBarStyle(route) as any,
        })}
      />
      
      <Tab.Screen 
        name="PatternsTab" 
        component={PatternsStackNavigator}
        options={({ route }) => ({
          tabBarStyle: getTabBarStyle(route) as any,
        })}
      />
      
      {/* <Tab.Screen 
        name="ProjectsTab" 
        component={ProjectsStackNavigator}
        options={({ route }) => ({
          tabBarStyle: getTabBarStyle(route) as any,
        })}
      /> */}
      
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsStackNavigator}
        options={({ route }) => ({
          tabBarStyle: getTabBarStyle(route) as any,
        })}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
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
