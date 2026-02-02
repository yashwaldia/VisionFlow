/**
 * VisionFlow AI - Home Screen (FIXED)
 * Dashboard with overview and quick actions
 * 
 * @module screens/HomeScreen
 */

import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
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

// FIXED: Composite navigation type using correct screen name 'Home'
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
 * HomeScreen Component
 * 
 * Main dashboard showing:
 * - Quick stats (reminders, patterns, projects)
 * - Recent activity
 * - Quick action buttons
 */
export function HomeScreen({ navigation }: HomeScreenProps) {
  // FIXED: Destructure refreshReminders instead of refresh
  const { reminders, isLoading, refreshReminders } = useReminders();
  const { projects } = useProjects();
  const { patterns } = usePatterns();

  const [refreshing, setRefreshing] = React.useState(false);

  // Calculate stats
  const stats = {
    totalReminders: reminders.length,
    activeReminders: reminders.filter(r => r.status === ReminderStatus.UPCOMING).length,
    totalProjects: projects.length,
    totalPatterns: patterns.length,
  };

  // Get recent reminders (last 5)
  const recentReminders = reminders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // FIXED: Pull to refresh handler using refreshReminders
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshReminders();
    setRefreshing(false);
  };

  // Navigation handlers
  const handleCaptureReminder = () => {
    // TODO: Uncomment when CameraModal is added in next batch
    navigation.navigate('CameraModal', { mode: 'reminder' });
    // console.log('📸 Camera modal - Coming in Batch 2!');
  };

  const handleDiscoverPattern = () => {
    // TODO: Uncomment when CameraModal is added
    navigation.navigate('CameraModal', { mode: 'pattern' });
    // console.log('✨ Pattern discovery - Coming in Batch 2!');
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
    // TODO: Uncomment when ReminderDetail is added in next batch
    // navigation.navigate('RemindersTab', {
    //   screen: 'ReminderDetail',
    //   params: { reminderId },
    // });
    console.log('📝 Reminder detail - Coming in Batch 2!', reminderId);
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
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
            <View>
              <Text variant="body" color="secondary">
                Welcome back
              </Text>
              <Text variant="h1" style={styles.headerTitle}>
                VisionFlow AI
              </Text>
            </View>
            <Pressable onPress={() => navigation.navigate('SettingsTab', { screen: 'SettingsHome' })}>
              <Icon name="settings-outline" size="lg" color={Theme.colors.text.secondary} />
            </Pressable>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <Card elevation="md" style={styles.statCard}>
              <Text variant="h1" customColor={Theme.colors.primary[500]}>
                {stats.activeReminders}
              </Text>
              <Text variant="caption" color="secondary">
                Active Reminders
              </Text>
            </Card>

            <Card elevation="md" style={styles.statCard}>
              <Text variant="h1" customColor={Theme.colors.primary[500]}>
                {stats.totalProjects}
              </Text>
              <Text variant="caption" color="secondary">
                Projects
              </Text>
            </Card>

            <Card elevation="md" style={styles.statCard}>
              <Text variant="h1" customColor={Theme.colors.primary[500]}>
                {stats.totalPatterns}
              </Text>
              <Text variant="caption" color="secondary">
                Patterns
              </Text>
            </Card>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>
              Quick Actions
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
              <Pressable onPress={handleViewAllReminders}>
                <Text variant="body" customColor={Theme.colors.primary[500]}>
                  View All
                </Text>
              </Pressable>
            </View>

            {recentReminders.length === 0 ? (
              // FIXED: Use actionLabel and onActionPress instead of action object
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
                      <View style={styles.reminderIcon}>
                        <Text variant="h3">{reminder.emoji}</Text>
                      </View>
                      <View style={styles.reminderInfo}>
                        <Text variant="bodyLarge" weight="600">
                          {reminder.title}
                        </Text>
                        <Text variant="caption" color="secondary">
                          {reminder.category} • {reminder.priority || 'medium'}
                        </Text>
                      </View>
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
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
  },
  headerTitle: {
    marginTop: Theme.spacing.xxs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Theme.spacing.l,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  actionButtons: {
    gap: Theme.spacing.s,
  },
  actionButton: {
    width: '100%',
  },
  remindersList: {
    gap: Theme.spacing.s,
  },
  reminderCard: {
    padding: Theme.spacing.m,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
  },
  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderInfo: {
    flex: 1,
  },
});
