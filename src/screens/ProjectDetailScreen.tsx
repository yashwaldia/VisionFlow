/**
 * VisionFlow AI - Project Detail Screen (100% ERROR-FREE)
 * View and manage a single project
 * 
 * @module screens/ProjectDetailScreen
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
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

type ProjectDetailScreenProps = NativeStackScreenProps<ProjectStackParamList, 'ProjectDetail'>;

/**
 * ProjectDetailScreen Component
 */
export function ProjectDetailScreen({ navigation, route }: ProjectDetailScreenProps) {
  const { projectId } = route.params;
  const { getProjectById, updateProject, deleteProject } = useProjects();
  const { reminders } = useReminders();
  
  const [project, setProject] = useState(getProjectById(projectId));

  // Get project reminders
  const projectReminders = reminders.filter(r => r.projectId === projectId);
  const upcomingReminders = projectReminders.filter(r => r.status === 'upcoming').length;
  const doneReminders = projectReminders.filter(r => r.status === 'done').length;
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
          <Text variant="h3">Project not found</Text>
          <Button label="Go Back" onPress={() => navigation.goBack()} />
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
      'Are you sure? All reminders will be unlinked from this project.',
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
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <Text variant="h4" weight="600">Project Details</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={handleEdit}>
            <Icon name="create-outline" size="md" color={Theme.colors.text.primary} />
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Icon name="trash-outline" size="md" color={Theme.colors.semantic.error} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Container padding="m">
          {/* Project Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Icon name="folder" size="xl" color={Theme.colors.primary[500]} />
            </View>
          </View>

          {/* Title & Category */}
          <Text variant="h2" style={styles.title}>{project.name}</Text>
          <View style={styles.categoryBadge}>
            <Text variant="body" weight="600" customColor={Theme.colors.primary[500]}>
              {project.primaryCategory}
            </Text>
          </View>

          {/* Description */}
          {project.description && (
            <Card style={styles.descriptionCard}>
              <Text variant="body">{project.description}</Text>
            </Card>
          )}

          {/* Stats Card */}
          <Card style={styles.statsCard}>
            <Text variant="h4" style={styles.statsTitle}>Statistics</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Icon name="list-outline" size="lg" color={Theme.colors.primary[500]} />
                <Text variant="h3" weight="600">{projectReminders.length}</Text>
                <Text variant="caption" color="secondary">Total Reminders</Text>
              </View>

              <View style={styles.statItem}>
                <Icon name="time-outline" size="lg" color={Theme.colors.semantic.info} />
                <Text variant="h3" weight="600">{upcomingReminders}</Text>
                <Text variant="caption" color="secondary">Upcoming</Text>
              </View>

              <View style={styles.statItem}>
                <Icon name="checkmark-circle-outline" size="lg" color={Theme.colors.semantic.success} />
                <Text variant="h3" weight="600">{doneReminders}</Text>
                <Text variant="caption" color="secondary">Completed</Text>
              </View>

              <View style={styles.statItem}>
                <Icon name="analytics-outline" size="lg" color={Theme.colors.primary[500]} />
                <Text variant="h3" weight="600">{completionRate}%</Text>
                <Text variant="caption" color="secondary">Completion</Text>
              </View>
            </View>
          </Card>

          {/* Details Card */}
          <Card style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Icon name="calendar-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="body" color="secondary">Created:</Text>
              <Text variant="body" weight="600">
                {new Date(project.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="time-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="body" color="secondary">Updated:</Text>
              <Text variant="body" weight="600">
                {new Date(project.updatedAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="archive-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="body" color="secondary">Status:</Text>
              <Text variant="body" weight="600">
                {project.isArchived ? 'Archived' : 'Active'}
              </Text>
            </View>
          </Card>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Button
              label="View Reminders"
              variant="outline"
              size="large"
              leftIcon="list-outline"
              onPress={handleViewReminders}
              style={styles.actionButton}
            />

            <Button
              label="Analytics"
              variant="outline"
              size="large"
              leftIcon="analytics-outline"
              onPress={handleViewAnalytics}
              style={styles.actionButton}
            />

            <Button
              label={project.isArchived ? 'Unarchive' : 'Archive'}
              variant="outline"
              size="large"
              leftIcon="archive-outline"
              onPress={handleArchive}
              style={styles.actionButton}
            />
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
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
  },
  content: {
    paddingBottom: Theme.spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: Theme.spacing.l,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: Theme.spacing.s,
  },
  categoryBadge: {
    alignSelf: 'center',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    marginBottom: Theme.spacing.l,
  },
  descriptionCard: {
    marginBottom: Theme.spacing.m,
  },
  statsCard: {
    marginBottom: Theme.spacing.m,
  },
  statsTitle: {
    marginBottom: Theme.spacing.m,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.m,
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: Theme.spacing.m,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.m,
    gap: Theme.spacing.xs,
  },
  detailsCard: {
    marginBottom: Theme.spacing.l,
    gap: Theme.spacing.m,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
  },
  actionsContainer: {
    gap: Theme.spacing.m,
  },
  actionButton: {
    width: '100%',
  },
});
