/**
 * VisionFlow AI - Home Stack Navigator
 * Navigation stack for Home tab
 * 
 * @module navigation/HomeStackNavigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types/navigation.types';
import { HomeScreen } from '../screens/HomeScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

/**
 * HomeStackNavigator Component
 * 
 * Stack Structure:
 * - Home (default) - Main dashboard
 * - Search - Global search screen
 */
export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* FIXED: Use 'Home' instead of 'HomeScreen' to match HomeStackParamList */}
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
      />

      {/* Search screen - will be added later
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
      />
      */}
    </Stack.Navigator>
  );
}
