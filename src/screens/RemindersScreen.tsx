/**
 * VisionFlow AI - Reminders List Screen (v2.1 - Harmonized Edition)
 * Display and manage all reminders
 * 
 * @module screens/RemindersScreen
 * 
 * CHANGELOG v2.1:
 * - ✅ Removed hardcoded paddingBottom (uses theme constant)
 * - ✅ Consistent filter chip styling
 */

import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  ReminderStackParamList,
  MainTabParamList,
  RootStackParamList,
} from '../types/navigation.types';
import {
  ReminderStatus,
  ReminderCategory,
  Reminder,
} from '../types/reminder.types';
import { Theme } from '../constants/theme';
import {
  Screen,
  Container,
  Text,
  Card,
  SearchBar,
  Button,
  Icon,
  Pressable,
  EmptyState,
  LoadingSpinner,
} from '../components';
import { useReminders } from '../hooks/useReminders';

type RemindersScreenNavigationProp = CompositeNavigationProp<
  NativeStackScreenProps<ReminderStackParamList, 'ReminderList'>['navigation'],
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    NativeStackScreenProps<RootStackParamList>['navigation']
  >
>;

type RemindersScreenProps = NativeStackScreenProps<
  ReminderStackParamList,
  'ReminderList'
> & {
  navigation: RemindersScreenNavigationProp;
};

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

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

/**
 * Get status configuration (color, icon, label)
 */
const getStatusConfig = (status: ReminderStatus) => {
  const configs = {
    [ReminderStatus.UPCOMING]: {
      color: Theme.colors.primary[500],
      icon: 'time-outline' as const,
      label: 'Upcoming',
    },
    [ReminderStatus.DONE]: {
      color: Theme.colors.semantic.success,
      icon: 'checkmark-circle' as const,
      label: 'Done',
    },
    [ReminderStatus.OVERDUE]: {
      color: Theme.colors.semantic.error,
      icon: 'alert-circle' as const,
      label: 'Overdue',
    },
    [ReminderStatus.SNOOZED]: {
      color: Theme.colors.semantic.warning,
      icon: 'moon-outline' as const,
      label: 'Snoozed',
    },
  };
  return configs[status] || configs[ReminderStatus.UPCOMING];
};

