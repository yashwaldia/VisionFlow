/**
 * VisionFlow AI - Project List Screen (v5.0 - Keyboard & Layout Fix)
 * Browse and manage all projects
 * 
 * @module screens/ProjectListScreen
 * 
 * CHANGELOG v5.0:
 * - ✅ CRITICAL FIX: Applied Pattern screen keyboard handling (keyboardShouldPersistTaps/keyboardDismissMode)
 * - ✅ CRITICAL FIX: Replaced View wrapper with Screen component (Pattern baseline)
 * - ✅ CRITICAL FIX: Moved header outside FlatList to prevent keyboard interference
 * - ✅ LAYOUT FIX: Removed manual safe area insets (Screen handles it)
 * - ✅ LAYOUT FIX: TextInput fontSize locked at 16px (prevents iOS zoom)
 * - ✅ Preserved Project's superior list styling (borders + arrows)
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TextInput, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProjectStackParamList } from '../types/navigation.types';
import { ReminderCategory } from '../types/reminder.types';
import { Theme } from '../constants/theme';
import {
  Screen,
  Container,
  Text,
  Card,
  Icon,
  Pressable,
  EmptyState,
  LoadingSpinner,
} from '../components';
import { useProjects } from '../hooks/useProjects';
import * as Haptics from 'expo-haptics';

type ProjectListScreenProps = NativeStackScreenProps<ProjectStackParamList, 'ProjectList'>;

/**
 * Format last updated timestamp
 */
const formatLastUpdated = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  if (diffDays < 7) return `Updated ${diffDays}d ago`;
  if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)}w ago`;
  
  return `Updated ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
};

/**
 * Get category icon
 */
const getCategoryIcon = (category: ReminderCategory | 'all'): string => {
  const icons: Record<string, string> = {
    all: 'apps-outline',
    [ReminderCategory.PERSONAL]: 'home-outline',
    [ReminderCategory.WORK]: 'briefcase-outline',
    [ReminderCategory.HEALTH]: 'fitness-outline',
    [ReminderCategory.MONEY]: 'cash-outline',
  };
  return icons[category] || 'folder-outline';
};

/**
 * ProjectListScreen Component
 * 
 * Features:
 * - List all projects with stats
 * - Search projects
 * - Filter by category
 * - Pull-to-refresh
 */
