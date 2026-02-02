/**
 * VisionFlow AI - Project Analytics Screen (FIXED)
 * View detailed analytics for a project
 * * @module screens/ProjectAnalyticsScreen
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProjectStackParamList } from '../types/navigation.types';
import { Theme } from '../constants/theme';
import {
  Screen,
  Container,
  Text,
  Card,
  Icon,
  Pressable,
} from '../components';
import { useProjects } from '../hooks/useProjects';
import { useReminders } from '../hooks/useReminders';

type ProjectAnalyticsScreenProps = NativeStackScreenProps<ProjectStackParamList, 'ProjectAnalytics'>;

/**
 * ProjectAnalyticsScreen Component
 */
export function ProjectAnalyticsScreen({ navigation, route }: ProjectAnalyticsScreenProps) {
  const { projectId } = route.params;
  const { getProjectById } = useProjects();
  const { reminders } = useReminders();

  const project = getProjectById(projectId);
  const projectReminders = reminders.filter(r => r.projectId === projectId);

  // Calculate statistics
  const totalReminders = projectReminders.length;
  const upcomingReminders = projectReminders.filter(r => r.status === 'upcoming').length;
  const doneReminders = projectReminders.filter(r => r.status === 'done').length;
  const overdueReminders = projectReminders.filter(r => r.status === 'overdue').length;
  const completionRate = totalReminders > 0 ? Math.round((doneReminders / totalReminders) * 100) : 0;

  // Category breakdown
  const categoryBreakdown = projectReminders.reduce((acc, reminder) => {
    // Ensure category is treated as a string key
    const catKey = String(reminder.category);
    acc[catKey] = (acc[catKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Priority breakdown
  const priorityBreakdown = projectReminders.reduce((acc, reminder) => {
    // FIXED: Handle undefined priority by defaulting to 'medium'
    const priorityKey = String(reminder.priority || 'medium');
    acc[priorityKey] = (acc[priorityKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!project) {
    return (
      <Screen>
        <Container padding="m">
          <Text variant="h3">Project not found</Text>
        </Container>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <Text variant="h4" weight="600">Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Container padding="m">
          {/* Project Info */}
          <View style={styles.projectHeader}>
            <Text variant="h2">{project.name}</Text>
            <Text variant="body" color="secondary">{project.primaryCategory}</Text>
          </View>

          {/* Overview Stats */}
          <Text variant="h4" style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Icon name="list-outline" size="lg" color={Theme.colors.primary[500]} />
              </View>
              <Text variant="h2" weight="600">{totalReminders}</Text>
              <Text variant="caption" color="secondary">Total Reminders</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Icon name="time-outline" size="lg" color={Theme.colors.semantic.info} />
              </View>
              <Text variant="h2" weight="600">{upcomingReminders}</Text>
              <Text variant="caption" color="secondary">Upcoming</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Icon name="checkmark-circle-outline" size="lg" color={Theme.colors.semantic.success} />
              </View>
              <Text variant="h2" weight="600">{doneReminders}</Text>
              <Text variant="caption" color="secondary">Completed</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Icon name="alert-circle-outline" size="lg" color={Theme.colors.semantic.error} />
              </View>
              <Text variant="h2" weight="600">{overdueReminders}</Text>
              <Text variant="caption" color="secondary">Overdue</Text>
            </Card>
          </View>

          {/* Completion Rate */}
          <Card style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <Text variant="h4">Completion Rate</Text>
              <Text variant="h2" weight="600" customColor={Theme.colors.primary[500]}>
                {completionRate}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${completionRate}%` },
                ]}
              />
            </View>
            <Text variant="caption" color="secondary" style={styles.progressText}>
              {doneReminders} of {totalReminders} reminders completed
            </Text>
          </Card>

          {/* Category Breakdown */}
          {Object.keys(categoryBreakdown).length > 0 && (
            <>
              <Text variant="h4" style={styles.sectionTitle}>By Category</Text>
              <Card style={styles.breakdownCard}>
                {Object.entries(categoryBreakdown).map(([category, count]) => (
                  <View key={category} style={styles.breakdownRow}>
                    <View style={styles.breakdownLabel}>
                      <View style={[styles.breakdownDot, { backgroundColor: Theme.colors.primary[500] }]} />
                      <Text variant="body">{category}</Text>
                    </View>
                    <Text variant="body" weight="600">{count}</Text>
                  </View>
                ))}
              </Card>
            </>
          )}

          {/* Priority Breakdown */}
          {Object.keys(priorityBreakdown).length > 0 && (
            <>
              <Text variant="h4" style={styles.sectionTitle}>By Priority</Text>
              <Card style={styles.breakdownCard}>
                {Object.entries(priorityBreakdown).map(([priority, count]) => {
                  const priorityColor = {
                    low: Theme.colors.semantic.success,
                    medium: Theme.colors.semantic.info,
                    high: Theme.colors.semantic.warning,
                    urgent: Theme.colors.semantic.error,
                  }[priority] || Theme.colors.primary[500];

                  return (
                    <View key={priority} style={styles.breakdownRow}>
                      <View style={styles.breakdownLabel}>
                        <View style={[styles.breakdownDot, { backgroundColor: priorityColor }]} />
                        <Text variant="body">{priority.toUpperCase()}</Text>
                      </View>
                      <Text variant="body" weight="600">{count}</Text>
                    </View>
                  );
                })}
              </Card>
            </>
          )}

          {/* Empty State */}
          {totalReminders === 0 && (
            <Card style={styles.emptyCard}>
              <Icon name="analytics-outline" size="xl" color={Theme.colors.text.tertiary} />
              <Text variant="h4" style={styles.emptyTitle}>No Data Yet</Text>
              <Text variant="body" color="secondary" style={styles.emptyText}>
                Add reminders to this project to see analytics
              </Text>
            </Card>
          )}
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
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
  },
  content: {
    paddingBottom: Theme.spacing.xl,
  },
  projectHeader: {
    alignItems: 'center',
    marginVertical: Theme.spacing.l,
    gap: Theme.spacing.xs,
  },
  sectionTitle: {
    marginTop: Theme.spacing.l,
    marginBottom: Theme.spacing.m,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.m,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: Theme.spacing.l,
    gap: Theme.spacing.s,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionCard: {
    marginTop: Theme.spacing.l,
    gap: Theme.spacing.m,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
    height: 12,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary[500],
    borderRadius: Theme.borderRadius.full,
  },
  progressText: {
    textAlign: 'center',
  },
  breakdownCard: {
    gap: Theme.spacing.m,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
    gap: Theme.spacing.m,
  },
  emptyTitle: {
    marginTop: Theme.spacing.m,
  },
  emptyText: {
    textAlign: 'center',
  },
});