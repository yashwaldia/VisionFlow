/**
 * VisionFlow AI - Create Reminder Screen (v3.1 - Type Fix + Footer Fix)
 * Manually create a reminder without AI
 * 
 * @module screens/CreateReminderScreen
 * 
 * CHANGELOG v3.1:
 * - 🐛 FIXED: Updated to use RootStackParamList and CreateReminderScreen type
 * - 🐛 FIXED: Footer now sticky/fixed at bottom
 * - 🐛 FIXED: Equal width buttons
 * - 🐛 FIXED: ScrollView clearance increased to 140
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
import { ReminderCategory, ReminderPriority, ReminderStatus } from '../types/reminder.types';
import { Theme } from '../constants/theme';
import {
  Text,
  Button,
  Card,
  Icon,
  Pressable,
} from '../components';
import { useReminders } from '../hooks/useReminders';
import * as Haptics from 'expo-haptics';

type CreateReminderScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateReminderScreen'>; // ✅ CHANGED

/**
 * Get priority color
 */
const getPriorityColor = (priority: ReminderPriority): string => {
  const colors: Record<string, string> = {
    [ReminderPriority.LOW]: Theme.colors.semantic.success,
    [ReminderPriority.MEDIUM]: Theme.colors.semantic.info,
    [ReminderPriority.HIGH]: Theme.colors.semantic.warning,
    [ReminderPriority.URGENT]: Theme.colors.semantic.error,
  };
  return colors[priority] || Theme.colors.primary[500];
};

/**
 * Get category emoji
 */
const getCategoryEmoji = (category: ReminderCategory): string => {
  const emojis: Record<string, string> = {
    [ReminderCategory.PERSONAL]: '🏠',
    [ReminderCategory.WORK]: '💼',
    [ReminderCategory.HEALTH]: '❤️',
    [ReminderCategory.MONEY]: '💰',
  };
  return emojis[category] || '📝';
};

/**
 * Category configuration (matching reference)
 */
const categoryConfig = {
  [ReminderCategory.PERSONAL]: { icon: 'person', color: Theme.colors.primary[500] },
  [ReminderCategory.WORK]: { icon: 'briefcase', color: Theme.colors.semantic.info },
  [ReminderCategory.HEALTH]: { icon: 'fitness', color: Theme.colors.semantic.success },
  [ReminderCategory.MONEY]: { icon: 'cash', color: Theme.colors.semantic.warning },
};

/**
 * Priority configuration (matching reference)
 */
const priorityConfig = {
  [ReminderPriority.LOW]: { icon: 'chevron-down', color: Theme.colors.text.tertiary },
  [ReminderPriority.MEDIUM]: { icon: 'remove', color: Theme.colors.semantic.info },
  [ReminderPriority.HIGH]: { icon: 'chevron-up', color: Theme.colors.semantic.warning },
  [ReminderPriority.URGENT]: { icon: 'warning', color: Theme.colors.semantic.error },
};

/**
 * CreateReminderScreen Component
 */
