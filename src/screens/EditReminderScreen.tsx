/**
 * VisionFlow AI - Edit Reminder Screen (v5.0 - Hidden Inside UI Edition)
 * Edit an existing reminder with enhanced cyberpunk aesthetic
 * 
 * @module screens/EditReminderScreen
 * 
 * CHANGELOG v5.0:
 * - ✅ UI ENHANCEMENT: Monospace fonts for technical labels
 * - ✅ UI ENHANCEMENT: Italic text for descriptive content
 * - ✅ UI ENHANCEMENT: Enhanced section headers with wider letter-spacing
 * - ✅ UI ENHANCEMENT: Blue glow border on form cards
 * - ✅ All v4.1 safe area and footer fixes preserved
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
import { BlurView } from 'expo-blur';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation.types';
import { ReminderCategory, ReminderPriority } from '../types/reminder.types';
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

type EditReminderScreenProps = NativeStackScreenProps<RootStackParamList, 'EditReminderScreen'>;

/**
 * Category configuration
 */
const categoryConfig = {
  [ReminderCategory.PERSONAL]: { icon: 'person', color: Theme.colors.primary[500] },
  [ReminderCategory.WORK]: { icon: 'briefcase', color: Theme.colors.semantic.info },
  [ReminderCategory.HEALTH]: { icon: 'fitness', color: Theme.colors.semantic.success },
  [ReminderCategory.MONEY]: { icon: 'cash', color: Theme.colors.semantic.warning },
};

/**
 * Priority configuration
 */
const priorityConfig = {
  [ReminderPriority.LOW]: { icon: 'chevron-down', color: Theme.colors.text.tertiary },
  [ReminderPriority.MEDIUM]: { icon: 'remove', color: Theme.colors.semantic.info },
  [ReminderPriority.HIGH]: { icon: 'chevron-up', color: Theme.colors.semantic.warning },
  [ReminderPriority.URGENT]: { icon: 'warning', color: Theme.colors.semantic.error },
};

/**
 * EditReminderScreen Component
 */