export function ProjectListScreen({ navigation }: ProjectListScreenProps) {
  const {
    filteredProjects,
    isLoading,
    refreshProjects,
    deleteProject,
    setFilters,
  } = useProjects();

  const searchInputRef = useRef<TextInput>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ReminderCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter by search query
  const searchFilteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return filteredProjects;
    
    const query = searchQuery.toLowerCase();
    return filteredProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.primaryCategory.toLowerCase().includes(query)
    );
  }, [filteredProjects, searchQuery]);

  // Count stats
  const projectStats = useMemo(() => {
    const total = filteredProjects.length;
    const active = filteredProjects.filter((p) => !p.isArchived).length;
    const archived = filteredProjects.filter((p) => p.isArchived).length;
    
    return { total, active, archived };
  }, [filteredProjects]);

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProjects();
    setRefreshing(false);
  };

  // Handle category filter
  const handleCategoryFilter = useCallback((category: ReminderCategory | 'all') => {
    setSelectedCategory(category);
    setFilters({ 
      category: category as any,
      isArchived: false,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [setFilters]);

  // Handle project tap
  const handleProjectTap = useCallback((projectId: string) => {
    navigation.navigate('ProjectDetail', { projectId });
  }, [navigation]);

  // Handle create project
  const handleCreateProject = useCallback(() => {
    navigation.navigate('CreateProject', {});
  }, [navigation]);

  // Render project card
  const renderProject = useCallback(({ item }: { item: any }) => {
    const completionRate = item.stats?.completionRate || 0;
    const totalReminders = item.stats?.totalReminders || 0;
    const activeReminders = item.stats?.activeCount || 0;
    const doneCount = item.stats?.doneCount || 0;
    const overdueCount = item.stats?.overdueCount || 0;
    
    return (
      <Card
        key={item.id}
        pressable
        onPress={() => handleProjectTap(item.id)}
        elevation="sm"
        style={styles.projectCard}
      >
        <View style={styles.projectContent}>
          {/* Project Icon */}
          <View style={styles.projectIconContainer}>
            <Icon 
              name="folder" 
              size="md" 
              color={Theme.colors.primary[500]} 
            />
            {item.isArchived && (
              <View style={styles.archivedBadge}>
                <Icon name="archive" size="xs" color={Theme.colors.text.tertiary} />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.projectInfo}>
            <View style={styles.projectHeader}>
              <Text variant="bodyLarge" weight="700" numberOfLines={1} style={styles.projectName}>
                {item.name}
              </Text>
              {totalReminders > 0 && (
                <View style={styles.countBadge}>
                  <Text variant="micro" weight="700" customColor={Theme.colors.primary[500]}>
                    {totalReminders}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.categoryRow}>
              <Icon 
                name={getCategoryIcon(item.primaryCategory) as any}
                size="xs" 
                color={Theme.colors.text.secondary} 
              />
              <Text variant="caption" color="secondary">
                {item.primaryCategory}
              </Text>
              <View style={styles.metaDivider} />
              <Text variant="caption" color="tertiary">
                {formatLastUpdated(item.updatedAt)}
              </Text>
            </View>

            {item.description && (
              <Text variant="caption" color="tertiary" numberOfLines={1} style={styles.description}>
                {item.description}
              </Text>
            )}

            {/* Stats Row */}
            {totalReminders > 0 && (
              <View style={styles.statsRow}>
                {activeReminders > 0 && (
                  <View style={styles.statItem}>
                    <Icon name="time-outline" size="xs" color={Theme.colors.primary[500]} />
                    <Text variant="caption" customColor={Theme.colors.primary[500]} weight="600">
                      {activeReminders}
                    </Text>
                  </View>
                )}
                
                {overdueCount > 0 && (
                  <View style={styles.statItem}>
                    <Icon name="alert-circle-outline" size="xs" color={Theme.colors.semantic.error} />
                    <Text variant="caption" customColor={Theme.colors.semantic.error} weight="600">
                      {overdueCount}
                    </Text>
                  </View>
                )}
                
                {doneCount > 0 && (
                  <View style={styles.statItem}>
                    <Icon name="checkmark-circle-outline" size="xs" color={Theme.colors.semantic.success} />
                    <Text variant="caption" customColor={Theme.colors.semantic.success}>
                      {doneCount}
                    </Text>
                  </View>
                )}
                
                <View style={styles.statItem}>
                  <Icon name="analytics-outline" size="xs" color={Theme.colors.text.tertiary} />
                  <Text variant="caption" color="tertiary">
                    {Math.round(completionRate)}%
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Arrow */}
          <Icon name="chevron-forward-outline" size="sm" color={Theme.colors.text.tertiary} />
        </View>
      </Card>
    );
  }, [handleProjectTap]);

  return (
    <Screen>
      {/* Header - Fixed Outside FlatList (Pattern Baseline) */}
      <Container padding="m" style={styles.header}>
        {/* Header Top */}
        <View style={styles.headerTop}>
          <View>
            <Text variant="h2">Projects</Text>
          </View>
          <Pressable 
            onPress={handleCreateProject}
            haptic="medium"
            style={styles.createButton}
          >
            <Icon name="add" size="sm" color={Theme.colors.background.primary} />
            <Text variant="caption" weight="700" customColor={Theme.colors.background.primary}>
              NEW
            </Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size="sm" color={Theme.colors.text.tertiary} />
          <TextInput
            ref={searchInputRef}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search projects..."
            placeholderTextColor={Theme.colors.text.tertiary}
            style={styles.searchInput}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Icon name="close-circle" size="sm" color={Theme.colors.text.tertiary} />
            </Pressable>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text variant="h4" customColor={Theme.colors.primary[500]}>
              {projectStats.total}
            </Text>
            <Text variant="caption" color="secondary">Total</Text>
          </View>
          
          <View style={styles.statBox}>
            <Text variant="h4" customColor={Theme.colors.semantic.success}>
              {projectStats.active}
            </Text>
            <Text variant="caption" color="secondary">Active</Text>
          </View>
          
          <View style={styles.statBox}>
            <Text variant="h4" customColor={Theme.colors.text.tertiary}>
              {projectStats.archived}
            </Text>
            <Text variant="caption" color="secondary">Archived</Text>
          </View>
        </View>

        {/* Category Filter with Icons */}
        <View style={styles.categoryFilter}>
          <Pressable
            onPress={() => handleCategoryFilter('all')}
            style={[
              styles.categoryChip,
              selectedCategory === 'all' ? styles.categoryChipActive : {},
            ]}
          >
            <Icon 
              name={getCategoryIcon('all') as any}
              size="xs" 
              color={selectedCategory === 'all' ? Theme.colors.primary[500] : Theme.colors.text.secondary} 
            />
            <Text
              variant="caption"
              weight="700"
              customColor={
                selectedCategory === 'all'
                  ? Theme.colors.primary[500]
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
              <Icon 
                name={getCategoryIcon(cat) as any}
                size="xs" 
                color={selectedCategory === cat ? Theme.colors.primary[500] : Theme.colors.text.secondary} 
              />
              <Text
                variant="caption"
                weight="700"
                customColor={
                  selectedCategory === cat
                    ? Theme.colors.primary[500]
                    : Theme.colors.text.secondary
                }
              >
                {cat.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </Container>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      ) : searchFilteredProjects.length === 0 && !searchQuery ? (
        <EmptyState
          icon="folder-outline"
          title="No projects found"
          description="Create your first project to organize reminders!"
          actionLabel="Create Project"
          onActionPress={handleCreateProject}
        />
      ) : (
        <FlatList
          data={searchFilteredProjects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            searchQuery ? (
              <View style={styles.emptySearch}>
                <Icon name="search-outline" size="xl" color={Theme.colors.text.tertiary} />
                <Text variant="h4" align="center" style={{ marginTop: Theme.spacing.m }}>
                  No matching projects
                </Text>
                <Text variant="body" color="secondary" align="center">
                  Try adjusting your search
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Theme.colors.primary[500]}
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header styles
  header: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
    paddingTop: Platform.OS === 'ios' ? 0 : Theme.spacing.s,
    ...Theme.shadows.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.m,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.primary[500],
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Theme.borderRadius.m,
    ...Theme.shadows.glow,
  },

  // Search bar styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
    height: 48,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    paddingHorizontal: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.text.primary,
    fontFamily: Theme.typography.fontFamily.mono,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  
  // Stats container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.m,
  },
  statBox: {
    alignItems: 'center',
  },
  
  // Category filter styles
  categoryFilter: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
    flexWrap: 'wrap',
    paddingBottom: Theme.spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
  },
  categoryChipActive: {
    backgroundColor: `${Theme.colors.primary[500]}20`,
    borderColor: Theme.colors.primary[500],
  },
  
  // List styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Theme.spacing.m,
    gap: Theme.spacing.s,
    paddingBottom: Theme.spacing.safeArea.bottomPaddingLarge,
  },
  emptySearch: {
    padding: Theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Project card styles
  projectCard: {
    marginBottom: Theme.spacing.s,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    ...Theme.shadows.sm,
  },
  projectContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.m,
  },
  projectIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: `${Theme.colors.primary[500]}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
    position: 'relative',
  },
  archivedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 2,
    borderColor: Theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectInfo: {
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
  countBadge: {
    minWidth: 24,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 16,
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
});
