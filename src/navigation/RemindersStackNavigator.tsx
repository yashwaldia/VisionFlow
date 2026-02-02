/**
 * VisionFlow AI - Reminders Stack Navigator (UPDATED)
 * Navigation stack for Reminders tab
 * * @module navigation/RemindersStackNavigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReminderStackParamList } from '../types/navigation.types';
import { ReminderListScreen } from '../screens/ReminderListScreen';
import { ReminderDetailScreen } from '../screens/ReminderDetailScreen';
import { CreateReminderScreen } from '../screens/CreateReminderScreen';
import { EditReminderScreen } from '../screens/EditReminderScreen';

const Stack = createNativeStackNavigator<ReminderStackParamList>();

/**
 * RemindersStackNavigator Component
 * * Stack Structure:
 * - ReminderList (default) - List of all reminders
 * - ReminderDetail - Full reminder details
 * - CreateReminder - Manual reminder creation
 * - EditReminder - Edit existing reminder
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

      <Stack.Screen 
        name="CreateReminder" 
        component={CreateReminderScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      <Stack.Screen 
        name="EditReminder" 
        component={EditReminderScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}