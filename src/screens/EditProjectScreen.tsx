/**
 * VisionFlow AI - Edit Project Screen (v5.0 - COMPLETE LAYOUT OVERHAUL)
 * Edit an existing project with matching Edit Reminder layout
 * 
 * @module screens/EditProjectScreen
 * 
 * CHANGELOG v5.0:
 * 🔥 COMPLETE LAYOUT OVERHAUL:
 * - ✅ FIXED: Category chips now horizontal with Card components (matching Edit Reminder)
 * - ✅ FIXED: Added glow effect on selected categories
 * - ✅ FIXED: Glassmorphism on form cards
 * - ✅ FIXED: BlurView footer with backdrop (iOS) and opaque footer (Android)
 * - ✅ FIXED: Removed broken icon section
 * - ✅ Layout now IDENTICAL to Edit Reminder screen
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
import { BlurView } from 'expo-blur';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation.types';
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

type EditProjectScreenProps = NativeStackScreenProps<RootStackParamList, 'EditProjectScreen'>;

/**
 * Category configuration (matching Edit Reminder)
 */
const categoryConfig = {
  [ReminderCategory.PERSONAL]: { icon: 'person', color: Theme.colors.primary[500] },
  [ReminderCategory.WORK]: { icon: 'briefcase', color: Theme.colors.semantic.info },
  [ReminderCategory.HEALTH]: { icon: 'fitness', color: Theme.colors.semantic.success },
  [ReminderCategory.MONEY]: { icon: 'cash', color: Theme.colors.semantic.warning },
};

/**
 * EditProjectScreen Component
 */
export function EditProjectScreen({ navigation, route }: EditProjectScreenProps) {
  const { project } = route.params;
  const { updateProject } = useProjects();
  const insets = useSafeAreaInsets();

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
        <View style={[styles.header, { paddingTop: insets.top + Theme.spacing.m }]}>
          <Pressable onPress={() => navigation.goBack()} haptic="light" style={styles.headerButton}>
            <Icon name="close" size="md" color={Theme.colors.text.primary} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text variant="h4" weight="600">Edit Project</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
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

      await updateProject(project.id, {
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
      {/* Header with Top Safe Area */}
      <View style={[styles.header, { paddingTop: insets.top + Theme.spacing.m }]}>
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
          {/* Original Project Preview with HUD variant (matching Edit Reminder) */}
          <Card 
            variant="hud"
            elevation="md"
            style={styles.originalCard}
          >
            <View style={styles.originalHeader}>
              <Icon name="folder-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="caption" color="secondary" weight="600">ORIGINAL PROJECT</Text>
            </View>
            <View style={styles.originalContent}>
              <View style={styles.originalIconContainer}>
                <Icon name="folder" size="lg" color={Theme.colors.primary[500]} />
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

          {/* Basic Information with Glass Card (matching Edit Reminder) */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="create-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Basic Information</Text>
            </View>
            
            <Card 
              variant="glass"
              elevation="md"
              style={styles.formCard}
            >
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
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  blurOnSubmit={false}
                  style={[styles.textInput, styles.textInputMultiline]}
                />
              </View>
            </Card>
          </View>

          {/* 🔥 FIXED: Category Selection with Glow (EXACTLY like Edit Reminder) */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="pricetag-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Primary Category</Text>
            </View>
            
            <View style={styles.categoryGrid}>
              {Object.entries(categoryConfig).map(([cat, config]) => {
                const isSelected = category === cat;
                return (
                  <Card
                    key={cat}
                    pressable
                    elevation={isSelected ? 'glow' : 'none'}
                    padding={10}
                    borderRadius={Theme.borderRadius.m}
                    onPress={() => {
                      setCategory(cat as ReminderCategory);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.categoryChipCard,
                      isSelected ? {
                        backgroundColor: config.color,
                        borderColor: config.color,
                        shadowColor: config.color,
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
                  </Card>
                );
              })}
            </View>
          </View>

          {/* Project Stats Info (matching Edit Reminder) */}
          <Card 
            variant="glass"
            elevation="sm"
            style={styles.statsCard}
          >
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

          {/* Info Card with Glass Variant (matching Edit Reminder) */}
          <Card 
            variant="glass"
            elevation="sm"
            style={styles.infoCard}
          >
            <View style={styles.infoRow}>
              <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
              <Text variant="caption" color="secondary" style={styles.infoText}>
                Changes will update the project immediately. Reminders linked to this project will remain unchanged.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* 🔥 FIXED: Footer with Enhanced Blur Effect (EXACTLY like Edit Reminder) */}
      <View style={[
        styles.footerContainer, 
        { paddingBottom: insets.bottom + Theme.spacing.m }
      ]}>
        {/* Stronger backdrop overlay */}
        <View style={styles.footerBackdrop} />
        
        {/* BlurView for iOS glassmorphism */}
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="dark" style={styles.footerBlur}>
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
                <View
                  style={
                    !isSaving && isFormValid
                      ? {
                          shadowColor: Theme.colors.primary[500],
                          shadowOpacity: 0.5,
                          shadowRadius: 12,
                          shadowOffset: { width: 0, height: 0 },
                          elevation: 8,
                          borderRadius: Theme.borderRadius.m,
                        }
                      : {}
                  }
                >
                  <Button
                    label={isSaving ? 'Saving...' : 'Save Changes'}
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
          </BlurView>
        ) : (
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
              <View
                style={
                  !isSaving && isFormValid
                    ? {
                        shadowColor: Theme.colors.primary[500],
                        shadowOpacity: 0.5,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: 8,
                        borderRadius: Theme.borderRadius.m,
                      }
                    : {}
                }
              >
                <Button
                  label={isSaving ? 'Saving...' : 'Save Changes'}
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
        )}
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
    paddingBottom: Theme.spacing.m,
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

  // Original project preview with HUD variant
  originalCard: {
    marginBottom: Theme.spacing.l,
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
    width: 48,
    height: 48,
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

  // Form card with glass variant
  formCard: {
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}40`,
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
  textInputMultiline: {
    height: 96,
    paddingTop: Theme.spacing.m,
    paddingBottom: Theme.spacing.m,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginVertical: Theme.spacing.m,
    opacity: 0.5,
  },

  // 🔥 FIXED: Category chips with Card component (matching Edit Reminder)
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
  },
  categoryChipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 100,
    borderWidth: 2,
    borderColor: Theme.colors.border.medium,
  },

  // Stats card with glass variant
  statsCard: {
    marginBottom: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.info}10`,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.info}40`,
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

  // Info card with glass variant
  infoCard: {
    marginTop: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.info}10`,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.info}40`,
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

  // 🔥 FIXED: Footer with enhanced blur effect (matching Edit Reminder)
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
  },
  footerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'ios' 
      ? 'rgba(18, 18, 18, 0.7)'  // Semi-opaque for iOS (under BlurView)
      : 'rgba(18, 18, 18, 0.95)', // More opaque for Android (no blur)
  },
  footerBlur: {
    paddingHorizontal: Theme.spacing.m,
    paddingTop: Theme.spacing.m,
  },
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    paddingHorizontal: Platform.OS === 'android' ? Theme.spacing.m : 0,
    paddingTop: Platform.OS === 'android' ? Theme.spacing.m : 0,
  },
  footerButton: {
    flex: 1,
  },
});
