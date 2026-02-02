/**
 * VisionFlow AI - Patterns Stack Navigator (UPDATED)
 * Navigation stack for Patterns tab
 * * @module navigation/PatternsStackNavigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PatternStackParamList } from '../types/navigation.types';
import { PatternLibraryScreen } from '../screens/PatternLibraryScreen';
import { PatternDetailScreen } from '../screens/PatternDetailScreen';

const Stack = createNativeStackNavigator<PatternStackParamList>();

/**
 * PatternsStackNavigator Component
 * * Stack Structure:
 * - PatternLibrary (default) - Grid of discovered patterns
 * - PatternDetail - Full pattern details with examples
 */
export function PatternsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="PatternLibrary" 
        component={PatternLibraryScreen}
      />

      <Stack.Screen 
        name="PatternDetail" 
        component={PatternDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}