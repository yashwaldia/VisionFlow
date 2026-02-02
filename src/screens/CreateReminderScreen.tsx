/**
 * VisionFlow AI - Create Reminder Screen (100% ERROR-FREE)
 * Manually create a reminder without AI
 * 
 * @module screens/CreateReminderScreen
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
import { ReminderStackParamList } from '../types/navigation.types';
import { ReminderCategory, ReminderPriority, ReminderStatus, CATEGORY_EMOJIS } from '../types/reminder.types';
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
  DateTimePicker,
} from '../components';
import { useReminders } from '../hooks/useReminders';
import * as Haptics from 'expo-haptics';

type CreateReminderScreenProps = NativeStackScreenProps<ReminderStackParamList, 'CreateReminder'>;

/**
 * CreateReminderScreen Component
 */
export function CreateReminderScreen({ navigation, route }: CreateReminderScreenProps) {
  const { imageUri, aiSuggestion } = route.params;
  const { createReminder } = useReminders();

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<ReminderCategory>(ReminderCategory.PERSONAL);
  const [priority, setPriority] = useState<ReminderPriority>(ReminderPriority.MEDIUM);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [emoji, setEmoji] = useState('📝');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validation
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

      await createReminder({
        id: `reminder_${Date.now()}`,
        title: title.trim(),
        smartNote: note.trim(),
        category,
        subcategory: category,
        priority,
        reminderDate,
        reminderTime,
        imageUri,
        emoji,
        status: ReminderStatus.UPCOMING,
        notificationEnabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('ReminderList', {});
    } catch (error: any) {
      console.error('[CreateReminder] Save failed:', error);
      Alert.alert('Save Failed', error.message || 'Failed to create reminder. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || note.trim()) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to discard this reminder?',
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
        <Text variant="h4" weight="600">New Reminder</Text>
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
            {/* Form Fields */}
            <Card style={styles.formCard}>
              <Input
                label="Title"
                value={title}
                onChangeText={setTitle}
                placeholder="What do you need to remember?"
                autoFocus
              />

              <View style={{ marginTop: Theme.spacing.m }} />

              <Input
                label="Note (Optional)"
                value={note}
                onChangeText={setNote}
                placeholder="Add details..."
                multiline
                numberOfLines={3}
              />

              <View style={{ marginTop: Theme.spacing.m }} />

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


            {/* Category Selection - FIXED */}
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

            {/* Priority Selection - FIXED */}
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
            label={isSaving ? 'Creating...' : 'Create Reminder'}
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
  input: {
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
