/**
 * VisionFlow AI - Pattern Detail Screen (FIXED)
 * View and manage discovered AI patterns
 * @module screens/PatternDetailScreen
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
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

type PatternDetailScreenProps = NativeStackScreenProps<PatternStackParamList, 'PatternDetail'>;

/**
 * Helper to determine confidence color based on score (0.0 - 1.0)
 */
const getConfidenceColor = (score: number): string => {
  if (score >= 0.8) return Theme.colors.semantic.success;
  if (score >= 0.5) return Theme.colors.semantic.warning;
  return Theme.colors.semantic.error;
};

/**
 * PatternDetailScreen Component
 */
export function PatternDetailScreen({ navigation, route }: PatternDetailScreenProps) {
  const { patternId } = route.params;
  const { getPatternById, deletePattern } = usePatterns();
  
  // Initialize local state from hook data
  const [pattern, setPattern] = useState(getPatternById(patternId));

  useEffect(() => {
    // Refresh pattern data if ID changes or on focus
    const unsubscribe = navigation.addListener('focus', () => {
        setPattern(getPatternById(patternId));
    });
    return unsubscribe;
  }, [navigation, patternId, getPatternById]);

  // Handle "Not Found" state (e.g., deep linking to deleted item)
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

  // FIXED: Handle optional confidence safely
  const safeConfidence = pattern.confidence ?? 0;
  const confidenceColor = getConfidenceColor(safeConfidence);
  const confidencePercentage = Math.round(safeConfidence * 100);

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

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        {/* FIXED: haptic prop must be a string enum, not boolean */}
        <Pressable onPress={() => navigation.goBack()} haptic="light">
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <Text variant="h4" weight="600">Pattern Details</Text>
        {/* FIXED: haptic prop must be a string enum */}
        <Pressable onPress={handleDelete} haptic="medium">
          <Icon name="trash-outline" size="md" color={Theme.colors.semantic.error} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Container padding="m">
          {/* Visual Header */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: `${confidenceColor}20` }]}>
              <Icon name="git-network-outline" size="xl" color={confidenceColor} />
            </View>
          </View>

          {/* Title & Type */}
          <Text variant="h2" style={styles.title}>{pattern.name}</Text>
          {/* FIXED: Replaced non-existent Theme.colors.secondary with primary */}
          <View style={[styles.typeBadge, { backgroundColor: `${Theme.colors.primary[500]}20` }]}>
            <Text variant="body" weight="600" customColor={Theme.colors.primary[500]}>
              {pattern.type.toUpperCase().replace('_', ' ')}
            </Text>
          </View>

          {/* Confidence Score Card */}
          <Card style={styles.card}>
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

          {/* Metadata Card */}
          <Card style={styles.card}>
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
            <View style={styles.detailRow}>
              <Icon name="heart-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="body" color="secondary">Favorite:</Text>
              <Text variant="body" weight="600">
                {pattern.isFavorite ? 'Yes' : 'No'}
              </Text>
            </View>
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
  },
  content: {
    paddingBottom: Theme.spacing.xl,
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
  iconContainer: {
    alignItems: 'center',
    marginVertical: Theme.spacing.l,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: Theme.spacing.s,
  },
  typeBadge: {
    alignSelf: 'center',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    marginBottom: Theme.spacing.l,
  },
  card: {
    marginBottom: Theme.spacing.m,
    gap: Theme.spacing.m,
  },
  cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Theme.spacing.s,
      marginBottom: Theme.spacing.xs,
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
  },
});