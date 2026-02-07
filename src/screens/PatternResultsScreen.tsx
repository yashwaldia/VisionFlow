/**
 * VisionFlow AI - Pattern Results Screen (v4.0 - Consistent UI)
 * Matches EditReminder/EditProject layout consistency
 * 
 * @module screens/PatternResultsScreen
 * @version 4.0.0
 * 
 * CHANGELOG v4.0:
 * - ✅ Consistent header layout (close button + title + subtitle)
 * - ✅ Consistent footer layout (equal-width buttons)
 * - ✅ Fixed ScrollView clearance (140px for footer)
 * - ✅ Removed haptic from frequent actions
 * - ✅ Matches EditReminder/EditProject UI patterns
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { RootStackParamList } from '../types/navigation.types';
import { Theme } from '../constants/theme';
import {
  Text,
  Button,
  Icon,
  Pressable,
  Container,
} from '../components';
import { AIPatternAnalysis, Pattern } from '../types/pattern.types';
import { usePatterns } from '../hooks/usePatterns';

import { HUDElements } from '../components/patterns/HUDElements';
import { PatternCanvas } from '../components/patterns/PatternCanvas';
import { PatternOverlayControls } from '../components/patterns/PatternOverlayControls';
import { TelemetryPanel } from '../components/patterns/TelemetryPanel';
import { InsightsSection } from '../components/patterns/InsightsSection';

type PatternResultsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PatternResultsScreen'
>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_HEIGHT = SCREEN_WIDTH * (3 / 4);

interface ProcessedImages {
  original: string;
  edges: string;
  width: number;
  height: number;
}

type BlendModeType = 'normal' | 'screen' | 'multiply' | 'overlay' | 'lighten';

export function PatternResultsScreen({ navigation, route }: PatternResultsScreenProps) {
  const { analysisResult, processedImages } = route.params as {
    analysisResult: AIPatternAnalysis;
    processedImages: ProcessedImages;
  };
  const { createPattern } = usePatterns();
  const insets = useSafeAreaInsets();

  // State
  const [overlayOpacity, setOverlayOpacity] = useState(0.8);
  const [showEdges, setShowEdges] = useState(false);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [blendMode, setBlendMode] = useState<BlendModeType>('screen');

  // Handlers
  const handleOpacityChange = (value: number) => {
    setOverlayOpacity(value);
  };

  const handlePatternTap = (patternId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPatternId(selectedPatternId === patternId ? null : patternId);
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
          overlaySteps: detectedPattern.overlaySteps,
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
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* ✅ CONSISTENT: Header with close + title + subtitle */}
      <View style={styles.header}>
        <Pressable onPress={handleDiscard} haptic="light" style={styles.headerButton}>
          <Icon name="close" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text variant="h4" weight="600">Pattern Analysis</Text>
          <Text variant="caption" color="tertiary">
            {analysisResult.patterns.length} pattern{analysisResult.patterns.length !== 1 ? 's' : ''} detected
          </Text>
        </View>
        <Pressable 
          onPress={() => setShowLabels(!showLabels)} 
          haptic="light" 
          style={styles.headerButton}
        >
          <Icon 
            name={showLabels ? "pricetag" : "pricetag-outline"} 
            size="md" 
            color={showLabels ? Theme.colors.primary[500] : Theme.colors.text.secondary} 
          />
        </Pressable>
      </View>

      {/* ✅ CONSISTENT: ScrollView with proper clearance */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image with Advanced Overlays */}
        <View style={styles.imageContainer}>
          <HUDElements 
            patternCount={analysisResult.patterns.length}
            showStatus={true}
          />

          <Image
            source={{ uri: showEdges ? processedImages.edges : processedImages.original }}
            style={styles.image}
            resizeMode="cover"
          />

          <PatternCanvas
            patterns={analysisResult.patterns as Pattern[]}
            selectedPatternId={selectedPatternId}
            opacity={overlayOpacity}
            showLabels={showLabels}
            onPatternTap={handlePatternTap}
          />
        </View>

        {/* ✅ CONSISTENT: Content padding */}
        <View style={styles.content}>
          {/* Pattern Overlay Controls */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="layers-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Overlay Controls</Text>
            </View>
            <PatternOverlayControls
              opacity={overlayOpacity}
              onOpacityChange={handleOpacityChange}
              blendMode={blendMode}
              onBlendModeChange={setBlendMode}
              showEdges={showEdges}
              onToggleEdges={() => setShowEdges(!showEdges)}
              showLabels={showLabels}
              onToggleLabels={() => setShowLabels(!showLabels)}
            />
          </View>

          {/* Pattern Telemetry */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="analytics-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Pattern Telemetry</Text>
            </View>
            <TelemetryPanel
              patterns={analysisResult.patterns as Pattern[]}
              selectedPatternId={selectedPatternId}
              onPatternSelect={handlePatternTap}
            />
          </View>

          {/* AI Insights */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="bulb-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">AI Insights</Text>
            </View>
            <InsightsSection insights={analysisResult.insights} />
          </View>
        </View>
      </ScrollView>

      {/* ✅ CONSISTENT: Footer with equal-width buttons */}
      <View style={[styles.footerContainer, { paddingBottom: insets.bottom + Theme.spacing.m }]}>
        <View style={styles.footer}>
          <View style={styles.footerButton}>
            <Button
              label="Discard"
              variant="outline"
              size="large"
              leftIcon="close"
              onPress={handleDiscard}
              disabled={isSaving}
              fullWidth
            />
          </View>
          <View style={styles.footerButton}>
            <Button
              label={isSaving ? 'Saving...' : 'Save Patterns'}
              variant="primary"
              size="large"
              leftIcon={isSaving ? undefined : "checkmark"}
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving}
              fullWidth
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },

  // ✅ CONSISTENT: Header styles matching EditReminder/EditProject
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },

  // ✅ CONSISTENT: Scroll styles matching reference
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 140, // Clear space for footer
  },

  // Image container (unique to this screen)
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

  // ✅ CONSISTENT: Content padding
  content: {
    padding: Theme.spacing.m,
  },

  // ✅ CONSISTENT: Section styles matching reference
  section: {
    marginBottom: Theme.spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.m,
  },

  // ✅ CONSISTENT: Footer matching reference exactly
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    ...Theme.shadows.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,
    paddingTop: Theme.spacing.m,
    paddingBottom: Theme.spacing.m,
  },
  footerButton: {
    flex: 1,
  },
});
