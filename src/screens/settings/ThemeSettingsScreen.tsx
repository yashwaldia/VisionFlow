/**
 * VisionFlow AI - Theme Settings Screen (v2.1 - Harmonized Edition)
 * Customize app appearance and display preferences
 * 
 * @module screens/settings/ThemeSettingsScreen
 * 
 * CHANGELOG v2.1:
 * - ✅ Fixed theme icon container opacity (15% → 20%)
 * - ✅ Added header shadow for separation
 * - ✅ Added card elevation for visual depth
 * - ✅ Scroll padding already adequate for tab bar (120px)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
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

  const renderThemeOption = (
    mode: 'light' |'dark' | 'auto', 
    icon: string, 
    label: string,
    description: string
  ) => {
    const isSelected = themeMode === mode;
    const activeColor = Theme.colors.primary[500];

    return (
      <Pressable
        onPress={() => handleThemeChange(mode)}
        style={[
          styles.themeOption,
          isSelected ? styles.themeOptionActive : {},
        ]}
        haptic="light"
      >
        <View style={[
          styles.themeIconContainer,
          isSelected ? styles.themeIconContainerActive : {},
        ]}>
          <Icon 
            name={icon as any} 
            size="lg" 
            color={isSelected ? Theme.colors.background.primary : Theme.colors.primary[500]} 
          />
        </View>
        <Text 
          variant="body" 
          weight="700"
          customColor={isSelected ? Theme.colors.background.primary : Theme.colors.text.primary}
        >
          {label}
        </Text>
        <Text 
          variant="caption" 
          align="center"
          customColor={isSelected ? `${Theme.colors.background.primary}CC` : Theme.colors.text.tertiary}
          style={styles.themeDescription}
        >
          {description}
        </Text>
        {isSelected && (
          <View style={styles.checkIconBadge}>
            <Icon name="checkmark-circle" size="sm" color={Theme.colors.semantic.success} />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <Screen>
      {/* Header - ✅ ENHANCED: Added shadow */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} haptic="light" style={styles.headerButton}>
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text variant="h4" weight="600">Appearance</Text>
          <Text variant="caption" color="tertiary">Customize your experience</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="m">
          
          {/* Theme Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="color-palette-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">App Theme</Text>
            </View>
            
            <View style={styles.themeGrid}>
              {renderThemeOption('light', 'sunny', 'Light', 'Bright & clean')}
              {renderThemeOption('dark', 'moon', 'Dark', 'Easy on eyes')}
              {renderThemeOption('auto', 'phone-portrait', 'Auto', 'Match system')}
            </View>

            <Card elevation="sm" style={styles.themeInfoCard}>
              <View style={styles.infoRow}>
                <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
                <Text variant="caption" color="secondary" style={styles.infoText}>
                  The app is currently optimized for Dark Mode. Light mode support is in beta and may have visual inconsistencies.
                </Text>
              </View>
            </Card>
          </View>

          {/* Interface Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="options-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Interface</Text>
            </View>
            
            <Card elevation="sm" style={styles.optionsCard}>
              
              {/* Compact Mode */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={styles.optionIconContainer}>
                    <Icon name="contract" size="sm" color={Theme.colors.primary[500]} />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text variant="body" weight="600">Compact Mode</Text>
                    <Text variant="caption" color="secondary">Reduce spacing and sizes</Text>
                  </View>
                </View>
                <Switch
                  value={compactMode}
                  onValueChange={(val) => handleDisplayToggle(setCompactMode, 'compactMode', val)}
                  trackColor={{ 
                    false: Theme.colors.background.tertiary, 
                    true: `${Theme.colors.primary[500]}80` 
                  }}
                  thumbColor={compactMode ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
                  ios_backgroundColor={Theme.colors.background.tertiary}
                />
              </View>

              <View style={styles.divider} />

              {/* Animations */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={styles.optionIconContainer}>
                    <Icon name="flash" size="sm" color={Theme.colors.semantic.warning} />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text variant="body" weight="600">Animations</Text>
                    <Text variant="caption" color="secondary">Fluid transitions and effects</Text>
                  </View>
                </View>
                <Switch
                  value={animationsEnabled}
                  onValueChange={(val) => handleDisplayToggle(setAnimationsEnabled, 'animationsEnabled', val)}
                  trackColor={{ 
                    false: Theme.colors.background.tertiary, 
                    true: `${Theme.colors.primary[500]}80` 
                  }}
                  thumbColor={animationsEnabled ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
                  ios_backgroundColor={Theme.colors.background.tertiary}
                />
              </View>
            </Card>
          </View>

          {/* Content Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="eye-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Content Display</Text>
            </View>
            
            <Card elevation="sm" style={styles.optionsCard}>
              
              {/* Category Emojis */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={styles.optionIconContainer}>
                    <Icon name="happy" size="sm" color={Theme.colors.semantic.warning} />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text variant="body" weight="600">Category Emojis</Text>
                    <Text variant="caption" color="secondary">Show visual category icons</Text>
                  </View>
                </View>
                <Switch
                  value={showCategoryEmojis}
                  onValueChange={(val) => handleDisplayToggle(setShowCategoryEmojis, 'showCategoryEmojis', val)}
                  trackColor={{ 
                    false: Theme.colors.background.tertiary, 
                    true: `${Theme.colors.primary[500]}80` 
                  }}
                  thumbColor={showCategoryEmojis ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
                  ios_backgroundColor={Theme.colors.background.tertiary}
                />
              </View>

              <View style={styles.divider} />

              {/* Pattern Labels */}
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <View style={styles.optionIconContainer}>
                    <Icon name="grid" size="sm" color={Theme.colors.semantic.info} />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text variant="body" weight="600">Pattern Labels</Text>
                    <Text variant="caption" color="secondary">Display overlay pattern names</Text>
                  </View>
                </View>
                <Switch
                  value={showPatternLabels}
                  onValueChange={(val) => handleDisplayToggle(setShowPatternLabels, 'showPatternLabels', val)}
                  trackColor={{ 
                    false: Theme.colors.background.tertiary, 
                    true: `${Theme.colors.primary[500]}80` 
                  }}
                  thumbColor={showPatternLabels ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
                  ios_backgroundColor={Theme.colors.background.tertiary}
                />
              </View>
            </Card>
          </View>

          {/* Preview Card - ✅ ENHANCED: Added elevation */}
          <Card elevation="sm" style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Icon name="eye" size="sm" color={Theme.colors.semantic.success} />
              <Text variant="caption" color="secondary" weight="600">LIVE PREVIEW</Text>
            </View>
            <View style={styles.previewContent}>
              <Text variant="body" color="secondary" align="center">
                Changes are applied immediately. Restart the app if some settings don't take effect.
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
  
  // Theme grid styles - ✅ FIXED: Standardized opacity
  themeGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
    marginBottom: Theme.spacing.m,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.s,
    borderRadius: Theme.borderRadius.l,
    backgroundColor: Theme.colors.background.secondary,
    borderWidth: 2,
    borderColor: Theme.colors.border.default,
    gap: Theme.spacing.xs,
    position: 'relative',
  },
  themeOptionActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  themeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: Theme.borderRadius.l,
    backgroundColor: `${Theme.colors.primary[500]}20`, // ✅ FIXED: 20% opacity (was 15%)
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  themeIconContainerActive: {
    backgroundColor: Theme.colors.background.primary,
    borderColor: Theme.colors.background.primary,
  },
  themeDescription: {
    fontSize: 11,
    lineHeight: 14,
  },
  checkIconBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: 12,
  },
  
  // Theme info card - ✅ Card elevation added via elevation="sm" prop
  themeInfoCard: {
    backgroundColor: `${Theme.colors.semantic.info}10`, // ✅ Kept at 10% (intentionally subtle)
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.info}30`,
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
  
  // Info styles
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.s,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
  
  // Preview card styles - ✅ Card elevation added via elevation="sm" prop
  previewCard: {
    marginTop: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.success}10`, // ✅ Kept at 10% (intentionally subtle)
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.success}30`,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Theme.spacing.s,
  },
  previewContent: {
    paddingTop: Theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: `${Theme.colors.semantic.success}20`,
  },
});
