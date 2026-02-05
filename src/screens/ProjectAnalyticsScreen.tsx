/**
 * VisionFlow AI - Project Analytics Screen (v2.1 - Harmonized Edition)
 * View detailed analytics for a project
 * 
 * @module screens/ProjectAnalyticsScreen
 * 
 * CHANGELOG v2.1:
 * - ✅ Fixed hardcoded paddingBottom (uses theme.spacing.safeArea.bottomPaddingLarge)
 * - ✅ Standardized project icon background opacity to 20%
 * - ✅ Standardized category badge opacity to 20%
 * - ✅ Added header shadow for separation
 * - ✅ Added card shadows for depth
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProjectAnalyticsScreenProps = NativeStackScreenProps<ProjectStackParamList, 'ProjectAnalytics'>;

/**
 * Get priority color
 */
const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: Theme.colors.semantic.success,
    medium: Theme.colors.semantic.info,
    high: Theme.colors.semantic.warning,
    urgent: Theme.colors.semantic.error,
  };
  return colors[priority.toLowerCase()] || Theme.colors.primary[500];
};

/**
 * Get category icon
 */
const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    personal: 'home',
    work: 'briefcase',
    health: 'fitness',
    money: 'cash',
  };
  return icons[category.toLowerCase()] || 'pricetag';
};

/**
 * ProjectAnalyticsScreen Component
 */
