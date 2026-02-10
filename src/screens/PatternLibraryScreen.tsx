/**
 * VisionFlow AI - Pattern Library Screen (v4.1 - Compact Card Layout)
 * Browse and manage all discovered patterns
 * 
 * @module screens/PatternLibraryScreen
 * @version 4.1.0
 * 
 * CHANGELOG v4.1:
 * - ✅ Compact card layout matching Reminder height
 * - ✅ Removed "Favorite" text badge (icon only)
 * - ✅ AI/Manual badge inline with pattern type
 * - ✅ Days ago and confidence % in same meta row
 * - ✅ Optimized vertical spacing
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PatternStackParamList } from '../types/navigation.types';
import { PatternType } from '../types/pattern.types';
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
import { usePatterns } from '../hooks/usePatterns';
import * as Haptics from 'expo-haptics';

type PatternLibraryScreenProps = NativeStackScreenProps<PatternStackParamList, 'PatternLibrary'>;

/**
 * Format date relative to today
 */
const formatRelativeDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const diffMs = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

/**
 * Get pattern type configuration (emoji, color, icon)
 */
const getPatternTypeConfig = (type: PatternType) => {
  const configs: Record<string, { icon: string; color: string; bgColor: string; emoji: string }> = {
    [PatternType.FIBONACCI]: {
      icon: 'git-branch-outline',
      color: '#FFD700',
      bgColor: '#FFD70020',
      emoji: '🌀',
    },
    [PatternType.ELLIOTT_WAVE]: {
      icon: 'trending-up-outline',
      color: '#00BCD4',
      bgColor: '#00BCD420',
      emoji: '📈',
    },
    [PatternType.SACRED_GEOMETRY]: {
      icon: 'diamond-outline',
      color: '#9C27B0',
      bgColor: '#9C27B020',
      emoji: '💎',
    },
    [PatternType.FRACTAL]: {
      icon: 'infinite-outline',
      color: '#FF6B35',
      bgColor: '#FF6B3520',
      emoji: '🌿',
    },
    [PatternType.SPIRAL]: {
      icon: 'reload-circle-outline',
      color: '#FFD700',
      bgColor: '#FFD70020',
      emoji: '🌀',
    },
    [PatternType.SYMMETRY]: {
      icon: 'copy-outline',
      color: '#4CAF50',
      bgColor: '#4CAF5020',
      emoji: '🦋',
    },
    [PatternType.CHANNEL]: {
      icon: 'swap-horizontal-outline',
      color: '#2196F3',
      bgColor: '#2196F320',
      emoji: '📊',
    },
    [PatternType.WAVE]: {
      icon: 'water-outline',
      color: '#00BCD4',
      bgColor: '#00BCD420',
      emoji: '🌊',
    },
    [PatternType.GEOMETRIC]: {
      icon: 'shapes-outline',
      color: '#9C27B0',
      bgColor: '#9C27B020',
      emoji: '🔷',
    },
    [PatternType.CUSTOM]: {
      icon: 'create-outline',
      color: Theme.colors.primary[500],
      bgColor: `${Theme.colors.primary[500]}20`,
      emoji: '✏️',
    },
  };
  return configs[type] || {
    icon: 'help-circle-outline',
    color: Theme.colors.text.tertiary,
    bgColor: `${Theme.colors.text.tertiary}20`,
    emoji: '❓',
  };
};

/**
 * Get confidence badge configuration
 */
const getConfidenceBadge = (confidence?: number) => {
  if (!confidence) return { label: 'N/A', color: Theme.colors.text.tertiary };
  if (confidence >= 0.8) return { label: 'HIGH', color: Theme.colors.semantic.success };
  if (confidence >= 0.6) return { label: 'MED', color: Theme.colors.semantic.warning };
  return { label: 'LOW', color: Theme.colors.text.tertiary };
};

