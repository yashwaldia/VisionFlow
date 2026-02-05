/**
 * VisionFlow AI - Project Detail Screen (v2.1 - Harmonized Edition)
 * View and manage a single project
 * 
 * @module screens/ProjectDetailScreen
 * 
 * CHANGELOG v2.1:
 * - ✅ Fixed hardcoded paddingBottom (uses theme.spacing.safeArea.bottomPaddingLarge)
 * - ✅ Standardized icon background opacity to 20%
 * - ✅ Standardized status badge opacity to 20%
 * - ✅ Added card elevation for visual depth
 * - ✅ Added header shadow for separation
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProjectStackParamList } from '../types/navigation.types';
import { Theme } from '../constants/theme';
import {
  Screen,
  Container,
  Text,
  Button,
  Card,
  Icon,
  Pressable,
} from '../components';
import { useProjects } from '../hooks/useProjects';
import { useReminders } from '../hooks/useReminders';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProjectDetailScreenProps = NativeStackScreenProps<ProjectStackParamList, 'ProjectDetail'>;

/**
 * Format date with relative time
 */
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  
  return date.toLocaleDateString(undefined, { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric' 
  });
};

/**
 * ProjectDetailScreen Component
 */
export function ProjectDetailScreen({ navigation, route }: ProjectDetailScreenProps) {
  const { projectId } = route.params;
  const { getProjectById, updateProject, deleteProject } = useProjects();
  const { reminders } = useReminders();
  
  const [project, setProject] = useState(getProjectById(projectId));

  // Get project reminders with detailed stats
  const projectReminders = reminders.filter(r => r.projectId === projectId);
  const upcomingReminders = projectReminders.filter(r => r.status === 'upcoming').length;
  const doneReminders = projectReminders.filter(r => r.status === 'done').length;
  const overdueReminders = projectReminders.filter(r => r.status === 'overdue').length;
  const completionRate = projectReminders.length > 0 
    ? Math.round((doneReminders / projectReminders.length) * 100) 
    : 0;

  useEffect(() => {
    setProject(getProjectById(projectId));
  }, [projectId, getProjectById]);

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
            <Button label="Go Back" onPress={() => navigation.goBack()} style={styles.notFoundButton} />
          </View>
        </Container>
      </Screen>
    );
  }

  const handleEdit = () => {
    navigation.navigate('EditProject', { projectId });
  };

  const handleArchive = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateProject(project.id, { isArchived: !project.isArchived });
      setProject(getProjectById(projectId));
    } catch (error) {
      Alert.alert('Error', 'Failed to update project');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? All reminders will be unlinked from this project. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await deleteProject(project.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const handleViewReminders = () => {
    navigation.navigate('RemindersTab' as any, {
      screen: 'ReminderList',
      params: { filterProjectId: projectId },
    });
  };

  const handleViewAnalytics = () => {
    navigation.navigate('ProjectAnalytics', { projectId });
  };

  return (
    <Screen>
      {/* Header - ✅ ENHANCED: Added shadow */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} haptic="light" style={styles.headerButton}>
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <Text variant="h4" weight="600">Details</Text>
        <View style={styles.headerActions}>
          {!project.isArchived && (
            <Pressable onPress={handleEdit} haptic="light" style={styles.headerButton}>
              <Icon name="create-outline" size="md" color={Theme.colors.text.primary} />
            </Pressable>
          )}
          <Pressable onPress={handleDelete} haptic="medium" style={styles.headerButton}>
            <Icon name="trash-outline" size="md" color={Theme.colors.semantic.error} />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="m">
          {/* Project Header */}
          <View style={styles.projectHeader}>
            <View style={styles.iconWrapper}>
              <View style={styles.iconCircle}>
                <Icon name="folder" size="xl" color={Theme.colors.primary[500]} />
              </View>
              {project.isArchived && (
                <View style={styles.archivedBadge}>
                  <Icon name="archive" size="sm" color={Theme.colors.text.tertiary} />
                </View>
              )}
            </View>

            <Text variant="h2" style={styles.title}>
              {project.name}
            </Text>
            
            <View style={styles.categoryBadgeContainer}>
              <View style={styles.categoryBadge}>
                <Icon name="pricetag" size="xs" color={Theme.colors.primary[500]} />
                <Text variant="body" weight="600" customColor={Theme.colors.primary[500]}>
                  {project.primaryCategory}
                </Text>
              </View>
              
              {project.isArchived && (
                <View style={styles.statusBadge}>
                  <Icon name="archive-outline" size="xs" color={Theme.colors.semantic.warning} />
                  <Text variant="caption" weight="700" customColor={Theme.colors.semantic.warning}>
                    ARCHIVED
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Description - ✅ ENHANCED: Added shadow */}
          {project.description && (
            <Card style={styles.descriptionCard}>
              <View style={styles.descriptionHeader}>
                <Icon name="document-text-outline" size="sm" color={Theme.colors.text.secondary} />
                <Text variant="bodyLarge" weight="600">Description</Text>
              </View>
              <Text variant="body" color="secondary" style={styles.descriptionText}>
                {project.description}
              </Text>
            </Card>
          )}

          {/* Stats Overview Card - ✅ ENHANCED: Added shadow */}
          <Card style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={styles.statsHeaderLeft}>
                <Icon name="bar-chart-outline" size="sm" color={Theme.colors.primary[500]} />
                <Text variant="h4">Statistics</Text>
              </View>
              {projectReminders.length > 0 && (
                <View style={styles.completionBadge}>
                  <Text variant="caption" weight="700" customColor={Theme.colors.semantic.success}>
                    {completionRate}%
                  </Text>
                </View>
              )}
            </View>
            
            {/* Progress Bar */}
            {projectReminders.length > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${completionRate}%`,
                        backgroundColor: completionRate === 100 
                          ? Theme.colors.semantic.success 
                          : Theme.colors.primary[500]
                      }
                    ]} 
                  />
                </View>
              </View>
            )}

            <View style={styles.statsGrid}>
              <Card elevation="sm" style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: `${Theme.colors.primary[500]}15` }]}>
                  <Icon name="list" size="sm" color={Theme.colors.primary[500]} />
                </View>
                <Text variant="h3" weight="600">{projectReminders.length}</Text>
                <Text variant="caption" color="secondary">Total</Text>
              </Card>

              <Card elevation="sm" style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: `${Theme.colors.semantic.info}15` }]}>
                  <Icon name="time" size="sm" color={Theme.colors.semantic.info} />
                </View>
                <Text variant="h3" weight="600" customColor={Theme.colors.semantic.info}>
                  {upcomingReminders}
                </Text>
                <Text variant="caption" color="secondary">Upcoming</Text>
              </Card>

              <Card elevation="sm" style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: `${Theme.colors.semantic.success}15` }]}>
                  <Icon name="checkmark-circle" size="sm" color={Theme.colors.semantic.success} />
                </View>
                <Text variant="h3" weight="600" customColor={Theme.colors.semantic.success}>
                  {doneReminders}
                </Text>
                <Text variant="caption" color="secondary">Done</Text>
              </Card>

              {overdueReminders > 0 && (
                <Card elevation="sm" style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: `${Theme.colors.semantic.error}15` }]}>
                    <Icon name="alert-circle" size="sm" color={Theme.colors.semantic.error} />
                  </View>
                  <Text variant="h3" weight="600" customColor={Theme.colors.semantic.error}>
                    {overdueReminders}
                  </Text>
                  <Text variant="caption" color="secondary">Overdue</Text>
                </Card>
              )}
            </View>
          </Card>

          {/* Project Info Card - ✅ ENHANCED: Added shadow */}
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Icon name="information-circle-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="h4">Project Information</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="calendar" size="sm" color={Theme.colors.primary[500]} />
              </View>
              <View style={styles.infoContent}>
                <Text variant="bodyLarge" weight="600">
                  {formatDate(project.createdAt)}
                </Text>
                <Text variant="caption" color="secondary">
                  Created on {new Date(project.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="time" size="sm" color={Theme.colors.semantic.info} />
              </View>
              <View style={styles.infoContent}>
                <Text variant="bodyLarge" weight="600">
                  {formatDate(project.updatedAt)}
                </Text>
                <Text variant="caption" color="secondary">
                  Last updated {new Date(project.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon 
                  name={project.isArchived ? "archive" : "folder-open"} 
                  size="sm" 
                  color={project.isArchived ? Theme.colors.semantic.warning : Theme.colors.semantic.success} 
                />
              </View>
              <View style={styles.infoContent}>
                <Text variant="bodyLarge" weight="600">
                  {project.isArchived ? 'Archived' : 'Active'}
                </Text>
                <Text variant="caption" color="secondary">
                  Project status
                </Text>
              </View>
            </View>
          </Card>

          {/* Quick Actions - ✅ ENHANCED: Added shadows */}
          <View style={styles.actionsContainer}>
            <Text variant="caption" color="tertiary" style={styles.actionsTitle}>
              QUICK ACTIONS
            </Text>
            
            <View style={styles.actionsGrid}>
              <Pressable 
                onPress={handleViewReminders}
                haptic="light"
                style={styles.actionCard}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: `${Theme.colors.primary[500]}15` }]}>
                  <Icon name="list" size="md" color={Theme.colors.primary[500]} />
                </View>
                <Text variant="body" weight="600" align="center">
                  View Reminders
                </Text>
                <Text variant="caption" color="tertiary" align="center">
                  {projectReminders.length} items
                </Text>
              </Pressable>

              <Pressable 
                onPress={handleViewAnalytics}
                haptic="light"
                style={styles.actionCard}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: `${Theme.colors.semantic.info}15` }]}>
                  <Icon name="analytics" size="md" color={Theme.colors.semantic.info} />
                </View>
                <Text variant="body" weight="600" align="center">
                  Analytics
                </Text>
                <Text variant="caption" color="tertiary" align="center">
                  View insights
                </Text>
              </Pressable>
            </View>

            <Button
              label={project.isArchived ? 'Unarchive Project' : 'Archive Project'}
              variant="outline"
              size="large"
              leftIcon={project.isArchived ? "folder-open-outline" : "archive-outline"}
              onPress={handleArchive}
              style={styles.archiveButton}
            />
          </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
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
  notFoundButton: {
    marginTop: Theme.spacing.l,
  },
  
  // Project header styles - ✅ FIXED: Opacity standardized
  projectHeader: {
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: Theme.spacing.m,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Theme.colors.primary[500]}20`, // ✅ FIXED: 20% opacity (was 15%)
    borderWidth: 2,
    borderColor: `${Theme.colors.primary[500]}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.background.secondary,
    borderWidth: 3,
    borderColor: Theme.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: Theme.spacing.s,
  },
  categoryBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: `${Theme.colors.primary[500]}15`,
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.s,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.s,
    backgroundColor: `${Theme.colors.semantic.warning}20`, // ✅ FIXED: 20% opacity (was 15%)
  },
  
  // Description card styles - ✅ ENHANCED: Added shadow
  descriptionCard: {
    marginBottom: Theme.spacing.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    ...Theme.shadows.sm, // ✅ ADDED: Card shadow for depth
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.s,
  },
  descriptionText: {
    lineHeight: 24,
  },
  
  // Stats card styles - ✅ ENHANCED: Added shadow
  statsCard: {
    marginBottom: Theme.spacing.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    ...Theme.shadows.sm, // ✅ ADDED: Card shadow for depth
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  statsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  completionBadge: {
    paddingHorizontal: Theme.spacing.s,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.s,
    backgroundColor: `${Theme.colors.semantic.success}20`,
  },
  progressContainer: {
    marginBottom: Theme.spacing.m,
  },
  progressBar: {
    height: 8,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.s,
    gap: 6,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  
  // Info card styles - ✅ ENHANCED: Added shadow
  infoCard: {
    marginBottom: Theme.spacing.l,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    ...Theme.shadows.sm, // ✅ ADDED: Card shadow for depth
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.m,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}20`,
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginVertical: Theme.spacing.m,
  },
  
  // Actions styles - ✅ ENHANCED: Added shadows
  actionsContainer: {
    gap: Theme.spacing.m,
  },
  actionsTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 10,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.m,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    gap: Theme.spacing.xs,
    ...Theme.shadows.sm, // ✅ ADDED: Action card shadow for depth
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.l,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  archiveButton: {
    width: '100%',
  },
});
