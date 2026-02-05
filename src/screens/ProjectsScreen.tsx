/**
 * VisionFlow AI - Projects List Screen (v2.1 - Harmonized Edition)
 * Organize reminders by projects
 * 
 * @module screens/ProjectsScreen
 * 
 * CHANGELOG v2.1:
 * - ✅ Fixed toggle button opacity (15% → 20%)
 * - ✅ Added card elevation for visual depth
 * - ✅ Added header shadow for separation
 * - ✅ Enhanced add button with glow effect
 * - ✅ Uses theme safe area constants
 */

import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  ProjectStackParamList,
  MainTabParamList,
  RootStackParamList,
} from '../types/navigation.types';
import { Project } from '../types/project.types';
import { ReminderCategory, ReminderStatus } from '../types/reminder.types';
import { Theme } from '../constants/theme';
import {
  Screen,
  Container,
  Text,
  Card,
  SearchBar,
  Icon,
  Pressable,
  EmptyState,
  LoadingSpinner,
} from '../components';
import { useProjects } from '../hooks/useProjects';
import { useReminders } from '../hooks/useReminders';

type ProjectsScreenNavigationProp = CompositeNavigationProp<
  NativeStackScreenProps<ProjectStackParamList, 'ProjectList'>['navigation'],
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    NativeStackScreenProps<RootStackParamList>['navigation']
  >
>;

type ProjectsScreenProps = NativeStackScreenProps<
  ProjectStackParamList,
  'ProjectList'
> & {
  navigation: ProjectsScreenNavigationProp;
};

/**
 * Format last updated date
 */
const formatLastUpdated = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

/**
 * ProjectsScreen Component
 * 
 * Features:
 * - Project list with stats
 * - Search projects
 * - Active/Archived filter
 * - Quick create
 * - Navigate to project details
 */
