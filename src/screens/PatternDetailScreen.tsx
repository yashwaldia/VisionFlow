/**
 * VisionFlow AI - Pattern Detail Screen (v3.0 - Complete Intelligence Dashboard)
 * View and manage discovered AI patterns with full visual analysis
 * 
 * @module screens/PatternDetailScreen
 * 
 * CHANGELOG v3.0:
 * - ✅ Added image display with edge toggle
 * - ✅ Display AI insights (explanation + secretMessage)
 * - ✅ Show all measurements with proper formatting
 * - ✅ Enhanced visual hierarchy
 * - ✅ Production-ready pattern visualization
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Image } from 'react-native';
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
import { formatDate } from '../utils/dateUtils';
import { PATTERN_COLORS, PatternType } from '../types/pattern.types';

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

export function PatternDetailScreen({ navigation, route }: PatternDetailScreenProps) {
  const { patternId } = route.params || {};
  const { getPatternById, deletePattern } = usePatterns();
  
  const [pattern, setPattern] = useState(getPatternById(patternId));
  const [showEdges, setShowEdges] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (patternId) {
        setPattern(getPatternById(patternId));
      }
    });
    return unsubscribe;
  }, [navigation, patternId, getPatternById]);

  if (!pattern) {
    return (
      <Screen>
        <Container padding="m" style={styles.centered}>
          <Icon name="alert-circle-outline" size="xl" color={Theme.colors.text.secondary} />
          <Text variant="h3" style={styles.notFoundTitle}>Pattern not found</Text>
          <Button label="Go Back" onPress={() => navigation.goBack()} />
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

  // Get display image (edge or original)
  const displayImage = showEdges && pattern.edgeImageUri 
    ? pattern.edgeImageUri 
    : pattern.imageUri;

  // Check if we have measurements to display
  const hasMeasurements = pattern.measurements && Object.keys(pattern.measurements).length > 0;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} haptic="light">
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <Text variant="h4" weight="600">Pattern Details</Text>
        <Pressable onPress={handleDelete} haptic="medium">
          <Icon name="trash-outline" size="md" color={Theme.colors.semantic.error} />
        </Pressable>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="m">
          {/* Image Display */}
          {displayImage && (
            <Card elevation="sm" style={styles.imageCard}>
              <Image
                source={{ uri: displayImage }}
                style={styles.patternImage}
                resizeMode="cover"
              />
              
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

          {/* Title & Type */}
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

          {/* Confidence Score Card */}
          {pattern.confidence !== undefined && (
            <Card elevation="sm" style={styles.card}>
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

          {/* AI Insights */}
          {pattern.insights && (
            <>
              {/* Explanation */}
              {pattern.insights.explanation && (
                <Card elevation="sm" style={styles.insightsCard}>
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
                <Card elevation="sm" style={styles.anomalyCard}>
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

          {/* Measurements */}
          {hasMeasurements && (
            <Card elevation="sm" style={styles.card}>
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

          {/* Anchor Points */}
          {pattern.anchors && pattern.anchors.length > 0 && (
            <Card elevation="sm" style={styles.card}>
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

          {/* User Notes */}
          {pattern.userNotes && (
            <Card elevation="sm" style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name="document-text-outline" size="md" color={Theme.colors.primary[500]} />
                <Text variant="h4">Notes</Text>
              </View>
              <Text variant="body">{pattern.userNotes}</Text>
            </Card>
          )}

          {/* Metadata Card */}
          <Card elevation="sm" style={styles.card}>
            <View style={styles.detailRow}>
              <Icon name="calendar-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="body" color="secondary">Discovered:</Text>
              <Text variant="body" weight="600">
                {formatDate(new Date(pattern.createdAt))}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="time-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="body" color="secondary">Last Updated:</Text>
              <Text variant="body" weight="600">
                {formatDate(new Date(pattern.updatedAt))}
              </Text>
            </View>
            {pattern.tags && pattern.tags.length > 0 && (
              <View style={styles.detailRow}>
                <Icon name="pricetag-outline" size="sm" color={Theme.colors.text.secondary} />
                <Text variant="body" color="secondary">Tags:</Text>
                <Text variant="body" weight="600">
                  {pattern.tags.join(', ')}
                </Text>
              </View>
            )}
          </Card>

        </Container>
      </ScrollView>
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
    paddingTop: Platform.OS === 'ios' ? 0 : Theme.spacing.s,
    ...Theme.shadows.sm,
  },
  scrollContent: {
    paddingBottom: Theme.spacing.safeArea.bottomPaddingLarge,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  notFoundTitle: {
    textAlign: 'center',
    marginBottom: Theme.spacing.s,
  },

  imageCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Theme.spacing.l,
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

  card: {
    marginBottom: Theme.spacing.m,
    gap: Theme.spacing.m,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
  },

  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
  },
  measurementItem: {
    backgroundColor: Theme.colors.background.tertiary,
    padding: Theme.spacing.m,
    borderRadius: Theme.borderRadius.m,
    minWidth: '30%',
    gap: 4,
  },

  contextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
  },
  contextItem: {
    backgroundColor: Theme.colors.background.tertiary,
    padding: Theme.spacing.m,
    borderRadius: Theme.borderRadius.s,
    width: '47%',
    gap: 4,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
    flexWrap: 'wrap',
  },
});
