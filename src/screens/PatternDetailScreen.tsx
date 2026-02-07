/**
 * VisionFlow AI - Pattern Detail Screen (v4.1 - Added Overlay Components)
 * View and manage discovered AI patterns with full visual analysis
 * 
 * @module screens/PatternDetailScreen
 * 
 * CHANGELOG v4.1:
 * - ✅ ADDED: HUDElements overlay on image
 * - ✅ ADDED: PatternCanvas for interactive pattern display
 * - ✅ ADDED: PatternOverlayControls section
 * - ✅ KEPT: Original layout and styling intact
 * - ✅ NO BREAKING CHANGES to existing UI
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
} from '../components';
import { usePatterns } from '../hooks/usePatterns';
import * as Haptics from 'expo-haptics';
import { PATTERN_COLORS, PatternType } from '../types/pattern.types';

// 🆕 NEW: Import overlay components
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
  const { getPatternById, patterns, deletePattern } = usePatterns();
  
  const [pattern, setPattern] = useState(getPatternById(patternId));
  const [showEdges, setShowEdges] = useState(false);

  // 🆕 NEW: Overlay controls state
  const [overlayOpacity, setOverlayOpacity] = useState(0.8);
  const [showLabels, setShowLabels] = useState(true);
  const [blendMode, setBlendMode] = useState<BlendModeType>('screen');

  // Refresh pattern when patterns array updates
  useEffect(() => {
    if (patternId) {
      const refreshedPattern = getPatternById(patternId);
      if (refreshedPattern) {
        setPattern(refreshedPattern);
      }
    }
  }, [patterns, patternId, getPatternById]);

  // Refresh on screen focus
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

  if (!pattern) {
    return (
      <Screen>
        <Container padding="m">
          <View style={styles.notFoundContainer}>
            <Icon name="alert-circle-outline" size="xl" color={Theme.colors.text.tertiary} />
            <Text variant="h3" align="center" style={styles.notFoundTitle}>
              Pattern not found
            </Text>
            <Text variant="body" color="secondary" align="center">
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
      {/* Header - UNCHANGED */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} haptic="light" style={styles.headerButton}>
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <Text variant="h4" weight="600">Details</Text>
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
          {/* 🆕 ENHANCED: Image Display with Interactive Overlays */}
          {displayImage && (
            <Card padding={0} style={styles.imageCard}>
              {/* 🆕 NEW: HUD Elements overlay */}
              <HUDElements 
                patternCount={1}
                showStatus={true}
              />

              <Image
                source={{ uri: displayImage }}
                style={styles.patternImage}
                resizeMode="cover"
              />

              {/* 🆕 NEW: Pattern Canvas overlay (if not showing edges) */}
              {!showEdges && pattern.anchors && pattern.anchors.length > 0 && (
                <PatternCanvas
                  patterns={[pattern]}
                  selectedPatternId={null}
                  opacity={overlayOpacity}
                  showLabels={showLabels}
                  blendMode={blendMode}
                />
              )}
              
              {/* Image Controls Overlay - UNCHANGED */}
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
                      customColor={showEdges ? Theme.colors.primary[500] : Theme.colors.text.secondary}
                    >
                      {showEdges ? 'Edges' : 'Original'}
                    </Text>
                  </Pressable>
                )}
                <View style={[styles.sourceBadge, { backgroundColor: patternColor }]}>
                  <Icon 
                    name={pattern.source === 'ai' ? 'sparkles' : 'create-outline'} 
                    size="sm" 
                    color="#fff" 
                  />
                  <Text variant="caption" weight="700" customColor="#fff">
                    {pattern.source === 'ai' ? 'AI DETECTED' : 'MANUAL'}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* 🆕 NEW: Pattern Overlay Controls (only if pattern has anchors) */}
          {pattern.anchors && pattern.anchors.length > 0 && (
            <Card style={styles.detailsCard}>
              <View style={styles.cardHeader}>
                <Icon name="layers-outline" size="md" color={Theme.colors.primary[500]} />
                <Text variant="h4">Pattern Overlay</Text>
              </View>
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

          {/* Title & Type - UNCHANGED */}
          <View style={styles.titleSection}>
            <View style={[styles.iconCircle, { backgroundColor: `${patternColor}20` }]}>
              <Icon name="git-network-outline" size="lg" color={patternColor} />
            </View>
            <Text variant="h2" style={styles.title}>{pattern.name}</Text>
            <View style={[styles.typeBadge, { backgroundColor: `${patternColor}20` }]}>
              <Text variant="body" weight="600" customColor={patternColor}>
                {pattern.type.toUpperCase().replace('_', ' ')}
                {pattern.subtype && ` • ${pattern.subtype}`}
              </Text>
            </View>
          </View>

          {/* Confidence Score Card - UNCHANGED */}
          {pattern.confidence !== undefined && (
            <Card style={styles.detailsCard}>
              <View style={styles.confidenceHeader}>
                <Text variant="h4">AI Confidence</Text>
                <Text variant="h2" weight="700" customColor={confidenceColor}>
                  {confidencePercentage}%
                </Text>
              </View>
              <View style={styles.confidenceBarBg}>
                <View 
                  style={[
                    styles.confidenceBarFill, 
                    { width: `${confidencePercentage}%`, backgroundColor: confidenceColor }
                  ]} 
                />
              </View>
            </Card>
          )}

          {/* AI Insights - UNCHANGED */}
          {pattern.insights && (
            <>
              {/* Explanation */}
              {pattern.insights.explanation && (
                <Card style={styles.insightsCard}>
                  <View style={styles.cardHeader}>
                    <Icon name="bulb-outline" size="md" color={Theme.colors.secondary[500]} />
                    <Text variant="h4">AI Insights</Text>
                  </View>
                  <View style={styles.quoteContainer}>
                    <Text variant="body" style={styles.quoteText}>
                      "{pattern.insights.explanation}"
                    </Text>
                  </View>
                </Card>
              )}

              {/* Secret Message */}
              {pattern.insights.secretMessage && (
                <Card style={styles.anomalyCard}>
                  <View style={styles.cardHeader}>
                    <Icon name="lock-closed-outline" size="md" color={Theme.colors.semantic.warning} />
                    <Text variant="h4">Hidden Meaning</Text>
                    <View style={styles.classifiedBadge}>
                      <Text variant="micro" customColor={Theme.colors.semantic.warning}>
                        CLASSIFIED
                      </Text>
                    </View>
                  </View>
                  <View style={styles.anomalyContent}>
                    <Text variant="body" color="secondary" style={{ fontStyle: 'italic' }}>
                      {pattern.insights.secretMessage}
                    </Text>
                  </View>
                </Card>
              )}
            </>
          )}

          {/* Measurements - UNCHANGED */}
          {hasMeasurements && (
            <Card style={styles.detailsCard}>
              <View style={styles.cardHeader}>
                <Icon name="calculator-outline" size="md" color={Theme.colors.semantic.info} />
                <Text variant="h4">Measurements</Text>
              </View>
              <View style={styles.measurementsGrid}>
                {pattern.measurements.goldenRatio !== undefined && (
                  <View style={styles.measurementItem}>
                    <Text variant="micro" color="tertiary">GOLDEN RATIO</Text>
                    <Text variant="bodyLarge" weight="600">
                      {pattern.measurements.goldenRatio.toFixed(3)}
                    </Text>
                  </View>
                )}
                {pattern.measurements.angles && pattern.measurements.angles.length > 0 && (
                  <View style={styles.measurementItem}>
                    <Text variant="micro" color="tertiary">ANGLE</Text>
                    <Text variant="bodyLarge" weight="600">
                      {pattern.measurements.angles[0].toFixed(1)}°
                    </Text>
                  </View>
                )}
                {pattern.measurements.symmetryAxes !== undefined && (
                  <View style={styles.measurementItem}>
                    <Text variant="micro" color="tertiary">SYMMETRY</Text>
                    <Text variant="bodyLarge" weight="600">
                      {pattern.measurements.symmetryAxes} axes
                    </Text>
                  </View>
                )}
                {pattern.measurements.nodeCount !== undefined && (
                  <View style={styles.measurementItem}>
                    <Text variant="micro" color="tertiary">NODES</Text>
                    <Text variant="bodyLarge" weight="600">
                      {pattern.measurements.nodeCount}
                    </Text>
                  </View>
                )}
                {pattern.measurements.aspectRatio !== undefined && (
                  <View style={styles.measurementItem}>
                    <Text variant="micro" color="tertiary">ASPECT RATIO</Text>
                    <Text variant="bodyLarge" weight="600">
                      {pattern.measurements.aspectRatio.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          )}

          {/* Anchor Points - UNCHANGED */}
          {pattern.anchors && pattern.anchors.length > 0 && (
            <Card style={styles.detailsCard}>
              <View style={styles.cardHeader}>
                <Icon name="scan-outline" size="md" color={patternColor} />
                <Text variant="h4">Anchor Points</Text>
              </View>
              <View style={styles.contextGrid}>
                {pattern.anchors.map((anchor, index) => (
                  <View key={index} style={[styles.contextItem, { borderLeftColor: patternColor, borderLeftWidth: 3 }]}>
                    <Text variant="caption" color="secondary">Point {index + 1}</Text>
                    <Text variant="body" weight="600">
                      X: {anchor.x.toFixed(1)}%, Y: {anchor.y.toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* User Notes - UNCHANGED */}
          {pattern.userNotes && (
            <Card style={styles.detailsCard}>
              <View style={styles.cardHeader}>
                <Icon name="document-text-outline" size="md" color={Theme.colors.primary[500]} />
                <Text variant="h4">Notes</Text>
              </View>
              <Text variant="body" style={styles.noteText}>{pattern.userNotes}</Text>
            </Card>
          )}

          {/* Metadata - UNCHANGED */}
          <View style={styles.metadataSection}>
            <View style={styles.metadataRow}>
              <Icon name="calendar-outline" size="xs" color={Theme.colors.text.tertiary} />
              <Text variant="caption" color="tertiary">
                Discovered {new Date(pattern.createdAt).toLocaleDateString(undefined, { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            {pattern.updatedAt !== pattern.createdAt && (
              <View style={styles.metadataRow}>
                <Icon name="time-outline" size="xs" color={Theme.colors.text.tertiary} />
                <Text variant="caption" color="tertiary">
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
                <Text variant="caption" color="tertiary">
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

// Styles - UNCHANGED (exact same as original)
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
  
  // Content styles
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
    ...Theme.shadows.md,
  },
  patternImage: {
    width: '100%',
    height: 280,
    backgroundColor: Theme.colors.background.tertiary,
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

  // Title section styles
  titleSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.m,
  },
  title: {
    textAlign: 'center',
    marginBottom: Theme.spacing.s,
  },
  typeBadge: {
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
  },

  // Details card styles
  detailsCard: {
    marginBottom: Theme.spacing.l,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    ...Theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
  },

  // Confidence styles
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  confidenceBarBg: {
    height: 8,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: Theme.borderRadius.full,
  },

  // Insights card styles
  insightsCard: {
    marginBottom: Theme.spacing.l,
    backgroundColor: `${Theme.colors.secondary[500]}08`,
    borderWidth: 1,
    borderColor: `${Theme.colors.secondary[500]}20`,
    ...Theme.shadows.sm,
  },
  quoteContainer: {
    paddingLeft: Theme.spacing.m,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.secondary[500],
  },
  quoteText: {
    lineHeight: 24,
  },

  // Anomaly card styles
  anomalyCard: {
    marginBottom: Theme.spacing.l,
    backgroundColor: `${Theme.colors.semantic.warning}08`,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.warning}30`,
    ...Theme.shadows.sm,
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

  // Measurements styles
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
    marginTop: Theme.spacing.m,
  },
  measurementItem: {
    backgroundColor: Theme.colors.background.tertiary,
    padding: Theme.spacing.m,
    borderRadius: Theme.borderRadius.m,
    minWidth: '30%',
    gap: 4,
  },

  // Context/Anchor styles
  contextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
    marginTop: Theme.spacing.m,
  },
  contextItem: {
    backgroundColor: Theme.colors.background.tertiary,
    padding: Theme.spacing.m,
    borderRadius: Theme.borderRadius.s,
    width: '47%',
    gap: 4,
  },

  // Note text styles
  noteText: {
    lineHeight: 24,
  },

  // Metadata styles
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
