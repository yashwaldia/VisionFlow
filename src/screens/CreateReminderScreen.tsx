/**
 * VisionFlow AI - Create Reminder Screen (v4.0 - CYBERPUNK TACTICAL ENHANCEMENT)
 * Manually create a reminder with visual depth
 * 
 * @module screens/CreateReminderScreen
 * 
 * CHANGELOG v4.0:
 * ✨ VISUAL ENHANCEMENTS:
 * - ✅ Category-colored gradient on preview emoji container with glow
 * - ✅ Glassmorphism effect on form cards
 * - ✅ Selected category chips with glow effect
 * - ✅ Selected priority chips with glow effect
 * - ✅ Glassmorphism on date/time input containers
 * - ✅ Info card with glass variant
 * - ✅ Footer primary button with glow effect
 * - ✅ Enhanced input fields with focus glow
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
import { RootStackParamList } from '../types/navigation.types';
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

type CreateReminderScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateReminderScreen'>;

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
 * ✨ NEW: Get category gradient colors
 */
const getCategoryGradient = (category: ReminderCategory) => {
  const categoryKey = category.toLowerCase() as keyof typeof Theme.colors.category;
  const categoryColors = Theme.colors.category[categoryKey];
  
  if (categoryColors && 'gradient' in categoryColors) {
    return categoryColors.gradient;
  }
  
  return [Theme.colors.primary[400], Theme.colors.primary[500], Theme.colors.primary[600]];
};

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

  // ✨ NEW: Get current category gradient
  const categoryGradient = getCategoryGradient(category);

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
          {/* ✨ ENHANCED: Preview Icon with Category Gradient & Glow */}
          <View style={styles.previewSection}>
            <View
              style={[
                styles.previewIconContainer,
                {
                  backgroundColor: categoryGradient[1],
                  borderColor: categoryGradient[0],
                  shadowColor: categoryGradient[2],
                  shadowOpacity: 0.5,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 8,
                },
              ]}
            >
              <Text variant="h1">{getCategoryEmoji(category)}</Text>
            </View>
            <Text variant="caption" color="tertiary" align="center">
              Emoji will be auto-selected based on category
            </Text>
          </View>

          {/* ✨ ENHANCED: Basic Information with Glass Card */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="create-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Basic Information</Text>
            </View>
            
            <Card 
              variant="glass"
              elevation="md"
              style={styles.formCard}
            >
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

          {/* ✨ ENHANCED: Date & Time with Glassmorphism */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="calendar-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Schedule</Text>
            </View>
            
            <Card 
              variant="glass"
              elevation="md"
              style={styles.formCard}
            >
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

          {/* ✨ ENHANCED: Category Selection with Glow on Active */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="pricetag-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Category</Text>
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
                  </Card>
                );
              })}
            </View>
          </View>

          {/* ✨ ENHANCED: Priority Selection with Glow on Active */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="flag-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Priority</Text>
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
                  </Card>
                );
              })}
            </View>
          </View>

          {/* ✨ ENHANCED: Info Card with Glass Variant */}
          <Card 
            variant="glass"
            elevation="sm"
            style={styles.infoCard}
          >
            <View style={styles.infoRow}>
              <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
              <Text variant="caption" color="secondary" style={styles.infoText}>
                You'll receive a notification at the scheduled time. Make sure notifications are enabled in your device settings.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* ✨ ENHANCED: Footer with Glassmorphism and Glow on Primary Button */}
      <View style={[
        styles.footerContainer, 
        { 
          paddingBottom: insets.bottom + Theme.spacing.m,
          backgroundColor: Theme.glassmorphism.tint,
        }
      ]}>
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
    paddingBottom: 140,
  },

  // Content padding
  content: {
    padding: Theme.spacing.m,
  },

  // ✨ ENHANCED: Preview section with gradient & glow
  previewSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
    gap: Theme.spacing.s,
  },
  previewIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
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

  // ✨ ENHANCED: Form card with glass variant
  formCard: {
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}40`,
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

  // ✨ ENHANCED: Category chips with Card component
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

  // ✨ ENHANCED: Priority chips with Card component
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

  // ✨ ENHANCED: Info card with glass variant
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

  // ✨ ENHANCED: Footer with glassmorphism
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    ...Theme.shadows.md,
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
