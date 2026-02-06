/**
 * VisionFlow AI - Projects Stack Navigator (v3.0 - Harmonized with Reminder)
 * Navigation stack for Projects tab
 * 
 * @module navigation/ProjectsStackNavigator
 * 
 * CHANGELOG v3.0:
 * - ✅ ALIGNED WITH REMINDER: Moved CreateProject and EditProject to RootStackNavigator
 * - ✅ REMOVED: Complex tab bar hiding logic (no longer needed)
 * - ✅ SIMPLIFIED: Only list, detail, and analytics screens remain
 * - ✅ CLEAN: Matches RemindersStackNavigator pattern exactly
 * 
 * MIGRATION NOTE:
 * CreateProject and EditProject are now in RootStackNavigator as fullScreenModals.
 * Access them via: navigation.navigate('CreateProjectScreen') or navigation.navigate('EditProjectScreen', { project })
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProjectStackParamList } from '../types/navigation.types';
import { ProjectListScreen } from '../screens/ProjectListScreen';
import { ProjectDetailScreen } from '../screens/ProjectDetailScreen';
import { ProjectAnalyticsScreen } from '../screens/ProjectAnalyticsScreen';

const Stack = createNativeStackNavigator<ProjectStackParamList>();

/**
 * ProjectsStackNavigator Component
 * 
 * Stack Structure:
 * - ProjectList (default) - List of all projects
 * - ProjectDetail - Full project details with reminders
 * - ProjectAnalytics - Charts and stats
 * 
 * Modal Screens (moved to RootStackNavigator):
 * - CreateProjectScreen - Manual project creation
 * - EditProjectScreen - Edit existing project
 */
export function ProjectsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="ProjectList" 
        component={ProjectListScreen}
      />

      <Stack.Screen 
        name="ProjectDetail" 
        component={ProjectDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />

      <Stack.Screen 
        name="ProjectAnalytics" 
        component={ProjectAnalyticsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />

      {/* ❌ REMOVED: CreateProject and EditProject */}
      {/* These screens are now in RootStackNavigator as fullScreenModals */}
      {/* Access them via: navigation.navigate('CreateProjectScreen') */}
      {/* Access them via: navigation.navigate('EditProjectScreen', { project }) */}
    </Stack.Navigator>
  );
}
