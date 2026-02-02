/**
 * VisionFlow AI - Edit Reminder Screen (FIXED)
 * Edit an existing reminder
 * * @module screens/EditReminderScreen
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
import { ReminderStackParamList } from '../types/navigation.types';
import { ReminderCategory, ReminderPriority, CATEGORY_EMOJIS } from '../types/reminder.types';
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
import { useReminders } from '../hooks/useReminders';
import * as Haptics from 'expo-haptics';

type EditReminderScreenProps = NativeStackScreenProps<ReminderStackParamList, 'EditReminder'>;

/**
 * EditReminderScreen Component
 */
export function EditReminderScreen({ navigation, route }: EditReminderScreenProps) {
  const { reminder } = route.params;
  const { updateReminder } = useReminders();

  const [title, setTitle] = useState(reminder.title);
  const [note, setNote] = useState(reminder.smartNote || '');
  const [category, setCategory] = useState<ReminderCategory>(reminder.category);
  // FIXED: Provide default value if priority is undefined
  const [priority, setPriority] = useState<ReminderPriority>(reminder.priority || ReminderPriority.MEDIUM);
  const [reminderDate, setReminderDate] = useState(reminder.reminderDate);
  const [reminderTime, setReminderTime] = useState(reminder.reminderTime);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title.');
      return;
    }
    if (!reminderDate) {
      Alert.alert('Validation Error', 'Please select a date.');
      return;
    }
    if (!reminderTime) {
      Alert.alert('Validation Error', 'Please select a time.');
      return;
    }

    try {
      setIsSaving(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await updateReminder(reminder.id, {
        title: title.trim(),
        smartNote: note.trim(),
        category,
        subcategory: category,
        priority,
        reminderDate,
        reminderTime,
        updatedAt: Date.now(),
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error: any) {
      console.error('[EditReminder] Save failed:', error);
      Alert.alert('Save Failed', error.message || 'Failed to update reminder. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const hasChanges =
      title !== reminder.title ||
      note !== (reminder.smartNote || '') ||
      category !== reminder.category ||
      priority !== reminder.priority ||
      reminderDate !== reminder.reminderDate ||
      reminderTime !== reminder.reminderTime;

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
        <Text variant="h4" weight="600">Edit Reminder</Text>
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
            {/* Form Fields - FIXED: NO style prop */}
            <Card style={styles.formCard}>
              <Input
                label="Title"
                value={title}
                onChangeText={setTitle}
                placeholder="What do you need to remember?"
              />

              <View style={{ height: Theme.spacing.m }} />

              <Input
                label="Note"
                value={note}
                onChangeText={setNote}
                placeholder="Add details..."
                multiline
                numberOfLines={3}
              />

              <View style={{ height: Theme.spacing.m }} />

              <View style={styles.dateTimeRow}>
                <View style={styles.dateInput}>
                  <Input
                    label="Date"
                    value={reminderDate}
                    onChangeText={setReminderDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={styles.timeInput}>
                  <Input
                    label="Time"
                    value={reminderTime}
                    onChangeText={setReminderTime}
                    placeholder="HH:MM"
                  />
                </View>
              </View>
            </Card>

            {/* Category Selection - FIXED: Use ternary with {} */}
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

            {/* Priority Selection - FIXED: Use ternary with {} */}
            <Text variant="h4" style={styles.sectionTitle}>Priority</Text>
            <View style={styles.priorityRow}>
              {[
                ReminderPriority.LOW,
                ReminderPriority.MEDIUM,
                ReminderPriority.HIGH,
                ReminderPriority.URGENT,
              ].map((prio) => (
                <Pressable
                  key={prio}
                  onPress={() => {
                    setPriority(prio);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.priorityChip,
                    priority === prio ? styles.priorityChipActive : {},
                  ]}
                >
                  <Text
                    variant="caption"
                    weight="600"
                    customColor={
                      priority === prio
                        ? Theme.colors.text.inverse
                        : Theme.colors.text.secondary
                    }
                  >
                    {prio.toUpperCase()}
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
            disabled={isSaving || !title.trim() || !reminderDate || !reminderTime}
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
  formCard: {
    marginBottom: Theme.spacing.m,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
  },
  dateInput: {
    flex: 2,
  },
  timeInput: {
    flex: 1,
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
  priorityRow: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
    marginBottom: Theme.spacing.l,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: Theme.spacing.m,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 2,
    borderColor: Theme.colors.border.medium,
    alignItems: 'center',
  },
  priorityChipActive: {
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