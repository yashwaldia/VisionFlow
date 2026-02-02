/**
 * VisionFlow AI - Reminder List Screen (100% ERROR-FREE)
 * Browse and manage all reminders
 * 
 * @module screens/ReminderListScreen
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
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
} from '../components';
import { useReminders } from '../hooks/useReminders';
import * as Haptics from 'expo-haptics';

type ReminderListScreenProps = NativeStackScreenProps<ReminderStackParamList, 'ReminderList'>;

/**
 * ReminderListScreen Component
 */
export function ReminderListScreen({ navigation, route }: ReminderListScreenProps) {
  const { filterCategory, filterProjectId } = route.params;
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

  useEffect(() => {
    if (filterCategory) {
      setSelectedCategory(filterCategory);
      setFilters({ category: filterCategory, status: 'all' });
    }
    if (filterProjectId) {
      setFilters({ projectId: filterProjectId, status: 'all' });
    }
  }, [filterCategory, filterProjectId]);

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

  const renderReminder = ({ item }: { item: any }) => (
    <Card
      key={item.id}
      pressable
      onPress={() => handleReminderTap(item.id)}
      style={styles.reminderCard}
    >
      <View style={styles.reminderContent}>
        {/* Emoji Icon - FIXED: Use undefined instead of null */}
        <View
          style={[
            styles.reminderIcon,
            item.status === ReminderStatus.DONE ? styles.reminderIconDone : undefined,
          ]}
        >
          <Text variant="h3">{item.emoji}</Text>
        </View>

        {/* Content */}
        <View style={styles.reminderInfo}>
          <Text
            variant="bodyLarge"
            weight="600"
            style={item.status === ReminderStatus.DONE ? styles.textDone : undefined}
          >
            {item.title}
          </Text>
          <Text variant="caption" color="secondary">
            {item.category} • {item.reminderDate} {item.reminderTime}
          </Text>
          {item.projectName && (
            <Text variant="caption" color="tertiary">
              📁 {item.projectName}
            </Text>
          )}
        </View>

        {/* Actions */}
        {item.status === ReminderStatus.UPCOMING && (
          <Pressable
            onPress={() => handleMarkDone(item.id)}
            style={styles.actionButton}
          >
            <Icon name="checkmark-circle-outline" size="md" color={Theme.colors.semantic.success} />
          </Pressable>
        )}

        {item.status === ReminderStatus.DONE && (
          <View style={styles.doneIndicator}>
            <Icon name="checkmark-circle" size="md" color={Theme.colors.semantic.success} />
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <Screen>
      {/* Header */}
      <Container padding="m" style={styles.header}>
        <View style={styles.headerTop}>
          <Text variant="h2">Reminders</Text>
          <Button
            label="Capture"
            leftIcon="camera-outline"
            variant="primary"
            size="small"
            onPress={() => navigation.navigate('CameraModal' as any, { mode: 'reminder' })}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="h4" customColor={Theme.colors.primary[500]}>
              {stats.upcoming}
            </Text>
            <Text variant="caption" color="secondary">Upcoming</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="h4" customColor={Theme.colors.semantic.success}>
              {stats.done}
            </Text>
            <Text variant="caption" color="secondary">Done</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="h4" customColor={Theme.colors.semantic.error}>
              {stats.overdue}
            </Text>
            <Text variant="caption" color="secondary">Overdue</Text>
          </View>
        </View>

        {/* Category Filter - FIXED: Use undefined instead of null */}
        <View style={styles.categoryFilter}>
          <Pressable
            onPress={() => handleCategoryFilter('all')}
            style={[
              styles.categoryChip,
              selectedCategory === 'all' ? styles.categoryChipActive : {},
            ]}
          >
            <Text
              variant="caption"
              weight="600"
              customColor={
                selectedCategory === 'all'
                  ? Theme.colors.text.inverse
                  : Theme.colors.text.secondary
              }
            >
              ALL
            </Text>
          </Pressable>

          {[
            ReminderCategory.PERSONAL,
            ReminderCategory.WORK,
            ReminderCategory.HEALTH,
            ReminderCategory.MONEY,
          ].map((cat) => (
            <Pressable
              key={cat}
              onPress={() => handleCategoryFilter(cat)}
              style={[
                styles.categoryChip,
                selectedCategory === cat ? styles.categoryChipActive : {},
              ]}
            >
              <Text
                variant="caption"
                weight="600"
                customColor={
                  selectedCategory === cat
                    ? Theme.colors.text.inverse
                    : Theme.colors.text.secondary
                }
              >
                {CATEGORY_EMOJIS[cat]} {cat}
              </Text>
            </Pressable>
          ))}
        </View>

      </Container>

      {/* List */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      ) : filteredReminders.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="No reminders found"
          description="Capture your first reminder to get started!"
          actionLabel="Capture Reminder"
          onActionPress={() => navigation.navigate('CameraModal' as any, { mode: 'reminder' })}
        />
      ) : (
        <FlatList
          data={filteredReminders}
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
  header: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
  },
  statItem: {
    alignItems: 'center',
  },
  categoryFilter: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: Theme.colors.border.medium,
  },
  categoryChipActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Theme.spacing.m,
    gap: Theme.spacing.s,
  },
  reminderCard: {
    marginBottom: Theme.spacing.s,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  reminderIcon: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderIconDone: {
    backgroundColor: `${Theme.colors.semantic.success}20`,
    opacity: 0.6,
  },
  reminderInfo: {
    flex: 1,
  },
  textDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  actionButton: {
    padding: Theme.spacing.s,
  },
  doneIndicator: {
    padding: Theme.spacing.s,
  },
});