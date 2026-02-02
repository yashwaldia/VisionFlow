/**
 * VisionFlow AI - Root Stack Navigator (UPDATED)
 * Top-level stack containing tab navigator and modal screens
 * 
 * @module navigation/RootStackNavigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation.types';
import { MainTabNavigator } from './MainTabNavigator';

// Modal Screens - NOW IMPORTED
import { CameraModal } from '../screens/modals/CameraModal';
import { AIReviewModal } from '../screens/modals/AIReviewModal';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * RootStackNavigator Component
 * 
 * Stack Structure:
 * - MainApp (default) - Bottom tab navigation
 * - CameraModal - Full screen camera capture
 * - AIReviewModal - Review AI-extracted data
 */
export function RootStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {/* Main App */}
      <Stack.Screen 
        name="MainApp" 
        component={MainTabNavigator}
        options={{
          animation: 'none',
        }}
      />

      {/* Modal Screens - NOW ACTIVE */}
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
    </Stack.Navigator>
  );
}