export function ProjectAnalyticsScreen({ navigation, route }: ProjectAnalyticsScreenProps) {
  const { projectId } = route.params;
  const { getProjectById } = useProjects();
  const { reminders } = useReminders();

  const project = getProjectById(projectId);
  const projectReminders = useMemo(
    () => reminders.filter(r => r.projectId === projectId),
    [reminders, projectId]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const total = projectReminders.length;
    const upcoming = projectReminders.filter(r => r.status === 'upcoming').length;
    const done = projectReminders.filter(r => r.status === 'done').length;
    const overdue = projectReminders.filter(r => r.status === 'overdue').length;
    const snoozed = projectReminders.filter(r => r.status === 'snoozed').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    
    return { total, upcoming, done, overdue, snoozed, completionRate };
  }, [projectReminders]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    return projectReminders.reduce((acc, reminder) => {
      const catKey = String(reminder.category);
      acc[catKey] = (acc[catKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [projectReminders]);

  // Priority breakdown
  const priorityBreakdown = useMemo(() => {
    return projectReminders.reduce((acc, reminder) => {
      const priorityKey = String(reminder.priority || 'medium');
      acc[priorityKey] = (acc[priorityKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [projectReminders]);

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    return projectReminders.reduce((acc, reminder) => {
      const statusKey = String(reminder.status);
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [projectReminders]);

  if (!project) {
    return (
      <Screen>
        <Container padding="m">
          <View style={styles.notFoundContainer}>
            <Icon name="alert-circle-outline" size="xl" color={Theme.colors.text.tertiary} />
            <Text variant="h3" align="center" style={styles.notFoundTitle}>
              Project not found
            </Text>
            <Text variant="body" color="secondary" align="center">
              This project may have been deleted
            </Text>
          </View>
        </Container>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header - ✅ ENHANCED: Added shadow */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} haptic="light" style={styles.headerButton}>
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <Text variant="h4" weight="600">Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="m">
          {/* Project Header */}
          <View style={styles.projectHeader}>
            <View style={styles.projectIconContainer}>
              <Icon name="folder" size="lg" color={Theme.colors.primary[500]} />
            </View>
            <Text variant="h2" align="center">{project.name}</Text>
            <View style={styles.categoryBadge}>
              <Icon 
                name={getCategoryIcon(project.primaryCategory) as any} 
                size="xs" 
                color={Theme.colors.primary[500]} 
              />
              <Text variant="body" weight="600" customColor={Theme.colors.primary[500]}>
                {project.primaryCategory}
              </Text>
            </View>
          </View>

          {/* Empty State - ✅ ENHANCED: Added shadow */}
          {stats.total === 0 ? (
            <Card style={styles.emptyCard}>
              <Icon name="analytics-outline" size="xl" color={Theme.colors.text.tertiary} />
              <Text variant="h3" style={styles.emptyTitle}>No Data Yet</Text>
              <Text variant="body" color="secondary" align="center" style={styles.emptyText}>
                Add reminders to this project to see detailed analytics and insights
              </Text>
            </Card>
          ) : (
            <>
              {/* Key Metrics Overview */}
              <View style={styles.metricsSection}>
                <View style={styles.sectionHeader}>
                  <Icon name="stats-chart-outline" size="sm" color={Theme.colors.primary[500]} />
                  <Text variant="h4">Key Metrics</Text>
                </View>
                
                <View style={styles.statsGrid}>
                  <Card elevation="sm" style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: `${Theme.colors.primary[500]}15` }]}>
                      <Icon name="list" size="md" color={Theme.colors.primary[500]} />
                    </View>
                    <Text variant="h2" weight="700">{stats.total}</Text>
                    <Text variant="caption" color="secondary">Total Reminders</Text>
                  </Card>

                  <Card elevation="sm" style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: `${Theme.colors.semantic.info}15` }]}>
                      <Icon name="time" size="md" color={Theme.colors.semantic.info} />
                    </View>
                    <Text variant="h2" weight="700" customColor={Theme.colors.semantic.info}>
                      {stats.upcoming}
                    </Text>
                    <Text variant="caption" color="secondary">Upcoming</Text>
                  </Card>

                  <Card elevation="sm" style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: `${Theme.colors.semantic.success}15` }]}>
                      <Icon name="checkmark-circle" size="md" color={Theme.colors.semantic.success} />
                    </View>
                    <Text variant="h2" weight="700" customColor={Theme.colors.semantic.success}>
                      {stats.done}
                    </Text>
                    <Text variant="caption" color="secondary">Completed</Text>
                  </Card>

                  {stats.overdue > 0 && (
                    <Card elevation="sm" style={styles.statCard}>
                      <View style={[styles.statIconContainer, { backgroundColor: `${Theme.colors.semantic.error}15` }]}>
                        <Icon name="alert-circle" size="md" color={Theme.colors.semantic.error} />
                      </View>
                      <Text variant="h2" weight="700" customColor={Theme.colors.semantic.error}>
                        {stats.overdue}
                      </Text>
                      <Text variant="caption" color="secondary">Overdue</Text>
                    </Card>
                  )}
                </View>
              </View>

              {/* Completion Rate - ✅ ENHANCED: Added shadow */}
              <View style={styles.completionSection}>
                <Card style={styles.completionCard}>
                  <View style={styles.completionHeader}>
                    <View style={styles.completionHeaderLeft}>
                      <Icon name="trophy" size="sm" color={Theme.colors.semantic.success} />
                      <Text variant="h4">Completion Rate</Text>
                    </View>
                    <View style={styles.completionBadge}>
                      <Text variant="h2" weight="700" customColor={
                        stats.completionRate === 100 
                          ? Theme.colors.semantic.success 
                          : stats.completionRate >= 50 
                          ? Theme.colors.primary[500] 
                          : Theme.colors.semantic.warning
                      }>
                        {stats.completionRate}%
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { 
                            width: `${stats.completionRate}%`,
                            backgroundColor: stats.completionRate === 100 
                              ? Theme.colors.semantic.success 
                              : Theme.colors.primary[500]
                          },
                        ]}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.progressStats}>
                    <View style={styles.progressStatItem}>
                      <Text variant="caption" color="tertiary">Completed</Text>
                      <Text variant="bodyLarge" weight="600" customColor={Theme.colors.semantic.success}>
                        {stats.done}
                      </Text>
                    </View>
                    <View style={styles.progressDivider} />
                    <View style={styles.progressStatItem}>
                      <Text variant="caption" color="tertiary">Remaining</Text>
                      <Text variant="bodyLarge" weight="600" customColor={Theme.colors.semantic.info}>
                        {stats.total - stats.done}
                      </Text>
                    </View>
                    <View style={styles.progressDivider} />
                    <View style={styles.progressStatItem}>
                      <Text variant="caption" color="tertiary">Total</Text>
                      <Text variant="bodyLarge" weight="600">
                        {stats.total}
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>

              {/* Status Breakdown - ✅ ENHANCED: Added shadow */}
              {Object.keys(statusBreakdown).length > 0 && (
                <View style={styles.breakdownSection}>
                  <View style={styles.sectionHeader}>
                    <Icon name="pie-chart-outline" size="sm" color={Theme.colors.text.secondary} />
                    <Text variant="h4">By Status</Text>
                  </View>
                  
                  <Card style={styles.breakdownCard}>
                    {Object.entries(statusBreakdown).map(([status, count]) => {
                      const percentage = Math.round((count / stats.total) * 100);
                      const statusConfig: Record<string, { color: string; icon: string }> = {
                        upcoming: { color: Theme.colors.primary[500], icon: 'time' },
                        done: { color: Theme.colors.semantic.success, icon: 'checkmark-circle' },
                        overdue: { color: Theme.colors.semantic.error, icon: 'alert-circle' },
                        snoozed: { color: Theme.colors.semantic.warning, icon: 'moon' },
                      };
                      const config = statusConfig[status] || { color: Theme.colors.text.secondary, icon: 'ellipse' };

                      return (
                        <View key={status} style={styles.breakdownRow}>
                          <View style={styles.breakdownLeft}>
                            <View style={[styles.breakdownIconContainer, { backgroundColor: `${config.color}15` }]}>
                              <Icon name={config.icon as any} size="xs" color={config.color} />
                            </View>
                            <View style={styles.breakdownInfo}>
                              <Text variant="body" weight="600">{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                              <Text variant="caption" color="tertiary">{percentage}% of total</Text>
                            </View>
                          </View>
                          <View style={styles.breakdownRight}>
                            <Text variant="h4" weight="700" customColor={config.color}>{count}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </Card>
                </View>
              )}

              {/* Category Breakdown - ✅ ENHANCED: Added shadow */}
              {Object.keys(categoryBreakdown).length > 0 && (
                <View style={styles.breakdownSection}>
                  <View style={styles.sectionHeader}>
                    <Icon name="pricetags-outline" size="sm" color={Theme.colors.text.secondary} />
                    <Text variant="h4">By Category</Text>
                  </View>
                  
                  <Card style={styles.breakdownCard}>
                    {Object.entries(categoryBreakdown)
                      .sort((a, b) => b[1] - a[1]) // Sort by count descending
                      .map(([category, count]) => {
                        const percentage = Math.round((count / stats.total) * 100);
                        const categoryColor = Theme.colors.primary[500];

                        return (
                          <View key={category} style={styles.breakdownRow}>
                            <View style={styles.breakdownLeft}>
                              <View style={[styles.breakdownIconContainer, { backgroundColor: `${categoryColor}15` }]}>
                                <Icon name={getCategoryIcon(category) as any} size="xs" color={categoryColor} />
                              </View>
                              <View style={styles.breakdownInfo}>
                                <Text variant="body" weight="600">{category}</Text>
                                <Text variant="caption" color="tertiary">{percentage}% of total</Text>
                              </View>
                            </View>
                            <View style={styles.breakdownRight}>
                              <Text variant="h4" weight="700">{count}</Text>
                            </View>
                          </View>
                        );
                      })}
                  </Card>
                </View>
              )}

              {/* Priority Breakdown - ✅ ENHANCED: Added shadow */}
              {Object.keys(priorityBreakdown).length > 0 && (
                <View style={styles.breakdownSection}>
                  <View style={styles.sectionHeader}>
                    <Icon name="flag-outline" size="sm" color={Theme.colors.text.secondary} />
                    <Text variant="h4">By Priority</Text>
                  </View>
                  
                  <Card style={styles.breakdownCard}>
                    {Object.entries(priorityBreakdown)
                      .sort((a, b) => {
                        const order: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
                        return (order[a[0].toLowerCase()] || 99) - (order[b[0].toLowerCase()] || 99);
                      })
                      .map(([priority, count]) => {
                        const percentage = Math.round((count / stats.total) * 100);
                        const priorityColor = getPriorityColor(priority);

                        return (
                          <View key={priority} style={styles.breakdownRow}>
                            <View style={styles.breakdownLeft}>
                              <View style={[styles.breakdownIconContainer, { backgroundColor: `${priorityColor}15` }]}>
                                <Icon name="flag" size="xs" color={priorityColor} />
                              </View>
                              <View style={styles.breakdownInfo}>
                                <Text variant="body" weight="600">{priority.toUpperCase()}</Text>
                                <Text variant="caption" color="tertiary">{percentage}% of total</Text>
                              </View>
                            </View>
                            <View style={styles.breakdownRight}>
                              <Text variant="h4" weight="700" customColor={priorityColor}>{count}</Text>
                            </View>
                          </View>
                        );
                      })}
                  </Card>
                </View>
              )}
            </>
          )}
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header styles - ✅ ENHANCED: Added shadow
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
    ...Theme.shadows.sm, // ✅ ADDED: Header shadow for depth
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.m,
  },
  
  // Content styles - ✅ FIXED: Uses theme constant
  scrollContent: {
    paddingBottom: Theme.spacing.safeArea.bottomPaddingLarge, // ✅ FIXED: 120 from theme (was hardcoded)
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
  
  // Project header styles - ✅ FIXED: Opacity standardized
  projectHeader: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    gap: Theme.spacing.m,
  },
  projectIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${Theme.colors.primary[500]}20`, // ✅ FIXED: 20% opacity (was 15%)
    borderWidth: 2,
    borderColor: `${Theme.colors.primary[500]}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: `${Theme.colors.primary[500]}20`, // ✅ FIXED: 20% opacity (was 15%)
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  
  // Section styles
  metricsSection: {
    marginBottom: Theme.spacing.l,
  },
  completionSection: {
    marginBottom: Theme.spacing.l,
  },
  breakdownSection: {
    marginBottom: Theme.spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.m,
  },
  
  // Stats grid styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: Theme.spacing.l,
    paddingHorizontal: Theme.spacing.s,
    gap: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  statIconContainer: {
    width: 52,
    height: 52,
    borderRadius: Theme.borderRadius.l,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  
  // Completion card styles - ✅ ENHANCED: Added shadow
  completionCard: {
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    ...Theme.shadows.sm, // ✅ ADDED: Card shadow for depth
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  completionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  completionBadge: {
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
  },
  progressBarContainer: {
    marginBottom: Theme.spacing.m,
  },
  progressBar: {
    height: 16,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.m,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Theme.borderRadius.m,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
  },
  progressStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  progressDivider: {
    width: 1,
    backgroundColor: Theme.colors.border.light,
  },
  
  // Breakdown card styles - ✅ ENHANCED: Added shadow
  breakdownCard: {
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    ...Theme.shadows.sm, // ✅ ADDED: Card shadow for depth
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    flex: 1,
  },
  breakdownIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownInfo: {
    flex: 1,
    gap: 2,
  },
  breakdownRight: {
    minWidth: 48,
    alignItems: 'flex-end',
  },
  
  // Empty state styles - ✅ ENHANCED: Added shadow
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.l,
    gap: Theme.spacing.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    ...Theme.shadows.sm, // ✅ ADDED: Card shadow for depth
  },
  emptyTitle: {
    marginTop: Theme.spacing.s,
  },
  emptyText: {
    maxWidth: 280,
  },
});
