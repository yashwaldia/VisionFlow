/**
 * VisionFlow AI - Screen Component (v2.3 - Background Pattern Edition)
 * Safe area wrapper with tactical grid overlay
 * Matches Hidden Inside web prototype
 * 
 * @module components/Screen
 * 
 * CHANGELOG v2.3:
 * - ✅ Integrated BackgroundPattern component
 * - ✅ Enhanced HUD decorations with grid overlay
 * - ✅ Preserves all existing functionality
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
import { BackgroundPattern } from './BackgroundPattern'; // ✅ NEW IMPORT

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
  showRuler?: boolean;
  disableTabBarSpacing?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  /**
   * ✅ NEW: Enable/disable background pattern
   * @default true
   */
  showBackgroundPattern?: boolean;
}

function useTabBarHeightSafe(): { height: number; isInTabNavigator: boolean } {
  try {
    const tabBarHeight = useBottomTabBarHeight();
    return { 
      height: tabBarHeight, 
      isInTabNavigator: true 
    };
  } catch {
    return { 
      height: 0, 
      isInTabNavigator: false 
    };
  }
}

/**
 * Screen Component
 * Now with tactical grid overlay from Hidden Inside prototype
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
  showBackgroundPattern = true, // ✅ NEW
}: ScreenProps) {
  
  const insets = useSafeAreaInsets();
  const { height: tabBarHeight, isInTabNavigator } = useTabBarHeightSafe();
  
  const bottomPadding = React.useMemo(() => {
    if (!safeAreaBottom || disableTabBarSpacing) {
      return 0;
    }
    
    if (!isInTabNavigator) {
      return insets.bottom;
    }
    
    return Math.max(insets.bottom, tabBarHeight) + Theme.spacing.m;
  }, [safeAreaBottom, disableTabBarSpacing, isInTabNavigator, insets.bottom, tabBarHeight]);
  
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
  };
  
  const safeAreaEdges: Array<'top' | 'bottom' | 'left' | 'right'> = [];
  if (safeAreaTop) safeAreaEdges.push('top');

  /**
   * ✅ ENHANCED: HUD Decorations with BackgroundPattern
   */
  const HudDecorations = () => (
    <View 
      style={[StyleSheet.absoluteFill, { zIndex: -1 }]} 
      pointerEvents="none"
    >
      {/* ✅ NEW: Background grid pattern */}
      {showBackgroundPattern && (
        <BackgroundPattern intensity={0.03} animated={true} gridSize={40} />
      )}
      
      {/* Legacy scanline overlay (now supplemental) */}
      <View 
        style={{ 
          flex: 1, 
          backgroundColor: Theme.colors.background.scanline 
        }} 
      />
      
      {/* Tactical ruler */}
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
