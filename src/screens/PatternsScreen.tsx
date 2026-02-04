/**
 * VisionFlow AI - Patterns Library Screen (v2.1 - Harmonized Edition)
 * Neural Database Interface for visual patterns
 * 
 * @module screens/PatternsScreen
 * 
 * CHANGELOG v2.1:
 * - ✅ Changed title from h3 to h2 for consistency
 * - ✅ Removed hardcoded paddingBottom (uses theme constant)
 * - ✅ Kept tactical/HUD styling as design aesthetic
 */

import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Image, Dimensions, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  PatternStackParamList,
  MainTabParamList,
  RootStackParamList,
} from '../types/navigation.types';
import { PatternType, Pattern } from '../types/pattern.types';
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
import { usePatterns } from '../hooks/usePatterns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Theme.spacing.m * 3) / 2;

type PatternsScreenNavigationProp = CompositeNavigationProp<
  NativeStackScreenProps<PatternStackParamList, 'PatternLibrary'>['navigation'],
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    NativeStackScreenProps<RootStackParamList>['navigation']
  >
>;

type PatternsScreenProps = NativeStackScreenProps<
  PatternStackParamList,
  'PatternLibrary'
> & {
  navigation: PatternsScreenNavigationProp;
};

export function PatternsScreen({ navigation, route }: PatternsScreenProps) {
  const { patterns, isLoading, refreshPatterns } = usePatterns();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<PatternType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const routeFilterType = route.params?.filterType;
  
  // Filter Logic
  const filteredPatterns = useMemo(() => {
    let result = [...patterns];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.userNotes?.toLowerCase().includes(query) ||
          p.type.toLowerCase().includes(query)
      );
    }
    
    const activeFilter = routeFilterType || filterType;
    if (activeFilter !== 'all') {
      result = result.filter((p) => p.type === activeFilter);
    }
    
    result.sort((a, b) => b.createdAt - a.createdAt);
    
    return result;
  }, [patterns, searchQuery, filterType, routeFilterType]);
  
  // Stats Logic
  const typeCounts = useMemo(() => {
    return {
      all: patterns.length,
      [PatternType.FIBONACCI]: patterns.filter((p) => p.type === PatternType.FIBONACCI).length,
      [PatternType.CHANNEL]: patterns.filter((p) => p.type === PatternType.CHANNEL).length,
      [PatternType.PITCHFORK]: patterns.filter((p) => p.type === PatternType.PITCHFORK).length,
      [PatternType.GEOMETRIC]: patterns.filter((p) => p.type === PatternType.GEOMETRIC).length,
      [PatternType.WAVE]: patterns.filter((p) => p.type === PatternType.WAVE).length,
      [PatternType.SYMMETRY]: patterns.filter((p) => p.type === PatternType.SYMMETRY).length,
      [PatternType.SACRED_GEOMETRY]: patterns.filter((p) => p.type === PatternType.SACRED_GEOMETRY).length,
      [PatternType.CUSTOM]: patterns.filter((p) => p.type === PatternType.CUSTOM).length,
    };
  }, [patterns]);
  
  // Pull to refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPatterns();
    setRefreshing(false);
  };
  
  const handleScanPattern = () => {
    navigation.navigate('CameraModal', { mode: 'pattern' });
  };
  
  const handlePatternPress = (pattern: Pattern) => {
    navigation.navigate('PatternDetail', { patternId: pattern.id });
  };
  
  const renderPatternCard = ({ item }: { item: Pattern }) => {
    // Get color from Theme
    const patternColors = Theme.colors.pattern as Record<string, string>;
    const typeColor = patternColors[item.type] || Theme.colors.primary[500];
    
    return (
      <Pressable onPress={() => handlePatternPress(item)} haptic="light">
        <Card 
          variant="hud"
          padding={0}
          style={styles.patternCard}
        >
          {/* Image Section */}
          <View style={styles.imageContainer}>
            {item.imageUri ? (
              <>
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.patternImage}
                  resizeMode="cover"
                />
                {/* Tech Overlay for "Scanned" look */}
                <View style={[styles.imageOverlay, { backgroundColor: `${typeColor}08` }]} />
              </>
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: `${typeColor}15` }]}>
                <Icon name="scan-outline" size="lg" color={typeColor} />
              </View>
            )}
            
            {/* Enhanced Type Badge */}
            <View style={[styles.typeBadge, { borderColor: typeColor, backgroundColor: 'rgba(0, 0, 0, 0.85)' }]}>
              <Text 
                variant="micro" 
                weight="700" 
                customColor={typeColor} 
                style={styles.badgeText}
              >
                {item.type.replace('_', ' ')}
              </Text>
            </View>
            
            {/* Confidence Badge (if high confidence) */}
            {item.confidence && item.confidence >= 0.8 && (
              <View style={[styles.confidenceBadge, { backgroundColor: `${typeColor}20`, borderColor: typeColor }]}>
                <Icon name="checkmark-circle" size="xs" color={typeColor} />
              </View>
            )}
          </View>
          
          {/* Content Section */}
          <View style={styles.cardContent}>
            <View style={styles.cardMeta}>
              <Text variant="caption" color="secondary" style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }).toUpperCase()}
              </Text>
              {item.confidence && (
                <View style={styles.confidenceContainer}>
                  <Text variant="micro" customColor={typeColor} weight="700">
                    {Math.round(item.confidence * 100)}%
                  </Text>
                </View>
              )}
            </View>
            
            <Text variant="body" weight="700" numberOfLines={1} style={styles.patternName}>
              {item.name}
            </Text>
            
            {item.userNotes && (
              <Text variant="caption" color="tertiary" numberOfLines={1}>
                {item.userNotes}
              </Text>
            )}
          </View>
        </Card>
      </Pressable>
    );
  };
  
  return (
    <Screen>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Container padding="m">
          {/* Status Line */}
          <View style={styles.statusLine}>
            <View style={styles.statusDot} />
            <Text variant="micro" style={styles.statusText}>
              DATABASE ONLINE
            </Text>
            <View style={styles.statusPulse} />
          </View>

          <View style={styles.headerTop}>
            {/* ✅ UPDATED: Changed from h3 to h2 */}
            <Text variant="h2" weight="700" style={styles.headerTitle}>
              NEURAL INDEX
            </Text>
            <Pressable 
              onPress={handleScanPattern} 
              haptic="medium"
              style={styles.scanButton}
            >
              <Icon name="scan" size="sm" color={Theme.colors.background.primary} />
              <Text variant="caption" weight="700" customColor={Theme.colors.background.primary} style={styles.scanButtonText}>
                SCAN
              </Text>
            </Pressable>
          </View>
          
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="SEARCH DATABASE..."
            style={styles.searchBar}
          />
        </Container>
        
        {/* Tactical Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { key: 'all', label: 'ALL', count: typeCounts.all },
              { key: PatternType.FIBONACCI, label: 'FIB', count: typeCounts[PatternType.FIBONACCI] },
              { key: PatternType.GEOMETRIC, label: 'GEO', count: typeCounts[PatternType.GEOMETRIC] },
              { key: PatternType.SYMMETRY, label: 'SYM', count: typeCounts[PatternType.SYMMETRY] },
              { key: PatternType.CHANNEL, label: 'CHN', count: typeCounts[PatternType.CHANNEL] },
              { key: PatternType.WAVE, label: 'WAV', count: typeCounts[PatternType.WAVE] },
            ]}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setFilterType(item.key as PatternType | 'all')}
                haptic="light"
              >
                <View
                  style={[
                    styles.filterChip,
                    filterType === item.key && styles.filterChipActive,
                  ]}
                >
                  <Text
                    variant="caption"
                    weight="700"
                    style={styles.filterText}
                    customColor={
                      filterType === item.key
                        ? Theme.colors.primary[400]
                        : Theme.colors.text.tertiary
                    }
                  >
                    {item.label} <Text variant="micro" color="tertiary">[{item.count}]</Text>
                  </Text>
                </View>
              </Pressable>
            )}
            contentContainerStyle={styles.filtersContent}
          />
        </View>
      </View>
      
      {/* Content */}
      {isLoading ? (
        <LoadingSpinner text="ACCESSING NEURAL NETWORK..." />
      ) : filteredPatterns.length === 0 ? (
        <EmptyState
          icon="grid-outline"
          title="INDEX EMPTY"
          description={
            searchQuery
              ? 'NO MATCHING DATA FOUND'
              : 'INITIALIZE SCANNER TO DETECT PATTERNS'
          }
          actionLabel="INITIALIZE SCAN"
          onActionPress={handleScanPattern}
        />
      ) : (
        <FlatList
          data={filteredPatterns}
          renderItem={renderPatternCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header styles
  header: {
    backgroundColor: Theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.default,
    paddingTop: Theme.spacing.xs,
  },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.s,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.semantic.success,
    marginRight: 6,
  },
  statusPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.semantic.success,
    marginLeft: 4,
    opacity: 0.3,
  },
  statusText: {
    color: Theme.colors.semantic.success,
    letterSpacing: 1.5,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  headerTitle: {
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary[500],
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
    gap: 6,
  },
  scanButtonText: {
    letterSpacing: 0.5,
  },
  searchBar: {
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 0,
  },
  
  // Filters styles - ✅ Kept tactical aesthetic (intentional design choice)
  filtersContainer: {
    paddingVertical: Theme.spacing.s,
    backgroundColor: Theme.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: `${Theme.colors.border.default}30`,
  },
  filtersContent: {
    paddingHorizontal: Theme.spacing.m,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,  // ✅ Kept square edges for HUD aesthetic
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    backgroundColor: 'transparent',
  },
  filterChipActive: {
    borderColor: Theme.colors.primary[500],
    backgroundColor: `${Theme.colors.primary[500]}15`,
  },
  filterText: {
    fontFamily: Theme.typography.fontFamily.mono,
  },
  
  // Grid styles - ✅ FIXED: Uses theme constant
  gridContent: {
    padding: Theme.spacing.m,
    paddingBottom: Theme.spacing.safeArea.bottomPadding,  // ✅ Uses theme (80)
  },
  gridRow: {
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  
  // Card styles
  patternCard: {
    width: CARD_WIDTH,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH * 0.75,
    backgroundColor: Theme.colors.background.tertiary,
  },
  patternImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 1,
  },
  badgeText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 9,
  },
  confidenceBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Card content styles
  cardContent: {
    padding: 12,
    gap: 6,
    backgroundColor: Theme.colors.background.tertiary,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 10,
  },
  confidenceContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: `${Theme.colors.primary[500]}10`,
    borderRadius: 3,
  },
  patternName: {
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
