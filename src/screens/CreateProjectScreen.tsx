/**
 * VisionFlow AI - Create Project Screen (v4.0 - Safe Area & Navigation Fix)
 * Create a new project
 * 
 * @module screens/CreateProjectScreen
 * 
 * CHANGELOG v4.0:
 * - ✅ CRITICAL FIX: Added top safe area padding to header
 * - ✅ CRITICAL FIX: Updated type to use RootStackParamList
 * - ✅ CRITICAL FIX: Navigation now matches Reminder pattern (explicit route)
 * - ✅ LAYOUT FIX: Header paddingTop uses safe area insets
 * - ✅ All fixes from v3.4 preserved
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation.types'; // ✅ CHANGED
import { ReminderCategory } from '../types/reminder.types';
import { Theme } from '../constants/theme';
import {
  Text,
  Button,
  Card,
  Icon,
  Pressable,
} from '../components';
import { useProjects } from '../hooks/useProjects';
import * as Haptics from 'expo-haptics';

type CreateProjectScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateProjectScreen'>; // ✅ CHANGED

/**
 * Category configuration
 */
const categoryConfig = {
  [ReminderCategory.PERSONAL]: { icon: 'home', color: Theme.colors.primary[500] },
  [ReminderCategory.WORK]: { icon: 'briefcase', color: Theme.colors.semantic.info },
  [ReminderCategory.HEALTH]: { icon: 'fitness', color: Theme.colors.semantic.success },
  [ReminderCategory.MONEY]: { icon: 'cash', color: Theme.colors.semantic.warning },
};

/**
 * CreateProjectScreen Component
 */