export function RemindersScreen({ navigation, route }: RemindersScreenProps) {
  const { reminders, isLoading, refreshReminders } = useReminders();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReminderStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const filterCategory = route.params?.filterCategory;
  const filterProjectId = route.params?.filterProjectId;
  
  // Filtered reminders
  const filteredReminders = useMemo(() => {
    let result = [...reminders];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.smartNote.toLowerCase().includes(query) ||
          r.category.toLowerCase().includes(query)
      );
    }
    
    if (filterStatus !== 'all') {
      result = result.filter((r) => r.status === filterStatus);
    }
    
    if (filterCategory) {
      result = result.filter((r) => r.category === filterCategory);
    }
    
    if (filterProjectId) {
      result = result.filter((r) => r.projectId === filterProjectId);
    }
    
    result.sort((a, b) => {
      const dateA = new Date(`${a.reminderDate} ${a.reminderTime || '00:00'}`).getTime();
      const dateB = new Date(`${b.reminderDate} ${b.reminderTime || '00:00'}`).getTime();
      return dateA - dateB; // Sort ascending (earliest first)
    });
    
    return result;
  }, [reminders, searchQuery, filterStatus, filterCategory, filterProjectId]);
  
  // Status counts
  const statusCounts = useMemo(() => {
    return {
      all: reminders.length,
      [ReminderStatus.UPCOMING]: reminders.filter((r) => r.status === ReminderStatus.UPCOMING).length,
      [ReminderStatus.DONE]: reminders.filter((r) => r.status === ReminderStatus.DONE).length,
      [ReminderStatus.OVERDUE]: reminders.filter((r) => r.status === ReminderStatus.OVERDUE).length,
      [ReminderStatus.SNOOZED]: reminders.filter((r) => r.status === ReminderStatus.SNOOZED).length,
    };
  }, [reminders]);
  
  // Pull to refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshReminders();
    setRefreshing(false);
  };
  
  const handleAddReminder = () => {
    navigation.navigate('CameraModal', { mode: 'reminder' });
  };
  
  const handleReminderPress = (reminder: Reminder) => {
    navigation.navigate('ReminderDetail', { reminderId: reminder.id });
  };
  
  const handleCreateManual = () => {
    navigation.navigate('CreateReminder', {});
  };
  
  const renderReminderCard = ({ item }: { item: Reminder }) => {
    const statusConfig = getStatusConfig(item.status);
    
    return (
      <Card
        pressable
        onPress={() => handleReminderPress(item)}
        style={styles.reminderCard}
      >
        <View style={styles.cardContent}>
          {/* Left: Emoji with status indicator */}
          <View style={styles.emojiWrapper}>
            <View style={styles.emojiContainer}>
              <Text variant="h3">{item.emoji}</Text>
            </View>
            {/* Status indicator dot */}
            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
          </View>
          
          {/* Center: Info */}
          <View style={styles.cardInfo}>
            <Text variant="bodyLarge" weight="600" numberOfLines={1}>
              {item.title}
            </Text>
            <Text variant="body" color="secondary" numberOfLines={2} style={styles.cardNote}>
              {item.smartNote}
            </Text>
            
            {/* Meta information */}
            <View style={styles.cardMeta}>
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
                  {formatRelativeDate(item.reminderDate)}
                </Text>
              </View>
              {item.reminderTime && (
                <>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Icon name="time-outline" size="xs" color={Theme.colors.text.tertiary} />
                    <Text variant="caption" color="tertiary">
                      {item.reminderTime}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
          
          {/* Right: Status badge */}
          <View style={styles.statusBadgeContainer}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}15` }]}>
              <Icon name={statusConfig.icon} size="xs" color={statusConfig.color} />
            </View>
            <Icon name="chevron-forward-outline" size="sm" color={Theme.colors.text.tertiary} />
          </View>
        </View>
      </Card>
    );
  };
  
  return (
    <Screen>
      <Container padding="none">
        {/* Fixed Header */}
        <View style={styles.header}>
          <Container padding="m">
            <View style={styles.headerTop}>
              <View>
                <Text variant="h2">Reminders</Text>
                <Text variant="caption" color="tertiary">
                  {reminders.length} total • {statusCounts[ReminderStatus.UPCOMING]} upcoming
                </Text>
              </View>
              <View style={styles.headerActions}>
                <Pressable onPress={handleCreateManual} haptic="light" style={styles.iconButton}>
                  <Icon name="create-outline" size="md" color={Theme.colors.text.secondary} />
                </Pressable>
                <Pressable onPress={handleAddReminder} haptic="light" style={styles.iconButtonPrimary}>
                  <Icon name="camera" size="md" color={Theme.colors.background.primary} />
                </Pressable>
              </View>
            </View>
            
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search reminders..."
              style={styles.searchBar}
            />
          </Container>
          
          {/* Status Filters - ✅ Using consistent chip styling */}
          <View style={styles.filtersContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[
                { key: 'all', label: 'All', count: statusCounts.all },
                { key: ReminderStatus.UPCOMING, label: 'Upcoming', count: statusCounts[ReminderStatus.UPCOMING] },
                { key: ReminderStatus.DONE, label: 'Done', count: statusCounts[ReminderStatus.DONE] },
                { key: ReminderStatus.OVERDUE, label: 'Overdue', count: statusCounts[ReminderStatus.OVERDUE] },
              ]}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setFilterStatus(item.key as ReminderStatus | 'all')}
                  haptic="light"
                >
                  <View
                    style={[
                      styles.filterChip,
                      filterStatus === item.key && styles.filterChipActive,
                    ]}
                  >
                    <Text
                      variant="body"
                      weight="600"
                      customColor={
                        filterStatus === item.key
                          ? Theme.colors.primary[500]
                          : Theme.colors.text.secondary
                      }
                    >
                      {item.label}
                    </Text>
                    <View style={[
                      styles.countBadge,
                      filterStatus === item.key && styles.countBadgeActive,
                    ]}>
                      <Text 
                        variant="caption" 
                        weight="700"
                        customColor={
                          filterStatus === item.key
                            ? Theme.colors.primary[500]
                            : Theme.colors.text.tertiary
                        }
                      >
                        {item.count}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )}
              contentContainerStyle={styles.filtersContent}
            />
          </View>
        </View>
        
        {/* Content */}
        {isLoading ? (
          <LoadingSpinner text="Loading reminders..." />
        ) : filteredReminders.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No reminders found"
            description={
              searchQuery
                ? 'Try adjusting your search'
                : 'Capture your first reminder with the camera'
            }
            actionLabel="Capture Reminder"
            onActionPress={handleAddReminder}
          />
        ) : (
          <FlatList
            data={filteredReminders}
            renderItem={renderReminderCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Theme.colors.primary[500]}
              />
            }
          />
        )}
      </Container>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header styles
  header: {
    backgroundColor: Theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.m,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPrimary: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    marginBottom: Theme.spacing.s,
  },
  
  // Filters styles - ✅ Consistent with theme
  filtersContainer: {
    paddingVertical: Theme.spacing.s,
    backgroundColor: Theme.colors.background.primary,
  },
  filtersContent: {
    paddingHorizontal: Theme.spacing.m,
    gap: Theme.spacing.s,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
    borderRadius: Theme.borderRadius.full,  // ✅ Consistent pill shape
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: Theme.colors.border.medium,
  },
  filterChipActive: {
    backgroundColor: `${Theme.colors.primary[500]}20`,  // ✅ 20% opacity
    borderColor: Theme.colors.primary[500],
  },
  countBadge: {
    minWidth: 24,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: Theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeActive: {
    backgroundColor: `${Theme.colors.primary[500]}25`,
  },
  
  // List styles - ✅ FIXED: Uses theme constant instead of hardcoded value
  listContent: {
    padding: Theme.spacing.m,
    paddingBottom: Theme.spacing.safeArea.bottomPadding,  // ✅ Uses theme constant (80)
    gap: Theme.spacing.s,
  },
  
  // Card styles
  reminderCard: {
    padding: Theme.spacing.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.m,
  },
  emojiWrapper: {
    position: 'relative',
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
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
  cardInfo: {
    flex: 1,
    gap: 6,
  },
  cardNote: {
    lineHeight: 20,
  },
  cardMeta: {
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
  statusBadgeContainer: {
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
