/**
 * VisionFlow AI - Edit Project Screen (v3.0 - Keyboard Nuclear Fix)
 * Edit an existing project
 * 
 * @module screens/EditProjectScreen
 * 
 * CHANGELOG v3.0:
 * - 🐛 FIXED: Removed KeyboardAvoidingView (was causing immediate keyboard dismiss)
 * - 🐛 FIXED: Using raw TextInput to bypass wrapper component issues
 * - 🐛 FIXED: Removed Screen component to prevent re-renders
 * - 🐛 FIXED: Fixed conditional style operators (changed && to ternary)
 * - ✅ Keyboard now stays open reliably
 */

import React, { useState, useEffect, useRef } from 'react';
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
import { ProjectStackParamList } from '../types/navigation.types';
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

type EditProjectScreenProps = NativeStackScreenProps<ProjectStackParamList, 'EditProject'>;

/**
 * Get category icon
 */
const getCategoryIcon = (category: ReminderCategory): string => {
  const icons: Record<string, string> = {
    [ReminderCategory.PERSONAL]: 'home',
    [ReminderCategory.WORK]: 'briefcase',
    [ReminderCategory.HEALTH]: 'fitness',
    [ReminderCategory.MONEY]: 'cash',
  };
  return icons[category] || 'pricetag';
};

/**
 * EditProjectScreen Component
 */
export function EditProjectScreen({ navigation, route }: EditProjectScreenProps) {
  const { projectId } = route.params;
  const { getProjectById, updateProject } = useProjects();
  const insets = useSafeAreaInsets();

  const project = getProjectById(projectId);

  const nameInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [category, setCategory] = useState<ReminderCategory>(
    project?.primaryCategory || ReminderCategory.PERSONAL
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setCategory(project.primaryCategory);
    }
  }, [project]);

  if (!project) {
    return (
      <View style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Icon name="alert-circle-outline" size="xl" color={Theme.colors.text.tertiary} />
          <Text variant="h3" align="center" style={styles.notFoundTitle}>
            Project not found
          </Text>
          <Text variant="body" color="secondary" align="center">
            This project may have been deleted
          </Text>
          <Button label="Go Back" onPress={() => navigation.goBack()} style={styles.notFoundButton} />
        </View>
      </View>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a project name.');
      return;
    }

    try {
      setIsSaving(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await updateProject(projectId, {
        name: name.trim(),
        description: description.trim() || undefined,
        primaryCategory: category,
        updatedAt: Date.now(),
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error: any) {
      console.error('[EditProject] Save failed:', error);
      Alert.alert('Save Failed', error.message || 'Failed to update project. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const hasChanges =
      name !== project.name ||
      description !== (project.description || '') ||
      category !== project.primaryCategory;

    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
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
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel} haptic="light" style={styles.headerButton}>
          <Icon name="close" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text variant="h4" weight="600">Edit Project</Text>
          <Text variant="caption" color="tertiary">
            Update project details
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
          {/* Original Project Preview */}
          <Card elevation="sm" style={styles.originalCard}>
            <View style={styles.originalHeader}>
              <Icon name="folder-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="caption" color="secondary" weight="600">ORIGINAL PROJECT</Text>
            </View>
            <View style={styles.originalContent}>
              <View style={styles.originalIconContainer}>
                <Icon name="folder" size="md" color={Theme.colors.primary[500]} />
              </View>
              <View style={styles.originalInfo}>
                <Text variant="body" weight="600" numberOfLines={1}>
                  {project.name}
                </Text>
                <Text variant="caption" color="tertiary">
                  {project.primaryCategory}
                </Text>
              </View>
            </View>
          </Card>

          {/* Project Icon */}
          <View style={styles.iconSection}>
            <View style={styles.iconWrapper}>
              <View style={styles.iconCircle}>
                <Icon name="folder" size="xl" color={Theme.colors.primary[500]} />
              </View>
            </View>
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
              {[
                ReminderCategory.PERSONAL,
                ReminderCategory.WORK,
                ReminderCategory.HEALTH,
                ReminderCategory.MONEY,
              ].map((cat) => {
                const isSelected = category === cat;
                const iconName = getCategoryIcon(cat);
                
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      setCategory(cat);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.categoryChip,
                      isSelected ? styles.categoryChipActive : {},
                    ]}
                  >
                    <View style={[
                      styles.categoryIconContainer,
                      isSelected ? styles.categoryIconContainerActive : {},
                    ]}>
                      <Icon 
                        name={iconName as any} 
                        size="md" 
                        color={isSelected ? Theme.colors.background.primary : Theme.colors.primary[500]} 
                      />
                    </View>
                    <Text
                      variant="body"
                      weight="700"
                      customColor={isSelected ? Theme.colors.background.primary : Theme.colors.text.primary}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Project Stats Info */}
          <Card elevation="sm" style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Icon name="information-circle-outline" size="sm" color={Theme.colors.semantic.info} />
              <Text variant="caption" color="secondary" weight="600">PROJECT STATS</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="caption" color="tertiary">Created</Text>
                <Text variant="body" weight="600">
                  {new Date(project.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text variant="caption" color="tertiary">Status</Text>
                <Text variant="body" weight="600">
                  {project.isArchived ? 'Archived' : 'Active'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Info Card */}
          <Card elevation="sm" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
              <Text variant="caption" color="secondary" style={styles.infoText}>
                Changes will update the project immediately. Reminders linked to this project will remain unchanged.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Theme.spacing.m }]}>
        <Button
          label="Cancel"
          variant="outline"
          size="large"
          onPress={handleCancel}
          style={styles.footerButton}
          disabled={isSaving}
        />
        <Button
          label={isSaving ? 'Saving...' : 'Save Changes'}
          variant="primary"
          size="large"
          leftIcon={isSaving ? undefined : "checkmark"}
          onPress={handleSave}
          style={styles.footerButtonPrimary}
          disabled={isSaving || !isFormValid}
          loading={isSaving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Content padding
  content: {
    padding: Theme.spacing.m,
  },

  // Not found styles
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
    gap: Theme.spacing.m,
    padding: Theme.spacing.m,
  },
  notFoundTitle: {
    marginTop: Theme.spacing.s,
  },
  notFoundButton: {
    marginTop: Theme.spacing.l,
  },

  // Original project preview
  originalCard: {
    marginBottom: Theme.spacing.l,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  originalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Theme.spacing.s,
  },
  originalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  originalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  originalInfo: {
    flex: 1,
    gap: 4,
  },

  // Icon section
  iconSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
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
    gap: Theme.spacing.m,
  },
  categoryChip: {
    width: '47%',
    alignItems: 'center',
    padding: Theme.spacing.m,
    borderRadius: Theme.borderRadius.l,
    backgroundColor: Theme.colors.background.secondary,
    borderWidth: 2,
    borderColor: Theme.colors.border.default,
    gap: Theme.spacing.s,
  },
  categoryChipActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.l,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  categoryIconContainerActive: {
    backgroundColor: Theme.colors.background.primary,
    borderColor: Theme.colors.background.primary,
  },

  // Stats card styles
  statsCard: {
    marginBottom: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.info}10`,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.info}30`,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Theme.spacing.m,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Theme.colors.border.light,
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

  // Footer styles
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
    ...Theme.shadows.sm,
  },
  footerButton: {
    flex: 1,
  },
  footerButtonPrimary: {
    flex: 2,
  },
});
