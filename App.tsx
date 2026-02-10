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
import * as NotificationService from './src/services/notification.service';


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
    // Initialize app services
    const initializeApp = async () => {
      try {
        // Create Android notification channels (no-op on iOS)
        await NotificationService.createNotificationChannels();
        
        // Reschedule all reminders (in case app was force-closed)
        await NotificationService.rescheduleAllReminders();
        
        // Update badge count
        await NotificationService.updateBadgeCount();
        
        console.log('[App] VisionFlow AI initialized');
      } catch (error) {
        console.error('[App] Initialization failed:', error);
      }
    };
    
    initializeApp();
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
