/**
 * VisionFlow AI - Theme Settings Screen
 * Customize app appearance and display preferences
 * @module screens/settings/ThemeSettingsScreen
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Switch, ScrollView, Alert, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types/navigation.types';
import { Theme } from '../../constants/theme';
import { UserPreferences, DisplayPreferences } from '../../types/common.types';
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
import * as StorageService from '../../services/storage.service';

type ThemeSettingsScreenProps = NativeStackScreenProps<SettingsStackParamList, 'ThemeSettings'>;

export function ThemeSettingsScreen({ navigation }: ThemeSettingsScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Theme State
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  
  // Display Preference States
  const [compactMode, setCompactMode] = useState(false);
  const [showCategoryEmojis, setShowCategoryEmojis] = useState(true);
  const [showPatternLabels, setShowPatternLabels] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Load saved preferences
  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      const prefs = await StorageService.getUserPreferences();
      
      if (prefs) {
        setThemeMode(prefs.theme ?? 'auto');
        
        // Display Preferences
        const display = prefs.display || {};
        setCompactMode(display.compactMode ?? false);
        setShowCategoryEmojis(display.showCategoryEmojis ?? true);
        setShowPatternLabels(display.showPatternLabels ?? true);
        setAnimationsEnabled(display.animationsEnabled ?? true);
      }
    } catch (error) {
      console.error('[ThemeSettings] Failed to load preferences:', error);
      Alert.alert('Error', 'Failed to load display settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  /**
   * Save preference helper
   */
  const savePreference = async (
    key: keyof DisplayPreferences | 'theme',
    value: any,
    isRootPref: boolean = false
  ) => {
    try {
      const currentPrefs = await StorageService.getUserPreferences();
      let updates: Partial<UserPreferences> = {};

      if (isRootPref) {
        updates = { [key]: value };
      } else {
        updates = {
          display: {
            ...currentPrefs.display,
            [key as keyof DisplayPreferences]: value,
          } as DisplayPreferences
        };
      }

      await StorageService.updateUserPreferences(updates);
    } catch (error) {
      console.error('[ThemeSettings] Save failed:', error);
    }
  };

  const handleThemeChange = async (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
    await savePreference('theme', mode, true);
  };

  const handleDisplayToggle = async (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    key: keyof DisplayPreferences,
    value: boolean
  ) => {
    setter(value);
    await savePreference(key, value);
  };

  if (isLoading) {
    return (
      <Screen>
        <Container center>
          <LoadingSpinner text="Loading appearance settings..." />
        </Container>
      </Screen>
    );
  }

  const renderThemeOption = (mode: 'light' | 'dark' | 'auto', icon: string, label: string) => {
    const isSelected = themeMode === mode;
    const activeColor = Theme.colors.primary[500];
    const inactiveBorder = Theme.colors.border.medium;
    const inactiveBg = Theme.colors.background.tertiary;

    return (
      <Pressable
        onPress={() => handleThemeChange(mode)}
        style={[
          styles.themeOption,
          { 
            borderColor: isSelected ? activeColor : inactiveBorder,
            backgroundColor: isSelected ? `${activeColor}15` : inactiveBg
          }
        ]}
        haptic="light"
      >
        <Icon 
          name={icon as any} 
          size="md" 
          color={isSelected ? activeColor : Theme.colors.text.secondary} 
        />
        <Text 
          variant="body" 
          weight={isSelected ? "600" : "400"}
          customColor={isSelected ? activeColor : Theme.colors.text.secondary}
          style={styles.themeLabel}
        >
          {label}
        </Text>
        {isSelected && (
          <View style={styles.checkIcon}>
            <Icon name="checkmark-circle" size="sm" color={activeColor} />
          </View>
        )}
      </Pressable>
    );
  };

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
        <Text variant="h4" weight="600">Appearance</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Container padding="m">
          
          {/* Theme Section */}
          <Text variant="h4" style={styles.sectionTitle}>App Theme</Text>
          <Card style={styles.card}>
            <View style={styles.themeGrid}>
              {renderThemeOption('light', 'sunny-outline', 'Light')}
              {renderThemeOption('dark', 'moon-outline', 'Dark')}
              {renderThemeOption('auto', 'phone-portrait-outline', 'System')}
            </View>
            <View style={styles.infoBox}>
              <Icon name="information-circle-outline" size="sm" color={Theme.colors.text.tertiary} />
              <Text variant="caption" color="tertiary" style={styles.infoText}>
                The app is currently optimized for Dark Mode. Light mode support is in beta.
              </Text>
            </View>
          </Card>

          {/* Interface Section */}
          <Text variant="h4" style={styles.sectionTitle}>Interface</Text>
          <Card style={styles.optionsCard}>
            
            {/* Compact Mode */}
            <View style={styles.optionRow}>
              <View style={styles.optionInfo}>
                <Text variant="body" weight="600">Compact Mode</Text>
                <Text variant="caption" color="secondary">Decrease spacing and font sizes</Text>
              </View>
              <Switch
                value={compactMode}
                onValueChange={(val) => handleDisplayToggle(setCompactMode, 'compactMode', val)}
                trackColor={{ false: Theme.colors.background.tertiary, true: Theme.colors.primary[500] }}
                thumbColor={Theme.colors.text.primary}
              />
            </View>

            <View style={styles.divider} />

            {/* Animations */}
            <View style={styles.optionRow}>
              <View style={styles.optionInfo}>
                <Text variant="body" weight="600">Animations</Text>
                <Text variant="caption" color="secondary">Enable fluid transitions and effects</Text>
              </View>
              <Switch
                value={animationsEnabled}
                onValueChange={(val) => handleDisplayToggle(setAnimationsEnabled, 'animationsEnabled', val)}
                trackColor={{ false: Theme.colors.background.tertiary, true: Theme.colors.primary[500] }}
                thumbColor={Theme.colors.text.primary}
              />
            </View>
          </Card>

          {/* Content Section */}
          <Text variant="h4" style={styles.sectionTitle}>Content</Text>
          <Card style={styles.optionsCard}>
            
            {/* Category Emojis */}
            <View style={styles.optionRow}>
              <View style={styles.optionInfo}>
                <Text variant="body" weight="600">Category Emojis</Text>
                <Text variant="caption" color="secondary">Show icons next to categories</Text>
              </View>
              <Switch
                value={showCategoryEmojis}
                onValueChange={(val) => handleDisplayToggle(setShowCategoryEmojis, 'showCategoryEmojis', val)}
                trackColor={{ false: Theme.colors.background.tertiary, true: Theme.colors.primary[500] }}
                thumbColor={Theme.colors.text.primary}
              />
            </View>

            <View style={styles.divider} />

            {/* Pattern Labels */}
            <View style={styles.optionRow}>
              <View style={styles.optionInfo}>
                <Text variant="body" weight="600">Pattern Labels</Text>
                <Text variant="caption" color="secondary">Show names on pattern overlays</Text>
              </View>
              <Switch
                value={showPatternLabels}
                onValueChange={(val) => handleDisplayToggle(setShowPatternLabels, 'showPatternLabels', val)}
                trackColor={{ false: Theme.colors.background.tertiary, true: Theme.colors.primary[500] }}
                thumbColor={Theme.colors.text.primary}
              />
            </View>
          </Card>

        </Container>
      </ScrollView>
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
  content: {
    paddingBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.m,
    marginLeft: Theme.spacing.xs,
    marginTop: Theme.spacing.m,
  },
  card: {
    padding: Theme.spacing.m,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Theme.spacing.m,
    borderRadius: Theme.borderRadius.m,
    borderWidth: 2,
    gap: Theme.spacing.s,
    position: 'relative',
  },
  themeLabel: {
    fontSize: Theme.typography.fontSize.caption,
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  infoBox: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
    marginTop: Theme.spacing.m,
    paddingTop: Theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
  },
  infoText: {
    flex: 1,
  },
  optionsCard: {
    padding: 0,
    overflow: 'hidden',
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