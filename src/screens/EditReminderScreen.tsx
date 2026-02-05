/**
 * VisionFlow AI - Edit Reminder Screen (v2.1 - Harmonized Edition)
 * Edit an existing reminder
 * 
 * @module screens/EditReminderScreen
 * 
 * CHANGELOG v2.1:
 * - ✅ Fixed footer paddingBottom to clear tab bar (uses theme.spacing.safeArea.bottomPadding)
 * - ✅ Fixed category icon background opacity (15% → 20%)
 * - ✅ Added header shadow for separation
 * - ✅ Added card elevation for visual depth
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
 * EditReminderScreen Component
 */
export function EditReminderScreen({ navigation, route }: EditReminderScreenProps) {
  const { reminder } = route.params;
  const { updateReminder } = useReminders();

  const [title, setTitle] = useState(reminder.title);
  const [note, setNote] = useState(reminder.smartNote || '');
  const [category, setCategory] = useState<ReminderCategory>(reminder.category);
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

  const isFormValid = title.trim() && reminderDate && reminderTime;

  return (
    <Screen>
      {/* Header - ✅ ENHANCED: Added shadow */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel} haptic="light" style={styles.headerButton}>
          <Icon name="close" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text variant="h4" weight="600">Edit Reminder</Text>
          <Text variant="caption" color="tertiary">
            Update reminder details
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
            {/* Original Reminder Preview - ✅ ENHANCED: Added elevation */}
            <Card elevation="sm" style={styles.originalCard}>
              <View style={styles.originalHeader}>
                <Icon name="document-text-outline" size="sm" color={Theme.colors.text.secondary} />
                <Text variant="caption" color="secondary" weight="600">ORIGINAL REMINDER</Text>
              </View>
              <View style={styles.originalContent}>
                <Text variant="h3">{reminder.emoji}</Text>
                <View style={styles.originalInfo}>
                  <Text variant="body" weight="600" numberOfLines={1}>
                    {reminder.title}
                  </Text>
                  <Text variant="caption" color="tertiary">
                    {reminder.reminderDate} at {reminder.reminderTime}
                  </Text>
                </View>
              </View>
            </Card>

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
                  <Input
                    value={title}
                    onChangeText={setTitle}
                    placeholder="What do you need to remember?"
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.inputGroup}>
                  <Text variant="caption" color="secondary" weight="600" style={styles.inputLabel}>
                    NOTES
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
              
              <Card elevation="sm" style={styles.formCard}>
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

            {/* Info Card - ✅ ENHANCED: Added elevation */}
            <Card elevation="sm" style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
                <Text variant="caption" color="secondary" style={styles.infoText}>
                  Changes will be saved immediately and cannot be undone
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

        {/* Footer Actions - ✅ ENHANCED: Added shadow */}

      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    // paddingBottom:80,
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
  
  // Original reminder preview - ✅ Card elevation added via elevation="sm" prop
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
  
  // Category grid styles - ✅ FIXED: Standardized opacity
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
    paddingBottom: Theme.spacing.safeArea.bottomPadding, // ✅ FIXED: 80px (was 24px)
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
