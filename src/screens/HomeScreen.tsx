/**
 * VisionFlow AI - Home Screen (v5.0 - Hidden Inside UI Edition)
 * Enhanced dashboard with cyberpunk aesthetic
 * 
 * @module screens/HomeScreen
 * 
 * CHANGELOG v5.0:
 * - ✅ UI ENHANCEMENT: Monospace fonts for technical labels
 * - ✅ UI ENHANCEMENT: Italic text for descriptive content
 * - ✅ UI ENHANCEMENT: Blue glow borders on reminder cards
 * - ✅ UI ENHANCEMENT: Section label above main header
 * - ✅ UI ENHANCEMENT: Enhanced stats with monospace numbers
 * - ✅ All v4.5 functionality and icon consistency preserved
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView } from 'react-native';
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
import { usePatterns } from '../hooks/usePatterns';

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

const PREMIUM_COLORS = {
  accent: '#00E5FF',
  accentDim: '#00B8D4',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const formatReminderDate = (dateString: string, timeString?: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return timeString ? `Today at ${timeString}` : 'Today';
  if (isTomorrow) return timeString ? `Tomorrow at ${timeString}` : 'Tomorrow';

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

/**
 * Get status configuration (matching Reminder List screen)
 */
const getStatusConfig = (status: ReminderStatus) => {
  const configs = {
    [ReminderStatus.UPCOMING]: {
      color: Theme.colors.primary[500],
      bgColor: `${Theme.colors.primary[500]}15`,
    },
    [ReminderStatus.DONE]: {
      color: Theme.colors.semantic.success,
      bgColor: `${Theme.colors.semantic.success}15`,
    },
    [ReminderStatus.OVERDUE]: {
      color: Theme.colors.semantic.error,
      bgColor: `${Theme.colors.semantic.error}15`,
    },
    [ReminderStatus.SNOOZED]: {
      color: Theme.colors.semantic.warning,
      bgColor: `${Theme.colors.semantic.warning}15`,
    },
  };
  return configs[status] || configs[ReminderStatus.UPCOMING];
};

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { reminders, isLoading, refreshReminders } = useReminders();
  const { patterns } = usePatterns();

  const [refreshing, setRefreshing] = React.useState(false);

  const stats = useMemo(() => ({
    totalReminders: reminders.length,
    activeReminders: reminders.filter(r => r.status === ReminderStatus.UPCOMING).length,
    overdueReminders: reminders.filter(r => r.status === ReminderStatus.OVERDUE).length,
    completedToday: reminders.filter(r => {
      if (r.status !== ReminderStatus.DONE) return false;
      const today = new Date().toDateString();
      const reminderDate = new Date(r.updatedAt).toDateString();
      return today === reminderDate;
    }).length,
    totalPatterns: patterns.length,
  }), [reminders, patterns]);

  const recentReminders = useMemo(() => 
    reminders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [reminders]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshReminders();
    setRefreshing(false);
  };

  const handleCaptureReminder = () => {
    navigation.navigate('CameraModal', { mode: 'reminder' });
  };

  const handleDiscoverPattern = () => {
    navigation.navigate('CameraModal', { mode: 'pattern' });
  };

  const handleViewAllReminders = () => {
    navigation.navigate('RemindersTab', { screen: 'ReminderList', params: {} });
  };

  const handleViewPatterns = () => {
    navigation.navigate('PatternsTab', { screen: 'PatternLibrary', params: {} });
  };

  const handleReminderDetail = (reminderId: string) => {
    navigation.navigate('RemindersTab', { screen: 'ReminderDetail', params: { reminderId } });
  };

  return (
    <Screen>
      <ScrollView
        bounces={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={PREMIUM_COLORS.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* ✅ NEW: Section label above greeting */}
            <Text variant="caption" mono weight="700" color="tertiary" style={styles.systemLabel}>
              SYSTEM_DASHBOARD
            </Text>
            {/* ✅ ENHANCED: Monospace greeting */}
            {/* <Text variant="caption" mono weight="700" style={styles.greeting}>
              {getGreeting().toUpperCase()}
            </Text> */}
            <Text variant="h1" style={styles.headerTitle}>
              VisionFlow AI
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('SettingsTab', { screen: 'SettingsHome' })}
            style={styles.settingsButton}
          >
            <View style={styles.settingsIconContainer}>
              <Icon name="settings-outline" size="sm" color={PREMIUM_COLORS.neutral[400]} />
            </View>
          </Pressable>
        </View>

        {/* ✅ ENHANCED: Stats section with label */}
        <View style={styles.statsSection}>
          <Text variant="caption" mono weight="700" color="tertiary" style={styles.sectionLabel}>
            STATUS_OVERVIEW
          </Text>
          <View style={styles.statsContainer}>
            {/* Active Reminders */}
            <Pressable onPress={handleViewAllReminders} style={styles.statCardPressable}>
              <Card variant="glass" elevation="sm" style={styles.statCard}>
                <View style={styles.statContent}>
                  <View style={styles.statHeader}>
                    {/* ✅ ENHANCED: Monospace stat label */}
                    <Text variant="caption" mono weight="700" style={styles.statLabel}>
                      ACTIVE_REMINDERS
                    </Text>
                    {stats.overdueReminders > 0 && (
                      <View style={styles.alertBadge}>
                        <View style={styles.alertDot} />
                      </View>
                    )}
                  </View>
                  {/* ✅ ENHANCED: Monospace number */}
                  <Text style={[styles.statNumber, { fontFamily: Theme.typography.fontFamily.mono }]}>
                    {stats.activeReminders}
                  </Text>
                  <View style={styles.statMetaContainer}>
                    {stats.overdueReminders > 0 ? (
                      <Text variant="caption" mono style={styles.statMeta}>
                        {stats.overdueReminders} overdue
                      </Text>
                    ) : (
                      <Text variant="caption" style={styles.statMetaPlaceholder}>
                        {' '}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            </Pressable>

            {/* Patterns */}
            <Pressable onPress={handleViewPatterns} style={styles.statCardPressable}>
              <Card variant="glass" elevation="sm" style={styles.statCard}>
                <View style={styles.statContent}>
                  <View style={styles.statHeader}>
                    {/* ✅ ENHANCED: Monospace stat label */}
                    <Text variant="caption" mono weight="700" style={styles.statLabel}>
                      PATTERNS
                    </Text>
                  </View>
                  {/* ✅ ENHANCED: Monospace number */}
                  <Text style={[styles.statNumber, { fontFamily: Theme.typography.fontFamily.mono }]}>
                    {stats.totalPatterns}
                  </Text>
                  <View style={styles.statMetaContainer}>
                    {/* ✅ ENHANCED: Monospace meta */}
                    <Text variant="caption" mono style={styles.statMeta}>
                      Discovered
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          </View>
        </View>

        {/* Full-Width Buttons */}
        <View style={styles.section}>
          {/* ✅ ENHANCED: Monospace section label */}
          <Text variant="caption" mono weight="700" color="tertiary" style={styles.sectionLabel}>
            QUICK_ACTIONS
          </Text>
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
              leftIcon="sparkles-outline"
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
            {/* ✅ ENHANCED: Monospace section label */}
            <Text variant="caption" mono weight="700" color="tertiary" style={styles.sectionLabel}>
              RECENT_ACTIVITY
            </Text>
            {recentReminders.length > 0 && (
              <Pressable onPress={handleViewAllReminders}>
                <Text variant="body" mono weight="600" style={styles.viewAllText}>
                  View All →
                </Text>
              </Pressable>
            )}
          </View>

          {recentReminders.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="No reminders yet"
              description="Capture your first image to get started"
              actionLabel="Capture Photo"
              onActionPress={handleCaptureReminder}
            />
          ) : (
            <View style={styles.remindersList}>
              {recentReminders.map((reminder) => {
                const statusConfig = getStatusConfig(reminder.status);
                
                return (
                  <Pressable
                    key={reminder.id}
                    onPress={() => handleReminderDetail(reminder.id)}
                  >
                    {/* ✅ ENHANCED: Blue glow border */}
                    <Card variant="glowBorder" elevation="sm" style={styles.reminderCard}>
                      <View style={styles.reminderContent}>
                        <View style={styles.iconWrapper}>
                          <View style={[styles.reminderIcon, { backgroundColor: statusConfig.bgColor }]}>
                            <Text variant="h3">{reminder.emoji}</Text>
                          </View>
                          <View style={[
                            styles.statusDot,
                            { backgroundColor: statusConfig.color }
                          ]} />
                        </View>

                        <View style={styles.reminderInfo}>
                          <Text variant="bodyLarge" weight="600" numberOfLines={1}>
                            {reminder.title}
                          </Text>
                          <View style={styles.reminderMeta}>
                            {/* ✅ ENHANCED: Monospace meta text */}
                            <Text variant="caption" mono style={styles.metaText}>
                              {reminder.category}
                            </Text>
                            <Text variant="caption" style={styles.metaSeparator}>
                              •
                            </Text>
                            <Text variant="caption" mono style={styles.metaText}>
                              {formatReminderDate(reminder.reminderDate, reminder.reminderTime)}
                            </Text>
                          </View>
                        </View>

                        <Icon 
                          name="chevron-forward" 
                          size="xs" 
                          color={PREMIUM_COLORS.neutral[500]} 
                        />
                      </View>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Completion Indicator */}
        {stats.completedToday > 0 && (
          <Card variant="glass" elevation="none" style={styles.completionCard}>
            <View style={styles.completionIndicator} />
            <View style={styles.completionContent}>
              {/* ✅ ENHANCED: Monospace completion title */}
              <Text variant="body" weight="600" mono style={styles.completionTitle}>
                {stats.completedToday} completed today
              </Text>
              {/* ✅ NEW: Italic descriptive text */}
              <Text variant="caption" italic style={styles.completionText}>
                Keep up the momentum
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: Theme.spacing.m,
    paddingBottom: Theme.spacing.safeArea.bottomPaddingLarge,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xl,
    paddingTop: Theme.spacing.s,
  },
  headerLeft: {
    flex: 1,
  },
  // ✅ NEW: System label above greeting
  systemLabel: {
    letterSpacing: 2,
    fontSize: 9,
    marginBottom: 2,
    opacity: 0.7,
  },
  greeting: {
    letterSpacing: 2,
    fontSize: 9,
    color: PREMIUM_COLORS.neutral[500],
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  settingsButton: {
    padding: 4,
    paddingTop: 22,
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${PREMIUM_COLORS.neutral[800]}60`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ✅ NEW: Stats section wrapper
  statsSection: {
    marginBottom: Theme.spacing.xxl,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
  },
  statCardPressable: {
    flex: 1,
  },
  statCard: {
    padding: 0,
    height: 120,
  },
  statContent: {
    padding: Theme.spacing.l,
    height: '100%',
    justifyContent: 'space-between',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 1.5, // Increased for technical feel
    color: PREMIUM_COLORS.neutral[500],
  },
  alertBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: `${PREMIUM_COLORS.error}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PREMIUM_COLORS.error,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: Theme.colors.text.primary,
    letterSpacing: -2,
    lineHeight: 52,
  },
  statMetaContainer: {
    height: 16,
  },
  statMeta: {
    fontSize: 11,
    color: PREMIUM_COLORS.neutral[500],
  },
  statMetaPlaceholder: {
    fontSize: 11,
    color: 'transparent',
  },

  // Sections
  section: {
    marginBottom: Theme.spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 2, // Increased from 1.2
    color: PREMIUM_COLORS.neutral[500],
    marginBottom: Theme.spacing.m,
    opacity: 0.7,
  },
  viewAllText: {
    fontSize: 13,
    color: PREMIUM_COLORS.accent,
  },

  // Full-Width Buttons
  actionButtons: {
    gap: Theme.spacing.s,
  },
  actionButton: {
    width: '100%',
  },

  // Reminder Cards
  remindersList: {
    gap: Theme.spacing.s,
  },
  reminderCard: {
    padding: Theme.spacing.m,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  
  // Icon styles (matching Reminder List screen)
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
    borderColor: Theme.colors.background.primary,
  },
  
  reminderInfo: {
    flex: 1,
    gap: 4,
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: PREMIUM_COLORS.neutral[500],
  },
  metaSeparator: {
    fontSize: 12,
    color: PREMIUM_COLORS.neutral[600],
  },

  // Completion Card
  completionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    padding: Theme.spacing.m,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 0,
  },
  completionIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: PREMIUM_COLORS.success,
  },
  completionContent: {
    flex: 1,
    gap: 2,
    paddingLeft: Theme.spacing.s,
  },
  completionTitle: {
    color: Theme.colors.text.primary,
  },
  completionText: {
    fontSize: 12,
    color: PREMIUM_COLORS.neutral[500],
  },
});