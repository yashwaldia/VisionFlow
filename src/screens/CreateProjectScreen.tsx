/**
 * VisionFlow AI - Create Project Screen (v3.0 - UI Pattern Consistency)
 * Create a new project
 * 
 * @module screens/CreateProjectScreen
 * 
 * CHANGELOG v3.0:
 * - 🔧 Fixed category chips to match AIReviewModal pattern (consistent width)
 * - 🔧 Fixed button layout with wrapper pattern (equal width buttons)
 * - 🔧 Fixed footer positioning (absolute, outside ScrollView)
 * - 🔧 Removed bottom tab bar visibility issue
 * - 🔧 Simplified category chip design for consistency
 */


import React, { useState } from 'react';
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


type CreateProjectScreenProps = NativeStackScreenProps<ProjectStackParamList, 'CreateProject'>;


/**
 * Category configuration matching AIReviewModal pattern
 */
const categoryConfig = {
  [ReminderCategory.PERSONAL]: { icon: 'person', color: Theme.colors.primary[500] },
  [ReminderCategory.WORK]: { icon: 'briefcase', color: Theme.colors.semantic.info },
  [ReminderCategory.HEALTH]: { icon: 'fitness', color: Theme.colors.semantic.success },
  [ReminderCategory.MONEY]: { icon: 'cash', color: Theme.colors.semantic.warning },
};


/**
 * CreateProjectScreen Component
 */
export function CreateProjectScreen({ navigation, route }: CreateProjectScreenProps) {
  const { suggestedName, suggestedCategory } = route.params;
  const { createProject } = useProjects();

  const [name, setName] = useState(suggestedName || '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReminderCategory>(
    suggestedCategory || ReminderCategory.PERSONAL
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validation
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
      navigation.goBack();
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
    <Screen 
      safeAreaTop 
      safeAreaBottom={false} 
      disableTabBarSpacing={true}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
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

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Container padding="m">
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
                  <Input
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter project name"
                    autoFocus
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

            {/* Category Selection - Matching AIReviewModal Pattern */}
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
                        ...(isSelected ? [{ 
                          backgroundColor: config.color,
                          borderColor: config.color 
                        }] : []),
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
          </Container>
        </ScrollView>

        {/* Fixed Footer - Outside ScrollView */}
        <View style={styles.footerContainer}>
          <View style={styles.footer}>
            <View style={styles.footerButton}>
              <Button
                label="Cancel"
                variant="outline"
                size="large"
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
                leftIcon={isSaving ? undefined : "add-circle"}
                onPress={handleSave}
                disabled={isSaving || !isFormValid}
                loading={isSaving}
                fullWidth
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingBottom: 140, // Clearance for fixed footer
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
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginVertical: Theme.spacing.m,
  },

  // Category grid - Matching AIReviewModal pattern
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
    minWidth: 100, // Fixed minimum width for consistency
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

  // Fixed footer - Matching AIReviewModal pattern
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    ...Theme.shadows.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,
    paddingTop: Theme.spacing.m,
    paddingBottom: Theme.spacing.m,
  },
  // Equal width for both buttons
  footerButton: {
    flex: 1,
  },
});
