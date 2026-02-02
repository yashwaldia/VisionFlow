/**
 * VisionFlow AI - Settings Stack Navigator (UPDATED)
 * Navigation stack for Settings tab
 * * @module navigation/SettingsStackNavigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../types/navigation.types';
import { SettingsScreen } from '../screens/SettingsScreen';

// Active Settings Sub-screens
import { NotificationSettingsScreen } from '../screens/settings/NotificationSettingsScreen';
import { ThemeSettingsScreen } from '../screens/settings/ThemeSettingsScreen';
import { DataManagementScreen } from '../screens/settings/DataManagementScreen';
import { AboutScreen } from '../screens/settings/AboutScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

/**
 * SettingsStackNavigator Component
 * * Stack Structure:
 * - SettingsHome (default) - Main settings menu
 * - NotificationSettings - Notification preferences
 * - ThemeSettings - Theme and appearance
 * - DataManagement - Backup, export, delete data
 * - About - App info, version, credits
 */
export function SettingsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="SettingsHome" 
        component={SettingsScreen}
      />

      <Stack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
      />

      <Stack.Screen 
        name="ThemeSettings" 
        component={ThemeSettingsScreen}
      />

      <Stack.Screen 
        name="DataManagement" 
        component={DataManagementScreen}
      />

      <Stack.Screen 
        name="About" 
        component={AboutScreen}
      />
    </Stack.Navigator>
  );
}