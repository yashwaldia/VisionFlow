/**
 * VisionFlow AI - Reminder List Screen (v7.0 - Fixed Layout Edition)
 * Browse and manage all reminders with consistent card heights
 * 
 * @module screens/ReminderListScreen
 * 
 * CHANGELOG v7.0:
 * - 🔧 CRITICAL FIX: All cards now have uniform height
 * - 🔧 FIXED: Card layout restructured for consistency
 * - 🔧 FIXED: Metadata (category + date) on same line
 * - 🔧 FIXED: Title and smart note with fixed line counts
 * - ✅ All v6.0 Hidden Inside UI features preserved
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReminderStackParamList } from '../types/navigation.types';
import { ReminderCategory, ReminderStatus } from '../types/reminder.types';
import { Theme } from '../constants/theme';
import {
  Screen,
  Container,
  Text,
  Card,
  Icon,
  Pressable,
  EmptyState,
  LoadingSpinner,
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

  const searchInputRef = useRef<TextInput>(null);

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
        variant="glowBorder"
        elevation="sm"
        style={[
          styles.reminderCard,
          isDone ? styles.reminderCardDone : {},
        ]}
      >
        {/* 🔧 FIXED: New fixed-height layout structure */}
        <View style={styles.reminderContent}>
          {/* Left: Emoji Icon with Status Indicator */}
          <View style={styles.iconWrapper}>
            <View style={[styles.reminderIcon, { backgroundColor: statusConfig.bgColor }]}>
              <Text variant="h3">{item.emoji}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
          </View>

          {/* Center: Content (Fixed 3-line structure) */}
          <View style={styles.reminderInfo}>

            {/* Line 3: Title (Heading) - Always 1 line */}
            <Text
              variant="bodyLarge"
              weight="600"
              style={[styles.title, ...(isDone ? [styles.textDone] : [])]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.title}
            </Text>

            {/* Line 2: Smart Note (Description) - Always 1 line */}
            <Text 
              variant="body" 
              color="secondary" 
              italic 
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.smartNote}
            >
              {item.smartNote || 'No description'}
            </Text>
            {/* Line 1: Metadata (Category + Date) - Always on same line */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon name="pricetag-outline" size="xs" color={Theme.colors.text.tertiary} />
                <Text variant="caption" color="tertiary" mono numberOfLines={1}>
                  {item.category}
                </Text>
              </View>
              
              <View style={styles.metaDivider} />
              
              <View style={[styles.metaItem, styles.metaItemFlex]}>
                <Icon name="calendar-outline" size="xs" color={Theme.colors.text.tertiary} />
                <Text variant="caption" color="tertiary" mono numberOfLines={1}>
                  {formatRelativeDate(item.reminderDate, item.reminderTime)}
                </Text>
              </View>
            </View>            

            {/* Optional: Project Tag (if present, shows below) */}
            {item.projectName && (
              <View style={styles.projectTag}>
                <Icon name="folder-outline" size="xs" color={Theme.colors.primary[500]} />
                <Text variant="caption" customColor={Theme.colors.primary[500]} mono weight="600" numberOfLines={1}>
                  {item.projectName}
                </Text>
              </View>
            )}
          </View>

          {/* Right: Actions */}
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
      {/* Header - Fixed Outside FlatList */}
      <Container padding="m" style={styles.header}>
        {/* Header Top */}
        <View style={styles.headerTop}>
          <View>
            <Text variant="caption" mono weight="700" color="tertiary" style={styles.sectionLabel}>
              COMMAND_CENTER
            </Text>
            <Text variant="h2">Reminders</Text>
          </View>
          <Pressable 
            onPress={() => navigation.navigate('CameraModal' as any, { mode: 'reminder' })}
            haptic="medium"
            style={styles.captureButton}
          >
            <Icon name="camera" size="sm" color={Theme.colors.background.primary} />
            <Text variant="caption" weight="700" customColor={Theme.colors.background.primary} mono>
              CAPTURE
            </Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size="sm" color={Theme.colors.text.tertiary} />
          <TextInput
            ref={searchInputRef}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search reminders..."
            placeholderTextColor={Theme.colors.text.tertiary}
            style={styles.searchInput}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Icon name="close-circle" size="sm" color={Theme.colors.text.tertiary} />
            </Pressable>
          )}
        </View>

        {/* Stats Row */}
        <Text variant="caption" mono weight="700" color="tertiary" style={styles.sectionLabel}>
          STATUS_OVERVIEW
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="h4" customColor={Theme.colors.primary[500]} mono>
              {stats.upcoming}
            </Text>
            <Text variant="caption" color="secondary" mono>
              Upcoming
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text variant="h4" customColor={Theme.colors.semantic.success} mono>
              {stats.done}
            </Text>
            <Text variant="caption" color="secondary" mono>
              Done
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text variant="h4" customColor={Theme.colors.semantic.error} mono>
              {stats.overdue}
            </Text>
            <Text variant="caption" color="secondary" mono>
              Overdue
            </Text>
          </View>
        </View>

        {/* Category Filter */}
        <Text variant="caption" mono weight="700" color="tertiary" style={styles.sectionLabel}>
          FILTER_BY_CATEGORY
        </Text>
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
              mono
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
            { key: ReminderCategory.WORK, icon: 'briefcase-outline', label: 'Work' },
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
                mono
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

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" text="LOADING_REMINDERS..." />
        </View>
      ) : searchFilteredReminders.length === 0 && !searchQuery ? (
        <EmptyState
          icon="document-text-outline"
          title="No reminders found"
          description="Capture your first reminder to get started!"
          actionLabel="Capture Reminder"
          onActionPress={() => navigation.navigate('CameraModal' as any, { mode: 'reminder' })}
        />
      ) : (
        <FlatList
          data={searchFilteredReminders}
          renderItem={renderReminder}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            searchQuery ? (
              <View style={styles.emptySearch}>
                <Icon name="search-outline" size="xl" color={Theme.colors.text.tertiary} />
                <Text variant="h4" align="center" style={{ marginTop: Theme.spacing.m }}>
                  No matching reminders
                </Text>
                <Text variant="body" color="secondary" align="center" italic>
                  Try adjusting your search
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Theme.colors.primary[500]}
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
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
    ...Theme.shadows.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.m,
  },
  sectionLabel: {
    letterSpacing: 2,
    marginBottom: Theme.spacing.xs,
    opacity: 0.7,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.primary[500],
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Theme.borderRadius.m,
    ...Theme.shadows.glow,
  },

  // Search bar styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
    height: 48,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    paddingHorizontal: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.text.primary,
    fontFamily: Theme.typography.fontFamily.mono,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  
  // Stats styles
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}50`,
  },
  statItem: {
    alignItems: 'center',
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
    gap: 6,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
  },
  categoryChipActive: {
    backgroundColor: `${Theme.colors.primary[500]}20`,
    borderColor: Theme.colors.primary[500],
    shadowColor: Theme.colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // List styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Theme.spacing.m,
    gap: Theme.spacing.s,
    paddingBottom: Theme.spacing.safeArea.bottomPaddingLarge,
  },
  emptySearch: {
    padding: Theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 🔧 FIXED: Reminder card styles with uniform height
  reminderCard: {
    marginBottom: Theme.spacing.s,
    minHeight: 120, // Ensures consistent minimum height
  },
  reminderCardDone: {
    opacity: 0.7,
    borderColor: `${Theme.colors.semantic.success}50`,
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
  // 🔧 FIXED: Info section with controlled structure
  reminderInfo: {
    flex: 1,
    gap: 4, // Reduced gap for tighter layout
    justifyContent: 'flex-start',
  },
  // 🔧 FIXED: Metadata row (Line 1)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  metaItemFlex: {
    flex: 1,
    minWidth: 0,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Theme.colors.text.tertiary,
    opacity: 0.5,
  },
  // 🔧 FIXED: Smart note (Line 2)
  smartNote: {
    lineHeight: 18,
    height: 18, // Fixed height for 1 line
  },
  // 🔧 FIXED: Title (Line 3)
  title: {
    lineHeight: 20,
    height: 20, // Fixed height for 1 line
  },
  textDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  // Project tag (optional, below main structure)
  projectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 2,
    backgroundColor: `${Theme.colors.primary[500]}10`,
    borderRadius: Theme.borderRadius.s,
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
    alignSelf: 'flex-start',
    marginTop: 4,
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
