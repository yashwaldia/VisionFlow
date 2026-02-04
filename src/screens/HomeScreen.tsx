/**
 * VisionFlow AI - Home Screen (v2.1 - Harmonized Edition)
 * Dashboard with overview and quick actions
 * 
 * @module screens/HomeScreen
 * 
 * CHANGELOG v2.1:
 * - ✅ Removed hardcoded paddingBottom (Screen component handles it)
 * - ✅ Simplified scroll handling via Screen component
 * - ✅ Kept h1 for main title (appropriate for home screen)
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  HomeStackParamList,
  MainTabParamList,
  RootStackParamList
} from '../types/navigation.types';
import { ReminderStatus } from '../types/reminder.types';
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
} from '../components';
import { useReminders } from '../hooks/useReminders';
import { useProjects } from '../hooks/useProjects';
import { usePatterns } from '../hooks/usePatterns';

// Composite navigation type
type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackScreenProps<HomeStackParamList, 'Home'>['navigation'],
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    NativeStackScreenProps<RootStackParamList>['navigation']
  >
>;

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

/**
 * Get time-based greeting
 */
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Format date for reminder card
 */
const formatReminderDate = (dateString: string, timeString?: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) {
    return timeString ? `Today at ${timeString}` : 'Today';
  }
  if (isTomorrow) {
    return timeString ? `Tomorrow at ${timeString}` : 'Tomorrow';
  }

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const formattedDate = date.toLocaleDateString(undefined, options);
  return timeString ? `${formattedDate} at ${timeString}` : formattedDate;
};

/**
 * Get status indicator color
 */
const getStatusColor = (status: ReminderStatus): string => {
  switch (status) {
    case ReminderStatus.UPCOMING:
      return Theme.colors.primary[500];
    case ReminderStatus.DONE:
      return Theme.colors.semantic.success;
    case ReminderStatus.OVERDUE:
      return Theme.colors.semantic.error;
    case ReminderStatus.SNOOZED:
      return Theme.colors.semantic.warning;
    default:
      return Theme.colors.text.tertiary;
  }
};

/**
 * HomeScreen Component
 * 
 * Main dashboard showing:
 * - Clean stat cards with proper spacing
 * - Recent activity with status indicators
 * - Quick action buttons
 */
