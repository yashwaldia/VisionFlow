/**
 * VisionFlow AI - Pattern Library Screen (v3.2 - Production)
 * Browse and manage all discovered patterns
 * 
 * @module screens/PatternLibraryScreen
 * 
 * CHANGELOG v3.2:
 * - ✅ Removed debug logging (production ready)
 * 
 * CHANGELOG v3.1:
 * - ✅ Fixed pattern navigation issue
 * 
 * CHANGELOG v3.0:
 * - ✅ Added Search Bar (matching Reminder screen UI)
 * - ✅ Unified Heading + Action Button styling
 * - ✅ Added icons to filter chips
 * - ✅ Enhanced visual consistency with Reminder screen
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

  const renderPattern = ({ item }: { item: any }) => (
    <Card
      key={item.id}
      pressable
      onPress={() => handlePatternTap(item.id)}
      style={styles.patternCard}
    >
      <View style={styles.patternContent}>
        <View style={styles.patternIconContainer}>
          {item.imageUri ? (
            <View style={styles.patternImagePlaceholder}>
              <Icon name="image-outline" size="lg" color={Theme.colors.primary[500]} />
            </View>
          ) : (
            <View style={styles.patternIconPlaceholder}>
              <Icon name="grid-outline" size="lg" color={Theme.colors.primary[500]} />
            </View>
          )}
        </View>

        <View style={styles.patternInfo}>
          <Text variant="bodyLarge" weight="600">
            {item.name}
          </Text>
          <Text variant="caption" color="secondary">
            {item.type} • {item.source === 'ai' ? '🤖 AI' : '✏️ Manual'}
          </Text>
          {item.confidence !== undefined && (
            <Text variant="caption" color="tertiary">
              Confidence: {Math.round(item.confidence * 100)}%
            </Text>
          )}
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            handleToggleFavorite(item.id);
          }}
          style={styles.favoriteButton}
          hitSlop={8}
        >
          <Icon
            name={item.isFavorite ? 'heart' : 'heart-outline'}
            size="md"
            color={item.isFavorite ? Theme.colors.semantic.error : Theme.colors.text.secondary}
          />
        </Pressable>
      </View>
    </Card>
  );

  return (
    <Screen>
      {/* Header */}
      <Container padding="m" style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text variant="h2">Pattern Library</Text>
          </View>
          <Pressable 
            onPress={() => navigation.navigate('CameraModal' as any, { mode: 'pattern' })}
            style={styles.discoverButton}
          >
            <Icon name="sparkles" size="sm" color={Theme.colors.background.primary} />
            <Text variant="caption" weight="700" customColor={Theme.colors.background.primary}>
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

        {/* Stats Row */}
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
            <Text variant="h4" customColor={Theme.colors.semantic.success}>
              {stats.favorites}
            </Text>
            <Text variant="caption" color="secondary">Favorites</Text>
          </View>
        </View>

        {/* Filter Chips */}
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
            { key: PatternType.SYMMETRY, icon: 'contract-outline', label: 'Symmetry' },
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
    paddingVertical: Theme.spacing.s,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.m,
  },
  statItem: {
    alignItems: 'center',
  },

  // Filter chips
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty search state
  emptySearch: {
    padding: Theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List styles
  listContent: {
    padding: Theme.spacing.m,
    gap: Theme.spacing.s,
    paddingBottom: Theme.spacing.safeArea.bottomPaddingLarge,
  },

  // Card styles
  patternCard: {
    marginBottom: Theme.spacing.s,
    ...Theme.shadows.sm,
  },
  patternContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  patternIconContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.m,
    overflow: 'hidden',
  },
  patternImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternIconPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: `${Theme.colors.primary[500]}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternInfo: {
    flex: 1,
  },
  favoriteButton: {
    padding: Theme.spacing.s,
  },
});
