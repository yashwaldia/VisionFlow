/**
 * VisionFlow AI - Reminder List Screen (Professional v2.0)
 * Browse and manage all reminders
 * 
 * @module screens/ReminderListScreen
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReminderStackParamList } from '../types/navigation.types';
import { ReminderCategory, ReminderStatus, CATEGORY_EMOJIS } from '../types/reminder.types';
import { Theme } from '../constants/theme';
import {
  Screen,
  Container,
  Text,
  Card,
  Button,
  Icon,
  Pressable,
  EmptyState,
  LoadingSpinner,
  SearchBar,
} from '../components';
import { useReminders } from '../hooks/useReminders';
import * as Haptics from 'expo-haptics';

type ReminderListScreenProps = NativeStackScreenProps<ReminderStackParamList, 'ReminderList'>;

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

  if (isToday) return timeString ? `Today at ${timeString}` : 'Today';
  if (isTomorrow) return timeString ? `Tomorrow at ${timeString}` : 'Tomorrow';
  if (isYesterday) return timeString ? `Yesterday at ${timeString}` : 'Yesterday';

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const formattedDate = date.toLocaleDateString(undefined, options);
  return timeString ? `${formattedDate} at ${timeString}` : formattedDate;
};

/**
 * Get status configuration
 */
const getStatusConfig = (status: ReminderStatus) => {
  const configs = {
    [ReminderStatus.UPCOMING]: {
      color: Theme.colors.primary[500],
      icon: 'time-outline' as const,
      bgColor: `${Theme.colors.primary[500]}15`,
    },
    [ReminderStatus.DONE]: {
      color: Theme.colors.semantic.success,
      icon: 'checkmark-circle' as const,
      bgColor: `${Theme.colors.semantic.success}15`,
    },
    [ReminderStatus.OVERDUE]: {
      color: Theme.colors.semantic.error,
      icon: 'alert-circle' as const,
      bgColor: `${Theme.colors.semantic.error}15`,
    },
    [ReminderStatus.SNOOZED]: {
      color: Theme.colors.semantic.warning,
      icon: 'moon-outline' as const,
      bgColor: `${Theme.colors.semantic.warning}15`,
    },
  };
  return configs[status] || configs[ReminderStatus.UPCOMING];
};

/**
 * ReminderListScreen Component
 */
