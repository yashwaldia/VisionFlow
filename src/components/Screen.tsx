/**
 * VisionFlow AI - Screen Component
 * Safe area wrapper with header support
 * 
 * @module components/Screen
 */

import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../constants/theme';

/**
 * Screen props
 */
export interface ScreenProps {
  /**
   * Screen content
   */
  children: React.ReactNode;
  
  /**
   * Enable scroll behavior
   */
  scroll?: boolean;
  
  /**
   * Show bounce effect on scroll (iOS)
   */
  bounces?: boolean;
  
  /**
   * Keyboard avoiding behavior
   */
  keyboardAvoiding?: boolean;
  
  /**
   * Use SafeAreaView
   */
  useSafeArea?: boolean;
  
  /**
   * Apply safe area only to top
   */
  safeAreaTop?: boolean;
  
  /**
   * Apply safe area only to bottom
   */
  safeAreaBottom?: boolean;
  
  /**
   * Background color
   */
  backgroundColor?: string;
  
  /**
   * Status bar style
   */
  statusBarStyle?: 'light-content' | 'dark-content';
  
  /**
   * Custom style
   */
  style?: ViewStyle;
  
  /**
   * Content container style (for ScrollView)
   */
  contentContainerStyle?: ViewStyle;
  
  /**
   * Test ID
   */
  testID?: string;
}

/**
 * Screen Component
 * 
 * @example
 * ```tsx
 * <Screen scroll>
 *   <Text>Content</Text>
 * </Screen>
 * 
 * <Screen keyboardAvoiding backgroundColor={Theme.colors.background.primary}>
 *   <Input />
 * </Screen>
 * ```
 */
export function Screen({
  children,
  scroll = false,
  bounces = true,
  keyboardAvoiding = false,
  useSafeArea = true,
  safeAreaTop = true,
  safeAreaBottom = true,
  backgroundColor = Theme.colors.background.primary,
  statusBarStyle = 'light-content',
  style,
  contentContainerStyle,
  testID,
}: ScreenProps) {
  // Container style
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
  };
  
  // Safe area edges
  const safeAreaEdges: Array<'top' | 'bottom' | 'left' | 'right'> = [];
  if (safeAreaTop) safeAreaEdges.push('top');
  if (safeAreaBottom) safeAreaEdges.push('bottom');
  
  // Render content based on scroll behavior
  const renderContent = () => {
    if (scroll) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContentContainer, contentContainerStyle]}
          bounces={bounces}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          testID={testID ? `${testID}-scroll` : undefined}
        >
          {children}
        </ScrollView>
      );
    }
    
    return <View style={[styles.contentContainer, style]}>{children}</View>;
  };
  
  // Wrap with keyboard avoiding view if needed
  const content = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {renderContent()}
    </KeyboardAvoidingView>
  ) : (
    renderContent()
  );
  
  // Wrap with SafeAreaView if needed
  if (useSafeArea) {
    return (
      <>
        <StatusBar barStyle={statusBarStyle} />
        <SafeAreaView
          edges={safeAreaEdges}
          style={[containerStyle, style]}
          testID={testID}
        >
          {content}
        </SafeAreaView>
      </>
    );
  }
  
  return (
    <>
      <StatusBar barStyle={statusBarStyle} />
      <View style={[containerStyle, style]} testID={testID}>
        {content}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
});
