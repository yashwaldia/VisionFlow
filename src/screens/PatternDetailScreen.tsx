/**
 * VisionFlow AI - Pattern Detail Screen (v6.0 - Consistent Design Edition)
 * Simplified styling matching ReminderDetailScreen's clean approach
 * 
 * @module screens/PatternDetailScreen
 * 
 * CHANGELOG v6.0:
 * - 🎨 REDESIGN: Consistent color usage (one accent color throughout)
 * - 🎨 SIMPLIFIED: All section headers match reminder screen style
 * - 🎨 CLEANED: Icon containers use consistent styling
 * - 🎨 IMPROVED: Detail rows structure matches reminder screen
 * - ✅ All v5.1 functionality preserved
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PatternStackParamList } from '../types/navigation.types';
import { Theme } from '../constants/theme';
import {
  Screen,
  Container,
  Text,
  Button,
  Card,
  Icon,
  Pressable,
  LoadingSpinner,
} from '../components';
import { usePatterns } from '../hooks/usePatterns';
import * as Haptics from 'expo-haptics';
import { PATTERN_COLORS, PatternType } from '../types/pattern.types';

// Import overlay components
import { HUDElements } from '../components/patterns/HUDElements';
import { PatternCanvas } from '../components/patterns/PatternCanvas';
import { PatternOverlayControls } from '../components/patterns/PatternOverlayControls';

const SCREEN_WIDTH = Dimensions.get('window').width;

type PatternDetailScreenProps = NativeStackScreenProps<PatternStackParamList, 'PatternDetail'>;

const getConfidenceColor = (score: number): string => {
  if (score >= 0.8) return Theme.colors.semantic.success;
  if (score >= 0.5) return Theme.colors.semantic.warning;
  return Theme.colors.semantic.error;
};

const getPatternColor = (type: PatternType): string => {
  const color = PATTERN_COLORS[type];
  return typeof color === 'string' ? color : PATTERN_COLORS[PatternType.GEOMETRIC];
};

type BlendModeType = 'normal' | 'screen' | 'multiply' | 'overlay' | 'lighten';

export function PatternDetailScreen({ navigation, route }: PatternDetailScreenProps) {
  const { patternId } = route.params || {};
  const { getPatternById, patterns, deletePattern, isLoading } = usePatterns();
  
  const [isLocalLoading, setIsLocalLoading] = useState(true);
  const [pattern, setPattern] = useState(getPatternById(patternId));
  const [showEdges, setShowEdges] = useState(false);

  // Overlay controls state
  const [overlayOpacity, setOverlayOpacity] = useState(0.8);
  const [showLabels, setShowLabels] = useState(true);
  const [blendMode, setBlendMode] = useState<BlendModeType>('screen');

  useEffect(() => {
    const loadPattern = async () => {
      setIsLocalLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      if (patternId) {
        const fetchedPattern = getPatternById(patternId);
        setPattern(fetchedPattern);
      }
      setIsLocalLoading(false);
    };

    loadPattern();
  }, [patternId, getPatternById]);

  useEffect(() => {
    if (patternId && !isLocalLoading) {
      const refreshedPattern = getPatternById(patternId);
      if (refreshedPattern) {
        setPattern(refreshedPattern);
      }
    }
  }, [patterns, patternId, getPatternById, isLocalLoading]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (patternId) {
        const focusedPattern = getPatternById(patternId);
        if (focusedPattern) {
          setPattern(focusedPattern);
        }
      }
    });
    return unsubscribe;
  }, [navigation, patternId, getPatternById]);

  if (isLocalLoading || isLoading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" text="LOADING_PATTERN..." />
        </View>
      </Screen>
    );
  }

  if (!pattern) {
    return (
      <Screen>
        <Container padding="m">
          <View style={styles.notFoundContainer}>
            <Icon name="alert-circle-outline" size="xl" color={Theme.colors.text.tertiary} />
            <Text variant="h3" align="center" style={styles.notFoundTitle}>
              Pattern not found
            </Text>
            <Text variant="body" color="secondary" italic align="center">
              This pattern may have been deleted
            </Text>
            <Button label="Go Back" onPress={() => navigation.goBack()} style={styles.notFoundButton} />
          </View>
        </Container>
      </Screen>
    );
  }

  const safeConfidence = pattern.confidence ?? 0;
  const confidenceColor = getConfidenceColor(safeConfidence);
  const confidencePercentage = Math.round(safeConfidence * 100);
  const patternColor = getPatternColor(pattern.type);

  const handleDelete = async () => {
    Alert.alert(
      'Delete Pattern',
      'Are you sure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await deletePattern(pattern.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete pattern');
            }
          },
        },
      ]
    );
  };

  const handleToggleEdges = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowEdges(!showEdges);
  };

  const displayImage = showEdges && pattern.edgeImageUri 
    ? pattern.edgeImageUri 
    : pattern.imageUri;

  const hasMeasurements = pattern.measurements && Object.keys(pattern.measurements).length > 0;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} haptic="light" style={styles.headerButton}>
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <Text variant="h4" weight="600" mono>DETAILS</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={handleDelete} haptic="medium" style={styles.headerButton}>
            <Icon name="trash-outline" size="md" color={Theme.colors.semantic.error} />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="m">
          {/* Image Display with Interactive Overlays */}
          {displayImage && (
            <Card 
              padding={0} 
              elevation="md"
              style={styles.imageCard}
            >
              <HUDElements 
                patternCount={1}
                showStatus={true}
              />

              <Image
                source={{ uri: displayImage }}
                style={styles.image}
                resizeMode="cover"
              />

              {!showEdges && pattern.anchors && pattern.anchors.length > 0 && (
                <PatternCanvas
                  patterns={[pattern]}
                  selectedPatternId={null}
                  opacity={overlayOpacity}
                  showLabels={showLabels}
                  blendMode={blendMode}
                />
              )}
              
              {/* Image Controls Overlay */}
              <View style={styles.imageOverlay}>
                {pattern.edgeImageUri && (
                  <Pressable
                    onPress={handleToggleEdges}
                    haptic="light"
                    style={[
                      styles.imageToggle,
                      ...(showEdges ? [styles.imageToggleActive] : []),
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
                      mono
                      customColor={showEdges ? Theme.colors.primary[500] : Theme.colors.text.secondary}
                    >
                      {showEdges ? 'EDGES' : 'ORIGINAL'}
                    </Text>
                  </Pressable>
                )}
                <View style={[styles.sourceBadge, { backgroundColor: patternColor }]}>
                  <Icon 
                    name={pattern.source === 'ai' ? 'sparkles' : 'create-outline'} 
                    size="sm" 
                    color="#fff" 
                  />
                  <Text variant="caption" weight="700" mono customColor="#fff">
                    {pattern.source === 'ai' ? 'AI_DETECTED' : 'MANUAL'}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Pattern Overlay Controls */}
          {pattern.anchors && pattern.anchors.length > 0 && (
            <Card variant="glowBorder" style={styles.detailsCard}>
              <Text variant="caption" color="tertiary" mono weight="700" style={styles.detailSectionTitle}>
                PATTERN_OVERLAY
              </Text>
              <PatternOverlayControls
                opacity={overlayOpacity}
                onOpacityChange={setOverlayOpacity}
                blendMode={blendMode}
                onBlendModeChange={setBlendMode}
                showEdges={showEdges}
                onToggleEdges={handleToggleEdges}
                showLabels={showLabels}
                onToggleLabels={() => setShowLabels(!showLabels)}
              />
            </Card>
          )}

          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <View
                style={[
                  styles.emojiContainer,
                  {
                    backgroundColor: `${patternColor}20`,
                    borderColor: `${Theme.colors.border.default}20`,
                  },
                ]}
              >
                <Icon name="git-network-outline" size="lg" color={patternColor} />
              </View>
              
              <View style={styles.titleInfo}>
                <Text variant="h2" style={styles.title}>
                  {pattern.name}
                </Text>
                
                {/* Type badge */}
                <Card
                  variant="glass"
                  elevation="none"
                  padding={8}
                  borderRadius={Theme.borderRadius.s}
                  style={[
                    styles.statusBadgeCard,
                    { borderColor: patternColor },
                  ]}
                >
                  <Text variant="caption" weight="700" customColor={patternColor} mono>
                    {pattern.type.toUpperCase().replace('_', ' ')}
                    {pattern.subtype && ` • ${pattern.subtype.toUpperCase()}`}
                  </Text>
                </Card>
              </View>
            </View>
          </View>

          {/* 🎨 REDESIGNED: Pattern Details Card - Matches Reminder Style */}
          <Card 
            variant="glowBorder"
            elevation="md"
            style={styles.detailsCard}
          >
            {/* AI Confidence Section */}
            {pattern.confidence !== undefined && (
              <View style={styles.detailSection}>
                <Text variant="caption" color="tertiary" mono weight="700" style={styles.detailSectionTitle}>
                  AI_CONFIDENCE
                </Text>
                
                <View style={styles.detailRow}>
                  <View
                    style={[
                      styles.detailIconContainer,
                      {
                        backgroundColor: `${patternColor}15`,
                        borderColor: `${patternColor}30`,
                        shadowColor: patternColor,
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: 4,
                      },
                    ]}
                  >
                    <Icon name="analytics" size="sm" color={patternColor} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text variant="bodyLarge" weight="600" mono>
                      {confidencePercentage}%
                    </Text>
                    <Text variant="caption" color="secondary" mono>
                      Confidence Score
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* 🎨 NEW: Divider (if measurements exist) */}
            {hasMeasurements && pattern.confidence !== undefined && (
              <View style={styles.dividerContainer}>
                <View style={styles.dividerGradient} />
              </View>
            )}

            {/* 🎨 REDESIGNED: Measurements Section */}
            {hasMeasurements && (
              <View style={styles.detailSection}>
                <Text variant="caption" color="tertiary" mono weight="700" style={styles.detailSectionTitle}>
                  MEASUREMENTS
                </Text>
                
                {pattern.measurements.goldenRatio !== undefined && (
                  <View style={styles.detailRow}>
                    <View
                      style={[
                        styles.detailIconContainer,
                        {
                          backgroundColor: `${patternColor}15`,
                          borderColor: `${patternColor}30`,
                          shadowColor: patternColor,
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 0 },
                          elevation: 4,
                        },
                      ]}
                    >
                      <Icon name="git-branch" size="sm" color={patternColor} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text variant="bodyLarge" weight="600" mono>
                        {pattern.measurements.goldenRatio.toFixed(3)}
                      </Text>
                      <Text variant="caption" color="secondary" mono>
                        Golden Ratio
                      </Text>
                    </View>
                  </View>
                )}

                {pattern.measurements.angles && pattern.measurements.angles.length > 0 && (
                  <View style={styles.detailRow}>
                    <View
                      style={[
                        styles.detailIconContainer,
                        {
                          backgroundColor: `${patternColor}15`,
                          borderColor: `${patternColor}30`,
                          shadowColor: patternColor,
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 0 },
                          elevation: 4,
                        },
                      ]}
                    >
                      <Icon name="compass" size="sm" color={patternColor} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text variant="bodyLarge" weight="600" mono>
                        {pattern.measurements.angles[0].toFixed(1)}°
                      </Text>
                      <Text variant="caption" color="secondary" mono>
                        Angle
                      </Text>
                    </View>
                  </View>
                )}

                {pattern.measurements.symmetryAxes !== undefined && (
                  <View style={styles.detailRow}>
                    <View
                      style={[
                        styles.detailIconContainer,
                        {
                          backgroundColor: `${patternColor}15`,
                          borderColor: `${patternColor}30`,
                          shadowColor: patternColor,
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 0 },
                          elevation: 4,
                        },
                      ]}
                    >
                      <Icon name="copy" size="sm" color={patternColor} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text variant="bodyLarge" weight="600" mono>
                        {pattern.measurements.symmetryAxes} axes
                      </Text>
                      <Text variant="caption" color="secondary" mono>
                        Symmetry
                      </Text>
                    </View>
                  </View>
                )}

                {pattern.measurements.nodeCount !== undefined && (
                  <View style={styles.detailRow}>
                    <View
                      style={[
                        styles.detailIconContainer,
                        {
                          backgroundColor: `${patternColor}15`,
                          borderColor: `${patternColor}30`,
                          shadowColor: patternColor,
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 0 },
                          elevation: 4,
                        },
                      ]}
                    >
                      <Icon name="radio-button-on" size="sm" color={patternColor} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text variant="bodyLarge" weight="600" mono>
                        {pattern.measurements.nodeCount}
                      </Text>
                      <Text variant="caption" color="secondary" mono>
                        Nodes
                      </Text>
                    </View>
                  </View>
                )}

                {pattern.measurements.aspectRatio !== undefined && (
                  <View style={styles.detailRow}>
                    <View
                      style={[
                        styles.detailIconContainer,
                        {
                          backgroundColor: `${patternColor}15`,
                          borderColor: `${patternColor}30`,
                          shadowColor: patternColor,
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 0 },
                          elevation: 4,
                        },
                      ]}
                    >
                      <Icon name="resize" size="sm" color={patternColor} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text variant="bodyLarge" weight="600" mono>
                        {pattern.measurements.aspectRatio.toFixed(2)}
                      </Text>
                      <Text variant="caption" color="secondary" mono>
                        Aspect Ratio
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </Card>

          {/* AI Insights */}
          {pattern.insights?.explanation && (
            <View style={styles.noteSection}>
              <View style={styles.noteSectionHeader}>
                <Icon name="bulb-outline" size="sm" color={Theme.colors.text.secondary} />
                <Text variant="h4" mono>AI_INSIGHTS</Text>
              </View>
              <Card 
                variant="glass"
                elevation="sm"
                style={styles.noteCard}
              >
                <Text variant="body" italic style={styles.noteText}>
                  "{pattern.insights.explanation}"
                </Text>
              </Card>
            </View>
          )}

          {/* Secret Message */}
          {pattern.insights?.secretMessage && (
            <View style={styles.noteSection}>
              <View style={styles.noteSectionHeader}>
                <Icon name="lock-closed-outline" size="sm" color={Theme.colors.text.secondary} />
                <Text variant="h4" mono>HIDDEN_MEANING</Text>
              </View>
              <Card 
                variant="glass"
                elevation="sm"
                style={styles.noteCard}
              >
                <Text variant="body" italic style={styles.noteText}>
                  {pattern.insights.secretMessage}
                </Text>
              </Card>
            </View>
          )}

          {/* Anchor Points */}
          {pattern.anchors && pattern.anchors.length > 0 && (
            <View style={styles.noteSection}>
              <View style={styles.noteSectionHeader}>
                <Icon name="scan-outline" size="sm" color={Theme.colors.text.secondary} />
                <Text variant="h4" mono>ANCHOR_POINTS</Text>
              </View>
              <Card 
                variant="glass"
                elevation="sm"
                style={styles.noteCard}
              >
                {pattern.anchors.map((anchor, index) => (
                  <View key={index} style={styles.anchorRow}>
                    <Text variant="caption" mono color="secondary">
                      POINT_{index + 1}:
                    </Text>
                    <Text variant="body" weight="600" mono>
                      X: {anchor.x.toFixed(1)}%, Y: {anchor.y.toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* User Notes */}
          {pattern.userNotes && (
            <View style={styles.noteSection}>
              <View style={styles.noteSectionHeader}>
                <Icon name="document-text-outline" size="sm" color={Theme.colors.text.secondary} />
                <Text variant="h4" mono>USER_NOTES</Text>
              </View>
              <Card 
                variant="glass"
                elevation="sm"
                style={styles.noteCard}
              >
                <Text variant="body" italic style={styles.noteText}>
                  {pattern.userNotes}
                </Text>
              </Card>
            </View>
          )}

          {/* Metadata */}
          <View style={styles.metadataSection}>
            <View style={styles.metadataRow}>
              <Icon name="add-circle-outline" size="xs" color={Theme.colors.text.tertiary} />
              <Text variant="caption" color="tertiary" mono>
                Discovered {new Date(pattern.createdAt).toLocaleDateString(undefined, { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            {pattern.updatedAt !== pattern.createdAt && (
              <View style={styles.metadataRow}>
                <Icon name="create-outline" size="xs" color={Theme.colors.text.tertiary} />
                <Text variant="caption" color="tertiary" mono>
                  Updated {new Date(pattern.updatedAt).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}
            {pattern.tags && pattern.tags.length > 0 && (
              <View style={styles.metadataRow}>
                <Icon name="pricetag-outline" size="xs" color={Theme.colors.text.tertiary} />
                <Text variant="caption" mono color="tertiary">
                  {pattern.tags.join(', ')}
                </Text>
              </View>
            )}
          </View>
        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header styles
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
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.m,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  scrollContent: {
    paddingBottom: Theme.spacing.safeArea.bottomPaddingLarge,
  },
  
  // Not found styles
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
    gap: Theme.spacing.m,
  },
  notFoundTitle: {
    marginTop: Theme.spacing.s,
  },
  notFoundButton: {
    marginTop: Theme.spacing.l,
  },

  // Image styles
  imageCard: {
    marginBottom: Theme.spacing.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  image: {
    width: '100%',
    height: SCREEN_WIDTH * 0.75,
  },
  imageOverlay: {
    position: 'absolute',
    top: Theme.spacing.m,
    left: Theme.spacing.m,
    right: Theme.spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  imageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...Theme.shadows.sm,
  },
  imageToggleActive: {
    backgroundColor: `${Theme.colors.primary[500]}20`,
    borderWidth: 1,
    borderColor: Theme.colors.primary[500],
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.full,
    ...Theme.shadows.sm,
  },

  // Title section (matches reminder)
  titleSection: {
    marginBottom: Theme.spacing.l,
  },
  titleRow: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    alignItems: 'flex-start',
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  titleInfo: {
    flex: 1,
    gap: Theme.spacing.s,
  },
  title: {
    lineHeight: 32,
  },
  statusBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },

  // 🎨 NEW: Details card (matches reminder)
  detailsCard: {
    marginBottom: Theme.spacing.l,
  },
  detailSection: {
    gap: Theme.spacing.m,
  },
  detailSectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 10,
    marginBottom: Theme.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  detailContent: {
    flex: 1,
    gap: 2,
  },
  
  // Gradient divider (matches reminder)
  dividerContainer: {
    marginVertical: Theme.spacing.m,
    alignItems: 'center',
  },
  dividerGradient: {
    width: '100%',
    height: 1,
    backgroundColor: Theme.colors.border.light,
    opacity: 0.5,
  },

  // Note section (matches reminder)
  noteSection: {
    marginBottom: Theme.spacing.l,
  },
  noteSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.m,
  },
  noteCard: {
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}50`,
  },
  noteText: {
    lineHeight: 24,
  },

  // Anchor row
  anchorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
    marginBottom: Theme.spacing.xs,
  },

  // Metadata (matches reminder)
  metadataSection: {
    gap: Theme.spacing.xs,
    paddingTop: Theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
