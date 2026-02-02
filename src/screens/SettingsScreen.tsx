/**
 * VisionFlow AI - Settings Screen
 * App configuration and preferences
 * 
 * @module screens/SettingsScreen
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
import { APP_INFO } from '../constants/config'; // FIXED: Changed APP_CONFIG → APP_INFO
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
    // FIXED: Using APP_INFO.bundleId
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
    // Share functionality would be implemented here
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
    },
    {
      id: 'theme',
      icon: 'color-palette-outline',
      label: 'Theme',
      subtitle: 'Dark mode (default)',
      onPress: handleThemeSettings,
      rightElement: 'chevron',
    },
    {
      id: 'data',
      icon: 'server-outline',
      label: 'Data Management',
      subtitle: 'Storage & backup',
      onPress: handleDataManagement,
      rightElement: 'chevron',
    },
  ];
  
  const supportSettings: SettingItem[] = [
    {
      id: 'rate',
      icon: 'star-outline',
      label: 'Rate VisionFlow AI',
      subtitle: 'Share your feedback',
      onPress: handleRateApp,
    },
    {
      id: 'share',
      icon: 'share-social-outline',
      label: 'Share with Friends',
      onPress: handleShareApp,
    },
    {
      id: 'support',
      icon: 'help-circle-outline',
      label: 'Contact Support',
      onPress: handleSupport,
    },
  ];
  
  const legalSettings: SettingItem[] = [
    {
      id: 'privacy',
      icon: 'shield-checkmark-outline',
      label: 'Privacy Policy',
      onPress: handlePrivacyPolicy,
    },
    {
      id: 'terms',
      icon: 'document-text-outline',
      label: 'Terms of Service',
      onPress: handleTermsOfService,
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      label: 'About',
      subtitle: `Version ${APP_INFO.version}`, // FIXED: APP_CONFIG → APP_INFO
      onPress: handleAbout,
      rightElement: 'chevron',
    },
  ];
  
  // Debug mode (dev only)
  const debugSettings: SettingItem[] = __DEV__ ? [
    {
      id: 'debug',
      icon: 'bug-outline',
      label: 'Debug Mode',
      subtitle: 'Developer tools',
      onPress: handleDebugMode,
      rightElement: 'badge',
      badgeText: 'DEV',
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
            item.destructive && styles.iconContainerDestructive,
          ]}>
            <Icon
              name={item.icon as any}
              size="sm"
              color={item.destructive ? Theme.colors.semantic.error : Theme.colors.primary[500]}
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
              <Text variant="caption" color="tertiary">
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>
        
        {item.rightElement === 'chevron' && (
          <Icon name="chevron-forward" size="sm" color={Theme.colors.text.tertiary} />
        )}
        
        {item.rightElement === 'badge' && item.badgeText && (
          <View style={styles.badge}>
            <Text variant="caption" weight="600" customColor={Theme.colors.primary[500]}>
              {item.badgeText}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
  
  return (
    <Screen scroll>
      <Container padding="m">
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h1">Settings</Text>
        </View>
        
        {/* App Settings */}
        <View style={styles.section}>
          <Text variant="h4" color="secondary" style={styles.sectionTitle}>
            App Settings
          </Text>
          <Card style={styles.card}>
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
          <Text variant="h4" color="secondary" style={styles.sectionTitle}>
            Support & Feedback
          </Text>
          <Card style={styles.card}>
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
          <Text variant="h4" color="secondary" style={styles.sectionTitle}>
            Legal & About
          </Text>
          <Card style={styles.card}>
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
            <Text variant="h4" color="secondary" style={styles.sectionTitle}>
              Developer
            </Text>
            <Card style={styles.card}>
              {debugSettings.map((item) => renderSettingItem(item))}
            </Card>
          </View>
        )}
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="caption" color="tertiary" align="center">
            VisionFlow AI
          </Text>
          <Text variant="caption" color="tertiary" align="center">
            Version {APP_INFO.version} ({APP_INFO.buildNumber}) {/* FIXED: APP_CONFIG → APP_INFO */}
          </Text>
          <Text variant="caption" color="tertiary" align="center" style={styles.footerText}>
            Made with ❤️ in India
          </Text>
        </View>
      </Container>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Theme.spacing.l,
  },
  section: {
    marginBottom: Theme.spacing.l,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.s,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.m,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerDestructive: {
    backgroundColor: `${Theme.colors.semantic.error}20`,
  },
  settingInfo: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.s,
    backgroundColor: `${Theme.colors.primary[500]}20`,
  },
  footer: {
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.xxl,
    gap: 4,
  },
  footerText: {
    marginTop: Theme.spacing.xs,
  },
});
