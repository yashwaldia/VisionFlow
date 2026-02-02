/**
 * VisionFlow AI - Projects List Screen
 * Organize reminders by projects
 * 
 * @module screens/ProjectsScreen
 */

import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  ProjectStackParamList,
  MainTabParamList,
  RootStackParamList,
} from '../types/navigation.types';
import { Project } from '../types/project.types';
import { ReminderCategory } from '../types/reminder.types';
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
 * ProjectsScreen Component
 * 
 * Features:
 * - Project list with stats
 * - Search projects
 * - Quick create
 * - Navigate to project details
 */
export function ProjectsScreen({ navigation }: ProjectsScreenProps) {
  const { projects, isLoading } = useProjects();
  const { reminders } = useReminders();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter projects by search
  const filteredProjects = useMemo(() => {
    let result = [...projects];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.primaryCategory.toLowerCase().includes(query) // FIXED: category → primaryCategory
      );
    }
    
    // Sort by updated date (most recent first)
    result.sort((a, b) => b.updatedAt - a.updatedAt);
    
    return result;
  }, [projects, searchQuery]);
  
  // Calculate reminder counts per project
  const projectReminderCounts = useMemo(() => {
    const counts: Record<string, { total: number; active: number }> = {};
    
    projects.forEach((project) => {
      const projectReminders = reminders.filter((r) => r.projectId === project.id);
      counts[project.id] = {
        total: projectReminders.length,
        active: projectReminders.filter((r) => r.status === 'upcoming').length,
      };
    });
    
    return counts;
  }, [projects, reminders]);
  
  // Get category color
  const getCategoryColor = (category: ReminderCategory): string => {
    const categoryColors = Theme.colors.category as Record<string, { main: string }>;
    return categoryColors[category.toLowerCase().replace(/\s+/g, '')]?.main || Theme.colors.primary[500];
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
    const counts = projectReminderCounts[item.id] || { total: 0, active: 0 };
    const categoryColor = getCategoryColor(item.primaryCategory); // FIXED: category → primaryCategory
    
    return (
      <Card
        pressable
        onPress={() => handleProjectPress(item)}
        style={styles.projectCard}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}30` }]}>
            <Icon
              name="folder"
              size="md"
              color={categoryColor}
            />
          </View>
          
          <View style={styles.cardInfo}>
            <Text variant="body" weight="600" numberOfLines={1}>
              {item.name}
            </Text>
            <Text variant="caption" color="tertiary">
              {item.primaryCategory} {/* FIXED: category → primaryCategory */}
            </Text>
          </View>
          
          <Icon
            name="chevron-forward"
            size="sm"
            color={Theme.colors.text.tertiary}
          />
        </View>
        
        {item.description && (
          <Text variant="body" color="secondary" numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.cardFooter}>
          <View style={styles.stat}>
            <Icon name="document-text" size="xs" color={Theme.colors.text.tertiary} />
            <Text variant="caption" color="tertiary">
              {counts.total} reminders
            </Text>
          </View>
          
          {counts.active > 0 && (
            <View style={styles.stat}>
              <View style={styles.activeBadge}>
                <Text variant="caption" weight="600" customColor={Theme.colors.primary[500]}>
                  {counts.active} active
                </Text>
              </View>
            </View>
          )}
        </View>
      </Card>
    );
  };
  
  return (
    <Screen>
      <Container padding="none">
        {/* Header with Search */}
        <View style={styles.header}>
          <Container padding="m">
            <View style={styles.headerTop}>
              <Text variant="h2">Projects</Text>
              <Pressable onPress={handleCreateProject} haptic="light">
                <Icon name="add-circle" size="md" color={Theme.colors.primary[500]} />
              </Pressable>
            </View>
            
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search projects..."
            />
          </Container>
        </View>
        
        {/* Projects List */}
        {isLoading ? (
          <LoadingSpinner text="Loading projects..." />
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            icon="folder-outline"
            title="No projects found"
            description={
              searchQuery
                ? 'Try adjusting your search'
                : 'Create your first project to organize reminders'
            }
            actionLabel="Create Project"
            onActionPress={handleCreateProject}
          />
        ) : (
          <FlatList
            data={filteredProjects}
            renderItem={renderProjectCard}
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
  listContent: {
    padding: Theme.spacing.m,
    gap: Theme.spacing.s,
  },
  projectCard: {
    padding: Theme.spacing.m,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
    marginBottom: Theme.spacing.s,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  description: {
    marginBottom: Theme.spacing.s,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeBadge: {
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.s,
    backgroundColor: `${Theme.colors.primary[500]}20`,
  },
});
