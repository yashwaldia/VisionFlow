/**
 * VisionFlow AI - Telemetry Panel Component (v2.0 - Hidden Inside UI Edition)
 * Enhanced technical display with monospace aesthetic
 * 
 * @module components/patterns/TelemetryPanel
 * 
 * CHANGELOG v2.0:
 * - ✅ UI ENHANCEMENT: Monospace fonts for all technical labels
 * - ✅ UI ENHANCEMENT: Enhanced letter-spacing
 * - ✅ All original functionality preserved
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';
import { Text, Card, Icon, Pressable } from '../index';
import { Pattern, PatternType, PATTERN_COLORS } from '../../types/pattern.types';

interface TelemetryPanelProps {
  patterns: Pattern[];
  selectedPatternId: string | null;
  onPatternSelect: (patternId: string) => void;
}

export function TelemetryPanel({
  patterns,
  selectedPatternId,
  onPatternSelect,
}: TelemetryPanelProps) {
  if (patterns.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="analytics-outline" size="sm" color={Theme.colors.primary[500]} />
        {/* ✅ ENHANCED: Monospace header */}
        <Text variant="h4" weight="700" mono style={styles.headerText}>
          PATTERN_TELEMETRY
        </Text>
        <View style={styles.badge}>
          {/* ✅ ENHANCED: Monospace count */}
          <Text variant="micro" weight="700" mono customColor={Theme.colors.primary[500]}>
            {patterns.length}
          </Text>
        </View>
      </View>

      <View style={styles.patternList}>
        {patterns.map((pattern, index) => (
          <PatternTelemetryCard
            key={index}
            pattern={pattern}
            index={index}
            isSelected={selectedPatternId === `pattern-${index}`}
            onPress={() => onPatternSelect(`pattern-${index}`)}
          />
        ))}
      </View>
    </View>
  );
}

interface PatternTelemetryCardProps {
  pattern: Pattern;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}

function PatternTelemetryCard({
  pattern,
  index,
  isSelected,
  onPress,
}: PatternTelemetryCardProps) {
  const patternColor = PATTERN_COLORS[pattern.type] || Theme.colors.primary[500];

  return (
    <Pressable onPress={onPress} haptic="light">
      <Card
        variant="hud"
        style={[
          styles.patternCard,
          ...(isSelected ? [styles.patternCardSelected] : []),
          { borderColor: isSelected ? patternColor : Theme.colors.border.default },
        ]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.patternIndicator, { backgroundColor: patternColor }]} />
            {/* ✅ Already uses mono font via style, now also using mono prop */}
            <Text variant="caption" weight="700" mono style={styles.patternIndex}>
              NODE_{index + 1}
            </Text>
          </View>
          <View style={styles.confidenceBadge}>
            <Icon name="checkmark-circle" size="xs" color={patternColor} />
            {/* ✅ ENHANCED: Monospace confidence percentage */}
            <Text variant="micro" weight="700" mono customColor={patternColor}>
              {Math.round((pattern.confidence || 0) * 100)}%
            </Text>
          </View>
        </View>

        {/* Pattern Name */}
        {/* ✅ ENHANCED: Monospace pattern name */}
        <Text variant="body" weight="700" mono numberOfLines={2} style={styles.patternName}>
          {pattern.name}
        </Text>

        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: `${patternColor}15` }]}>
          {/* ✅ ENHANCED: Monospace type label */}
          <Text variant="micro" weight="700" mono customColor={patternColor}>
            {pattern.type.toUpperCase().replace('_', ' ')}
          </Text>
        </View>

        {/* Measurements Grid */}
        {pattern.measurements && Object.keys(pattern.measurements).length > 0 && (
          <View style={styles.measurementsGrid}>
            {pattern.measurements.goldenRatio && (
              <MeasurementItem
                icon="analytics"
                label="φ_RATIO"
                value={pattern.measurements.goldenRatio.toFixed(3)}
                color={patternColor}
              />
            )}
            {pattern.measurements.angles && pattern.measurements.angles.length > 0 && (
              <MeasurementItem
                icon="shapes-outline"
                label="ANGLES"
                value={`${pattern.measurements.angles.length}°`}
                color={patternColor}
              />
            )}
            {pattern.measurements.symmetryAxes !== undefined && (
              <MeasurementItem
                icon="git-branch-outline"
                label="AXES"
                value={pattern.measurements.symmetryAxes.toString()}
                color={patternColor}
              />
            )}
            {pattern.measurements.nodeCount !== undefined && (
              <MeasurementItem
                icon="ellipse-outline"
                label="NODES"
                value={pattern.measurements.nodeCount.toString()}
                color={patternColor}
              />
            )}
          </View>
        )}

        {/* Anchors Count */}
        <View style={styles.anchorInfo}>
          <Icon name="locate-outline" size="xs" color={Theme.colors.text.tertiary} />
          {/* ✅ ENHANCED: Monospace anchor count */}
          <Text variant="micro" color="tertiary" mono>
            {pattern.anchors.length} anchor_point{pattern.anchors.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

interface MeasurementItemProps {
  icon: string;
  label: string;
  value: string;
  color: string;
}

function MeasurementItem({ icon, label, value, color }: MeasurementItemProps) {
  return (
    <View style={styles.measurementItem}>
      <Icon name={icon as any} size="xs" color={color} />
      <View style={styles.measurementText}>
        {/* ✅ ENHANCED: Monospace measurement label */}
        <Text variant="micro" color="tertiary" mono>
          {label}
        </Text>
        {/* ✅ ENHANCED: Monospace measurement value */}
        <Text variant="caption" weight="700" mono customColor={color}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.m,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  headerText: {
    flex: 1,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  patternList: {
    gap: Theme.spacing.m,
  },
  patternCard: {
    borderWidth: 2,
    borderColor: Theme.colors.border.default,
    gap: Theme.spacing.s,
  },
  patternCardSelected: {
    backgroundColor: `${Theme.colors.primary[500]}05`,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  patternIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  patternIndex: {
    fontSize: 10,
    letterSpacing: 0.5,
    fontFamily: Theme.typography.fontFamily.mono,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: 4,
  },
  patternName: {
    lineHeight: 20,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
    marginTop: Theme.spacing.xs,
  },
  measurementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: 6,
    minWidth: 80,
  },
  measurementText: {
    gap: 2,
  },
  anchorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Theme.spacing.xs,
  },
});
