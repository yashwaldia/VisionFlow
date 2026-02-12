/**
 * VisionFlow AI - Pattern Library Screen (v6.0 - Consistent Layout Edition)
 * Matches ReminderListScreen layout with uniform card heights
 * 
 * @module screens/PatternLibraryScreen
 * @version 6.0.0
 * 
 * CHANGELOG v6.0:
 * - 🔧 CRITICAL FIX: Restructured card layout to match reminder screen
 * - 🔧 FIXED: All cards now have uniform height (minHeight: 120)
 * - 🔧 FIXED: 3-line structure (Type+Source → Date+Confidence → Title)
 * - 🔧 ADDED: Section labels matching reminder screen style
 * - ✅ All v5.0 Hidden Inside UI features preserved
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
 * Get pattern type configuration (4 types only)
 */
const getPatternTypeConfig = (type: PatternType) => {
  const configs: Record<string, { icon: string; color: string; bgColor: string; emoji: string }> = {
    [PatternType.FIBONACCI]: {
      icon: 'git-branch-outline',
      color: '#FACC15',
      bgColor: '#FACC1520',
      emoji: '🌀',
    },
    [PatternType.GEOMETRIC]: {
      icon: 'shapes-outline',
      color: '#A855F7',
      bgColor: '#A855F720',
      emoji: '🔷',
    },
    [PatternType.SYMMETRY]: {
      icon: 'copy-outline',
      color: '#6366F1',
      bgColor: '#6366F120',
      emoji: '🦋',
    },
    [PatternType.CUSTOM]: {
      icon: 'create-outline',
      color: '#EF4444',
      bgColor: '#EF444420',
      emoji: '✨',
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
        variant="glowBorder"
        pressable
        onPress={() => handlePatternTap(item.id)}
        elevation="sm"
        style={styles.patternCard}
      >
        {/* 🔧 FIXED: New fixed-height layout structure (matches reminder) */}
        <View style={styles.patternContent}>
          {/* Left: Icon with Status Indicator */}
          <View style={styles.iconWrapper}>
            <View style={[styles.patternIcon, { backgroundColor: typeConfig.bgColor }]}>
              <Text variant="h3">{typeConfig.emoji}</Text>
            </View>
            {/* Confidence dot */}
            {item.confidence !== undefined && (
              <View style={[styles.statusDot, { backgroundColor: confidenceBadge.color }]} />
            )}
          </View>

          {/* Center: Content (Fixed 3-line structure) */}
          <View style={styles.patternInfo}>
                        {/* Line 3: Pattern Name (Title/Heading) - Always 1 line */}
            <Text
              variant="bodyLarge"
              weight="600"
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
            {/* Line 1: Type + Source badges (Metadata) - Always on same line */}
            <View style={styles.metaRow}>
              <View style={[styles.typeBadge, { backgroundColor: typeConfig.bgColor }]}>
                <Icon name={typeConfig.icon as any} size="xs" color={typeConfig.color} />
                <Text variant="caption" mono customColor={typeConfig.color} weight="600" numberOfLines={1}>
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
                  mono
                  customColor={isAIGenerated ? Theme.colors.semantic.info : Theme.colors.text.secondary}
                  weight="600"
                  numberOfLines={1}
                >
                  {isAIGenerated ? 'AI' : 'MANUAL'}
                </Text>
              </View>
            </View>

            {/* Line 2: Date + Confidence (Description-like) - Always 1 line */}
            <View style={styles.descriptionRow}>
              <View style={styles.metaItem}>
                <Icon name="time-outline" size="xs" color={Theme.colors.text.tertiary} />
                <Text variant="caption" color="tertiary" italic numberOfLines={1}>
                  {formatRelativeDate(item.createdAt)}
                </Text>
              </View>
              
              {item.confidence !== undefined && (
                <>
                  <View style={styles.metaDivider} />
                  <View style={[styles.metaItem, styles.metaItemFlex]}>
                    <Icon name="analytics-outline" size="xs" color={confidenceBadge.color} />
                    <Text variant="caption" mono customColor={confidenceBadge.color} numberOfLines={1}>
                      {(item.confidence * 100).toFixed(0)}% confidence
                    </Text>
                  </View>
                </>
              )}
            </View>
            

          </View>

          {/* Right: Actions */}
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
      {/* Header - Fixed Outside FlatList */}
      <Container padding="m" style={styles.header}>
        {/* Header Top */}
        <View style={styles.headerTop}>
          <View>
            {/* 🔧 NEW: Added section label above title */}
            <Text variant="caption" mono weight="700" color="tertiary" style={styles.sectionLabel}>
              KNOWLEDGE_BASE
            </Text>
            <Text variant="h2">Pattern Library</Text>
          </View>
          <Pressable 
            onPress={() => navigation.navigate('CameraModal' as any, { mode: 'pattern' })}
            haptic="medium"
            style={styles.discoverButton}
          >
            <Icon name="sparkles" size="sm" color={Theme.colors.background.primary} />
            <Text variant="caption" weight="700" mono customColor={Theme.colors.background.primary}>
              DISCOVER
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

        {/* 🔧 ENHANCED: Stats Row with section label */}
        <Text variant="caption" mono weight="700" color="tertiary" style={styles.sectionLabel}>
          STATUS_OVERVIEW
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="h4" mono customColor={Theme.colors.primary[500]}>
              {stats.total}
            </Text>
            <Text variant="caption" mono color="secondary">Total</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text variant="h4" mono customColor={Theme.colors.semantic.info}>
              {stats.aiGenerated}
            </Text>
            <Text variant="caption" mono color="secondary">AI</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text variant="h4" mono customColor={Theme.colors.semantic.error}>
              {stats.favorites}
            </Text>
            <Text variant="caption" mono color="secondary">Favorites</Text>
          </View>
        </View>

        {/* 🔧 ENHANCED: Type Filter with section label */}
        <Text variant="caption" mono weight="700" color="tertiary" style={styles.sectionLabel}>
          FILTER_BY_TYPE
        </Text>
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
              mono
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
            { key: PatternType.FIBONACCI, icon: 'git-branch-outline', label: 'FIBONACCI' },
            { key: PatternType.GEOMETRIC, icon: 'shapes-outline', label: 'GEOMETRIC' },
            { key: PatternType.SYMMETRY, icon: 'copy-outline', label: 'SYMMETRY' },
            { key: PatternType.CUSTOM, icon: 'create-outline', label: 'CUSTOM' },
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
                mono
                customColor={
                  selectedType === type.key
                    ? Theme.colors.primary[500]
                    : Theme.colors.text.secondary
                }
              >
                {type.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Container>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" text="LOADING_PATTERNS..." />
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
                <Text variant="body" color="secondary" italic align="center">
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
  // 🔧 NEW: Section label styling (matches reminder screen)
  sectionLabel: {
    letterSpacing: 2,
    marginBottom: Theme.spacing.xs,
    opacity: 0.7,
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
  
  // Stats styles
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}50`,
  },
  statItem: {
    alignItems: 'center',
  },
  
  // Type filter styles
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
    shadowColor: Theme.colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
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
  
  // 🔧 FIXED: Pattern card styles with uniform height
  patternCard: {
    marginBottom: Theme.spacing.s,
    minHeight: 120, // Same as reminder cards
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
  
  // 🔧 FIXED: Info section with controlled structure
  patternInfo: {
    flex: 1,
    gap: 4,
    justifyContent: 'flex-start',
  },
  
  // 🔧 FIXED: Metadata row (Line 1) - Type + Source badges
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: 2,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.s,
    flexShrink: 1,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.s,
    flexShrink: 1,
  },
  
  // 🔧 FIXED: Description row (Line 2) - Date + Confidence
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    height: 18, // Fixed height for 1 line
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  metaItemFlex: {
    flex: 1,
    minWidth: 0,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Theme.colors.text.tertiary,
    opacity: 0.5,
  },
  
  // 🔧 FIXED: Title (Line 3)
  title: {
    lineHeight: 20,
    height: 20, // Fixed height for 1 line
  },
  
  // Actions
  actionContainer: {
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  actionButton: {
    padding: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
  },
});
