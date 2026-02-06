/**
 * VisionFlow AI - Reminders Stack Navigator (v2.0 - Modal Screens Moved)
 * Navigation stack for Reminders tab
 * 
 * @module navigation/RemindersStackNavigator
 * 
 * CHANGELOG v2.0:
 * - Moved CreateReminder and EditReminder to RootStackNavigator
 * - These screens now render as fullScreenModals to properly hide tab bar
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReminderStackParamList } from '../types/navigation.types';
import { ReminderListScreen } from '../screens/ReminderListScreen';
import { ReminderDetailScreen } from '../screens/ReminderDetailScreen';

const Stack = createNativeStackNavigator<ReminderStackParamList>();

/**
 * RemindersStackNavigator Component
 * 
 * Stack Structure:
 * - ReminderList (default) - List of all reminders
 * - ReminderDetail - Full reminder details
 * 
 * Modal Screens (moved to RootStackNavigator):
 * - CreateReminderScreen - Manual reminder creation
 * - EditReminderScreen - Edit existing reminder
 */
export function RemindersStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="ReminderList" 
        component={ReminderListScreen}
      />

      <Stack.Screen 
        name="ReminderDetail" 
        component={ReminderDetailScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* ❌ REMOVED: CreateReminder and EditReminder */}
      {/* These screens are now in RootStackNavigator as fullScreenModals */}
      {/* Access them via: navigation.navigate('CreateReminderScreen') */}
      {/* Access them via: navigation.navigate('EditReminderScreen', { reminder }) */}
    </Stack.Navigator>
  );
}
