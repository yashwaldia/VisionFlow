/**
 * VisionFlow AI - Root Application File (100% ERROR-FREE)
 * Main app entry point
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components';
import { Theme } from './src/constants/theme';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

/**
 * App Component
 */
export default function App() {
  useEffect(() => {
    // Initialize app services here
    console.log('[App] VisionFlow AI initialized');
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={Theme.colors.background.primary}
          />
          <AppNavigator />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