export function EditReminderScreen({ navigation, route }: EditReminderScreenProps) {
  const { reminder } = route.params;
  const { updateReminder } = useReminders();
  const insets = useSafeAreaInsets();

  const titleInputRef = useRef<TextInput>(null);
  const noteInputRef = useRef<TextInput>(null);
  const dateInputRef = useRef<TextInput>(null);
  const timeInputRef = useRef<TextInput>(null);

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
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Theme.spacing.m }]}>
        <Pressable onPress={handleCancel} haptic="light" style={styles.headerButton}>
          <Icon name="close" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          {/* ✅ ENHANCED: Monospace header title */}
          <Text variant="h4" weight="600" mono>EDIT_REMINDER</Text>
          {/* ✅ NEW: Italic subtitle */}
          <Text variant="caption" color="tertiary" italic>
            Update reminder details
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
          {/* Original Reminder Preview */}
          <Card 
            variant="hud"
            elevation="md"
            style={styles.originalCard}
          >
            <View style={styles.originalHeader}>
              <Icon name="document-text-outline" size="sm" color={Theme.colors.text.secondary} />
              {/* ✅ ENHANCED: Monospace label with wider spacing */}
              <Text variant="caption" color="secondary" weight="600" mono style={styles.originalLabel}>
                ORIGINAL_REMINDER
              </Text>
            </View>
            <View style={styles.originalContent}>
              <Text variant="h3">{reminder.emoji}</Text>
              <View style={styles.originalInfo}>
                <Text variant="body" weight="600" numberOfLines={1}>
                  {reminder.title}
                </Text>
                {/* ✅ ENHANCED: Monospace date/time */}
                <Text variant="caption" color="tertiary" mono>
                  {reminder.reminderDate} at {reminder.reminderTime}
                </Text>
              </View>
            </View>
          </Card>

          {/* ✅ ENHANCED: Basic Information with blue glow border */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="create-outline" size="sm" color={Theme.colors.primary[500]} />
              {/* ✅ ENHANCED: Monospace section header */}
              <Text variant="h4" mono>BASIC_INFO</Text>
            </View>
            
            <Card 
              variant="glowBorder"
              elevation="md"
              style={styles.formCard}
            >
              <View style={styles.inputGroup}>
                {/* ✅ ENHANCED: Monospace input label with wider spacing */}
                <Text variant="caption" color="secondary" weight="700" mono style={styles.inputLabel}>
                  TITLE *
                </Text>
                <TextInput
                  ref={titleInputRef}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="What do you need to remember?"
                  placeholderTextColor={Theme.colors.text.tertiary}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => noteInputRef.current?.focus()}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.inputGroup}>
                {/* ✅ ENHANCED: Monospace input label */}
                <Text variant="caption" color="secondary" weight="700" mono style={styles.inputLabel}>
                  NOTES
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

          {/* ✅ ENHANCED: Date & Time with blue glow border */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="calendar-outline" size="sm" color={Theme.colors.primary[500]} />
              {/* ✅ ENHANCED: Monospace section header */}
              <Text variant="h4" mono>SCHEDULE</Text>
            </View>
            
            <Card 
              variant="glowBorder"
              elevation="md"
              style={styles.formCard}
            >
              <View style={styles.dateTimeRow}>
                <View style={styles.dateInputContainer}>
                  {/* ✅ ENHANCED: Monospace input label */}
                  <Text variant="caption" color="secondary" weight="700" mono style={styles.inputLabel}>
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
                  {/* ✅ ENHANCED: Monospace input label */}
                  <Text variant="caption" color="secondary" weight="700" mono style={styles.inputLabel}>
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

          {/* Category Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="pricetag-outline" size="sm" color={Theme.colors.primary[500]} />
              {/* ✅ ENHANCED: Monospace section header */}
              <Text variant="h4" mono>CATEGORY</Text>
            </View>
            
            <View style={styles.categoryGrid}>
              {Object.entries(categoryConfig).map(([cat, config]) => {
                const isSelected = category === cat;
                return (
                  <Card
                    key={cat}
                    pressable
                    elevation={isSelected ? 'glow' : 'none'}
                    padding={10}
                    borderRadius={Theme.borderRadius.m}
                    onPress={() => {
                      setCategory(cat as ReminderCategory);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.categoryChipCard,
                      isSelected ? {
                        backgroundColor: config.color,
                        borderColor: config.color,
                        shadowColor: config.color,
                      } : {},
                    ]}
                  >
                    <Icon 
                      name={config.icon as any} 
                      size="sm" 
                      color={isSelected ? Theme.colors.background.primary : config.color} 
                    />
                    {/* ✅ ENHANCED: Monospace chip label */}
                    <Text
                      variant="caption"
                      weight="700"
                      mono
                      customColor={
                        isSelected
                          ? Theme.colors.background.primary
                          : Theme.colors.text.primary
                      }
                    >
                      {cat}
                    </Text>
                  </Card>
                );
              })}
            </View>
          </View>

          {/* Priority Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="flag-outline" size="sm" color={Theme.colors.primary[500]} />
              {/* ✅ ENHANCED: Monospace section header */}
              <Text variant="h4" mono>PRIORITY</Text>
            </View>
            
            <View style={styles.priorityGrid}>
              {Object.entries(priorityConfig).map(([prio, config]) => {
                const isSelected = priority === prio;
                return (
                  <Card
                    key={prio}
                    pressable
                    elevation={isSelected ? 'glow' : 'none'}
                    padding={10}
                    borderRadius={Theme.borderRadius.m}
                    onPress={() => {
                      setPriority(prio as ReminderPriority);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.priorityChipCard,
                      isSelected ? {
                        backgroundColor: config.color,
                        borderColor: config.color,
                        shadowColor: config.color,
                      } : {},
                    ]}
                  >
                    <Icon 
                      name={config.icon as any} 
                      size="sm" 
                      color={isSelected ? Theme.colors.background.primary : config.color} 
                    />
                    {/* ✅ ENHANCED: Monospace chip label */}
                    <Text
                      variant="caption"
                      weight="700"
                      mono
                      customColor={
                        isSelected
                          ? Theme.colors.background.primary
                          : Theme.colors.text.primary
                      }
                    >
                      {prio}
                    </Text>
                  </Card>
                );
              })}
            </View>
          </View>

          {/* Info Card */}
          <Card 
            variant="glass"
            elevation="sm"
            style={styles.infoCard}
          >
            <View style={styles.infoRow}>
              <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
              {/* ✅ NEW: Italic info text */}
              <Text variant="caption" color="secondary" italic style={styles.infoText}>
                Changes will be saved immediately and cannot be undone
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[
        styles.footerContainer, 
        { paddingBottom: insets.bottom + Theme.spacing.m }
      ]}>
        <View style={styles.footerBackdrop} />
        
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="dark" style={styles.footerBlur}>
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
                <View
                  style={
                    !isSaving && isFormValid
                      ? {
                          shadowColor: Theme.colors.primary[500],
                          shadowOpacity: 0.5,
                          shadowRadius: 12,
                          shadowOffset: { width: 0, height: 0 },
                          elevation: 8,
                          borderRadius: Theme.borderRadius.m,
                        }
                      : {}
                  }
                >
                  <Button
                    label={isSaving ? 'Saving...' : 'Save Changes'}
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
          </BlurView>
        ) : (
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
              <View
                style={
                  !isSaving && isFormValid
                    ? {
                        shadowColor: Theme.colors.primary[500],
                        shadowOpacity: 0.5,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: 8,
                        borderRadius: Theme.borderRadius.m,
                      }
                    : {}
                }
              >
                <Button
                  label={isSaving ? 'Saving...' : 'Save Changes'}
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
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.m,
    paddingBottom: Theme.spacing.m,
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
    paddingBottom: 140,
  },

  // Content padding
  content: {
    padding: Theme.spacing.m,
  },

  // Original reminder preview
  originalCard: {
    marginBottom: Theme.spacing.l,
  },
  originalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Theme.spacing.s,
  },
  // ✅ NEW: Wider letter-spacing for original label
  originalLabel: {
    letterSpacing: 2,
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

  // Form card
  formCard: {
    // Border already handled by glowBorder variant
  },
  inputGroup: {
    gap: Theme.spacing.xs,
  },
  // ✅ ENHANCED: Wider letter-spacing for input labels
  inputLabel: {
    textTransform: 'uppercase',
    letterSpacing: 2, // Increased from 0.5
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
    opacity: 0.5,
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

  // Category chips
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
  },
  categoryChipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 100,
    borderWidth: 2,
    borderColor: Theme.colors.border.medium,
  },

  // Priority chips
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
  },
  priorityChipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 100,
    borderWidth: 2,
    borderColor: Theme.colors.border.medium,
  },

  // Info card
  infoCard: {
    marginTop: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.info}10`,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.info}40`,
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

  // Footer
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
  },
  footerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'ios' 
      ? 'rgba(18, 18, 18, 0.7)'
      : 'rgba(18, 18, 18, 0.95)',
  },
  footerBlur: {
    paddingHorizontal: Theme.spacing.m,
    paddingTop: Theme.spacing.m,
  },
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    paddingHorizontal: Platform.OS === 'android' ? Theme.spacing.m : 0,
    paddingTop: Platform.OS === 'android' ? Theme.spacing.m : 0,
  },
  footerButton: {
    flex: 1,
  },
});
