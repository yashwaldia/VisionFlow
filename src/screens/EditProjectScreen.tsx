/**
 * VisionFlow AI - Edit Project Screen (v2.1 - Harmonized Edition)
 * Edit an existing project
 * 
 * @module screens/EditProjectScreen
 * 
 * CHANGELOG v2.1:
 * - ✅ Fixed footer paddingBottom to clear tab bar (uses theme.spacing.safeArea.bottomPadding)
 * - ✅ Fixed original icon container opacity (15% → 20%)
 * - ✅ Fixed project icon circle opacity (15% → 20%)
 * - ✅ Fixed category icon container opacity (15% → 20%)
 * - ✅ Added header shadow for separation
 * - ✅ Added card elevation for visual depth
 * - ✅ Added footer shadow for separation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProjectStackParamList } from '../types/navigation.types';
import { ReminderCategory } from '../types/reminder.types';
import { Theme } from '../constants/theme';
import {
  Screen,
  Container,
  Text,
  Button,
  Input,
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

  const project = getProjectById(projectId);

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
      <Screen>
        <Container padding="m">
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
        </Container>
      </Screen>
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
    <Screen>
      {/* Header - ✅ ENHANCED: Added shadow */}
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

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Container padding="m">
            {/* Original Project Preview - ✅ ENHANCED: Added elevation */}
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
                  <Input
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter project name"
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.inputGroup}>
                  <Text variant="caption" color="secondary" weight="600" style={styles.inputLabel}>
                    DESCRIPTION (OPTIONAL)
                  </Text>
                  <Input
                    value={description}
                    onChangeText={setDescription}
                    placeholder="What is this project about?"
                    multiline
                    numberOfLines={4}
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

            {/* Project Stats Info - ✅ ENHANCED: Added elevation */}
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

            {/* Info Card - ✅ ENHANCED: Added elevation */}
            <Card elevation="sm" style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
                <Text variant="caption" color="secondary" style={styles.infoText}>
                  Changes will update the project immediately. Reminders linked to this project will remain unchanged.
                </Text>
              </View>
            </Card>
          </Container>
                  <View style={styles.footer}>
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
          />
        </View>
        </ScrollView>

        {/* Footer Actions - ✅ ENHANCED: Fixed padding + added shadow */}

      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    paddingBottom:0,
  },
  
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
  
  // Scroll styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Theme.spacing.xl,
  },
  
  // Not found styles
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
    gap: Theme.spacing.m,
  },
  notFoundTitle: {
    marginTop: Theme.spacing.s,
  },
  notFoundButton: {
    marginTop: Theme.spacing.l,
  },
  
  // Original project preview - ✅ Card elevation added via elevation="sm" prop
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
    backgroundColor: `${Theme.colors.primary[500]}20`, // ✅ FIXED: 20% opacity (was 15%)
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  originalInfo: {
    flex: 1,
    gap: 4,
  },
  
  // Icon section - ✅ FIXED: Standardized opacity
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
    backgroundColor: `${Theme.colors.primary[500]}20`, // ✅ FIXED: 20% opacity (was 15%)
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
  
  // Form card styles - ✅ Card elevation added via elevation="sm" prop
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
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginVertical: Theme.spacing.m,
  },
  
  // Category grid styles - ✅ FIXED: Standardized opacity
categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Pushes items to the edges
    // Removed 'gap' to prevent width calculation conflicts
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
  categoryChipActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.l,
    backgroundColor: `${Theme.colors.primary[500]}20`, // ✅ FIXED: 20% opacity (was 15%)
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  categoryIconContainerActive: {
    backgroundColor: Theme.colors.background.primary,
    borderColor: Theme.colors.background.primary,
  },
  
  // Stats card styles - ✅ Card elevation added via elevation="sm" prop
  statsCard: {
    marginBottom: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.info}10`, // ✅ Kept at 10% (intentionally subtle)
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
  
  // Footer styles - ✅ ENHANCED: Fixed padding + added shadow
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    paddingBottom: Theme.spacing.m, // Just 16px
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
    ...Theme.shadows.sm, // ✅ ADDED: Footer shadow for depth
  },
  footerButton: {
    flex: 1,
  },
  footerButtonPrimary: {
    flex: 2,
  },
});
