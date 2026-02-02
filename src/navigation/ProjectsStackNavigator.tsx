/**
 * VisionFlow AI - Projects Stack Navigator (UPDATED)
 * Navigation stack for Projects tab
 * * @module navigation/ProjectsStackNavigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProjectStackParamList } from '../types/navigation.types';
import { ProjectListScreen } from '../screens/ProjectListScreen';
import { ProjectDetailScreen } from '../screens/ProjectDetailScreen';
import { CreateProjectScreen } from '../screens/CreateProjectScreen';
import { EditProjectScreen } from '../screens/EditProjectScreen';
import { ProjectAnalyticsScreen } from '../screens/ProjectAnalyticsScreen';

const Stack = createNativeStackNavigator<ProjectStackParamList>();

/**
 * ProjectsStackNavigator Component
 * * Stack Structure:
 * - ProjectList (default) - List of all projects
 * - ProjectDetail - Full project details with reminders
 * - CreateProject - Create new project
 * - EditProject - Edit existing project
 * - ProjectAnalytics - Charts and stats
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
        name="CreateProject" 
        component={CreateProjectScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      <Stack.Screen 
        name="EditProject" 
        component={EditProjectScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      <Stack.Screen 
        name="ProjectAnalytics" 
        component={ProjectAnalyticsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}