/**
 * VisionFlow AI - Notification Settings Screen (FIXED)
 * Manage push notification preferences
 * @module screens/settings/NotificationSettingsScreen
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Switch, Alert, Linking, AppState } from 'react-native';
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
      
      // FIXED: Use correct service method
      const prefs = await StorageService.getUserPreferences();
      
      if (prefs) {
        // FIXED: Map to correct properties from common.types.ts (NotificationPreferences)
        setRemindersEnabled(prefs.notifications?.reminderAlerts ?? true);
        setPatternsEnabled(prefs.notifications?.patternDiscoveries ?? true);
        setUpdatesEnabled(prefs.notifications?.projectUpdates ?? true);
        
        // FIXED: soundEnabled is in notifications, not display
        setSoundEnabled(prefs.notifications?.soundEnabled ?? true);
        
        // FIXED: hapticFeedbackEnabled is in display
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
   * Handles deep merging safely since StorageService uses shallow merge
   */
  const savePreference = async (
    key: keyof NotificationPreferences | keyof DisplayPreferences, 
    value: boolean, 
    section: 'notifications' | 'display'
  ) => {
    try {
      // 1. Get current complete state to avoid overwriting siblings
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

      // 2. FIXED: Use correct service method 'updateUserPreferences'
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
          <LoadingSpinner text="Loading settings..." />
        </Container>
      </Screen>
    );
  }

  const isPermissionGranted = permissionStatus === PermissionStatus.GRANTED;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Button 
            label="Back" 
            variant="ghost" 
            leftIcon="arrow-back" 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
        />
        <Text variant="h4" weight="600">Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <Container padding="m">
        {/* Permission Status Card */}
        <Card style={styles.permissionCard}>
          <View style={styles.permissionHeader}>
            <View style={[
              styles.iconCircle, 
              { backgroundColor: isPermissionGranted ? `${Theme.colors.semantic.success}20` : `${Theme.colors.semantic.error}20` }
            ]}>
              <Icon 
                name={isPermissionGranted ? "notifications" : "notifications-off"} 
                size="md" 
                color={isPermissionGranted ? Theme.colors.semantic.success : Theme.colors.semantic.error} 
              />
            </View>
            <View style={styles.permissionText}>
              <Text variant="h4">
                {isPermissionGranted ? 'Notifications Enabled' : 'Notifications Disabled'}
              </Text>
              <Text variant="caption" color="secondary">
                {isPermissionGranted 
                  ? 'VisionFlow can send you reminders and updates.' 
                  : 'Enable permissions in settings to receive alerts.'}
              </Text>
            </View>
          </View>
          
          {!isPermissionGranted && (
            <Button
              label="Open System Settings"
              variant="outline"
              size="small"
              onPress={openSystemSettings}
              style={styles.settingsButton}
            />
          )}
        </Card>

        <Text variant="h4" style={styles.sectionTitle}>Alert Types</Text>
        
        <Card style={styles.optionsCard}>
          {/* Reminders Toggle - FIXED: key mapped to reminderAlerts */}
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text variant="body" weight="600">Reminders</Text>
              <Text variant="caption" color="secondary">Get notified for due tasks</Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={(val) => {
                setRemindersEnabled(val);
                savePreference('reminderAlerts', val, 'notifications');
              }}
              trackColor={{ false: Theme.colors.background.tertiary, true: Theme.colors.primary[500] }}
              thumbColor={Theme.colors.text.primary}
              disabled={!isPermissionGranted}
            />
          </View>

          <View style={styles.divider} />

          {/* Patterns Toggle - FIXED: key mapped to patternDiscoveries */}
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text variant="body" weight="600">Pattern Insights</Text>
              <Text variant="caption" color="secondary">Weekly pattern discovery summaries</Text>
            </View>
            <Switch
              value={patternsEnabled}
              onValueChange={(val) => {
                setPatternsEnabled(val);
                savePreference('patternDiscoveries', val, 'notifications');
              }}
              trackColor={{ false: Theme.colors.background.tertiary, true: Theme.colors.primary[500] }}
              thumbColor={Theme.colors.text.primary}
              disabled={!isPermissionGranted}
            />
          </View>

          <View style={styles.divider} />

          {/* Updates Toggle - FIXED: key mapped to projectUpdates */}
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text variant="body" weight="600">Product Updates</Text>
              <Text variant="caption" color="secondary">News about new features</Text>
            </View>
            <Switch
              value={updatesEnabled}
              onValueChange={(val) => {
                setUpdatesEnabled(val);
                savePreference('projectUpdates', val, 'notifications');
              }}
              trackColor={{ false: Theme.colors.background.tertiary, true: Theme.colors.primary[500] }}
              thumbColor={Theme.colors.text.primary}
              disabled={!isPermissionGranted}
            />
          </View>
        </Card>

        <Text variant="h4" style={styles.sectionTitle}>Preferences</Text>

        <Card style={styles.optionsCard}>
            {/* Sound Toggle - FIXED: section is 'notifications' */}
            <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text variant="body" weight="600">In-App Sound</Text>
              <Text variant="caption" color="secondary">Play sounds for actions</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={(val) => {
                setSoundEnabled(val);
                savePreference('soundEnabled', val, 'notifications');
              }}
              trackColor={{ false: Theme.colors.background.tertiary, true: Theme.colors.primary[500] }}
              thumbColor={Theme.colors.text.primary}
            />
          </View>

          <View style={styles.divider} />

          {/* Haptics Toggle - FIXED: section is 'display' */}
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text variant="body" weight="600">Haptic Feedback</Text>
              <Text variant="caption" color="secondary">Vibrate on interactions</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={(val) => {
                setHapticsEnabled(val);
                savePreference('hapticFeedbackEnabled', val, 'display');
              }}
              trackColor={{ false: Theme.colors.background.tertiary, true: Theme.colors.primary[500] }}
              thumbColor={Theme.colors.text.primary}
            />
          </View>
        </Card>

      </Container>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
  },
  backButton: {
    paddingHorizontal: 0,
  },
  placeholder: {
    width: 48,
  },
  permissionCard: {
    marginBottom: Theme.spacing.l,
    gap: Theme.spacing.m,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    flex: 1,
    gap: 4,
  },
  settingsButton: {
    marginTop: Theme.spacing.s,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.m,
    marginLeft: Theme.spacing.xs,
  },
  optionsCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Theme.spacing.l,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.m,
  },
  optionInfo: {
    flex: 1,
    gap: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginLeft: Theme.spacing.m,
  },
});