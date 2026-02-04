/**
 * VisionFlow AI - Create Reminder Screen (Professional v2.0)
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
import { ReminderCategory, ReminderPriority, ReminderStatus } from '../types/reminder.types';
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

type CreateReminderScreenProps = NativeStackScreenProps<ReminderStackParamList, 'CreateReminder'>;

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

  const isFormValid = title.trim() && reminderDate && reminderTime;

  return (
    <Screen>
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
              
              <Card style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text variant="caption" color="secondary" weight="600" style={styles.inputLabel}>
                    TITLE *
                  </Text>
                  <Input
                    value={title}
                    onChangeText={setTitle}
                    placeholder="What do you need to remember?"
                    autoFocus
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.inputGroup}>
                  <Text variant="caption" color="secondary" weight="600" style={styles.inputLabel}>
                    NOTES (OPTIONAL)
                  </Text>
                  <Input
                    value={note}
                    onChangeText={setNote}
                    placeholder="Add additional details..."
                    multiline
                    numberOfLines={4}
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
              
              <Card style={styles.formCard}>
                <View style={styles.dateTimeRow}>
                  <View style={styles.dateInputContainer}>
                    <Text variant="caption" color="secondary" weight="600" style={styles.inputLabel}>
                      DATE *
                    </Text>
                    <Pressable style={styles.dateTimeButton}>
                      <Icon name="calendar" size="sm" color={Theme.colors.primary[500]} />
                      <Input
                        value={reminderDate}
                        onChangeText={setReminderDate}
                        placeholder="YYYY-MM-DD"
                      />
                    </Pressable>
                  </View>
                  
                  <View style={styles.timeInputContainer}>
                    <Text variant="caption" color="secondary" weight="600" style={styles.inputLabel}>
                      TIME *
                    </Text>
                    <Pressable style={styles.dateTimeButton}>
                      <Icon name="time" size="sm" color={Theme.colors.primary[500]} />
                      <Input
                        value={reminderTime}
                        onChangeText={setReminderTime}
                        placeholder="HH:MM"
                      />
                    </Pressable>
                  </View>
                </View>
              </Card>
            </View>

            {/* Category Selection */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="pricetag-outline" size="sm" color={Theme.colors.primary[500]} />
                <Text variant="h4">Category</Text>
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

            {/* Priority Selection */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="flag-outline" size="sm" color={Theme.colors.primary[500]} />
                <Text variant="h4">Priority</Text>
              </View>
              
              <View style={styles.priorityGrid}>
                {[
                  ReminderPriority.LOW,
                  ReminderPriority.MEDIUM,
                  ReminderPriority.HIGH,
                  ReminderPriority.URGENT,
                ].map((prio) => {
                  const isSelected = priority === prio;
                  const prioColor = getPriorityColor(prio);
                  
                  return (
                    <Pressable
                      key={prio}
                      onPress={() => {
                        setPriority(prio);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[
                        styles.priorityChip,
                        isSelected ? { backgroundColor: prioColor, borderColor: prioColor } : {},
                      ]}
                    >
                      <Icon 
                        name="flag" 
                        size="sm" 
                        color={isSelected ? Theme.colors.background.primary : prioColor} 
                      />
                      <Text
                        variant="caption"
                        weight="700"
                        customColor={isSelected ? Theme.colors.background.primary : Theme.colors.text.primary}
                      >
                        {prio.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Info Card */}
            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
                <Text variant="caption" color="secondary" style={styles.infoText}>
                  You'll receive a notification at the scheduled time. Make sure notifications are enabled in your device settings.
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
            label={isSaving ? 'Creating...' : 'Create Reminder'}
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
  
  // Priority grid styles
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
  },
  priorityChip: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Theme.spacing.m,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.secondary,
    borderWidth: 2,
    borderColor: Theme.colors.border.default,
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
