/**
 * VisionFlow AI - App Navigator
 * Root navigation container with theme configuration
 * 
 * @module navigation/AppNavigator
 */

import React from 'react';
import { NavigationContainer, DefaultTheme, NavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Theme } from '../constants/theme';
import { RootStackNavigator } from './RootStackNavigator';

/**
 * Custom navigation theme matching app design system
 */
const navigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: Theme.colors.primary[500],
    background: Theme.colors.background.primary,
    card: Theme.colors.background.secondary,
    text: Theme.colors.text.primary,
    border: Theme.colors.border.default,
    notification: Theme.colors.semantic.error,
  },
};

/**
 * Navigation reference for imperatively navigating
 * Usage: navigationRef.current?.navigate('ScreenName')
 */
export const navigationRef = React.createRef<NavigationContainerRef<any>>();

/**
 * AppNavigator Component
 * Wraps the entire navigation hierarchy
 */
export function AppNavigator() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        <RootStackNavigator />
      </NavigationContainer>
    </>
  );
}
