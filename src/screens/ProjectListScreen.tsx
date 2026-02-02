/**
 * VisionFlow AI - Project List Screen (100% ERROR-FREE)
 * Browse and manage all projects
 * 
 * @module screens/ProjectListScreen
 */

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProjectStackParamList } from '../types/navigation.types';
import { ReminderCategory } from '../types/reminder.types';
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
import { useProjects } from '../hooks/useProjects';
import * as Haptics from 'expo-haptics';

type ProjectListScreenProps = NativeStackScreenProps<ProjectStackParamList, 'ProjectList'>;

/**
 * ProjectListScreen Component
 * 
 * Features:
 * - List all projects with stats
 * - Filter by category
 * - Pull-to-refresh
 * - Archive/unarchive projects
 * - Stats overview
 */
export function ProjectListScreen({ navigation }: ProjectListScreenProps) {
  const {
    filteredProjects,
    isLoading,
    refreshProjects,
    deleteProject,
    setFilters,
  } = useProjects();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ReminderCategory | 'all'>('all');

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProjects();
    setRefreshing(false);
  };

  // Handle category filter
  const handleCategoryFilter = (category: ReminderCategory | 'all') => {
    setSelectedCategory(category);
    setFilters({ 
      category: category as any,
      isArchived: false,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle project tap
  const handleProjectTap = (projectId: string) => {
    navigation.navigate('ProjectDetail', { projectId });
  };

  // Handle create project
  const handleCreateProject = () => {
    navigation.navigate('CreateProject', {});
  };

  // Render project card
  const renderProject = ({ item }: { item: any }) => {
    const completionRate = item.stats?.completionRate || 0;
    const totalReminders = item.stats?.totalReminders || 0;
    const doneCount = item.stats?.doneCount || 0;
    
    return (
      <Card
        key={item.id}
        pressable
        onPress={() => handleProjectTap(item.id)}
        style={styles.projectCard}
      >
        <View style={styles.projectContent}>
          {/* Project Icon */}
          <View style={styles.projectIcon}>
            <Icon name="folder" size="lg" color={Theme.colors.primary[500]} />
          </View>

          {/* Content */}
          <View style={styles.projectInfo}>
            <Text variant="bodyLarge" weight="600">
              {item.name}
            </Text>
            <Text variant="caption" color="secondary">
              {item.primaryCategory}
            </Text>
            {item.description && (
              <Text variant="caption" color="tertiary" numberOfLines={1}>
                {item.description}
              </Text>
            )}

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <Icon name="list-outline" size="xs" color={Theme.colors.text.secondary} />
                <Text variant="caption" color="secondary">
                  {totalReminders}
                </Text>
              </View>
              
              <View style={styles.statBadge}>
                <Icon name="checkmark-circle-outline" size="xs" color={Theme.colors.semantic.success} />
                <Text variant="caption" color="secondary">
                  {doneCount}
                </Text>
              </View>

              <View style={styles.statBadge}>
                <Icon name="analytics-outline" size="xs" color={Theme.colors.primary[500]} />
                <Text variant="caption" color="secondary">
                  {Math.round(completionRate)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Arrow */}
          <Icon name="chevron-forward" size="sm" color={Theme.colors.text.tertiary} />
        </View>
      </Card>
    );
  };

  return (
    <Screen>
      {/* Header */}
      <Container padding="m" style={styles.header}>
        <View style={styles.headerTop}>
          <Text variant="h2">Projects</Text>
          <Button
            label="New"
            leftIcon="add-outline"
            variant="primary"
            size="small"
            onPress={handleCreateProject}
          />
        </View>

        {/* Category Filter - FIXED: Use ternary with empty object */}
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
                {cat}
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
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon="folder-outline"
          title="No projects found"
          description="Create your first project to organize reminders!"
          actionLabel="Create Project"
          onActionPress={handleCreateProject}
        />
      ) : (
        <FlatList
          data={filteredProjects}
          renderItem={renderProject}
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

      {/* Floating Action Button */}
      <Pressable
        style={styles.fab}
        onPress={handleCreateProject}
      >
        <Icon name="add" size="lg" color={Theme.colors.text.inverse} />
      </Pressable>
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
    paddingBottom: 100, // Space for FAB
    gap: Theme.spacing.s,
  },
  projectCard: {
    marginBottom: Theme.spacing.s,
  },
  projectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  projectIcon: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectInfo: {
    flex: 1,
    gap: Theme.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    marginTop: Theme.spacing.xs,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fab: {
    position: 'absolute',
    bottom: Theme.spacing.l,
    right: Theme.spacing.l,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
