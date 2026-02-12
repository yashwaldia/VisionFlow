/**
 * VisionFlow AI - Notification Settings Screen (v3.0 - Hidden Inside UI Edition)
 * Enhanced cyberpunk aesthetic with monospace and italic typography
 * 
 * @module screens/settings/NotificationSettingsScreen
 * 
 * CHANGELOG v3.0:
 * - ✅ UI ENHANCEMENT: Monospace fonts for technical labels
 * - ✅ UI ENHANCEMENT: Italic text for descriptive content
 * - ✅ All v2.1 harmonized features preserved
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
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} haptic="light" style={styles.headerButton}>
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          {/* ✅ ENHANCED: Monospace header */}
          <Text variant="h4" weight="600" mono>NOTIFICATIONS</Text>
          {/* ✅ NEW: Italic subtitle */}
          <Text variant="caption" color="tertiary" italic>Manage your alerts</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="m">
          {/* Permission Status Card */}
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
                {/* ✅ ENHANCED: Monospace permission status */}
                <Text variant="h4" mono>
                  {isPermissionGranted ? 'NOTIFICATIONS_ENABLED' : 'NOTIFICATIONS_DISABLED'}
                </Text>
                {/* ✅ NEW: Italic permission description */}
                <Text variant="caption" color="secondary" italic style={styles.permissionDescription}>
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
              {/* ✅ ENHANCED: Monospace section header */}
              <Text variant="h4" mono>ALERT_TYPES</Text>
            </View>
            
            <Card elevation="sm" style={styles.optionsCard}>
              {/* Reminders Toggle */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={styles.optionIconContainer}>
                    <Icon name="alarm" size="sm" color={Theme.colors.primary[500]} />
                  </View>
                  <View style={styles.optionInfo}>
                    {/* ✅ ENHANCED: Monospace option label */}
                    <Text variant="body" weight="600" mono>REMINDERS</Text>
                    {/* ✅ NEW: Italic option description */}
                    <Text variant="caption" color="secondary" italic>Get notified for due tasks</Text>
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
                  <View style={[styles.optionIconContainer, styles.disabledOption]}>
                    <Icon name="analytics" size="sm" color={Theme.colors.text.tertiary} />
                  </View>
                  <View style={styles.optionInfo}>
                    <View style={styles.optionTitleRow}>
                      {/* ✅ ENHANCED: Monospace option label */}
                      <Text variant="body" weight="600" mono color="secondary">PATTERN_INSIGHTS</Text>
                      <View style={styles.comingSoonBadge}>
                        {/* ✅ ENHANCED: Monospace badge */}
                        <Text variant="caption" weight="700" mono customColor={Theme.colors.semantic.info} style={styles.comingSoonText}>
                          COMING_SOON
                        </Text>
                      </View>
                    </View>
                    {/* ✅ NEW: Italic option description */}
                    <Text variant="caption" color="tertiary" italic>Weekly pattern discoveries</Text>
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
                  disabled={true}
                />
              </View>

              <View style={styles.divider} />

              {/* Updates Toggle */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIconContainer, styles.disabledOption]}>
                    <Icon name="gift" size="sm" color={Theme.colors.text.tertiary} />
                  </View>
                  <View style={styles.optionInfo}>
                    <View style={styles.optionTitleRow}>
                      {/* ✅ ENHANCED: Monospace option label */}
                      <Text variant="body" weight="600" mono color="secondary">PRODUCT_UPDATES</Text>
                      <View style={styles.comingSoonBadge}>
                        {/* ✅ ENHANCED: Monospace badge */}
                        <Text variant="caption" weight="700" mono customColor={Theme.colors.semantic.info} style={styles.comingSoonText}>
                          COMING_SOON
                        </Text>
                      </View>
                    </View>
                    {/* ✅ NEW: Italic option description */}
                    <Text variant="caption" color="tertiary" italic>News about new features</Text>
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
                  disabled={true}
                />
              </View>
            </Card>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="options-outline" size="sm" color={Theme.colors.primary[500]} />
              {/* ✅ ENHANCED: Monospace section header */}
              <Text variant="h4" mono>EXPERIENCE</Text>
            </View>

            <Card elevation="sm" style={styles.optionsCard}>
              {/* Sound Toggle */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={styles.optionIconContainer}>
                    <Icon name="volume-high" size="sm" color={Theme.colors.semantic.success} />
                  </View>
                  <View style={styles.optionInfo}>
                    {/* ✅ ENHANCED: Monospace option label */}
                    <Text variant="body" weight="600" mono>IN-APP_SOUND</Text>
                    {/* ✅ NEW: Italic option description */}
                    <Text variant="caption" color="secondary" italic>Play sounds for actions</Text>
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
                    {/* ✅ ENHANCED: Monospace option label */}
                    <Text variant="body" weight="600" mono>HAPTIC_FEEDBACK</Text>
                    {/* ✅ NEW: Italic option description */}
                    <Text variant="caption" color="secondary" italic>Vibrate on interactions</Text>
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

          {/* Info Card */}
          <Card elevation="sm" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
              {/* ✅ NEW: Italic info text */}
              <Text variant="caption" color="secondary" italic style={styles.infoText}>
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
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
    ...Theme.shadows.sm,
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
  
  // Scroll styles
  scrollContent: {
    paddingBottom: 120,
  },
  
  // Permission card styles
  permissionCard: {
    marginBottom: Theme.spacing.l,
    borderWidth: 2,
  },
  permissionCardEnabled: {
    backgroundColor: `${Theme.colors.semantic.success}10`,
    borderColor: `${Theme.colors.semantic.success}30`,
  },
  permissionCardDisabled: {
    backgroundColor: `${Theme.colors.semantic.error}10`,
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
    backgroundColor: `${Theme.colors.semantic.success}20`,
    borderColor: `${Theme.colors.semantic.success}40`,
  },
  permissionIconDisabled: {
    backgroundColor: `${Theme.colors.semantic.error}20`,
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
  
  // Options card styles
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
  disabledOption: {
    opacity: 0.5,
  },
  optionInfo: {
    flex: 1,
    gap: 2,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  comingSoonBadge: {
    backgroundColor: `${Theme.colors.semantic.info}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.s,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.info}40`,
  },
  comingSoonText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginLeft: Theme.spacing.m + 40 + Theme.spacing.m,
  },
  
  // Info card styles
  infoCard: {
    marginTop: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.info}10`,
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
