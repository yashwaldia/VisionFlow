/**
 * VisionFlow AI - Reminder Detail Screen (v4.1 - Loading Fix Edition)
 * View and manage a single reminder with proper loading states
 * 
 * @module screens/ReminderDetailScreen
 * 
 * CHANGELOG v4.1:
 * - 🔧 CRITICAL FIX: Added loading state to prevent premature error screen
 * - 🔧 FIXED: Shows loading spinner while fetching reminder
 * - 🔧 FIXED: Error screen only appears after loading completes
 * - ✅ All v4.0 Hidden Inside UI features preserved
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Dimensions, Animated } from 'react-native';
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
  const { getReminderById, markAsDone, deleteReminder, isLoading } = useReminders();
  
  // 🔧 NEW: Track local loading state
  const [isLocalLoading, setIsLocalLoading] = useState(true);
  const [reminder, setReminder] = useState(getReminderById(reminderId));

  const glowPulse = useRef(new Animated.Value(0.4)).current;

  // 🔧 FIXED: Load reminder with proper loading state
  useEffect(() => {
    const loadReminder = async () => {
      setIsLocalLoading(true);
      // Small delay to ensure data is fetched
      await new Promise(resolve => setTimeout(resolve, 100));
      const fetchedReminder = getReminderById(reminderId);
      setReminder(fetchedReminder);
      setIsLocalLoading(false);
    };

    loadReminder();
  }, [reminderId, getReminderById]);

  useEffect(() => {
    if (reminder && reminder.status !== ReminderStatus.DONE) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowPulse, {
            toValue: 0.4,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [reminder]);

  // 🔧 FIXED: Check loading state FIRST before showing error
  if (isLocalLoading || isLoading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" text="LOADING_REMINDER..." />
        </View>
      </Screen>
    );
  }

  // 🔧 FIXED: Only show error screen AFTER loading is complete
  if (!reminder) {
    return (
      <Screen>
        <Container padding="m">
          <View style={styles.notFoundContainer}>
            <Icon name="alert-circle-outline" size="xl" color={Theme.colors.text.tertiary} />
            <Text variant="h3" align="center" style={styles.notFoundTitle}>
              Reminder not found
            </Text>
            <Text variant="body" color="secondary" align="center" italic>
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
  const isOverdue = reminder.status === ReminderStatus.OVERDUE;

  const handleEdit = () => {
    console.log('📝 Edit button pressed, navigating to EditReminderScreen');
    (navigation as any).getParent()?.navigate('EditReminderScreen', { reminder });
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
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} haptic="light" style={styles.headerButton}>
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <Text variant="h4" weight="600" mono>DETAILS</Text>
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
          {/* Image with glassmorphism overlay */}
          {reminder.imageUri && (
            <Card 
              padding={0} 
              elevation="md"
              style={styles.imageCard}
            >
              <Image 
                source={{ uri: reminder.imageUri }} 
                style={styles.image} 
                resizeMode="cover" 
              />
              <View style={styles.imageOverlay}>
                <View style={styles.imageOverlayGradient} />
              </View>
            </Card>
          )}

          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <View
                style={[
                  styles.emojiContainer,
                  {
                    backgroundColor: statusConfig.bgColor,
                    borderColor: `${Theme.colors.border.default}20`,
                  },
                ]}
              >
                <Text variant="h1">{reminder.emoji}</Text>
              </View>
              
              <View style={styles.titleInfo}>
                <Text variant="h2" style={styles.title}>
                  {reminder.title}
                </Text>
                
                {/* Status badge */}
                <Card
                  variant="glass"
                  elevation="none"
                  padding={8}
                  borderRadius={Theme.borderRadius.s}
                  style={[
                    styles.statusBadgeCard,
                    { borderColor: statusConfig.color },
                  ]}
                >
                  <Icon name={statusConfig.icon} size="xs" color={statusConfig.color} />
                  <Text variant="caption" weight="700" customColor={statusConfig.color} mono>
                    {statusConfig.label.toUpperCase()}
                  </Text>
                </Card>
              </View>
            </View>
          </View>

          {/* Details Card */}
          <Card 
            variant="glowBorder"
            elevation="md"
            style={styles.detailsCard}
          >
            {/* Date & Time */}
            <View style={styles.detailSection}>
              <Text variant="caption" color="tertiary" mono weight="700" style={styles.detailSectionTitle}>
                SCHEDULED_FOR
              </Text>
              
              <View style={styles.detailRow}>
                <View
                  style={[
                    styles.detailIconContainer,
                    {
                      backgroundColor: `${Theme.colors.primary[500]}15`,
                      borderColor: `${Theme.colors.primary[500]}30`,
                      shadowColor: Theme.colors.primary[500],
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: 4,
                    },
                  ]}
                >
                  <Icon name="calendar" size="sm" color={Theme.colors.primary[500]} />
                </View>
                <View style={styles.detailContent}>
                  <Text variant="bodyLarge" weight="600" mono>
                    {formatRelativeDate(reminder.reminderDate)}
                  </Text>
                  <Text variant="caption" color="secondary" mono>
                    {reminder.reminderDate}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View
                  style={[
                    styles.detailIconContainer,
                    {
                      backgroundColor: `${Theme.colors.primary[500]}15`,
                      borderColor: `${Theme.colors.primary[500]}30`,
                      shadowColor: Theme.colors.primary[500],
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: 4,
                    },
                  ]}
                >
                  <Icon name="time" size="sm" color={Theme.colors.primary[500]} />
                </View>
                <View style={styles.detailContent}>
                  <Text variant="bodyLarge" weight="600" mono>
                    {reminder.reminderTime}
                  </Text>
                  <Text variant="caption" color="secondary" mono>
                    Time
                  </Text>
                </View>
              </View>
            </View>

            {/* Gradient divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerGradient} />
            </View>
            
            {/* Category & Project */}
            <View style={styles.detailSection}>
              <Text variant="caption" color="tertiary" mono weight="700" style={styles.detailSectionTitle}>
                ORGANIZATION
              </Text>
              
              <View style={styles.detailRow}>
                <View
                  style={[
                    styles.detailIconContainer,
                    {
                      backgroundColor: `${Theme.colors.semantic.info}15`,
                      borderColor: `${Theme.colors.semantic.info}30`,
                      shadowColor: Theme.colors.semantic.info,
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: 4,
                    },
                  ]}
                >
                  <Icon name="pricetag" size="sm" color={Theme.colors.semantic.info} />
                </View>
                <View style={styles.detailContent}>
                  <Text variant="bodyLarge" weight="600" mono>
                    {reminder.category}
                  </Text>
                  <Text variant="caption" color="secondary" mono>
                    Category
                  </Text>
                </View>
              </View>

              {reminder.projectName && (
                <View style={styles.detailRow}>
                  <View
                    style={[
                      styles.detailIconContainer,
                      {
                        backgroundColor: `${Theme.colors.semantic.warning}15`,
                        borderColor: `${Theme.colors.semantic.warning}30`,
                        shadowColor: Theme.colors.semantic.warning,
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: 4,
                      },
                    ]}
                  >
                    <Icon name="folder" size="sm" color={Theme.colors.semantic.warning} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text variant="bodyLarge" weight="600" mono>
                      {reminder.projectName}
                    </Text>
                    <Text variant="caption" color="secondary" mono>
                      Project
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Card>

          {/* Smart Note section */}
          <View style={styles.noteSection}>
            <View style={styles.noteSectionHeader}>
              <Icon name="document-text-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="h4" mono>SMART_NOTE</Text>
            </View>
            <Card 
              variant="glass"
              elevation="sm"
              style={styles.noteCard}
            >
              <Text variant="body" italic style={styles.noteText}>
                {reminder.smartNote}
              </Text>
            </Card>
          </View>

          {/* Metadata */}
          <View style={styles.metadataSection}>
            <View style={styles.metadataRow}>
              <Icon name="add-circle-outline" size="xs" color={Theme.colors.text.tertiary} />
              <Text variant="caption" color="tertiary" mono>
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
                <Text variant="caption" color="tertiary" mono>
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

      {/* Footer with glassmorphism and pulsing glow */}
      {!isDone && (
        <View style={styles.footer}>
          <Container padding="m">
            <Animated.View
              style={{
                shadowColor: Theme.colors.semantic.success,
                shadowOpacity: glowPulse,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 0 },
                elevation: 8,
                borderRadius: Theme.borderRadius.m,
              }}
            >
              <Button
                label="Mark as Complete"
                variant="primary"
                size="large"
                leftIcon="checkmark-circle"
                onPress={handleMarkDone}
                style={styles.footerButton}
              />
            </Animated.View>
          </Container>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  headerActions: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  
  // 🔧 NEW: Loading container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Content styles
  scrollContent: {
    paddingBottom: Theme.spacing.safeArea.bottomPaddingLarge,
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
  
  // Image styles
  imageCard: {
    marginBottom: Theme.spacing.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  image: {
    width: '100%',
    height: SCREEN_WIDTH * 0.75,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  imageOverlayGradient: {
    flex: 1,
    backgroundColor: 'transparent',
    borderBottomLeftRadius: Theme.borderRadius.l,
    borderBottomRightRadius: Theme.borderRadius.l,
  },
  
  // Title section
  titleSection: {
    marginBottom: Theme.spacing.l,
  },
  titleRow: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    alignItems: 'flex-start',
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  titleInfo: {
    flex: 1,
    gap: Theme.spacing.s,
  },
  title: {
    lineHeight: 32,
  },
  statusBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  
  // Details card
  detailsCard: {
    marginBottom: Theme.spacing.l,
  },
  detailSection: {
    gap: Theme.spacing.m,
  },
  detailSectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 10,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  detailContent: {
    flex: 1,
    gap: 2,
  },
  
  // Gradient divider
  dividerContainer: {
    marginVertical: Theme.spacing.m,
    alignItems: 'center',
  },
  dividerGradient: {
    width: '100%',
    height: 1,
    backgroundColor: Theme.colors.border.light,
    opacity: 0.5,
  },
  
  // Note section
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
    borderColor: `${Theme.colors.border.default}50`,
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
  
  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    backgroundColor: Theme.glassmorphism.tint,
    paddingBottom: Theme.spacing.s,
    ...Theme.shadows.md,
  },
  footerButton: {
    width: '100%',
  },
});
