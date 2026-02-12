/**
 * VisionFlow AI - Settings Screen (v3.0 - Hidden Inside UI Edition)
 * Enhanced cyberpunk aesthetic with monospace and italic typography
 * 
 * @module screens/SettingsScreen
 * 
 * CHANGELOG v3.0:
 * - ✅ UI ENHANCEMENT: Monospace fonts for technical labels
 * - ✅ UI ENHANCEMENT: Italic text for descriptive content
 * - ✅ All v2.4 layout alignment preserved
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Alert, Linking, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  SettingsStackParamList,
  MainTabParamList,
  RootStackParamList,
} from '../types/navigation.types';
import { Theme } from '../constants/theme';
import { APP_INFO } from '../constants/config';
import {
  Screen,
  Container,
  Text,
  Card,
  Icon,
  Pressable,
  Divider,
} from '../components';

type SettingsScreenNavigationProp = CompositeNavigationProp<
  NativeStackScreenProps<SettingsStackParamList, 'SettingsHome'>['navigation'],
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    NativeStackScreenProps<RootStackParamList>['navigation']
  >
>;

type SettingsScreenProps = NativeStackScreenProps<
  SettingsStackParamList,
  'SettingsHome'
> & {
  navigation: SettingsScreenNavigationProp;
};

interface SettingItem {
  id: string;
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  rightElement?: 'chevron' | 'badge';
  badgeText?: string;
  destructive?: boolean;
  iconColor?: string;
  iconBgColor?: string;
}

/**
 * SettingsScreen Component
 */
