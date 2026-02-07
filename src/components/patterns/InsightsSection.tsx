/**
 * VisionFlow AI - Insights Section Component
 * Display AI-generated insights, explanations, and secret messages
 * 
 * @module components/patterns/InsightsSection
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';
import { Text, Card, Icon } from '../index';
import { PatternInsights } from '../../types/pattern.types';

interface InsightsSectionProps {
  insights: PatternInsights;
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  return (
    <View style={styles.container}>
      {/* Explanation */}
      <Card variant="hud" style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Icon name="bulb" size="sm" color={Theme.colors.semantic.warning} />
          <Text variant="h4" weight="700">
            ANALYSIS
          </Text>
        </View>
        <Text variant="body" color="secondary" style={styles.insightText}>
          {insights.explanation}
        </Text>
      </Card>

      {/* Secret Message */}
      {insights.secretMessage && (
        <Card variant="hud" style={[styles.insightCard, styles.secretCard]}>
          <View style={styles.insightHeader}>
            <Icon name="eye" size="sm" color={Theme.colors.primary[500]} />
            <Text variant="h4" weight="700">
              HIDDEN INSIGHT
            </Text>
          </View>
          <Text variant="body" style={[styles.insightText, styles.secretText]}>
            {insights.secretMessage}
          </Text>
        </Card>
      )}

      {/* Share Caption */}
      {insights.shareCaption && (
        <Card variant="hud" style={styles.shareCard}>
          <View style={styles.shareHeader}>
            <Icon name="share-social" size="sm" color={Theme.colors.secondary[500]} />
            <Text variant="caption" color="secondary" weight="700">
              SHARE CAPTION
            </Text>
          </View>
          <Text variant="body" color="secondary" style={styles.shareText}>
            {insights.shareCaption}
          </Text>
        </Card>
      )}

      {/* Mathematical Context */}
      {insights.mathematicalContext && (
        <Card variant="hud" style={styles.contextCard}>
          <View style={styles.contextHeader}>
            <Icon name="calculator" size="xs" color={Theme.colors.text.tertiary} />
            <Text variant="caption" color="tertiary" weight="700">
              MATHEMATICAL CONTEXT
            </Text>
          </View>
          <Text variant="caption" color="secondary" style={styles.contextText}>
            {insights.mathematicalContext}
          </Text>
        </Card>
      )}

      {/* Cultural Context */}
      {insights.culturalContext && (
        <Card variant="hud" style={styles.contextCard}>
          <View style={styles.contextHeader}>
            <Icon name="library" size="xs" color={Theme.colors.text.tertiary} />
            <Text variant="caption" color="tertiary" weight="700">
              CULTURAL CONTEXT
            </Text>
          </View>
          <Text variant="caption" color="secondary" style={styles.contextText}>
            {insights.culturalContext}
          </Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.m,
  },
  insightCard: {
    gap: Theme.spacing.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.warning}30`,
    backgroundColor: `${Theme.colors.semantic.warning}05`,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  insightText: {
    lineHeight: 22,
  },
  secretCard: {
    borderColor: `${Theme.colors.primary[500]}30`,
    backgroundColor: `${Theme.colors.primary[500]}05`,
  },
  secretText: {
    fontStyle: 'italic',
    color: Theme.colors.primary[400],
  },
  shareCard: {
    gap: Theme.spacing.s,
    borderWidth: 1,
    borderColor: `${Theme.colors.secondary[500]}30`,
    backgroundColor: `${Theme.colors.secondary[500]}05`,
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  shareText: {
    lineHeight: 20,
  },
  contextCard: {
    gap: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  contextText: {
    lineHeight: 18,
  },
});
