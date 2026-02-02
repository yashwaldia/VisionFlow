/**
 * VisionFlow AI - Patterns Library Screen
 * Browse and discover visual patterns
 * 
 * @module screens/PatternsScreen
 */

import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Image, Dimensions } from 'react-native';
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
  const { patterns, isLoading } = usePatterns(); // FIXED: Changed loading → isLoading
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<PatternType | 'all'>('all');
  
  const routeFilterType = route.params?.filterType;
  
  const filteredPatterns = useMemo(() => {
    let result = [...patterns];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.userNotes?.toLowerCase().includes(query) || // FIXED: Changed description → userNotes
          p.type.toLowerCase().includes(query) // FIXED: Changed patternType → type
      );
    }
    
    const activeFilter = routeFilterType || filterType;
    if (activeFilter !== 'all') {
      result = result.filter((p) => p.type === activeFilter); // FIXED: Changed patternType → type
    }
    
    result.sort((a, b) => b.createdAt - a.createdAt); // FIXED: Changed detectedAt → createdAt
    
    return result;
  }, [patterns, searchQuery, filterType, routeFilterType]);
  
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
  
  const handleScanPattern = () => {
    navigation.navigate('CameraModal', { mode: 'pattern' });
  };
  
  const handlePatternPress = (pattern: Pattern) => {
    navigation.navigate('PatternDetail', { patternId: pattern.id });
  };
  
  const renderPatternCard = ({ item }: { item: Pattern }) => {
    // FIXED: Proper type casting for Theme.colors.pattern
    const patternColors = Theme.colors.pattern as Record<string, string>;
    const typeColor = patternColors[item.type] || Theme.colors.primary[500];
    
    return (
      <Pressable onPress={() => handlePatternPress(item)} haptic="light">
        <Card style={styles.patternCard}>
          <View style={styles.imageContainer}>
            {item.imageUri ? (
              <Image
                source={{ uri: item.imageUri }}
                style={styles.patternImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: `${typeColor}30` }]}>
                <Icon name="scan" size="lg" color={typeColor} />
              </View>
            )}
            <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
              <Text variant="caption" weight="600" customColor="#FFFFFF" numberOfLines={1}>
                {item.type} {/* FIXED: Changed patternType → type */}
              </Text>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <Text variant="body" weight="600" numberOfLines={2}>
              {item.name}
            </Text>
            {/* FIXED: Changed description → userNotes with null check */}
            {item.userNotes && (
              <Text variant="caption" color="tertiary" numberOfLines={2}>
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
      <Container padding="none">
        <View style={styles.header}>
          <Container padding="m">
            <View style={styles.headerTop}>
              <Text variant="h2">Patterns</Text>
              <Pressable onPress={handleScanPattern} haptic="light">
                <Icon name="scan" size="md" color={Theme.colors.primary[500]} />
              </Pressable>
            </View>
            
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search patterns..."
            />
          </Container>
          
          <View style={styles.filtersContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[
                { key: 'all', label: 'All', count: typeCounts.all },
                { key: PatternType.FIBONACCI, label: 'Fibonacci', count: typeCounts[PatternType.FIBONACCI] },
                { key: PatternType.GEOMETRIC, label: 'Geometric', count: typeCounts[PatternType.GEOMETRIC] },
                { key: PatternType.SYMMETRY, label: 'Symmetry', count: typeCounts[PatternType.SYMMETRY] },
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
                      variant="body"
                      weight="600"
                      customColor={
                        filterType === item.key
                          ? Theme.colors.primary[500]
                          : Theme.colors.text.secondary
                      }
                    >
                      {item.label} ({item.count})
                    </Text>
                  </View>
                </Pressable>
              )}
              contentContainerStyle={styles.filtersContent}
            />
          </View>
        </View>
        
        {isLoading ? (
          <LoadingSpinner text="Loading patterns..." />
        ) : filteredPatterns.length === 0 ? (
          <EmptyState
            icon="sparkles"
            title="No patterns found"
            description={
              searchQuery
                ? 'Try adjusting your search'
                : 'Discover your first pattern by scanning an image'
            }
            actionLabel="Scan Pattern"
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
  filtersContainer: {
    paddingVertical: Theme.spacing.s,
  },
  filtersContent: {
    paddingHorizontal: Theme.spacing.m,
    gap: Theme.spacing.s,
  },
  filterChip: {
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.background.tertiary,
  },
  filterChipActive: {
    backgroundColor: `${Theme.colors.primary[500]}20`,
  },
  gridContent: {
    padding: Theme.spacing.m,
  },
  gridRow: {
    gap: Theme.spacing.s,
    marginBottom: Theme.spacing.s,
  },
  patternCard: {
    width: CARD_WIDTH,
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH,
  },
  patternImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: Theme.spacing.xs,
    right: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.s,
  },
  cardContent: {
    padding: Theme.spacing.s,
    gap: 4,
  },
});
