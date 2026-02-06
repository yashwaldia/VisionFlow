/**
 * VisionFlow AI - Pattern Results Screen (v1.0 - Visual Intelligence Dashboard)
 * Display AI-detected patterns with visual overlays and insights
 * 
 * @module screens/PatternResultsScreen
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../types/navigation.types';
import { Theme } from '../constants/theme';
import {
  Screen,
  Container,
  Text,
  Button,
  Card,
  Icon,
  Pressable,
} from '../components';
import { 
  AIPatternAnalysis, 
  Pattern, 
  PATTERN_COLORS, 
  PatternType 
} from '../types/pattern.types';
import { usePatterns } from '../hooks/usePatterns';

type PatternResultsScreenProps = NativeStackScreenProps<RootStackParamList, 'PatternResultsScreen'>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_HEIGHT = SCREEN_WIDTH * (3 / 4);

interface ProcessedImages {
  original: string;
  edges: string;
  width: number;
  height: number;
}

export function PatternResultsScreen({ navigation, route }: PatternResultsScreenProps) {
  const { analysisResult, processedImages } = route.params as {
    analysisResult: AIPatternAnalysis;
    processedImages: ProcessedImages;
  };
  const { createPattern } = usePatterns();

  // State
  const [showEdges, setShowEdges] = useState(false);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Animated values
  const overlayOpacity = useSharedValue(0.8);

  // Convert percentage coordinates to display pixels
  const anchorToPixels = (x: number, y: number) => ({
    x: (x / 100) * SCREEN_WIDTH,
    y: (y / 100) * IMAGE_HEIGHT,
  });

  // Animated overlay style
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleOpacityChange = (value: number) => {
    overlayOpacity.value = withSpring(value, {
      damping: 20,
      stiffness: 90,
    });
  };

  const handlePatternTap = (patternId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPatternId(selectedPatternId === patternId ? null : patternId);
  };

  // Get pattern color (using current PATTERN_COLORS structure)
  const getPatternColor = (type: PatternType): string => {
    const colorValue = PATTERN_COLORS[type];
    if (typeof colorValue === 'string') {
      return colorValue;
    }
    return PATTERN_COLORS[PatternType.GEOMETRIC]; // Fallback
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const savedPatterns: Pattern[] = [];
      
      for (const detectedPattern of analysisResult.patterns) {
        const pattern: Pattern = {
          id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: detectedPattern.type,
          subtype: detectedPattern.subtype,
          name: detectedPattern.name,
          confidence: detectedPattern.confidence,
          anchors: detectedPattern.anchors,
          measurements: detectedPattern.measurements,
          insights: analysisResult.insights,
          source: 'ai',
          imageUri: processedImages.original,
          edgeImageUri: processedImages.edges,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          userNotes: '',
          tags: [],
          isFavorite: false,
        };

        await createPattern(pattern);
        savedPatterns.push(pattern);
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (savedPatterns.length > 0) {
        navigation.replace('MainApp', {
          screen: 'PatternsTab',
          params: {
            screen: 'PatternDetail',
            params: { patternId: savedPatterns[0].id },
          },
        });
      } else {
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Save Failed', error.message || 'Failed to save patterns.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Analysis?',
      'Are you sure you want to discard these detected patterns?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <Screen safeAreaTop safeAreaBottom={false} disableTabBarSpacing={true}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleDiscard} haptic="light">
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text variant="h4" weight="600">Pattern Analysis</Text>
          <Text variant="caption" color="tertiary">
            {analysisResult.patterns.length} pattern{analysisResult.patterns.length !== 1 ? 's' : ''} detected
          </Text>
        </View>
        <Pressable onPress={() => setShowEdges(!showEdges)} haptic="light">
          <Icon 
            name={showEdges ? "eye-off-outline" : "eye-outline"} 
            size="md" 
            color={Theme.colors.primary[500]} 
          />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image with Overlays */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: showEdges ? processedImages.edges : processedImages.original }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Pattern Overlays */}
          <Animated.View style={[styles.overlayContainer, overlayAnimatedStyle]}>
            {analysisResult.patterns.map((pattern, patternIndex) => {
              const isSelected = selectedPatternId === `pattern-${patternIndex}`;
              const patternColor = getPatternColor(pattern.type);
              
              return (
                <View key={patternIndex} style={StyleSheet.absoluteFill}>
                  {/* Anchor Points */}
                  {pattern.anchors.map((anchor, anchorIndex) => {
                    const pos = anchorToPixels(anchor.x, anchor.y);
                    const baseSize = isSelected ? 12 : 8;
                    const pulseSize = isSelected ? 24 : 16;

                    return (
                      <View key={anchorIndex}>
                        {/* Pulse Ring */}
                        <View
                          style={[
                            styles.anchorPulse,
                            {
                              left: pos.x - pulseSize / 2,
                              top: pos.y - pulseSize / 2,
                              width: pulseSize,
                              height: pulseSize,
                              borderRadius: pulseSize / 2,
                              borderColor: patternColor,
                              opacity: isSelected ? 0.4 : 0.2,
                            },
                          ]}
                        />
                        {/* Anchor Dot */}
                        <TouchableOpacity
                          onPress={() => handlePatternTap(`pattern-${patternIndex}`)}
                          activeOpacity={0.7}
                          style={[
                            styles.anchorDot,
                            {
                              left: pos.x - baseSize / 2,
                              top: pos.y - baseSize / 2,
                              width: baseSize,
                              height: baseSize,
                              borderRadius: baseSize / 2,
                              backgroundColor: isSelected ? patternColor : `${patternColor}CC`,
                              borderColor: isSelected ? '#fff' : patternColor,
                            },
                          ]}
                        />
                      </View>
                    );
                  })}

                  {/* Pattern Label */}
                  {pattern.anchors.length > 0 && (
                    <View
                      style={[
                        styles.patternLabel,
                        {
                          left: anchorToPixels(pattern.anchors[0].x, pattern.anchors[0].y).x + 12,
                          top: anchorToPixels(pattern.anchors[0].x, pattern.anchors[0].y).y - 24,
                          backgroundColor: isSelected ? patternColor : 'rgba(0,0,0,0.7)',
                          borderColor: isSelected ? '#fff' : patternColor,
                        },
                      ]}
                    >
                      <Text 
                        variant="micro" 
                        weight="700" 
                        customColor={isSelected ? '#000' : '#fff'}
                      >
                        {pattern.name.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </Animated.View>
        </View>

        <Container padding="m">
          {/* Controls */}
          <Card elevation="sm" style={styles.controlsCard}>
            <View style={styles.controlRow}>
              <View style={styles.controlLabel}>
                <Icon name="options-outline" size="sm" color={Theme.colors.text.secondary} />
                <Text variant="body" color="secondary">Overlay Opacity</Text>
              </View>
              <View style={styles.opacityButtons}>
                {[0.3, 0.5, 0.8, 1.0].map((val) => (
                  <Pressable
                    key={val}
                    onPress={() => handleOpacityChange(val)}
                    haptic="light"
                    style={[
                      styles.opacityButton,
                      ...(overlayOpacity.value === val ? [styles.opacityButtonActive] : []),
                    ]}
                  >
                    <Text 
                      variant="caption" 
                      weight="600"
                      customColor={
                        overlayOpacity.value === val 
                          ? Theme.colors.primary[500] 
                          : Theme.colors.text.tertiary
                      }
                    >
                      {Math.round(val * 100)}%
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.controlRow}>
              <View style={styles.controlLabel}>
                <Icon name="layers-outline" size="sm" color={Theme.colors.text.secondary} />
                <Text variant="body" color="secondary">Base Layer</Text>
              </View>
              <Pressable
                onPress={() => setShowEdges(!showEdges)}
                haptic="light"
                style={[
                  styles.toggleButton,
                  ...(showEdges ? [styles.toggleButtonActive] : []),
                ]}
              >
                <Icon 
                  name={showEdges ? "scan" : "image-outline"} 
                  size="sm" 
                  color={showEdges ? Theme.colors.primary[500] : Theme.colors.text.secondary} 
                />
                <Text 
                  variant="caption" 
                  weight="600"
                  customColor={showEdges ? Theme.colors.primary[500] : Theme.colors.text.secondary}
                >
                  {showEdges ? 'Edge Map' : 'Original'}
                </Text>
              </Pressable>
            </View>
          </Card>

          {/* Pattern Telemetry */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="analytics-outline" size="md" color={Theme.colors.primary[500]} />
              <Text variant="h4">Telemetry</Text>
            </View>

            {analysisResult.patterns.map((pattern, index) => {
              const isSelected = selectedPatternId === `pattern-${index}`;
              const patternColor = getPatternColor(pattern.type);

              return (
                <Pressable
                  key={index}
                  onPress={() => handlePatternTap(`pattern-${index}`)}
                  haptic="light"
                >
                  <Card 
                    elevation={isSelected ? "md" : "sm"} 
                    style={[
                      styles.patternCard,
                      ...(isSelected ? [{ borderColor: patternColor, borderWidth: 2 }] : []),
                    ]}
                  >
                    <View style={styles.patternCardHeader}>
                      <View 
                        style={[
                          styles.patternIcon,
                          { backgroundColor: `${patternColor}20` }
                        ]}
                      >
                        <Icon 
                          name="git-network-outline" 
                          size="md" 
                          color={patternColor} 
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyLarge" weight="600">{pattern.name}</Text>
                        <Text variant="caption" color="secondary">
                          {pattern.type.toUpperCase().replace('_', ' ')}
                          {pattern.subtype && ` • ${pattern.subtype}`}
                        </Text>
                      </View>
                      <View style={styles.confidenceBadge}>
                        <Text 
                          variant="caption" 
                          weight="700" 
                          customColor={patternColor}
                        >
                          {Math.round(pattern.confidence * 100)}%
                        </Text>
                      </View>
                    </View>

                    {/* Measurements */}
                    {pattern.measurements && Object.keys(pattern.measurements).length > 0 && (
                      <View style={styles.measurementsGrid}>
                        {pattern.measurements.goldenRatio !== undefined && (
                          <View style={styles.measurementItem}>
                            <Text variant="micro" color="tertiary">GOLDEN RATIO</Text>
                            <Text variant="caption" weight="600">
                              {pattern.measurements.goldenRatio.toFixed(3)}
                            </Text>
                          </View>
                        )}
                        {pattern.measurements.angles && pattern.measurements.angles.length > 0 && (
                          <View style={styles.measurementItem}>
                            <Text variant="micro" color="tertiary">ANGLE</Text>
                            <Text variant="caption" weight="600">
                              {pattern.measurements.angles[0].toFixed(1)}°
                            </Text>
                          </View>
                        )}
                        {pattern.measurements.nodeCount !== undefined && (
                          <View style={styles.measurementItem}>
                            <Text variant="micro" color="tertiary">NODES</Text>
                            <Text variant="caption" weight="600">
                              {pattern.measurements.nodeCount}
                            </Text>
                          </View>
                        )}
                        {pattern.measurements.symmetryAxes !== undefined && (
                          <View style={styles.measurementItem}>
                            <Text variant="micro" color="tertiary">SYMMETRY</Text>
                            <Text variant="caption" weight="600">
                              {pattern.measurements.symmetryAxes} axes
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </Card>
                </Pressable>
              );
            })}
          </View>

          {/* AI Insights */}
          <Card elevation="sm" style={styles.insightsCard}>
            <View style={styles.sectionHeader}>
              <Icon name="bulb-outline" size="md" color={Theme.colors.secondary[500]} />
              <Text variant="h4">Insights</Text>
            </View>
            <View style={styles.quoteContainer}>
              <Text variant="body" style={styles.quoteText}>
                "{analysisResult.insights.explanation}"
              </Text>
            </View>
          </Card>

          {/* Anomaly Log */}
          <Card elevation="sm" style={styles.anomalyCard}>
            <View style={styles.sectionHeader}>
              <Icon name="lock-closed-outline" size="md" color={Theme.colors.semantic.warning} />
              <Text variant="h4">Anomaly Log</Text>
              <View style={styles.classifiedBadge}>
                <Text variant="micro" customColor={Theme.colors.semantic.warning}>
                  CLASSIFIED
                </Text>
              </View>
            </View>
            <View style={styles.anomalyContent}>
              <Text variant="body" color="secondary" style={{ fontStyle: 'italic' }}>
                {analysisResult.insights.secretMessage}
              </Text>
            </View>
          </Card>
        </Container>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          label="Discard"
          variant="outline"
          size="large"
          leftIcon="close"
          onPress={handleDiscard}
          disabled={isSaving}
          style={{ flex: 1 }}
        />
        <Button
          label={isSaving ? 'Saving...' : 'Save to Library'}
          variant="primary"
          size="large"
          leftIcon="save-outline"
          onPress={handleSave}
          disabled={isSaving}
          loading={isSaving}
          style={{ flex: 2 }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
    ...Theme.shadows.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    marginHorizontal: Theme.spacing.m,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },

  imageContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: Theme.colors.background.tertiary,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },

  anchorPulse: {
    position: 'absolute',
    borderWidth: 2,
  },
  anchorDot: {
    position: 'absolute',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  patternLabel: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.s,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },

  controlsCard: {
    marginBottom: Theme.spacing.m,
    gap: Theme.spacing.m,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  opacityButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  opacityButton: {
    paddingHorizontal: Theme.spacing.s,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.s,
    backgroundColor: Theme.colors.background.tertiary,
  },
  opacityButtonActive: {
    backgroundColor: `${Theme.colors.primary[500]}20`,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
  },
  toggleButtonActive: {
    backgroundColor: `${Theme.colors.primary[500]}20`,
  },

  section: {
    marginBottom: Theme.spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.m,
  },

  patternCard: {
    marginBottom: Theme.spacing.s,
    gap: Theme.spacing.m,
  },
  patternCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  patternIcon: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceBadge: {
    paddingHorizontal: Theme.spacing.s,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.s,
    backgroundColor: Theme.colors.background.tertiary,
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
    paddingTop: Theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
  },
  measurementItem: {
    minWidth: '22%',
    gap: 2,
  },

  insightsCard: {
    marginBottom: Theme.spacing.m,
    gap: Theme.spacing.m,
    backgroundColor: `${Theme.colors.secondary[500]}08`,
    borderWidth: 1,
    borderColor: `${Theme.colors.secondary[500]}20`,
  },
  quoteContainer: {
    paddingLeft: Theme.spacing.m,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.secondary[500],
  },
  quoteText: {
    lineHeight: 24,
  },

  anomalyCard: {
    marginBottom: Theme.spacing.m,
    gap: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.warning}08`,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.warning}30`,
  },
  classifiedBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: `${Theme.colors.semantic.warning}20`,
    borderRadius: Theme.borderRadius.s,
  },
  anomalyContent: {
    padding: Theme.spacing.m,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.warning}40`,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,
    paddingTop: Theme.spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 34 : Theme.spacing.m,
    backgroundColor: Theme.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    ...Theme.shadows.sm,
  },
});