export function ReminderListScreen({ navigation, route }: ReminderListScreenProps) {
  const { filterCategory, filterProjectId } = route.params || {};
  
  const {
    filteredReminders,
    isLoading,
    stats,
    refreshReminders,
    markAsDone,
    deleteReminder,
    setFilters,
  } = useReminders();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ReminderCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Apply filters from route params
  useEffect(() => {
    if (filterCategory) {
      setSelectedCategory(filterCategory);
      setFilters({ category: filterCategory, status: 'all' });
    }
    if (filterProjectId) {
      setFilters({ projectId: filterProjectId, status: 'all' });
    }
  }, [filterCategory, filterProjectId]);

  // Filter by search query
  const searchFilteredReminders = useMemo(() => {
    if (!searchQuery.trim()) return filteredReminders;
    
    const query = searchQuery.toLowerCase();
    return filteredReminders.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.smartNote.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query)
    );
  }, [filteredReminders, searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshReminders();
    setRefreshing(false);
  };

  const handleCategoryFilter = (category: ReminderCategory | 'all') => {
    setSelectedCategory(category);
    setFilters({
      category: category as any,
      status: 'all',
      projectId: filterProjectId,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleReminderTap = (reminderId: string) => {
    navigation.navigate('ReminderDetail', { reminderId });
  };

  const handleMarkDone = async (id: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await markAsDone(id);
    } catch (error) {
      console.error('Failed to mark as done:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await deleteReminder(id);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const renderReminder = ({ item }: { item: any }) => {
    const statusConfig = getStatusConfig(item.status);
    const isDone = item.status === ReminderStatus.DONE;
    
    return (
      <Card
        key={item.id}
        pressable
        onPress={() => handleReminderTap(item.id)}
        style={StyleSheet.flatten([
          styles.reminderCard,
          isDone && styles.reminderCardDone
        ])}
      >
        <View style={styles.reminderContent}>
          {/* Emoji Icon with Status Indicator */}
          <View style={styles.iconWrapper}>
            <View style={[styles.reminderIcon, { backgroundColor: statusConfig.bgColor }]}>
              <Text variant="h3">{item.emoji}</Text>
            </View>
            {/* Status dot */}
            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
          </View>

          {/* Content */}
          <View style={styles.reminderInfo}>
            <Text
              variant="bodyLarge"
              weight="600"
              style={isDone ? styles.textDone : undefined}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            
            <Text variant="body" color="secondary" numberOfLines={1} style={styles.smartNote}>
              {item.smartNote}
            </Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon name="pricetag-outline" size="xs" color={Theme.colors.text.tertiary} />
                <Text variant="caption" color="tertiary">
                  {item.category}
                </Text>
              </View>
              
              <View style={styles.metaDivider} />
              
              <View style={styles.metaItem}>
                <Icon name="calendar-outline" size="xs" color={Theme.colors.text.tertiary} />
                <Text variant="caption" color="tertiary">
                  {formatRelativeDate(item.reminderDate, item.reminderTime)}
                </Text>
              </View>
            </View>
            
            {item.projectName && (
              <View style={styles.projectTag}>
                <Icon name="folder-outline" size="xs" color={Theme.colors.primary[500]} />
                <Text variant="caption" customColor={Theme.colors.primary[500]}>
                  {item.projectName}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionContainer}>
            {item.status === ReminderStatus.UPCOMING && (
              <Pressable
                onPress={() => handleMarkDone(item.id)}
                style={styles.actionButton}
                hitSlop={8}
              >
                <Icon name="checkmark-circle-outline" size="md" color={Theme.colors.semantic.success} />
              </Pressable>
            )}

            {isDone && (
              <View style={styles.doneIndicator}>
                <Icon name="checkmark-circle" size="md" color={Theme.colors.semantic.success} />
              </View>
            )}
            
            <Icon name="chevron-forward-outline" size="sm" color={Theme.colors.text.tertiary} />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <Screen>
      {/* Header */}
      <Container padding="m" style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text variant="h2">Reminders</Text>
            <Text variant="caption" color="tertiary">
              {filteredReminders.length} {filteredReminders.length === 1 ? 'reminder' : 'reminders'}
            </Text>
          </View>
          <Pressable 
            onPress={() => navigation.navigate('CameraModal' as any, { mode: 'reminder' })}
            haptic="medium"
            style={styles.captureButton}
          >
            <Icon name="camera" size="sm" color={Theme.colors.background.primary} />
            <Text variant="caption" weight="700" customColor={Theme.colors.background.primary}>
              CAPTURE
            </Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search reminders..."
          style={styles.searchBar}
        />

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card elevation="sm" style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${Theme.colors.primary[500]}15` }]}>
              <Icon name="time-outline" size="sm" color={Theme.colors.primary[500]} />
            </View>
            <Text variant="h3" customColor={Theme.colors.primary[500]}>
              {stats.upcoming}
            </Text>
            <Text variant="caption" color="secondary">Upcoming</Text>
          </Card>
          
          <Card elevation="sm" style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${Theme.colors.semantic.success}15` }]}>
              <Icon name="checkmark-circle-outline" size="sm" color={Theme.colors.semantic.success} />
            </View>
            <Text variant="h3" customColor={Theme.colors.semantic.success}>
              {stats.done}
            </Text>
            <Text variant="caption" color="secondary">Done</Text>
          </Card>
          
          <Card elevation="sm" style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${Theme.colors.semantic.error}15` }]}>
              <Icon name="alert-circle-outline" size="sm" color={Theme.colors.semantic.error} />
            </View>
            <Text variant="h3" customColor={Theme.colors.semantic.error}>
              {stats.overdue}
            </Text>
            <Text variant="caption" color="secondary">Overdue</Text>
          </Card>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryFilter}>
        <Pressable
            onPress={() => handleCategoryFilter('all')}
            style={[
            styles.categoryChip,
            selectedCategory === 'all' ? styles.categoryChipActive : {},
            ]}
        >
            <Icon 
            name="apps-outline" 
            size="xs" 
            color={selectedCategory === 'all' ? Theme.colors.primary[500] : Theme.colors.text.secondary} 
            />
            <Text
            variant="caption"
            weight="700"
            customColor={
                selectedCategory === 'all'
                ? Theme.colors.primary[500]
                : Theme.colors.text.secondary
            }
            >
            ALL
            </Text>
        </Pressable>

        {[
            { key: ReminderCategory.PERSONAL, icon: 'home-outline', label: 'Personal' },
            { key: ReminderCategory.WORK, icon: 'briefcase-outline', label: 'Workk' },
            { key: ReminderCategory.HEALTH, icon: 'fitness-outline', label: 'Health' },
            { key: ReminderCategory.MONEY, icon: 'cash-outline', label: 'Money' },
        ].map((cat) => (
            <Pressable
            key={cat.key}
            onPress={() => handleCategoryFilter(cat.key)}
            style={[
                styles.categoryChip,
                selectedCategory === cat.key ? styles.categoryChipActive : {},
            ]}
            >
            <Icon 
                name={cat.icon as any} 
                size="xs" 
                color={selectedCategory === cat.key ? Theme.colors.primary[500] : Theme.colors.text.secondary} 
            />
            <Text
                variant="caption"
                weight="700"
                customColor={
                selectedCategory === cat.key
                    ? Theme.colors.primary[500]
                    : Theme.colors.text.secondary
                }
            >
                {cat.label.toUpperCase()}
            </Text>
            </Pressable>
        ))}
        </View>

      </Container>

      {/* List */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" text="Loading reminders..." />
        </View>
      ) : searchFilteredReminders.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title={searchQuery ? "No matching reminders" : "No reminders found"}
          description={
            searchQuery
              ? "Try adjusting your search"
              : "Capture your first reminder to get started!"
          }
          actionLabel={searchQuery ? undefined : "Capture Reminder"}
          onActionPress={searchQuery ? undefined : () => navigation.navigate('CameraModal' as any, { mode: 'reminder' })}
        />
      ) : (
        <FlatList
          data={searchFilteredReminders}
          renderItem={renderReminder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Theme.colors.primary[500]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header styles
  header: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
    paddingTop: Platform.OS === 'ios' ? 0 : Theme.spacing.s,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.m,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.primary[500],
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Theme.borderRadius.m,
  },
  searchBar: {
    marginBottom: Theme.spacing.m,
  },
  
  // Stats styles
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
    marginBottom: Theme.spacing.m,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.xs,
    gap: 6,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  
  // Category filter styles
  categoryFilter: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
    flexWrap: 'wrap',
    paddingBottom: Theme.spacing.xs,
  },
    categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Space between icon and text
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    },
    categoryChipActive: {
    backgroundColor: `${Theme.colors.primary[500]}15`,
    borderColor: Theme.colors.primary[500],
    },

  
  // List styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Theme.spacing.m,
    paddingBottom: 120, // Space for bottom tab bar
    gap: Theme.spacing.s,
  },
  
  // Reminder card styles
  reminderCard: {
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  reminderCardDone: {
    opacity: 0.7,
    borderColor: `${Theme.colors.semantic.success}30`,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.m,
  },
  iconWrapper: {
    position: 'relative',
  },
  reminderIcon: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}20`,
  },
  statusDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Theme.colors.background.secondary,
  },
  reminderInfo: {
    flex: 1,
    gap: 6,
  },
  smartNote: {
    lineHeight: 18,
  },
  textDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Theme.colors.text.tertiary,
    opacity: 0.5,
  },
  projectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 2,
    backgroundColor: `${Theme.colors.primary[500]}10`,
    borderRadius: Theme.borderRadius.s,
    alignSelf: 'flex-start',
  },
  actionContainer: {
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  actionButton: {
    padding: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: `${Theme.colors.semantic.success}10`,
  },
  doneIndicator: {
    padding: Theme.spacing.xs,
  },
});
