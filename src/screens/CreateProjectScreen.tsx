/**
 * VisionFlow AI - Create Project Screen (Professional v2.0)
 * Create a new project
 * 
 * @module screens/CreateProjectScreen
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
    <Screen>
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
              
              <Card style={styles.formCard}>
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

            {/* Info Cards */}
            <View style={styles.infoCardsContainer}>
              <Card style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
                  <Text variant="caption" color="secondary" style={styles.infoText}>
                    Projects help you organize related reminders. You can assign reminders to this project later.
                  </Text>
                </View>
              </Card>

              <Card style={styles.benefitsCard}>
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

        {/* Footer Actions */}
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
            label={isSaving ? 'Creating...' : 'Create Project'}
            variant="primary"
            size="large"
            leftIcon={isSaving ? undefined : "add-circle"}
            onPress={handleSave}
            style={styles.footerButtonPrimary}
            disabled={isSaving || !isFormValid}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Container styles
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
    backgroundColor: `${Theme.colors.primary[500]}15`,
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
    backgroundColor: `${Theme.colors.primary[500]}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  categoryIconContainerActive: {
    backgroundColor: Theme.colors.background.primary,
    borderColor: Theme.colors.background.primary,
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
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    paddingBottom: Theme.spacing.l,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
  },
  footerButton: {
    flex: 1,
  },
  footerButtonPrimary: {
    flex: 2,
  },
});
