/**
 * VisionFlow AI - Root Stack Navigator (v2.2 - Project Modals Added)
 * Top-level stack containing tab navigator and modal screens
 * 
 * @module navigation/RootStackNavigator
 * 
 * CHANGELOG v2.2:
 * - ✅ Added CreateProjectScreen and EditProjectScreen as fullScreenModals
 * - ✅ Matches Reminder pattern for consistent tab bar hiding
 * - ✅ All modal screens now properly hide tab bar
 * 
 * CHANGELOG v2.1:
 * - Added CreateReminderScreen and EditReminderScreen as fullScreenModals
 * - Ensures tab bar is properly hidden on these screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation.types';
import { MainTabNavigator } from './MainTabNavigator';

// Camera & AI Modal Screens
import { CameraModal } from '../screens/modals/CameraModal';
import { AIReviewModal } from '../screens/modals/AIReviewModal';
import { PatternResultsScreen } from '../screens/PatternResultsScreen';

// Reminder Modal Screens
import { CreateReminderScreen } from '../screens/CreateReminderScreen';
import { EditReminderScreen } from '../screens/EditReminderScreen';

// ✅ Project Modal Screens
import { CreateProjectScreen } from '../screens/CreateProjectScreen';
import { EditProjectScreen } from '../screens/EditProjectScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * RootStackNavigator Component
 * 
 * Stack Structure:
 * - MainApp (default) - Bottom tab navigation
 * - CameraModal - Full screen camera capture
 * - AIReviewModal - Review AI-extracted data
 * - PatternResultsScreen - Visual pattern analysis results
 * - CreateReminderScreen - Create new reminder (fullScreenModal)
 * - EditReminderScreen - Edit existing reminder (fullScreenModal)
 * - CreateProjectScreen - Create new project (fullScreenModal)
 * - EditProjectScreen - Edit existing project (fullScreenModal)
 */
export function RootStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {/* Main App with Tab Navigation */}
      <Stack.Screen 
        name="MainApp" 
        component={MainTabNavigator}
        options={{
          animation: 'none',
        }}
      />

      {/* Camera & AI Modal Screens */}
      <Stack.Screen 
        name="CameraModal" 
        component={CameraModal}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      
      <Stack.Screen 
        name="AIReviewModal" 
        component={AIReviewModal}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen 
        name="PatternResultsScreen" 
        component={PatternResultsScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />

      {/* Reminder Modal Screens */}
      <Stack.Screen 
        name="CreateReminderScreen" 
        component={CreateReminderScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />

      <Stack.Screen 
        name="EditReminderScreen" 
        component={EditReminderScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />

      {/* ✅ Project Modal Screens */}
      <Stack.Screen 
        name="CreateProjectScreen" 
        component={CreateProjectScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />

      <Stack.Screen 
        name="EditProjectScreen" 
        component={EditProjectScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
    </Stack.Navigator>
  );
}
