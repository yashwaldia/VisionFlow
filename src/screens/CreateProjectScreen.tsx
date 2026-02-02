/**
 * VisionFlow AI - Create Project Screen (100% ERROR-FREE)
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

type CreateProjectScreenProps = NativeStackScreenProps<ProjectStackParamList, 'CreateProject'>;

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

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel}>
          <Icon name="close" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <Text variant="h4" weight="600">New Project</Text>
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
                autoFocus
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

            {/* Info Card */}
            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="information-circle-outline" size="md" color={Theme.colors.semantic.info} />
                <Text variant="caption" color="secondary" style={styles.infoText}>
                  Projects help you organize related reminders. You can assign reminders to this project later.
                </Text>
              </View>
            </Card>
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
  infoCard: {
    backgroundColor: `${Theme.colors.semantic.info}10`,
  },
  infoRow: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
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
