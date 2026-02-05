/**
 * VisionFlow AI - Projects Stack Navigator (v2.0 - Tab Bar Control)
 * Navigation stack for Projects tab
 * 
 * @module navigation/ProjectsStackNavigator
 * 
 * CHANGELOG v2.0:
 * - 🔧 Added tab bar hiding for CreateProject and EditProject modal screens
 * - ✅ Footer buttons no longer hidden behind floating tab bar
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
 * 
 * Stack Structure:
 * - ProjectList (default) - List of all projects
 * - ProjectDetail - Full project details with reminders
 * - CreateProject - Create new project (tab bar hidden)
 * - EditProject - Edit existing project (tab bar hidden)
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
        options={({ navigation }) => ({
          presentation: 'modal',
          animation: 'slide_from_bottom',
          // 🔧 Hide tab bar when this screen is active
          tabBarStyle: { display: 'none' },
        })}
        listeners={({ navigation }) => ({
          focus: () => {
            // Hide tab bar when screen gains focus
            navigation.getParent()?.setOptions({
              tabBarStyle: { display: 'none' }
            });
          },
          beforeRemove: () => {
            // Show tab bar when leaving screen
            navigation.getParent()?.setOptions({
              tabBarStyle: {
                position: 'absolute',
                bottom: 30,
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
              }
            });
          },
        })}
      />

      <Stack.Screen 
        name="EditProject" 
        component={EditProjectScreen}
        options={({ navigation }) => ({
          presentation: 'modal',
          animation: 'slide_from_bottom',
          // 🔧 Hide tab bar when this screen is active
          tabBarStyle: { display: 'none' },
        })}
        listeners={({ navigation }) => ({
          focus: () => {
            // Hide tab bar when screen gains focus
            navigation.getParent()?.setOptions({
              tabBarStyle: { display: 'none' }
            });
          },
          beforeRemove: () => {
            // Show tab bar when leaving screen
            navigation.getParent()?.setOptions({
              tabBarStyle: {
                position: 'absolute',
                bottom: 30,
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
              }
            });
          },
        })}
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
