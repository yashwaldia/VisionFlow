/**
 * VisionFlow AI - Edit Project Screen (100% ERROR-FREE)
 * Edit an existing project
 * 
 * @module screens/EditProjectScreen
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
import { ReminderCategory, CATEGORY_EMOJIS } from '../types/reminder.types';
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
          <Text variant="h3">Project not found</Text>
          <Button label="Go Back" onPress={() => navigation.goBack()} />
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

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel}>
          <Icon name="close" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <Text variant="h4" weight="600">Edit Project</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Container padding="m">
            {/* Icon Preview */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Icon name="folder" size="xl" color={Theme.colors.primary[500]} />
              </View>
            </View>

            {/* Form Fields */}
            <Card style={styles.formCard}>
              <Input
                label="Project Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter project name"
              />

              <View style={{ marginTop: Theme.spacing.m }} />

              <Input
                label="Description (Optional)"
                value={description}
                onChangeText={setDescription}
                placeholder="What is this project about?"
                multiline
                numberOfLines={3}
              />
            </Card>


            {/* Category Selection - FIXED: Use ternary with empty object */}
            <Text variant="h4" style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryGrid}>
              {[
                ReminderCategory.PERSONAL,
                ReminderCategory.WORK,
                ReminderCategory.HEALTH,
                ReminderCategory.MONEY,
              ].map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    setCategory(cat);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.categoryChip,
                    category === cat ? styles.categoryChipActive : {},
                  ]}
                >
                  <Text variant="h3">{CATEGORY_EMOJIS[cat]}</Text>
                  <Text
                    variant="caption"
                    weight="600"
                    customColor={
                      category === cat
                        ? Theme.colors.text.inverse
                        : Theme.colors.text.secondary
                    }
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
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
            label={isSaving ? 'Saving...' : 'Save Changes'}
            variant="primary"
            size="large"
            onPress={handleSave}
            style={styles.footerButtonPrimary}
            disabled={isSaving || !name.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Theme.spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: Theme.spacing.l,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    marginBottom: Theme.spacing.m,
  },
  input: {
    marginBottom: Theme.spacing.m,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.m,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  categoryChip: {
    width: '47%',
    padding: Theme.spacing.m,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 2,
    borderColor: Theme.colors.border.medium,
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
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