export function HomeScreen({ navigation }: HomeScreenProps) {
  const { reminders, isLoading, refreshReminders } = useReminders();
  const { projects } = useProjects();
  const { patterns } = usePatterns();

  const [refreshing, setRefreshing] = React.useState(false);

  // Calculate stats with memoization
  const stats = useMemo(() => ({
    totalReminders: reminders.length,
    activeReminders: reminders.filter(r => r.status === ReminderStatus.UPCOMING).length,
    completedToday: reminders.filter(r => {
      if (r.status !== ReminderStatus.DONE) return false;
      const today = new Date().toDateString();
      const reminderDate = new Date(r.updatedAt).toDateString();
      return today === reminderDate;
    }).length,
    totalProjects: projects.length,
    activeProjects: projects.filter(p => !p.isArchived).length,
    totalPatterns: patterns.length,
  }), [reminders, projects, patterns]);

  // Get recent reminders (last 5)
  const recentReminders = useMemo(() => 
    reminders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [reminders]
  );

  // Pull to refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshReminders();
    setRefreshing(false);
  };

  // Navigation handlers
  const handleCaptureReminder = () => {
    navigation.navigate('CameraModal', { mode: 'reminder' });
  };

  const handleDiscoverPattern = () => {
    navigation.navigate('CameraModal', { mode: 'pattern' });
  };

  const handleViewAllReminders = () => {
    navigation.navigate('RemindersTab', {
      screen: 'ReminderList',
      params: {},
    });
  };

  const handleViewProjects = () => {
    navigation.navigate('ProjectsTab', {
      screen: 'ProjectList',
    });
  };

  const handleViewPatterns = () => {
    navigation.navigate('PatternsTab', {
      screen: 'PatternLibrary',
      params: {},
    });
  };

  const handleReminderDetail = (reminderId: string) => {
    console.log('📝 Reminder detail navigation:', reminderId);
    // TODO: Uncomment when ReminderDetail is ready
    // navigation.navigate('RemindersTab', {
    //   screen: 'ReminderDetail',
    //   params: { reminderId },
    // });
  };

  return (
    <Screen 
      scroll 
      bounces={true}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Theme.colors.primary[500]}
        />
      }
    >
      <Container padding="m">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="caption" color="tertiary" style={styles.greeting}>
              {getGreeting().toUpperCase()}
            </Text>
            <Text variant="h1" style={styles.headerTitle}>
              VisionFlow AI
            </Text>
          </View>
          <Pressable 
            onPress={() => navigation.navigate('SettingsTab', { screen: 'SettingsHome' })}
            haptic="light"
            style={styles.settingsButton}
          >
            <Icon name="settings-outline" size="lg" color={Theme.colors.text.secondary} />
          </Pressable>
        </View>

        {/* Clean Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Active Reminders Card */}
          <Pressable onPress={handleViewAllReminders} haptic="light" style={styles.statCardWrapper}>
            <Card elevation="md" style={styles.statCard}>
              <Text variant="h1" customColor={Theme.colors.primary[500]} style={styles.statNumber}>
                {stats.activeReminders}
              </Text>
              <Text variant="caption" color="secondary" style={styles.statLabel}>
                Active Reminders
              </Text>
              <View style={[styles.statGlow, { backgroundColor: Theme.colors.primary[500] }]} />
            </Card>
          </Pressable>

          {/* Projects Card */}
          <Pressable onPress={handleViewProjects} haptic="light" style={styles.statCardWrapper}>
            <Card elevation="md" style={styles.statCard}>
              <Text variant="h1" customColor={Theme.colors.semantic.info} style={styles.statNumber}>
                {stats.activeProjects}
              </Text>
              <Text variant="caption" color="secondary" style={styles.statLabel}>
                Active Projects
              </Text>
              <View style={[styles.statGlow, { backgroundColor: Theme.colors.semantic.info }]} />
            </Card>
          </Pressable>

          {/* Patterns Card */}
          <Pressable onPress={handleViewPatterns} haptic="light" style={styles.statCardWrapper}>
            <Card elevation="md" style={styles.statCard}>
              <Text variant="h1" customColor={Theme.colors.semantic.warning} style={styles.statNumber}>
                {stats.totalPatterns}
              </Text>
              <Text variant="caption" color="secondary" style={styles.statLabel}>
                Discovered Patterns
              </Text>
              <View style={[styles.statGlow, { backgroundColor: Theme.colors.semantic.warning }]} />
            </Card>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <Text variant="caption" color="tertiary">
              Capture intelligence instantly
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <Button
              label="Capture Reminder"
              leftIcon="camera-outline"
              variant="primary"
              size="large"
              onPress={handleCaptureReminder}
              style={styles.actionButton}
            />
            <Button
              label="Discover Pattern"
              leftIcon="grid-outline"
              variant="secondary"
              size="large"
              onPress={handleDiscoverPattern}
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">Recent Reminders</Text>
            {recentReminders.length > 0 && (
              <Pressable onPress={handleViewAllReminders} haptic="light">
                <View style={styles.viewAllButton}>
                  <Text variant="body" customColor={Theme.colors.primary[500]} weight="600">
                    View All
                  </Text>
                  <Icon 
                    name="chevron-forward" 
                    size="sm" 
                    color={Theme.colors.primary[500]} 
                  />
                </View>
              </Pressable>
            )}
          </View>

          {recentReminders.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="No reminders yet"
              description="Capture your first image to get started!"
              actionLabel="Capture Photo"
              onActionPress={handleCaptureReminder}
            />
          ) : (
            <View style={styles.remindersList}>
              {recentReminders.map((reminder) => (
                <Card
                  key={reminder.id}
                  pressable
                  onPress={() => handleReminderDetail(reminder.id)}
                  style={styles.reminderCard}
                >
                  <View style={styles.reminderContent}>
                    {/* Emoji container with status indicator */}
                    <View style={styles.reminderIconWrapper}>
                      <View style={styles.reminderIcon}>
                        <Text variant="h3">{reminder.emoji}</Text>
                      </View>
                      {/* Status dot */}
                      <View style={[
                        styles.statusDot, 
                        { backgroundColor: getStatusColor(reminder.status) }
                      ]} />
                    </View>

                    {/* Reminder info */}
                    <View style={styles.reminderInfo}>
                      <Text variant="bodyLarge" weight="600" numberOfLines={1}>
                        {reminder.title}
                      </Text>
                      <View style={styles.reminderMeta}>
                        <Text variant="caption" color="secondary">
                          {reminder.category}
                        </Text>
                        <View style={styles.metaDivider} />
                        <Text variant="caption" color="secondary">
                          {formatReminderDate(reminder.reminderDate, reminder.reminderTime)}
                        </Text>
                      </View>
                    </View>

                    {/* Chevron */}
                    <Icon 
                      name="chevron-forward-outline" 
                      size="sm" 
                      color={Theme.colors.text.tertiary} 
                    />
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Completion Stats (if any completed today) */}
        {stats.completedToday > 0 && (
          <View style={styles.completionBanner}>
            <Icon 
              name="checkmark-circle" 
              size="md" 
              color={Theme.colors.semantic.success} 
            />
            <View style={styles.completionText}>
              <Text variant="body" weight="600">
                Great progress today!
              </Text>
              <Text variant="caption" color="secondary">
                {stats.completedToday} reminder{stats.completedToday > 1 ? 's' : ''} completed
              </Text>
            </View>
          </View>
        )}
      </Container>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // ✅ REMOVED: paddingBottom (Screen component handles it automatically)
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xl,
    paddingTop: Theme.spacing.xs,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    letterSpacing: 1.5,
    fontSize: 10,
    marginBottom: 4,
  },
  headerTitle: {
    marginTop: 0,
  },
  settingsButton: {
    padding: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.m,
  },

  // Stats Grid - Clean & Professional
  statsGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.xl,
  },
  statCardWrapper: {
    flex: 1,
  },
  statCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.s,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    minHeight: 100,
  },
  statNumber: {
    marginBottom: Theme.spacing.xs,
    fontSize: 36,
  },
  statLabel: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
  },
  statGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.5,
  },

  // Section styles
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionHeader: {
    marginBottom: Theme.spacing.m,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Theme.spacing.xs,
  },

  // Action buttons styles
  actionButtons: {
    gap: Theme.spacing.s,
  },
  actionButton: {
    width: '100%',
  },

  // Reminders list styles
  remindersList: {
    gap: Theme.spacing.s,
  },
  reminderCard: {
    padding: Theme.spacing.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}20`,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  reminderIconWrapper: {
    position: 'relative',
  },
  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: `${Theme.colors.primary[500]}08`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}20`,
  },
  statusDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Theme.colors.background.primary,
  },
  reminderInfo: {
    flex: 1,
    gap: 4,
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Theme.colors.text.tertiary,
    opacity: 0.5,
  },

  // Completion banner
  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
    padding: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.success}10`,
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.success}20`,
    marginBottom: Theme.spacing.m,
  },
  completionText: {
    flex: 1,
    gap: 2,
  },
});