export function PatternLibraryScreen({ navigation, route }: PatternLibraryScreenProps) {
  const { filterType } = route.params || {};
  
  const {
    filteredPatterns,
    isLoading,
    stats,
    refreshPatterns,
    toggleFavorite,
    setFilters,
  } = usePatterns();

  const searchInputRef = useRef<TextInput>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<PatternType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (filterType) {
      setSelectedType(filterType);
      setFilters({ type: filterType, source: 'all' });
    }
  }, [filterType]);

  // Filter by search query
  const searchFilteredPatterns = useMemo(() => {
    if (!searchQuery.trim()) return filteredPatterns;
    
    const query = searchQuery.toLowerCase();
    return filteredPatterns.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.type.toLowerCase().includes(query) ||
        p.source.toLowerCase().includes(query)
    );
  }, [filteredPatterns, searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPatterns();
    setRefreshing(false);
  };

  const handleTypeFilter = (type: PatternType | 'all') => {
    setSelectedType(type);
    setFilters({ 
      type: type as any, 
      source: 'all',
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePatternTap = (patternId: string) => {
    navigation.navigate('PatternDetail', { patternId });
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await toggleFavorite(id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const renderPattern = ({ item }: { item: any }) => {
    const typeConfig = getPatternTypeConfig(item.type);
    const confidenceBadge = getConfidenceBadge(item.confidence);
    const isAIGenerated = item.source === 'ai';
    
    return (
      <Card
        key={item.id}
        pressable
        onPress={() => handlePatternTap(item.id)}
        elevation="sm"
        style={styles.patternCard}
      >
        <View style={styles.patternContent}>
          {/* Icon Wrapper with Status Indicator (SAME AS REMINDER) */}
          <View style={styles.iconWrapper}>
            <View style={[styles.patternIcon, { backgroundColor: typeConfig.bgColor }]}>
              <Text variant="h3">{typeConfig.emoji}</Text>
            </View>
            {/* Confidence dot (SAME AS REMINDER STATUS DOT) */}
            {item.confidence !== undefined && (
              <View style={[styles.statusDot, { backgroundColor: confidenceBadge.color }]} />
            )}
          </View>

          {/* Content - COMPACT LAYOUT */}
          <View style={styles.patternInfo}>
            {/* Title */}
            <Text
              variant="bodyLarge"
              weight="600"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            
            {/* Pattern Type + AI/Manual Badge (INLINE) */}
            <View style={styles.typeRow}>
              <View style={[styles.typeBadge, { backgroundColor: typeConfig.bgColor }]}>
                <Icon name={typeConfig.icon as any} size="xs" color={typeConfig.color} />
                <Text variant="caption" customColor={typeConfig.color} weight="600">
                  {item.type.replace(/_/g, ' ')}
                </Text>
              </View>
              
              <View style={styles.metaDivider} />
              
              <View style={[
                styles.sourceBadge, 
                { backgroundColor: isAIGenerated ? `${Theme.colors.semantic.info}15` : `${Theme.colors.text.secondary}15` }
              ]}>
                <Icon 
                  name={isAIGenerated ? 'sparkles' : 'create-outline'} 
                  size="xs" 
                  color={isAIGenerated ? Theme.colors.semantic.info : Theme.colors.text.secondary} 
                />
                <Text 
                  variant="caption" 
                  customColor={isAIGenerated ? Theme.colors.semantic.info : Theme.colors.text.secondary}
                  weight="600"
                >
                  {isAIGenerated ? 'AI' : 'Manual'}
                </Text>
              </View>
            </View>
            
            {/* Meta Row: Days + Confidence % */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon name="time-outline" size="xs" color={Theme.colors.text.tertiary} />
                <Text variant="caption" color="tertiary">
                  {formatRelativeDate(item.createdAt)}
                </Text>
              </View>
              
              {item.confidence !== undefined && (
                <>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Icon name="analytics-outline" size="xs" color={confidenceBadge.color} />
                    <Text variant="caption" customColor={confidenceBadge.color}>
                      {(item.confidence * 100).toFixed(0)}%
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Actions - ICON ONLY */}
          <View style={styles.actionContainer}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                handleToggleFavorite(item.id);
              }}
              style={styles.actionButton}
              hitSlop={8}
            >
              <Icon
                name={item.isFavorite ? 'heart' : 'heart-outline'}
                size="md"
                color={item.isFavorite ? Theme.colors.semantic.error : Theme.colors.text.tertiary}
              />
            </Pressable>
            
            <Icon name="chevron-forward-outline" size="sm" color={Theme.colors.text.tertiary} />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <Screen>
      {/* Header - Fixed Outside FlatList (SAME AS REMINDER) */}
      <Container padding="m" style={styles.header}>
        {/* Header Top */}
        <View style={styles.headerTop}>
          <View>
            <Text variant="h2">Pattern Library</Text>
          </View>
          <Pressable 
            onPress={() => navigation.navigate('CameraModal' as any, { mode: 'pattern' })}
            haptic="medium"
            style={styles.discoverButton}
          >
            <Icon name="sparkles" size="sm" color={Theme.colors.background.primary} />
            <Text variant="caption" weight="700" customColor={Theme.colors.background.primary}>
              DISCOVER
            </Text>
          </Pressable>
        </View>

        {/* Search Bar (SAME AS REMINDER) */}
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size="sm" color={Theme.colors.text.tertiary} />
          <TextInput
            ref={searchInputRef}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search patterns..."
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

        {/* Stats Row (SAME AS REMINDER) */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="h4" customColor={Theme.colors.primary[500]}>
              {stats.total}
            </Text>
            <Text variant="caption" color="secondary">Total</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text variant="h4" customColor={Theme.colors.semantic.info}>
              {stats.aiGenerated}
            </Text>
            <Text variant="caption" color="secondary">AI</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text variant="h4" customColor={Theme.colors.semantic.error}>
              {stats.favorites}
            </Text>
            <Text variant="caption" color="secondary">Favorites</Text>
          </View>
        </View>

        {/* Type Filter (SAME AS CATEGORY FILTER IN REMINDER) */}
        <View style={styles.typeFilter}>
          <Pressable
            onPress={() => handleTypeFilter('all')}
            style={[
              styles.typeChip,
              selectedType === 'all' ? styles.typeChipActive : {},
            ]}
          >
            <Icon 
              name="apps-outline" 
              size="xs" 
              color={selectedType === 'all' ? Theme.colors.primary[500] : Theme.colors.text.secondary} 
            />
            <Text
              variant="caption"
              weight="700"
              customColor={
                selectedType === 'all'
                  ? Theme.colors.primary[500]
                  : Theme.colors.text.secondary
              }
            >
              ALL
            </Text>
          </Pressable>

          {[
            { key: PatternType.FIBONACCI, icon: 'git-branch-outline', label: 'Fibonacci' },
            { key: PatternType.GEOMETRIC, icon: 'shapes-outline', label: 'Geometric' },
            { key: PatternType.SYMMETRY, icon: 'copy-outline', label: 'Symmetry' },
            { key: PatternType.CUSTOM, icon: 'create-outline', label: 'Custom' },
          ].map((type) => (
            <Pressable
              key={type.key}
              onPress={() => handleTypeFilter(type.key)}
              style={[
                styles.typeChip,
                selectedType === type.key ? styles.typeChipActive : {},
              ]}
            >
              <Icon 
                name={type.icon as any} 
                size="xs" 
                color={selectedType === type.key ? Theme.colors.primary[500] : Theme.colors.text.secondary} 
              />
              <Text
                variant="caption"
                weight="700"
                customColor={
                  selectedType === type.key
                    ? Theme.colors.primary[500]
                    : Theme.colors.text.secondary
                }
              >
                {type.label.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </Container>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      ) : searchFilteredPatterns.length === 0 && !searchQuery ? (
        <EmptyState
          icon="sparkles-outline"
          title="No patterns found"
          description="Discover your first pattern using AI!"
          actionLabel="Discover Pattern"
          onActionPress={() => navigation.navigate('CameraModal' as any, { mode: 'pattern' })}
        />
      ) : (
        <FlatList
          data={searchFilteredPatterns}
          renderItem={renderPattern}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            searchQuery ? (
              <View style={styles.emptySearch}>
                <Icon name="search-outline" size="xl" color={Theme.colors.text.tertiary} />
                <Text variant="h4" align="center" style={{ marginTop: Theme.spacing.m }}>
                  No matching patterns
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
  // Header styles (SAME AS REMINDER)
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
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.primary[500],
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Theme.borderRadius.m,
    ...Theme.shadows.glow,
  },

  // Search bar styles (SAME AS REMINDER)
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
  
  // Stats styles (SAME AS REMINDER)
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.m,
  },
  statItem: {
    alignItems: 'center',
  },
  
  // Type filter styles (SAME AS CATEGORY FILTER)
  typeFilter: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
    flexWrap: 'wrap',
    paddingBottom: Theme.spacing.xs,
  },
  typeChip: {
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
  typeChipActive: {
    backgroundColor: `${Theme.colors.primary[500]}20`,
    borderColor: Theme.colors.primary[500],
  },
  
  // List styles (SAME AS REMINDER)
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
  
  // COMPACT Card styles - MATCHING REMINDER HEIGHT
  patternCard: {
    marginBottom: Theme.spacing.s,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    ...Theme.shadows.sm,
  },
  patternContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.m,
  },
  iconWrapper: {
    position: 'relative',
  },
  patternIcon: {
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
    borderColor: Theme.colors.background.secondary,
  },
  
  // COMPACT Info Layout
  patternInfo: {
    flex: 1,
    gap: 4, // Reduced from 6 to make more compact
  },
  
  // Type + Source badges in one row
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    flexWrap: 'wrap',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.s,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.s,
  },
  
  // Meta row: Days + Confidence
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    flexWrap: 'wrap',
  },
  metaItem: {
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
  
  // Actions - Icon only
  actionContainer: {
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  actionButton: {
    padding: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
  },
});
