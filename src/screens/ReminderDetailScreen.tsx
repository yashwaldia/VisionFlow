/**
 * VisionFlow AI - Reminder Detail Screen (v2.1 - Harmonized Edition)
 * View and manage a single reminder
 * 
 * @module screens/ReminderDetailScreen
 * 
 * CHANGELOG v2.1:
 * - ✅ Fixed hardcoded paddingBottom (uses theme.spacing.safeArea.bottomPaddingLarge)
 * - ✅ Added card elevation for visual depth
 * - ✅ Added header shadow for separation
 * - ✅ Enhanced footer button with glow effect
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReminderStackParamList } from '../types/navigation.types';
import { ReminderStatus } from '../types/reminder.types';
import { Theme } from '../constants/theme';
import {
  Screen,
  Container,
  Text,
  Button,
  Card,
  Icon,
  Pressable,
  LoadingSpinner,
} from '../components';
import { useReminders } from '../hooks/useReminders';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ReminderDetailScreenProps = NativeStackScreenProps<ReminderStackParamList, 'ReminderDetail'>;

/**
 * Format date relative to today
 */
const formatRelativeDate = (dateString: string, timeString?: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';
  if (isYesterday) return 'Yesterday';

  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

/**
 * Get status configuration
 */
const getStatusConfig = (status: ReminderStatus) => {
  const configs = {
    [ReminderStatus.UPCOMING]: {
      color: Theme.colors.primary[500],
      icon: 'time-outline' as const,
      label: 'Upcoming',
      bgColor: `${Theme.colors.primary[500]}15`,
    },
    [ReminderStatus.DONE]: {
      color: Theme.colors.semantic.success,
      icon: 'checkmark-circle' as const,
      label: 'Completed',
      bgColor: `${Theme.colors.semantic.success}15`,
    },
    [ReminderStatus.OVERDUE]: {
      color: Theme.colors.semantic.error,
      icon: 'alert-circle' as const,
      label: 'Overdue',
      bgColor: `${Theme.colors.semantic.error}15`,
    },
    [ReminderStatus.SNOOZED]: {
      color: Theme.colors.semantic.warning,
      icon: 'moon-outline' as const,
      label: 'Snoozed',
      bgColor: `${Theme.colors.semantic.warning}15`,
    },
  };
  return configs[status] || configs[ReminderStatus.UPCOMING];
};

/**
 * ReminderDetailScreen Component
 */
export function ReminderDetailScreen({ navigation, route }: ReminderDetailScreenProps) {
  const { reminderId } = route.params;
  const { getReminderById, markAsDone, deleteReminder } = useReminders();
  const [reminder, setReminder] = useState(getReminderById(reminderId));

  useEffect(() => {
    setReminder(getReminderById(reminderId));
  }, [reminderId, getReminderById]);

  if (!reminder) {
    return (
      <Screen>
        <Container padding="m">
          <View style={styles.notFoundContainer}>
            <Icon name="alert-circle-outline" size="xl" color={Theme.colors.text.tertiary} />
            <Text variant="h3" align="center" style={styles.notFoundTitle}>
              Reminder not found
            </Text>
            <Text variant="body" color="secondary" align="center">
              This reminder may have been deleted
            </Text>
            <Button label="Go Back" onPress={() => navigation.goBack()} style={styles.notFoundButton} />
          </View>
        </Container>
      </Screen>
    );
  }

  const statusConfig = getStatusConfig(reminder.status);
  const isDone = reminder.status === ReminderStatus.DONE;

  const handleEdit = () => {
    navigation.navigate('EditReminder', { reminder: reminder });
  };

  const handleMarkDone = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await markAsDone(reminder.id);
      setReminder(getReminderById(reminderId));
    } catch (error) {
      Alert.alert('Error', 'Failed to mark as done');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await deleteReminder(reminder.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete reminder');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      {/* Header - ✅ ENHANCED: Added shadow for depth */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} haptic="light" style={styles.headerButton}>
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <Text variant="h4" weight="600">Details</Text>
        <View style={styles.headerActions}>
          {!isDone && (
            <Pressable onPress={handleEdit} haptic="light" style={styles.headerButton}>
              <Icon name="create-outline" size="md" color={Theme.colors.text.primary} />
            </Pressable>
          )}
          <Pressable onPress={handleDelete} haptic="medium" style={styles.headerButton}>
            <Icon name="trash-outline" size="md" color={Theme.colors.semantic.error} />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="m">
          {/* Image - ✅ ENHANCED: Added card elevation */}
          {reminder.imageUri && (
            <Card padding={0} style={styles.imageCard}>
              <Image 
                source={{ uri: reminder.imageUri }} 
                style={styles.image} 
                resizeMode="cover" 
              />
            </Card>
          )}

          {/* Title Section with Status */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <View style={styles.emojiContainer}>
                <Text variant="h1">{reminder.emoji}</Text>
              </View>
              <View style={styles.titleInfo}>
                <Text variant="h2" style={styles.title}>
                  {reminder.title}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                  <Icon name={statusConfig.icon} size="xs" color={statusConfig.color} />
                  <Text variant="caption" weight="700" customColor={statusConfig.color}>
                    {statusConfig.label.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Details Card - ✅ ENHANCED: Added elevation */}
          <Card style={styles.detailsCard}>
            {/* Date & Time */}
            <View style={styles.detailSection}>
              <Text variant="caption" color="tertiary" style={styles.detailSectionTitle}>
                SCHEDULED FOR
              </Text>
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="calendar" size="sm" color={Theme.colors.primary[500]} />
                </View>
                <View style={styles.detailContent}>
                  <Text variant="bodyLarge" weight="600">
                    {formatRelativeDate(reminder.reminderDate)}
                  </Text>
                  <Text variant="caption" color="secondary">
                    {reminder.reminderDate}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="time" size="sm" color={Theme.colors.primary[500]} />
                </View>
                <View style={styles.detailContent}>
                  <Text variant="bodyLarge" weight="600">
                    {reminder.reminderTime}
                  </Text>
                  <Text variant="caption" color="secondary">
                    Time
                  </Text>
                </View>
              </View>
            </View>

            {/* Category & Project */}
            <View style={styles.divider} />
            
            <View style={styles.detailSection}>
              <Text variant="caption" color="tertiary" style={styles.detailSectionTitle}>
                ORGANIZATION
              </Text>
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="pricetag" size="sm" color={Theme.colors.semantic.info} />
                </View>
                <View style={styles.detailContent}>
                  <Text variant="bodyLarge" weight="600">
                    {reminder.category}
                  </Text>
                  <Text variant="caption" color="secondary">
                    Category
                  </Text>
                </View>
              </View>

              {reminder.projectName && (
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Icon name="folder" size="sm" color={Theme.colors.semantic.warning} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text variant="bodyLarge" weight="600">
                      {reminder.projectName}
                    </Text>
                    <Text variant="caption" color="secondary">
                      Project
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Card>

          {/* Smart Note - ✅ ENHANCED: Added elevation */}
          <View style={styles.noteSection}>
            <View style={styles.noteSectionHeader}>
              <Icon name="document-text-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="h4">Details</Text>
            </View>
            <Card style={styles.noteCard}>
              <Text variant="body" style={styles.noteText}>
                {reminder.smartNote}
              </Text>
            </Card>
          </View>

          {/* Metadata */}
          <View style={styles.metadataSection}>
            <View style={styles.metadataRow}>
              <Icon name="add-circle-outline" size="xs" color={Theme.colors.text.tertiary} />
              <Text variant="caption" color="tertiary">
                Created {new Date(reminder.createdAt).toLocaleDateString(undefined, { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            {reminder.updatedAt !== reminder.createdAt && (
              <View style={styles.metadataRow}>
                <Icon name="create-outline" size="xs" color={Theme.colors.text.tertiary} />
                <Text variant="caption" color="tertiary">
                  Updated {new Date(reminder.updatedAt).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}
          </View>
        </Container>
      </ScrollView>

      {/* Footer Actions - ✅ ENHANCED: Added glow to button */}
      {!isDone && (
        <View style={styles.footer}>
          <Container padding="m">
            <Button
              label="Mark as Complete"
              variant="primary"
              size="large"
              leftIcon="checkmark-circle"
              onPress={handleMarkDone}
              style={styles.footerButton}
            />
          </Container>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  headerActions: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  
  // Content styles - ✅ FIXED: Uses theme constant
  scrollContent: {
    paddingBottom: Theme.spacing.safeArea.bottomPaddingLarge, // ✅ FIXED: 96 from theme (was hardcoded 120)
  },
  
  // Not found styles
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
    gap: Theme.spacing.m,
  },
  notFoundTitle: {
    marginTop: Theme.spacing.s,
  },
  notFoundButton: {
    marginTop: Theme.spacing.l,
  },
  
  // Image styles - ✅ ENHANCED: Added shadow
  imageCard: {
    marginBottom: Theme.spacing.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    ...Theme.shadows.md, // ✅ ADDED: Image card shadow for depth
  },
  image: {
    width: '100%',
    height: SCREEN_WIDTH * 0.75, // 4:3 aspect ratio
  },
  
  // Title section styles
  titleSection: {
    marginBottom: Theme.spacing.l,
  },
  titleRow: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    alignItems: 'flex-start',
  },
  emojiContainer: {
    width: 64,
    height: 64,
    borderRadius: Theme.borderRadius.l,
    backgroundColor: Theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  titleInfo: {
    flex: 1,
    gap: Theme.spacing.s,
  },
  title: {
    lineHeight: 32,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.s,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.s,
    alignSelf: 'flex-start',
  },
  
  // Details card styles - ✅ ENHANCED: Added shadow
  detailsCard: {
    marginBottom: Theme.spacing.l,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    ...Theme.shadows.sm, // ✅ ADDED: Details card shadow for depth
  },
  detailSection: {
    gap: Theme.spacing.m,
  },
  detailSectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}20`,
  },
  detailContent: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginVertical: Theme.spacing.m,
  },
  
  // Note section styles - ✅ ENHANCED: Added shadow
  noteSection: {
    marginBottom: Theme.spacing.l,
  },
  noteSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.m,
  },
  noteCard: {
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    ...Theme.shadows.sm, // ✅ ADDED: Note card shadow for depth
  },
  noteText: {
    lineHeight: 24,
  },
  
  // Metadata styles
  metadataSection: {
    gap: Theme.spacing.xs,
    paddingTop: Theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  // Footer styles - ✅ ENHANCED: Added shadow
  footer: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
    paddingBottom: Theme.spacing.s,
    ...Theme.shadows.md, // ✅ ADDED: Footer shadow for separation
  },
  footerButton: {
    width: '100%',
  },
});