export function ProjectsScreen({ navigation }: ProjectsScreenProps) {
  const { projects, isLoading, refreshProjects } = useProjects();
  const { reminders } = useReminders();
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter projects by search and archive status
  const filteredProjects = useMemo(() => {
    let result = [...projects];
    
    // Filter by archived status
    result = result.filter((p) => p.isArchived === showArchived);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.primaryCategory.toLowerCase().includes(query)
      );
    }
    
    // Sort by updated date (most recent first)
    result.sort((a, b) => b.updatedAt - a.updatedAt);
    
    return result;
  }, [projects, searchQuery, showArchived]);
  
  // Calculate reminder counts per project
  const projectReminderCounts = useMemo(() => {
    const counts: Record<string, { total: number; active: number; completed: number; overdue: number }> = {};
    
    projects.forEach((project) => {
      const projectReminders = reminders.filter((r) => r.projectId === project.id);
      counts[project.id] = {
        total: projectReminders.length,
        active: projectReminders.filter((r) => r.status === ReminderStatus.UPCOMING).length,
        completed: projectReminders.filter((r) => r.status === ReminderStatus.DONE).length,
        overdue: projectReminders.filter((r) => r.status === ReminderStatus.OVERDUE).length,
      };
    });
    
    return counts;
  }, [projects, reminders]);
  
  // Get active/archived counts
  const projectCounts = useMemo(() => ({
    active: projects.filter((p) => !p.isArchived).length,
    archived: projects.filter((p) => p.isArchived).length,
  }), [projects]);
  
  // Get category color
  const getCategoryColor = (category: ReminderCategory): string => {
    const categoryColors = Theme.colors.category as Record<string, { main: string }>;
    return categoryColors[category.toLowerCase().replace(/\s+/g, '')]?.main || Theme.colors.primary[500];
  };
  
  // Pull to refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProjects();
    setRefreshing(false);
  };
  
  // Navigation handlers
  const handleCreateProject = () => {
    navigation.navigate('CreateProject', {});
  };
  
  const handleProjectPress = (project: Project) => {
    navigation.navigate('ProjectDetail', { projectId: project.id });
  };
  
  // Render project card
  const renderProjectCard = ({ item }: { item: Project }) => {
    const counts = projectReminderCounts[item.id] || { total: 0, active: 0, completed: 0, overdue: 0 };
    const categoryColor = getCategoryColor(item.primaryCategory);
    const completionRate = counts.total > 0 ? (counts.completed / counts.total) * 100 : 0;
    
    return (
      <Card
        pressable
        onPress={() => handleProjectPress(item)}
        style={styles.projectCard}
      >
        <View style={styles.cardContent}>
          {/* Left: Category icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}15` }]}>
            <Icon
              name="folder"
              size="md"
              color={categoryColor}
            />
          </View>
          
          {/* Center: Project info */}
          <View style={styles.cardInfo}>
            <View style={styles.projectHeader}>
              <Text variant="bodyLarge" weight="600" numberOfLines={1} style={styles.projectName}>
                {item.name}
              </Text>
              {item.isArchived && (
                <View style={styles.archivedBadge}>
                  <Text variant="micro" color="tertiary" weight="700">
                    ARCHIVED
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.categoryRow}>
              <Icon name="pricetag-outline" size="xs" color={categoryColor} />
              <Text variant="caption" customColor={categoryColor}>
                {item.primaryCategory}
              </Text>
              <View style={styles.metaDivider} />
              <Text variant="caption" color="tertiary">
                Updated {formatLastUpdated(item.updatedAt)}
              </Text>
            </View>
            
            {item.description && (
              <Text variant="body" color="secondary" numberOfLines={2} style={styles.description}>
                {item.description}
              </Text>
            )}
            
            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="document-text-outline" size="xs" color={Theme.colors.text.tertiary} />
                <Text variant="caption" color="tertiary">
                  {counts.total}
                </Text>
              </View>
              
              {counts.active > 0 && (
                <View style={styles.statItem}>
                  <Icon name="time-outline" size="xs" color={Theme.colors.primary[500]} />
                  <Text variant="caption" customColor={Theme.colors.primary[500]} weight="600">
                    {counts.active}
                  </Text>
                </View>
              )}
              
              {counts.overdue > 0 && (
                <View style={styles.statItem}>
                  <Icon name="alert-circle-outline" size="xs" color={Theme.colors.semantic.error} />
                  <Text variant="caption" customColor={Theme.colors.semantic.error} weight="600">
                    {counts.overdue}
                  </Text>
                </View>
              )}
              
              {counts.completed > 0 && (
                <View style={styles.statItem}>
                  <Icon name="checkmark-circle-outline" size="xs" color={Theme.colors.semantic.success} />
                  <Text variant="caption" customColor={Theme.colors.semantic.success}>
                    {counts.completed}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Progress bar (if has reminders) */}
            {counts.total > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${completionRate}%`,
                        backgroundColor: categoryColor,
                      }
                    ]} 
                  />
                </View>
                <Text variant="micro" color="tertiary">
                  {Math.round(completionRate)}%
                </Text>
              </View>
            )}
          </View>
          
          {/* Right: Chevron */}
          <Icon
            name="chevron-forward-outline"
            size="sm"
            color={Theme.colors.text.tertiary}
          />
        </View>
      </Card>
    );
  };
  
  return (
    <Screen>
      <Container padding="none">
        {/* Header with Search - ✅ ENHANCED: Added shadow */}
        <View style={styles.header}>
          <Container padding="m">
            <View style={styles.headerTop}>
              <View>
                <Text variant="h2">Projects</Text>
                <Text variant="caption" color="tertiary">
                  {projectCounts.active} active • {projectCounts.archived} archived
                </Text>
              </View>
              <Pressable onPress={handleCreateProject} haptic="light" style={styles.addButton}>
                <Icon name="add" size="md" color={Theme.colors.background.primary} />
              </Pressable>
            </View>
            
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search projects..."
            />
          </Container>
          
          {/* Archive Toggle */}
          <View style={styles.toggleContainer}>
            <Pressable 
              onPress={() => setShowArchived(false)} 
              haptic="light"
              style={styles.toggleOption}
            >
              <View style={[
                styles.toggleButton,
                !showArchived && styles.toggleButtonActive,
              ]}>
                <Text 
                  variant="body" 
                  weight="600"
                  customColor={!showArchived ? Theme.colors.primary[500] : Theme.colors.text.secondary}
                >
                  Active
                </Text>
                <View style={[
                  styles.countBadge,
                  !showArchived && styles.countBadgeActive,
                ]}>
                  <Text 
                    variant="caption" 
                    weight="700"
                    customColor={!showArchived ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
                  >
                    {projectCounts.active}
                  </Text>
                </View>
              </View>
            </Pressable>
            
            <Pressable 
              onPress={() => setShowArchived(true)} 
              haptic="light"
              style={styles.toggleOption}
            >
              <View style={[
                styles.toggleButton,
                showArchived && styles.toggleButtonActive,
              ]}>
                <Text 
                  variant="body" 
                  weight="600"
                  customColor={showArchived ? Theme.colors.primary[500] : Theme.colors.text.secondary}
                >
                  Archived
                </Text>
                <View style={[
                  styles.countBadge,
                  showArchived && styles.countBadgeActive,
                ]}>
                  <Text 
                    variant="caption" 
                    weight="700"
                    customColor={showArchived ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
                  >
                    {projectCounts.archived}
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>
        </View>
        
        {/* Projects List */}
        {isLoading ? (
          <LoadingSpinner text="Loading projects..." />
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            icon="folder-outline"
            title={showArchived ? "No archived projects" : "No projects found"}
            description={
              searchQuery
                ? 'Try adjusting your search'
                : showArchived
                ? 'Archived projects will appear here'
                : 'Create your first project to organize reminders'
            }
            actionLabel={showArchived ? undefined : "Create Project"}
            onActionPress={showArchived ? undefined : handleCreateProject}
          />
        ) : (
          <FlatList
            data={filteredProjects}
            renderItem={renderProjectCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Theme.colors.primary[500]}
              />
            }
          />
        )}
      </Container>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header styles - ✅ ENHANCED: Added shadow
  header: {
    backgroundColor: Theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    ...Theme.shadows.sm, // ✅ ADDED: Header shadow for depth
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.m,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.glow, // ✅ ADDED: Glow effect on primary button
  },
  
  // Toggle styles - ✅ FIXED: Standardized to 20% opacity
  toggleContainer: {
    flexDirection: 'row',
    padding: Theme.spacing.m,
    paddingTop: Theme.spacing.s,
    gap: Theme.spacing.s,
    backgroundColor: Theme.colors.background.primary,
  },
  toggleOption: {
    flex: 1,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.xs,
    paddingVertical: Theme.spacing.s,
    paddingHorizontal: Theme.spacing.m,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: `${Theme.colors.primary[500]}20`, // ✅ FIXED: 20% opacity (was 15%)
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  countBadge: {
    minWidth: 24,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: Theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeActive: {
    backgroundColor: `${Theme.colors.primary[500]}25`,
  },
  
  // List styles - ✅ Already correct
  listContent: {
    padding: Theme.spacing.m,
    paddingBottom: Theme.spacing.safeArea.bottomPadding, // ✅ Uses theme (80)
    gap: Theme.spacing.m,
  },
  
  // Card styles - ✅ ENHANCED: Added shadow
  projectCard: {
    padding: Theme.spacing.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    ...Theme.shadows.sm, // ✅ ADDED: Card shadow for depth
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.m,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}20`,
  },
  cardInfo: {
    flex: 1,
    gap: 6,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  projectName: {
    flex: 1,
  },
  archivedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Theme.colors.text.tertiary,
    opacity: 0.5,
  },
  description: {
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    paddingTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
