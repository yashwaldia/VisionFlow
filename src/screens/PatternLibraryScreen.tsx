/**
 * VisionFlow AI - Pattern Library Screen (v2.1 - Harmonized Edition)
 * Browse and manage all discovered patterns
 * 
 * @module screens/PatternLibraryScreen
 * 
 * CHANGELOG v2.1:
 * - ✅ Fixed hardcoded paddingBottom (uses theme.spacing.safeArea.bottomPaddingLarge)
 * - ✅ Added header shadow for separation
 * - ✅ Added card elevation for visual depth
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PatternStackParamList } from '../types/navigation.types';
import { PatternType } from '../types/pattern.types';
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
import { usePatterns } from '../hooks/usePatterns';
import * as Haptics from 'expo-haptics';

type PatternLibraryScreenProps = NativeStackScreenProps<PatternStackParamList, 'PatternLibrary'>;

export function PatternLibraryScreen({ navigation, route }: PatternLibraryScreenProps) {
  // FIXED: Handle undefined params safely to prevent crash
  const { filterType } = route.params || {};
  
  const {
    filteredPatterns,
    isLoading,
    stats,
    refreshPatterns,
    toggleFavorite,
    deletePattern,
    setFilters,
  } = usePatterns();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<PatternType | 'all'>('all');

  useEffect(() => {
    if (filterType) {
      setSelectedType(filterType);
      setFilters({ type: filterType, source: 'all' });
    }
  }, [filterType]);

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
      {/* Header - ✅ ENHANCED: Added shadow */}
      <Container padding="m" style={styles.header}>
        <View style={styles.headerTop}>
          <Text variant="h2">Pattern Library</Text>
          <Button
            label="Discover"
            leftIcon="sparkles-outline"
            variant="primary"
            size="small"
            onPress={() => navigation.navigate('CameraModal' as any, { mode: 'pattern' })}
          />
        </View>

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

        <View style={styles.typeFilter}>
          <Pressable
            onPress={() => handleTypeFilter('all')}
            style={[
              styles.typeChip,
              selectedType === 'all' ? styles.typeChipActive : {},
            ]}
          >
            <Text
              variant="caption"
              weight="600"
              customColor={
                selectedType === 'all'
                  ? Theme.colors.text.inverse
                  : Theme.colors.text.secondary
              }
            >
              ALL
            </Text>
          </Pressable>

          {[
            PatternType.FIBONACCI,
            PatternType.GEOMETRIC,
            PatternType.SYMMETRY,
            PatternType.CUSTOM,
          ].map((type) => (
            <Pressable
              key={type}
              onPress={() => handleTypeFilter(type)}
              style={[
                styles.typeChip,
                selectedType === type ? styles.typeChipActive : {},
              ]}
            >
              <Text
                variant="caption"
                weight="600"
                customColor={
                  selectedType === type
                    ? Theme.colors.text.inverse
                    : Theme.colors.text.secondary
                }
              >
                {type.toUpperCase().replace('_', ' ')}
              </Text>
            </Pressable>
          ))}
        </View>
      </Container>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      ) : filteredPatterns.length === 0 ? (
        <EmptyState
          icon="sparkles-outline"
          title="No patterns found"
          description="Discover your first pattern using AI!"
          actionLabel="Discover Pattern"
          onActionPress={() => navigation.navigate('CameraModal' as any, { mode: 'pattern' })}
        />
      ) : (
        <FlatList
          data={filteredPatterns}
          renderItem={renderPattern}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header styles - ✅ ENHANCED: Added shadow
  header: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
    paddingTop: Platform.OS === 'ios' ? 0 : Theme.spacing.s,
    ...Theme.shadows.sm, // ✅ ADDED: Header shadow for depth
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
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
  typeFilter: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
    flexWrap: 'wrap',
    paddingBottom: Theme.spacing.xs,
  },
  typeChip: {
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: Theme.colors.border.medium,
  },
  typeChipActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // List styles - ✅ FIXED: Uses theme constant
  listContent: {
    padding: Theme.spacing.m,
    gap: Theme.spacing.s,
    paddingBottom: Theme.spacing.safeArea.bottomPaddingLarge, // ✅ FIXED: 120 from theme (was hardcoded)
  },
  // Card styles - ✅ ENHANCED: Added shadow
  patternCard: {
    marginBottom: Theme.spacing.s,
    ...Theme.shadows.sm, // ✅ ADDED: Card shadow for depth
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
    backgroundColor: `${Theme.colors.primary[500]}10`, // ✅ Kept at 10% (intentionally subtle)
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
