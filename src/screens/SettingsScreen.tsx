/**
 * VisionFlow AI - Settings Screen (v2.1 - Harmonized Edition)
 * App configuration and preferences
 * 
 * @module screens/SettingsScreen
 * 
 * CHANGELOG v2.1:
 * - ✅ Changed title from h1 to h2 for consistency
 * - ✅ Removed hardcoded paddingBottom (Screen component handles it)
 * - ✅ Improved visual hierarchy
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
 * 
 * Features:
 * - App preferences
 * - Notification settings
 * - Data management
 * - About & support
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
      iconBgColor: `${Theme.colors.primary[500]}15`,
    },
    {
      id: 'theme',
      icon: 'color-palette-outline',
      label: 'Appearance',
      subtitle: 'Theme and display',
      onPress: handleThemeSettings,
      rightElement: 'chevron',
      iconColor: Theme.colors.semantic.warning,
      iconBgColor: `${Theme.colors.semantic.warning}15`,
    },
    {
      id: 'data',
      icon: 'server-outline',
      label: 'Data Management',
      subtitle: 'Storage, backup & export',
      onPress: handleDataManagement,
      rightElement: 'chevron',
      iconColor: Theme.colors.semantic.info,
      iconBgColor: `${Theme.colors.semantic.info}15`,
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
      iconBgColor: 'rgba(250, 204, 21, 0.15)',
    },
    {
      id: 'share',
      icon: 'share-social-outline',
      label: 'Share with Friends',
      subtitle: 'Spread the word',
      onPress: handleShareApp,
      rightElement: 'chevron',
      iconColor: Theme.colors.semantic.success,
      iconBgColor: `${Theme.colors.semantic.success}15`,
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
      iconBgColor: `${Theme.colors.primary[500]}15`,
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
      iconBgColor: `${Theme.colors.semantic.error}15`,
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
            { backgroundColor: item.iconBgColor || `${Theme.colors.primary[500]}15` },
            item.destructive && styles.iconContainerDestructive,
          ]}>
            <Icon
              name={item.icon as any}
              size="sm"
              color={item.iconColor || (item.destructive ? Theme.colors.semantic.error : Theme.colors.primary[500])}
            />
          </View>
          
          <View style={styles.settingInfo}>
            <Text
              variant="body"
              weight="600"
              customColor={item.destructive ? Theme.colors.semantic.error : undefined}
            >
              {item.label}
            </Text>
            {item.subtitle && (
              <Text variant="caption" color="tertiary" style={styles.subtitle}>
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.settingRight}>
          {item.rightElement === 'badge' && item.badgeText && (
            <View style={styles.badge}>
              <Text variant="caption" weight="700" customColor={Theme.colors.primary[500]}>
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
    <Screen scroll>
      <Container padding="m">
        {/* Header - ✅ UPDATED */}
        <View style={styles.header}>
          <Text variant="h2">Settings</Text>
          <Text variant="body" color="secondary" style={styles.headerSubtitle}>
            Customize your VisionFlow experience
          </Text>
        </View>
        
        {/* App Info Card */}
        <Card style={styles.appInfoCard}>
          <View style={styles.appInfoContent}>
            <View style={styles.appIconContainer}>
              <Icon name="aperture" size="lg" color={Theme.colors.primary[500]} />
            </View>
            <View style={styles.appInfo}>
              <Text variant="bodyLarge" weight="700">
                VisionFlow AI
              </Text>
              <Text variant="caption" color="secondary">
                Visual Intelligence Platform
              </Text>
            </View>
            <View style={styles.versionBadge}>
              <Text variant="micro" weight="700" color="secondary">
                v{APP_INFO.version}
              </Text>
            </View>
          </View>
        </Card>
        
        {/* App Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="settings-outline" size="xs" color={Theme.colors.text.tertiary} />
            <Text variant="caption" color="tertiary" style={styles.sectionTitle}>
              APP SETTINGS
            </Text>
          </View>
          <Card padding={0} style={styles.card}>
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
            <Text variant="caption" color="tertiary" style={styles.sectionTitle}>
              SUPPORT & FEEDBACK
            </Text>
          </View>
          <Card padding={0} style={styles.card}>
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
            <Text variant="caption" color="tertiary" style={styles.sectionTitle}>
              LEGAL & ABOUT
            </Text>
          </View>
          <Card padding={0} style={styles.card}>
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
              <Text variant="caption" customColor={Theme.colors.semantic.error} style={styles.sectionTitle}>
                DEVELOPER
              </Text>
            </View>
            <Card padding={0} style={styles.card}>
              {debugSettings.map((item) => renderSettingItem(item))}
            </Card>
          </View>
        )}
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Icon name="heart" size="sm" color={Theme.colors.semantic.error} />
            <Text variant="caption" color="tertiary">
              Made with love in India
            </Text>
          </View>
          <Text variant="micro" color="tertiary" align="center" style={styles.footerBuild}>
            Build {APP_INFO.buildNumber} • © 2026 VisionFlow AI
          </Text>
        </View>
      </Container>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // ✅ REMOVED: paddingBottom (Screen component handles it automatically)
  
  // Header styles
  header: {
    marginBottom: Theme.spacing.l,
  },
  headerSubtitle: {
    marginTop: 4,
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
    backgroundColor: `${Theme.colors.primary[500]}15`,
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
    backgroundColor: `${Theme.colors.semantic.error}15`,
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
  
  // Footer styles - ✅ UPDATED
  footer: {
    marginTop: Theme.spacing.xl,
    gap: Theme.spacing.s,
    alignItems: 'center',
    // No marginBottom needed - Screen component handles it!
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