export function CreateReminderScreen({ navigation, route }: CreateReminderScreenProps) {
  const { imageUri, aiSuggestion } = route.params;
  const { createReminder } = useReminders();
  const insets = useSafeAreaInsets();

  const titleInputRef = useRef<TextInput>(null);
  const noteInputRef = useRef<TextInput>(null);
  const dateInputRef = useRef<TextInput>(null);
  const timeInputRef = useRef<TextInput>(null);

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<ReminderCategory>(ReminderCategory.PERSONAL);
  const [priority, setPriority] = useState<ReminderPriority>(ReminderPriority.MEDIUM);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
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

      const emoji = getCategoryEmoji(category);

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
      
      // ✅ Navigate back to MainApp
      navigation.navigate('MainApp', {
        screen: 'RemindersTab',
        params: {
          screen: 'ReminderList',
          params: {},
        },
      });
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

  const isFormValid = title.trim() && reminderDate && reminderTime;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel} haptic="light" style={styles.headerButton}>
          <Icon name="close" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text variant="h4" weight="600">New Reminder</Text>
          <Text variant="caption" color="tertiary">
            Create a manual reminder
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
          {/* Preview Icon */}
          <View style={styles.previewSection}>
            <View style={styles.previewIconContainer}>
              <Text variant="h1">{getCategoryEmoji(category)}</Text>
            </View>
            <Text variant="caption" color="tertiary" align="center">
              Emoji will be auto-selected based on category
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
                  TITLE *
                </Text>
                <TextInput
                  ref={titleInputRef}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="What do you need to remember?"
                  placeholderTextColor={Theme.colors.text.tertiary}
                  autoFocus
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => noteInputRef.current?.focus()}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.inputGroup}>
                <Text variant="caption" color="secondary" weight="600" style={styles.inputLabel}>
                  NOTES (OPTIONAL)
                </Text>
                <TextInput
                  ref={noteInputRef}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add additional details..."
                  placeholderTextColor={Theme.colors.text.tertiary}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => dateInputRef.current?.focus()}
                  style={styles.textInput}
                />
              </View>
            </Card>
          </View>

          {/* Date & Time */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="calendar-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Schedule</Text>
            </View>
            
            <Card elevation="sm" style={styles.formCard}>
              <View style={styles.dateTimeRow}>
                <View style={styles.dateInputContainer}>
                  <Text variant="caption" color="secondary" weight="600" style={styles.inputLabel}>
                    DATE *
                  </Text>
                  <View style={styles.dateTimeButton}>
                    <Icon name="calendar" size="sm" color={Theme.colors.primary[500]} />
                    <TextInput
                      ref={dateInputRef}
                      value={reminderDate}
                      onChangeText={setReminderDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={Theme.colors.text.tertiary}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => timeInputRef.current?.focus()}
                      style={styles.dateTimeInput}
                    />
                  </View>
                </View>
                
                <View style={styles.timeInputContainer}>
                  <Text variant="caption" color="secondary" weight="600" style={styles.inputLabel}>
                    TIME *
                  </Text>
                  <View style={styles.dateTimeButton}>
                    <Icon name="time" size="sm" color={Theme.colors.primary[500]} />
                    <TextInput
                      ref={timeInputRef}
                      value={reminderTime}
                      onChangeText={setReminderTime}
                      placeholder="HH:MM"
                      placeholderTextColor={Theme.colors.text.tertiary}
                      blurOnSubmit={false}
                      style={styles.dateTimeInput}
                    />
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Category Selection - MATCHING REFERENCE */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="pricetag-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Category</Text>
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

          {/* Priority Selection - MATCHING REFERENCE */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="flag-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Priority</Text>
            </View>
            
            <View style={styles.priorityGrid}>
              {Object.entries(priorityConfig).map(([prio, config]) => {
                const isSelected = priority === prio;
                return (
                  <Pressable
                    key={prio}
                    onPress={() => {
                      setPriority(prio as ReminderPriority);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.priorityChip,
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
                      {prio}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Info Card */}
          <Card elevation="sm" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
              <Text variant="caption" color="secondary" style={styles.infoText}>
                You'll receive a notification at the scheduled time. Make sure notifications are enabled in your device settings.
              </Text>
            </View>
          </Card>
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
              label={isSaving ? 'Creating...' : 'Create Reminder'}
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
    flexGrow: 1,
    paddingBottom: 140, // ✅ FIXED
  },

  // Content padding
  content: {
    padding: Theme.spacing.m,
  },

  // Preview section
  previewSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
    gap: Theme.spacing.s,
  },
  previewIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${Theme.colors.border.default}30`,
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

  // Date & Time styles
  dateTimeRow: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
  },
  dateInputContainer: {
    flex: 2,
    gap: Theme.spacing.xs,
  },
  timeInputContainer: {
    flex: 1,
    gap: Theme.spacing.xs,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  dateTimeInput: {
    flex: 1,
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

  // ✅ FIXED: Category grid matching reference
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

  // ✅ FIXED: Priority grid matching reference
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
  },
  priorityChip: {
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

  // ✅ FIXED: Footer matching reference
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