export function SettingsScreen({ navigation }: SettingsScreenProps) {
  // Navigation handlers
  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
  };
  
  const handleThemeSettings = () => {
    navigation.navigate('ThemeSettings');
  };
  
  const handleDataManagement = () => {
    navigation.navigate('DataManagement');
  };
  
  const handleAbout = () => {
    navigation.navigate('About');
  };
  
  const handleDebugMode = () => {
    if (__DEV__) {
      navigation.navigate('DebugMode');
    }
  };
  
  const handleRateApp = async () => {
    const storeUrl = Platform.select({
      ios: `https://apps.apple.com/app/id${APP_INFO.bundleId}`,
      android: `https://play.google.com/store/apps/details?id=${APP_INFO.bundleId}`,
    });
    
    if (storeUrl) {
      try {
        await Linking.openURL(storeUrl);
      } catch (error) {
        Alert.alert('Error', 'Could not open app store');
      }
    }
  };
  
  const handleShareApp = () => {
    Alert.alert('Share', 'Share functionality coming soon!');
  };
  
  const handleSupport = async () => {
    const email = 'support@visionflow.app';
    const subject = 'VisionFlow AI Support';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Could not open email client');
    }
  };
  
  const handlePrivacyPolicy = async () => {
    try {
      await Linking.openURL('https://visionflow.app/privacy');
    } catch (error) {
      Alert.alert('Error', 'Could not open privacy policy');
    }
  };
  
  const handleTermsOfService = async () => {
    try {
      await Linking.openURL('https://visionflow.app/terms');
    } catch (error) {
      Alert.alert('Error', 'Could not open terms of service');
    }
  };
  
  // Settings sections
  const appSettings: SettingItem[] = [
    {
      id: 'notifications',
      icon: 'notifications-outline',
      label: 'Notifications',
      subtitle: 'Manage reminder alerts',
      onPress: handleNotificationSettings,
      rightElement: 'chevron',
      iconColor: Theme.colors.primary[500],
      iconBgColor: `${Theme.colors.primary[500]}20`,
    },
    {
      id: 'data',
      icon: 'server-outline',
      label: 'Data Management',
      subtitle: 'Storage, backup & export',
      onPress: handleDataManagement,
      rightElement: 'chevron',
      iconColor: Theme.colors.semantic.info,
      iconBgColor: `${Theme.colors.semantic.info}20`,
    },
  ];
  
  const supportSettings: SettingItem[] = [
    {
      id: 'rate',
      icon: 'star-outline',
      label: 'Rate VisionFlow AI',
      subtitle: 'Share your feedback',
      onPress: handleRateApp,
      rightElement: 'chevron',
      iconColor: '#facc15',
      iconBgColor: 'rgba(250, 204, 21, 0.2)',
    },
    {
      id: 'share',
      icon: 'share-social-outline',
      label: 'Share with Friends',
      subtitle: 'Spread the word',
      onPress: handleShareApp,
      rightElement: 'chevron',
      iconColor: Theme.colors.semantic.success,
      iconBgColor: `${Theme.colors.semantic.success}20`,
    },
    {
      id: 'support',
      icon: 'help-circle-outline',
      label: 'Contact Support',
      subtitle: 'Get help and report issues',
      onPress: handleSupport,
      rightElement: 'chevron',
      iconColor: Theme.colors.text.secondary,
      iconBgColor: Theme.colors.background.tertiary,
    },
  ];
  
  const legalSettings: SettingItem[] = [
    {
      id: 'privacy',
      icon: 'shield-checkmark-outline',
      label: 'Privacy Policy',
      subtitle: 'How we protect your data',
      onPress: handlePrivacyPolicy,
      rightElement: 'chevron',
      iconColor: Theme.colors.text.secondary,
      iconBgColor: Theme.colors.background.tertiary,
    },
    {
      id: 'terms',
      icon: 'document-text-outline',
      label: 'Terms of Service',
      subtitle: 'Usage agreement',
      onPress: handleTermsOfService,
      rightElement: 'chevron',
      iconColor: Theme.colors.text.secondary,
      iconBgColor: Theme.colors.background.tertiary,
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      label: 'About VisionFlow AI',
      subtitle: `Version ${APP_INFO.version}`,
      onPress: handleAbout,
      rightElement: 'chevron',
      iconColor: Theme.colors.primary[500],
      iconBgColor: `${Theme.colors.primary[500]}20`,
    },
  ];
  
  // Debug mode (dev only)
  const debugSettings: SettingItem[] = __DEV__ ? [
    {
      id: 'debug',
      icon: 'bug-outline',
      label: 'Debug Mode',
      subtitle: 'Developer tools and diagnostics',
      onPress: handleDebugMode,
      rightElement: 'badge',
      badgeText: 'DEV',
      iconColor: Theme.colors.semantic.error,
      iconBgColor: `${Theme.colors.semantic.error}20`,
    },
  ] : [];
  
  // Render setting item
  const renderSettingItem = (item: SettingItem) => (
    <Pressable
      key={item.id}
      onPress={item.onPress}
      haptic="light"
    >
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: item.iconBgColor || `${Theme.colors.primary[500]}20` },
            item.destructive && styles.iconContainerDestructive,
          ]}>
            <Icon
              name={item.icon as any}
              size="sm"
              color={item.iconColor || (item.destructive ? Theme.colors.semantic.error : Theme.colors.primary[500])}
            />
          </View>
          
          <View style={styles.settingInfo}>
            {/* ✅ ENHANCED: Monospace setting label */}
            <Text
              variant="body"
              weight="600"
              mono
              customColor={item.destructive ? Theme.colors.semantic.error : undefined}
            >
              {item.label}
            </Text>
            {/* ✅ NEW: Italic subtitle */}
            {item.subtitle && (
              <Text variant="caption" color="tertiary" italic style={styles.subtitle}>
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.settingRight}>
          {item.rightElement === 'badge' && item.badgeText && (
            <View style={styles.badge}>
              {/* ✅ ENHANCED: Monospace badge text */}
              <Text variant="caption" weight="700" mono customColor={Theme.colors.primary[500]}>
                {item.badgeText}
              </Text>
            </View>
          )}
          
          {item.rightElement === 'chevron' && (
            <Icon name="chevron-forward-outline" size="sm" color={Theme.colors.text.tertiary} />
          )}
        </View>
      </View>
    </Pressable>
  );
  
  return (
    <Screen>
      {/* Header - Fixed Outside Scroll */}
      <Container padding="m" style={styles.header}>
        {/* ✅ ENHANCED: Monospace header */}
        <Text variant="h2" mono>SETTINGS</Text>
      </Container>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="m">
          {/* App Info Card */}
          <Card elevation="sm" style={styles.appInfoCard}>
            <View style={styles.appInfoContent}>
              <View style={styles.appIconContainer}>
                <Icon name="aperture" size="lg" color={Theme.colors.primary[500]} />
              </View>
              <View style={styles.appInfo}>
                {/* ✅ ENHANCED: Monospace app name */}
                <Text variant="bodyLarge" weight="700" mono>
                  VISIONFLOW_AI
                </Text>
                {/* ✅ NEW: Italic subtitle */}
                <Text variant="caption" color="secondary" italic>
                  Visual Intelligence Platform
                </Text>
              </View>
              <View style={styles.versionBadge}>
                {/* ✅ ENHANCED: Monospace version */}
                <Text variant="micro" weight="700" mono color="secondary">
                  v{APP_INFO.version}
                </Text>
              </View>
            </View>
          </Card>
          
          {/* App Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="settings-outline" size="xs" color={Theme.colors.text.tertiary} />
              {/* ✅ ENHANCED: Monospace section title */}
              <Text variant="caption" color="tertiary" mono style={styles.sectionTitle}>
                APP_SETTINGS
              </Text>
            </View>
            <Card elevation="sm" padding={0} style={styles.card}>
              {appSettings.map((item, index) => (
                <React.Fragment key={item.id}>
                  {renderSettingItem(item)}
                  {index < appSettings.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Card>
          </View>
          
          {/* Support */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="heart-outline" size="xs" color={Theme.colors.text.tertiary} />
              {/* ✅ ENHANCED: Monospace section title */}
              <Text variant="caption" color="tertiary" mono style={styles.sectionTitle}>
                SUPPORT_&_FEEDBACK
              </Text>
            </View>
            <Card elevation="sm" padding={0} style={styles.card}>
              {supportSettings.map((item, index) => (
                <React.Fragment key={item.id}>
                  {renderSettingItem(item)}
                  {index < supportSettings.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Card>
          </View>
          
          {/* Legal & About */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="document-outline" size="xs" color={Theme.colors.text.tertiary} />
              {/* ✅ ENHANCED: Monospace section title */}
              <Text variant="caption" color="tertiary" mono style={styles.sectionTitle}>
                LEGAL_&_ABOUT
              </Text>
            </View>
            <Card elevation="sm" padding={0} style={styles.card}>
              {legalSettings.map((item, index) => (
                <React.Fragment key={item.id}>
                  {renderSettingItem(item)}
                  {index < legalSettings.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Card>
          </View>
          
          {/* Debug Mode (Dev Only) */}
          {debugSettings.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="bug-outline" size="xs" color={Theme.colors.semantic.error} />
                {/* ✅ ENHANCED: Monospace section title */}
                <Text variant="caption" customColor={Theme.colors.semantic.error} mono style={styles.sectionTitle}>
                  DEVELOPER
                </Text>
              </View>
              <Card elevation="sm" padding={0} style={styles.card}>
                {debugSettings.map((item) => renderSettingItem(item))}
              </Card>
            </View>
          )}
          
          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <Icon name="heart" size="sm" color={Theme.colors.semantic.error} />
              {/* ✅ NEW: Italic footer text */}
              <Text variant="caption" color="tertiary" italic>
                Made with love in India
              </Text>
            </View>
            {/* ✅ ENHANCED: Monospace build info */}
            <Text variant="micro" color="tertiary" mono align="center" style={styles.footerBuild}>
              Build {APP_INFO.buildNumber} • © 2026 VisionFlow_AI
            </Text>
          </View>
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Fixed header
  header: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
    paddingTop: Platform.OS === 'ios' ? 0 : Theme.spacing.s,
    ...Theme.shadows.sm,
  },
  
  // Bottom safe area in ScrollView content
  scrollContent: {
    paddingBottom: Theme.spacing.safeArea.bottomPaddingLarge,
  },
  
  // App Info Card
  appInfoCard: {
    marginBottom: Theme.spacing.l,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  appInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  appIconContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.l,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  appInfo: {
    flex: 1,
    gap: 2,
  },
  versionBadge: {
    paddingHorizontal: Theme.spacing.s,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.s,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
  },
  
  // Section styles
  section: {
    marginBottom: Theme.spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Theme.spacing.s,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 10,
    fontWeight: '700',
  },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  
  // Setting item styles
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.m,
    minHeight: 72,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}20`,
  },
  iconContainerDestructive: {
    backgroundColor: `${Theme.colors.semantic.error}20`,
    borderColor: `${Theme.colors.semantic.error}30`,
  },
  settingInfo: {
    flex: 1,
    gap: 2,
  },
  subtitle: {
    lineHeight: 16,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
  },
  badge: {
    paddingHorizontal: Theme.spacing.s,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.s,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  
  // Footer styles
  footer: {
    marginTop: Theme.spacing.xl,
    gap: Theme.spacing.s,
    alignItems: 'center',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  footerBuild: {
    opacity: 0.7,
  },
});
