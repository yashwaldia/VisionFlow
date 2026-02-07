/**
 * VisionFlow AI - Telemetry Panel Component
 * Display pattern metadata, measurements, and technical details
 * 
 * @module components/patterns/TelemetryPanel
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
        <Text variant="h4" weight="700" style={styles.headerText}>
          PATTERN TELEMETRY
        </Text>
        <View style={styles.badge}>
          <Text variant="micro" weight="700" customColor={Theme.colors.primary[500]}>
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
            <Text variant="caption" weight="700" style={styles.patternIndex}>
              NODE_{index + 1}
            </Text>
          </View>
          <View style={styles.confidenceBadge}>
            <Icon name="checkmark-circle" size="xs" color={patternColor} />
            <Text variant="micro" weight="700" customColor={patternColor}>
              {Math.round((pattern.confidence || 0) * 100)}%
            </Text>
          </View>
        </View>

        {/* Pattern Name */}
        <Text variant="body" weight="700" numberOfLines={2} style={styles.patternName}>
          {pattern.name}
        </Text>

        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: `${patternColor}15` }]}>
          <Text variant="micro" weight="700" customColor={patternColor}>
            {pattern.type.toUpperCase().replace('_', ' ')}
          </Text>
        </View>

        {/* Measurements Grid */}
        {pattern.measurements && Object.keys(pattern.measurements).length > 0 && (
          <View style={styles.measurementsGrid}>
            {pattern.measurements.goldenRatio && (
              <MeasurementItem
                icon="analytics"
                label="φ Ratio"
                value={pattern.measurements.goldenRatio.toFixed(3)}
                color={patternColor}
              />
            )}
            {pattern.measurements.angles && pattern.measurements.angles.length > 0 && (
              <MeasurementItem
                icon="shapes-outline"
                label="Angles"
                value={`${pattern.measurements.angles.length}°`}
                color={patternColor}
              />
            )}
            {pattern.measurements.symmetryAxes !== undefined && (
              <MeasurementItem
                icon="git-branch-outline"
                label="Axes"
                value={pattern.measurements.symmetryAxes.toString()}
                color={patternColor}
              />
            )}
            {pattern.measurements.nodeCount !== undefined && (
              <MeasurementItem
                icon="ellipse-outline"
                label="Nodes"
                value={pattern.measurements.nodeCount.toString()}
                color={patternColor}
              />
            )}
          </View>
        )}

        {/* Anchors Count */}
        <View style={styles.anchorInfo}>
          <Icon name="locate-outline" size="xs" color={Theme.colors.text.tertiary} />
          <Text variant="micro" color="tertiary">
            {pattern.anchors.length} anchor point{pattern.anchors.length !== 1 ? 's' : ''}
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
        <Text variant="micro" color="tertiary">
          {label}
        </Text>
        <Text variant="caption" weight="700" customColor={color}>
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
