/**
 * VisionFlow AI - Notification Settings Screen (v2.1 - Harmonized Edition)
 * Manage push notification preferences
 * 
 * @module screens/settings/NotificationSettingsScreen
 * 
 * CHANGELOG v2.1:
 * - ✅ Added header shadow for separation
 * - ✅ Added card elevation for visual depth
 * - ✅ Opacity already correct at 20% (no changes needed)
 * - ✅ Scroll padding already adequate for tab bar (120px)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Switch, Alert, Linking, AppState, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types/navigation.types';
import { Theme } from '../../constants/theme';
import { PermissionStatus, UserPreferences, NotificationPreferences, DisplayPreferences } from '../../types/common.types';
import {
  Screen,
  Container,
  Text,
  Card,
  Icon,
  Button,
  Pressable,
  LoadingSpinner,
} from '../../components';
import * as NotificationService from '../../services/notification.service';
import * as StorageService from '../../services/storage.service';

type NotificationSettingsScreenProps = NativeStackScreenProps<SettingsStackParamList, 'NotificationSettings'>;

export function NotificationSettingsScreen({ navigation }: NotificationSettingsScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(PermissionStatus.UNDETERMINED);
  
  // Preference States
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [patternsEnabled, setPatternsEnabled] = useState(true);
  const [updatesEnabled, setUpdatesEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Check permissions on mount and app foreground
  const checkPermissions = useCallback(async () => {
    try {
      const status = await NotificationService.requestNotificationPermission();
      setPermissionStatus(status);
    } catch (error) {
      console.error('[NotificationSettings] Failed to check permissions:', error);
    }
  }, []);

  // Load saved preferences
  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      await checkPermissions();
      
      const prefs = await StorageService.getUserPreferences();
      
      if (prefs) {
        setRemindersEnabled(prefs.notifications?.reminderAlerts ?? true);
        setPatternsEnabled(prefs.notifications?.patternDiscoveries ?? true);
        setUpdatesEnabled(prefs.notifications?.projectUpdates ?? true);
        setSoundEnabled(prefs.notifications?.soundEnabled ?? true);
        setHapticsEnabled(prefs.display?.hapticFeedbackEnabled ?? true);
      }
    } catch (error) {
      console.error('[NotificationSettings] Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, [checkPermissions]);

  useEffect(() => {
    loadPreferences();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermissions();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loadPreferences, checkPermissions]);

  /**
   * Save preference helper
   */
  const savePreference = async (
    key: keyof NotificationPreferences | keyof DisplayPreferences, 
    value: boolean, 
    section: 'notifications' | 'display'
  ) => {
    try {
      const currentPrefs = await StorageService.getUserPreferences();
      
      let updates: Partial<UserPreferences> = {};

      if (section === 'notifications') {
        updates = {
          notifications: {
            ...currentPrefs.notifications,
            [key]: value,
          } as NotificationPreferences
        };
      } else if (section === 'display') {
        updates = {
          display: {
            ...currentPrefs.display,
            [key]: value,
          } as DisplayPreferences
        };
      }

      await StorageService.updateUserPreferences(updates);
      
    } catch (error) {
      console.error('[NotificationSettings] Save failed:', error);
      Alert.alert('Error', 'Failed to save preference');
    }
  };

  const openSystemSettings = () => {
    Linking.openSettings();
  };

  if (isLoading) {
    return (
      <Screen>
        <Container center>
          <LoadingSpinner text="Loading notification settings..." />
        </Container>
      </Screen>
    );
  }

  const isPermissionGranted = permissionStatus === PermissionStatus.GRANTED;

  return (
    <Screen>
      {/* Header - ✅ ENHANCED: Added shadow */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} haptic="light" style={styles.headerButton}>
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text variant="h4" weight="600">Notifications</Text>
          <Text variant="caption" color="tertiary">Manage your alerts</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="m">
          {/* Permission Status Card - ✅ ENHANCED: Added elevation */}
          <Card elevation="sm" style={[
            styles.permissionCard,
            isPermissionGranted ? styles.permissionCardEnabled : styles.permissionCardDisabled
          ]}>
            <View style={styles.permissionHeader}>
              <View style={[
                styles.permissionIconContainer,
                isPermissionGranted ? styles.permissionIconEnabled : styles.permissionIconDisabled
              ]}>
                <Icon 
                  name={isPermissionGranted ? "notifications" : "notifications-off"} 
                  size="lg" 
                  color={isPermissionGranted ? Theme.colors.semantic.success : Theme.colors.semantic.error} 
                />
              </View>
              <View style={styles.permissionInfo}>
                <Text variant="h4">
                  {isPermissionGranted ? 'Notifications Enabled' : 'Notifications Disabled'}
                </Text>
                <Text variant="caption" color="secondary" style={styles.permissionDescription}>
                  {isPermissionGranted 
                    ? 'VisionFlow can send you reminders and updates' 
                    : 'Enable permissions in settings to receive alerts'}
                </Text>
              </View>
            </View>
            
            {!isPermissionGranted && (
              <Button
                label="Open System Settings"
                variant="primary"
                size="medium"
                leftIcon="settings"
                onPress={openSystemSettings}
                style={styles.settingsButton}
              />
            )}
          </Card>

          {/* Alert Types Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="notifications-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Alert Types</Text>
            </View>
            
            <Card elevation="sm" style={styles.optionsCard}>
              {/* Reminders Toggle */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={styles.optionIconContainer}>
                    <Icon name="alarm" size="sm" color={Theme.colors.primary[500]} />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text variant="body" weight="600">Reminders</Text>
                    <Text variant="caption" color="secondary">Get notified for due tasks</Text>
                  </View>
                </View>
                <Switch
                  value={remindersEnabled}
                  onValueChange={(val) => {
                    setRemindersEnabled(val);
                    savePreference('reminderAlerts', val, 'notifications');
                  }}
                  trackColor={{ 
                    false: Theme.colors.background.tertiary, 
                    true: `${Theme.colors.primary[500]}80` 
                  }}
                  thumbColor={remindersEnabled ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
                  ios_backgroundColor={Theme.colors.background.tertiary}
                  disabled={!isPermissionGranted}
                />
              </View>

              <View style={styles.divider} />

              {/* Patterns Toggle */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={styles.optionIconContainer}>
                    <Icon name="analytics" size="sm" color={Theme.colors.semantic.info} />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text variant="body" weight="600">Pattern Insights</Text>
                    <Text variant="caption" color="secondary">Weekly pattern discoveries</Text>
                  </View>
                </View>
                <Switch
                  value={patternsEnabled}
                  onValueChange={(val) => {
                    setPatternsEnabled(val);
                    savePreference('patternDiscoveries', val, 'notifications');
                  }}
                  trackColor={{ 
                    false: Theme.colors.background.tertiary, 
                    true: `${Theme.colors.primary[500]}80` 
                  }}
                  thumbColor={patternsEnabled ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
                  ios_backgroundColor={Theme.colors.background.tertiary}
                  disabled={!isPermissionGranted}
                />
              </View>

              <View style={styles.divider} />

              {/* Updates Toggle */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={styles.optionIconContainer}>
                    <Icon name="gift" size="sm" color={Theme.colors.semantic.warning} />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text variant="body" weight="600">Product Updates</Text>
                    <Text variant="caption" color="secondary">News about new features</Text>
                  </View>
                </View>
                <Switch
                  value={updatesEnabled}
                  onValueChange={(val) => {
                    setUpdatesEnabled(val);
                    savePreference('projectUpdates', val, 'notifications');
                  }}
                  trackColor={{ 
                    false: Theme.colors.background.tertiary, 
                    true: `${Theme.colors.primary[500]}80` 
                  }}
                  thumbColor={updatesEnabled ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
                  ios_backgroundColor={Theme.colors.background.tertiary}
                  disabled={!isPermissionGranted}
                />
              </View>
            </Card>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="options-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Experience</Text>
            </View>

            <Card elevation="sm" style={styles.optionsCard}>
              {/* Sound Toggle */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={styles.optionIconContainer}>
                    <Icon name="volume-high" size="sm" color={Theme.colors.semantic.success} />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text variant="body" weight="600">In-App Sound</Text>
                    <Text variant="caption" color="secondary">Play sounds for actions</Text>
                  </View>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={(val) => {
                    setSoundEnabled(val);
                    savePreference('soundEnabled', val, 'notifications');
                  }}
                  trackColor={{ 
                    false: Theme.colors.background.tertiary, 
                    true: `${Theme.colors.primary[500]}80` 
                  }}
                  thumbColor={soundEnabled ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
                  ios_backgroundColor={Theme.colors.background.tertiary}
                />
              </View>

              <View style={styles.divider} />

              {/* Haptics Toggle */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={styles.optionIconContainer}>
                    <Icon name="phone-portrait" size="sm" color={Theme.colors.semantic.info} />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text variant="body" weight="600">Haptic Feedback</Text>
                    <Text variant="caption" color="secondary">Vibrate on interactions</Text>
                  </View>
                </View>
                <Switch
                  value={hapticsEnabled}
                  onValueChange={(val) => {
                    setHapticsEnabled(val);
                    savePreference('hapticFeedbackEnabled', val, 'display');
                  }}
                  trackColor={{ 
                    false: Theme.colors.background.tertiary, 
                    true: `${Theme.colors.primary[500]}80` 
                  }}
                  thumbColor={hapticsEnabled ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
                  ios_backgroundColor={Theme.colors.background.tertiary}
                />
              </View>
            </Card>
          </View>

          {/* Info Card - ✅ ENHANCED: Added elevation */}
          <Card elevation="sm" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
              <Text variant="caption" color="secondary" style={styles.infoText}>
                Notification settings are saved instantly. System notification permissions can be changed in your device settings at any time.
              </Text>
            </View>
          </Card>

        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header styles - ✅ ENHANCED: Added shadow
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
    ...Theme.shadows.sm, // ✅ ADDED: Header shadow for depth
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.m,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  
  // Scroll styles - ✅ Already adequate for tab bar (120px)
  scrollContent: {
    paddingBottom: 120,
  },
  
  // Permission card styles - ✅ Card elevation added via elevation="sm" prop
  permissionCard: {
    marginBottom: Theme.spacing.l,
    borderWidth: 2,
  },
  permissionCardEnabled: {
    backgroundColor: `${Theme.colors.semantic.success}10`, // ✅ Kept at 10% (intentionally subtle)
    borderColor: `${Theme.colors.semantic.success}30`,
  },
  permissionCardDisabled: {
    backgroundColor: `${Theme.colors.semantic.error}10`, // ✅ Kept at 10% (intentionally subtle)
    borderColor: `${Theme.colors.semantic.error}30`,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  permissionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  permissionIconEnabled: {
    backgroundColor: `${Theme.colors.semantic.success}20`, // ✅ Already correct at 20%
    borderColor: `${Theme.colors.semantic.success}40`,
  },
  permissionIconDisabled: {
    backgroundColor: `${Theme.colors.semantic.error}20`, // ✅ Already correct at 20%
    borderColor: `${Theme.colors.semantic.error}40`,
  },
  permissionInfo: {
    flex: 1,
    gap: 4,
  },
  permissionDescription: {
    lineHeight: 18,
  },
  settingsButton: {
    marginTop: Theme.spacing.s,
  },
  
  // Section styles
  section: {
    marginBottom: Theme.spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.m,
  },
  
  // Options card styles - ✅ Card elevation added via elevation="sm" prop
  optionsCard: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.m,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    flex: 1,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}20`,
  },
  optionInfo: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginLeft: Theme.spacing.m + 40 + Theme.spacing.m, // Left padding + icon + gap
  },
  
  // Info card styles - ✅ Card elevation added via elevation="sm" prop
  infoCard: {
    marginTop: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.info}10`, // ✅ Kept at 10% (intentionally subtle)
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.info}30`,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.s,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
});
