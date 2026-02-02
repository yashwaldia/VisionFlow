/**
 * VisionFlow AI - Reminders List Screen
 * Display and manage all reminders
 * 
 * @module screens/RemindersScreen
 */

import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
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

export function RemindersScreen({ navigation, route }: RemindersScreenProps) {
  const { reminders, isLoading } = useReminders(); // FIXED: Changed loading → isLoading
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReminderStatus | 'all'>('all');
  
  const filterCategory = route.params?.filterCategory;
  const filterProjectId = route.params?.filterProjectId;
  
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
      const dateA = new Date(`${a.reminderDate} ${a.reminderTime}`).getTime();
      const dateB = new Date(`${b.reminderDate} ${b.reminderTime}`).getTime();
      return dateB - dateA;
    });
    
    return result;
  }, [reminders, searchQuery, filterStatus, filterCategory, filterProjectId]);
  
  const statusCounts = useMemo(() => {
    return {
      all: reminders.length,
      [ReminderStatus.UPCOMING]: reminders.filter((r) => r.status === ReminderStatus.UPCOMING).length,
      [ReminderStatus.DONE]: reminders.filter((r) => r.status === ReminderStatus.DONE).length,
      [ReminderStatus.OVERDUE]: reminders.filter((r) => r.status === ReminderStatus.OVERDUE).length,
      [ReminderStatus.SNOOZED]: reminders.filter((r) => r.status === ReminderStatus.SNOOZED).length,
    };
  }, [reminders]);
  
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
    const statusColor = {
      [ReminderStatus.UPCOMING]: Theme.colors.semantic.info,
      [ReminderStatus.DONE]: Theme.colors.semantic.success,
      [ReminderStatus.OVERDUE]: Theme.colors.semantic.error,
      [ReminderStatus.SNOOZED]: Theme.colors.semantic.warning,
    }[item.status];
    
    return (
      <Card
        pressable
        onPress={() => handleReminderPress(item)}
        style={styles.reminderCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.emojiContainer}>
            <Text variant="h3">{item.emoji}</Text>
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text variant="body" weight="600" numberOfLines={1}>
              {item.title}
            </Text>
            <Text variant="caption" color="tertiary">
              {item.category}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}30` }]}>
            <Text
              variant="caption"
              weight="600"
              customColor={statusColor}
              style={styles.statusText}
            >
              {item.status}
            </Text>
          </View>
        </View>
        
        <Text variant="body" color="secondary" numberOfLines={2} style={styles.cardNote}>
          {item.smartNote}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.dateInfo}>
            <Icon name="calendar-outline" size="xs" color={Theme.colors.text.tertiary} />
            <Text variant="caption" color="tertiary">
              {item.reminderDate}
            </Text>
          </View>
          <View style={styles.dateInfo}>
            <Icon name="time-outline" size="xs" color={Theme.colors.text.tertiary} />
            <Text variant="caption" color="tertiary">
              {item.reminderTime}
            </Text>
          </View>
        </View>
      </Card>
    );
  };
  
  return (
    <Screen>
      <Container padding="none">
        <View style={styles.header}>
          <Container padding="m">
            <View style={styles.headerTop}>
              <Text variant="h2">Reminders</Text>
              <View style={styles.headerActions}>
                <Pressable onPress={handleCreateManual} haptic="light">
                  <Icon name="create-outline" size="md" />
                </Pressable>
                <Pressable onPress={handleAddReminder} haptic="light">
                  <Icon name="camera" size="md" color={Theme.colors.primary[500]} />
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
                      {item.label} ({item.count})
                    </Text>
                  </View>
                </Pressable>
              )}
              contentContainerStyle={styles.filtersContent}
            />
          </View>
        </View>
        
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
          />
        )}
      </Container>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
  },
  searchBar: {
    marginBottom: Theme.spacing.s,
  },
  filtersContainer: {
    paddingVertical: Theme.spacing.s,
  },
  filtersContent: {
    paddingHorizontal: Theme.spacing.m,
    gap: Theme.spacing.s,
  },
  filterChip: {
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.background.tertiary,
  },
  filterChipActive: {
    backgroundColor: `${Theme.colors.primary[500]}20`,
  },
  listContent: {
    padding: Theme.spacing.m,
    gap: Theme.spacing.s,
  },
  reminderCard: {
    padding: Theme.spacing.m,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
    marginBottom: Theme.spacing.s,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.s,
  },
  statusText: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  cardNote: {
    marginBottom: Theme.spacing.s,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
