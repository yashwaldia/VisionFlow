/**
 * VisionFlow AI - Screen Component (v2.2 - Modal Fix Edition)
 * Safe area wrapper with automatic bottom tab bar spacing
 * 
 * @module components/Screen
 * 
 * CHANGELOG v2.2:
 * - ✅ FIXED: Modal screens no longer get unwanted tab bar padding
 * - ✅ Better detection of tab navigator context
 * - ✅ Smarter bottom padding calculation
 * 
 * CHANGELOG v2.1:
 * - ✅ FIXED: Automatic bottom padding for tab bar (no more hidden content!)
 * - ✅ Uses useBottomTabBarHeight() when available
 * - ✅ Fallback to theme-based tab bar height
 * - ✅ Developers no longer need to add paddingBottom manually
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
  RefreshControlProps,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Theme } from '../constants/theme';

/**
 * Screen props
 */
export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  bounces?: boolean;
  keyboardAvoiding?: boolean;
  useSafeArea?: boolean;
  safeAreaTop?: boolean;
  safeAreaBottom?: boolean;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  testID?: string;
  /**
   * Show the tactical vertical ruler on the left
   * @default true
   */
  showRuler?: boolean;
  /**
   * Disable automatic bottom tab bar spacing
   * Use this ONLY if screen is not within tab navigator
   * @default false
   */
  disableTabBarSpacing?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

/**
 * Hook to get tab bar height with fallback
 * Returns both the height and whether we're actually in a tab navigator
 */
function useTabBarHeightSafe(): { height: number; isInTabNavigator: boolean } {
  try {
    // Try to get actual tab bar height from navigation
    const tabBarHeight = useBottomTabBarHeight();
    return { 
      height: tabBarHeight, 
      isInTabNavigator: true 
    };
  } catch {
    // Not in a tab navigator context
    return { 
      height: 0, 
      isInTabNavigator: false 
    };
  }
}

/**
 * Screen Component
 * "The Mainframe Canvas" - Now with automatic tab bar spacing!
 * 
 * @example
 * ```tsx
 * // Scrollable screen in tab navigator (automatic bottom spacing)
 * <Screen scroll>
 *   <Text>Content will automatically clear the tab bar!</Text>
 * </Screen>
 * 
 * // Non-scrollable screen
 * <Screen>
 *   <View>Content here</View>
 * </Screen>
 * 
 * // Modal (no tab bar spacing - automatically detected)
 * <Screen>
 *   <Text>Modal content - no extra padding added!</Text>
 * </Screen>
 * 
 * // Force disable tab bar spacing
 * <Screen disableTabBarSpacing>
 *   <Text>Manual override</Text>
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
  showRuler = true,
  disableTabBarSpacing = false,
  refreshControl,
}: ScreenProps) {
  
  // Get safe area insets
  const insets = useSafeAreaInsets();
  
  // Get tab bar height and context
  const { height: tabBarHeight, isInTabNavigator } = useTabBarHeightSafe();
  
  /**
   * Calculate bottom padding
   * This ensures content is visible above the tab bar
   * 
   * ✅ FIXED: Only adds padding if we're actually in a tab navigator
   */
  const bottomPadding = React.useMemo(() => {
    // If disabled explicitly, return 0
    if (!safeAreaBottom || disableTabBarSpacing) {
      return 0;
    }
    
    // ✅ NEW: Only add tab bar padding if we're in a tab navigator
    if (!isInTabNavigator) {
      // For modals/non-tab screens, just use safe area inset
      return insets.bottom;
    }
    
    // For tab navigator screens: tab bar height + extra spacing
    return Math.max(insets.bottom, tabBarHeight) + Theme.spacing.m;
  }, [safeAreaBottom, disableTabBarSpacing, isInTabNavigator, insets.bottom, tabBarHeight]);
  
  // Base Container Style
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
  };
  
  // Safe area edges (now we handle bottom manually for better control)
  const safeAreaEdges: Array<'top' | 'bottom' | 'left' | 'right'> = [];
  if (safeAreaTop) safeAreaEdges.push('top');
  // Note: We don't add 'bottom' here because we handle it with padding

  /**
   * HUD Decorations (Passive Visuals)
   */
  const HudDecorations = () => (
    <View 
      style={[StyleSheet.absoluteFill, { zIndex: -1 }]} 
      pointerEvents="none"
    >
      {/* 1. Global Tint/Scanline Overlay */}
      <View 
        style={{ 
          flex: 1, 
          backgroundColor: Theme.colors.background.scanline 
        }} 
      />
      
      {/* 2. Tactical Ruler (Visual Anchor) */}
      {showRuler && (
        <View 
          style={{
            position: 'absolute',
            left: 24,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }} 
        />
      )}
    </View>
  );
  
  // Render content based on scroll behavior
  const renderContent = () => {
    if (scroll) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContentContainer,
            {
              paddingBottom: bottomPadding,
            },
            contentContainerStyle,
          ]}
          bounces={bounces}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
          testID={testID ? `${testID}-scroll` : undefined}
        >
          {children}
        </ScrollView>
      );
    }
    
    return (
      <View 
        style={[
          styles.contentContainer, 
          {
            paddingBottom: bottomPadding,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
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
  
  // Render Logic
  if (useSafeArea) {
    return (
      <>
        <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
        <SafeAreaView
          edges={safeAreaEdges}
          style={[containerStyle, style]}
          testID={testID}
        >
          <HudDecorations />
          {content}
        </SafeAreaView>
      </>
    );
  }
  
  return (
    <>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      <View style={[containerStyle, style]} testID={testID}>
        <HudDecorations />
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