export function CreateProjectScreen({ navigation, route }: CreateProjectScreenProps) {
  const { suggestedName, suggestedCategory } = route.params || {}; // ✅ Added optional chaining
  const { createProject } = useProjects();
  const insets = useSafeAreaInsets();

  const nameInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  const [name, setName] = useState(suggestedName || '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReminderCategory>(
    suggestedCategory || ReminderCategory.PERSONAL
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a project name.');
      return;
    }

    try {
      setIsSaving(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await createProject({
        id: `project_${Date.now()}`,
        name: name.trim(),
        description: description.trim() || undefined,
        primaryCategory: category,
        isArchived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // ✅ FIXED: Navigate explicitly to ProjectList (matches Reminder pattern)
      navigation.navigate('MainApp', {
        screen: 'ProjectsTab',
        params: {
          screen: 'ProjectList',
          params: {},
        },
      } as any);
    } catch (error: any) {
      console.error('[CreateProject] Save failed:', error);
      Alert.alert('Save Failed', error.message || 'Failed to create project. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (name.trim() || description.trim()) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to discard this project?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const isFormValid = name.trim();

  return (
    <View style={styles.container}>
      {/* Header - ✅ FIXED: Added top safe area */}
      <View style={[styles.header, { paddingTop: insets.top + Theme.spacing.m }]}>
        <Pressable onPress={handleCancel} haptic="light" style={styles.headerButton}>
          <Icon name="close" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text variant="h4" weight="600">New Project</Text>
          <Text variant="caption" color="tertiary">
            Create a project to organize reminders
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Project Icon Preview */}
          <View style={styles.iconSection}>
            <View style={styles.iconWrapper}>
              <View style={styles.iconCircle}>
                <Icon name="folder" size="xl" color={Theme.colors.primary[500]} />
              </View>
            </View>
            <Text variant="caption" color="tertiary" align="center">
              All projects use the folder icon
            </Text>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="create-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Basic Information</Text>
            </View>
            
            <Card elevation="sm" style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text variant="caption" color="secondary" weight="600" style={styles.inputLabel}>
                  PROJECT NAME *
                </Text>
                <TextInput
                  ref={nameInputRef}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter project name"
                  placeholderTextColor={Theme.colors.text.tertiary}
                  autoFocus
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => descriptionInputRef.current?.focus()}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.inputGroup}>
                <Text variant="caption" color="secondary" weight="600" style={styles.inputLabel}>
                  DESCRIPTION (OPTIONAL)
                </Text>
                <TextInput
                  ref={descriptionInputRef}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What is this project about?"
                  placeholderTextColor={Theme.colors.text.tertiary}
                  blurOnSubmit={false}
                  style={styles.textInput}
                />
              </View>
            </Card>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="pricetag-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Primary Category</Text>
            </View>
            
            <View style={styles.categoryGrid}>
              {Object.entries(categoryConfig).map(([cat, config]) => {
                const isSelected = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      setCategory(cat as ReminderCategory);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    haptic="light"
                    style={[
                      styles.categoryChip,
                      isSelected ? {
                        backgroundColor: config.color,
                        borderColor: config.color,
                      } : {},
                    ]}
                  >
                    <Icon 
                      name={config.icon as any} 
                      size="sm" 
                      color={isSelected ? Theme.colors.background.primary : config.color} 
                    />
                    <Text
                      variant="caption"
                      weight="700"
                      customColor={
                        isSelected
                          ? Theme.colors.background.primary
                          : Theme.colors.text.primary
                      }
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Info Cards */}
          <View style={styles.infoCardsContainer}>
            <Card elevation="sm" style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
                <Text variant="caption" color="secondary" style={styles.infoText}>
                  Projects help you organize related reminders. You can assign reminders to this project later.
                </Text>
              </View>
            </Card>

            <Card elevation="sm" style={styles.benefitsCard}>
              <View style={styles.benefitsHeader}>
                <Icon name="checkmark-circle" size="sm" color={Theme.colors.semantic.success} />
                <Text variant="caption" color="secondary" weight="600">BENEFITS</Text>
              </View>
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <View style={styles.benefitDot} />
                  <Text variant="caption" color="secondary">Group related reminders together</Text>
                </View>
                <View style={styles.benefitItem}>
                  <View style={styles.benefitDot} />
                  <Text variant="caption" color="secondary">Track progress by project</Text>
                </View>
                <View style={styles.benefitItem}>
                  <View style={styles.benefitDot} />
                  <Text variant="caption" color="secondary">View analytics per project</Text>
                </View>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Footer - Fixed at bottom */}
      <View style={[styles.footerContainer, { paddingBottom: insets.bottom + Theme.spacing.m }]}>
        <View style={styles.footer}>
          <View style={styles.footerButton}>
            <Button
              label="Cancel"
              variant="outline"
              size="large"
              leftIcon="close"
              onPress={handleCancel}
              disabled={isSaving}
              fullWidth
            />
          </View>
          <View style={styles.footerButton}>
            <Button
              label={isSaving ? 'Creating...' : 'Create Project'}
              variant="primary"
              size="large"
              leftIcon={isSaving ? undefined : "checkmark"}
              onPress={handleSave}
              disabled={isSaving || !isFormValid}
              loading={isSaving}
              fullWidth
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },

  // Header styles - ✅ FIXED: Top padding now dynamic with safe area
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.m,
    paddingBottom: Theme.spacing.m, // ✅ Separate bottom padding
    // paddingTop is dynamic (applied inline with insets.top)
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 140,
  },

  // Content padding
  content: {
    padding: Theme.spacing.m,
  },

  // Icon section
  iconSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
    gap: Theme.spacing.s,
  },
  iconWrapper: {
    position: 'relative',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    borderWidth: 2,
    borderColor: `${Theme.colors.primary[500]}30`,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Form card styles
  formCard: {
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  inputGroup: {
    gap: Theme.spacing.xs,
  },
  inputLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 10,
  },
  textInput: {
    height: 48,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    paddingHorizontal: Theme.spacing.m,
    fontSize: 16,
    color: Theme.colors.text.primary,
    fontFamily: Theme.typography.fontFamily.mono,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginVertical: Theme.spacing.m,
  },

  // Category grid styles
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 2,
    borderColor: Theme.colors.border.medium,
    minWidth: 100,
  },

  // Info cards styles
  infoCardsContainer: {
    gap: Theme.spacing.m,
  },
  infoCard: {
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

  // Benefits card styles
  benefitsCard: {
    backgroundColor: `${Theme.colors.semantic.success}10`,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.success}30`,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Theme.spacing.s,
  },
  benefitsList: {
    gap: Theme.spacing.xs,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.semantic.success,
  },

  // Footer styles
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    ...Theme.shadows.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,
    paddingTop: Theme.spacing.m,
    paddingBottom: Theme.spacing.m,
  },
  footerButton: {
    flex: 1,
  },
});
