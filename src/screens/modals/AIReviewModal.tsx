/**
 * VisionFlow AI - AI Review Modal (v6.0 - Hidden Inside UI Edition)
 * Enhanced AI review interface with cyberpunk aesthetic
 * 
 * @module modals/AIReviewModal
 * 
 * CHANGELOG v6.0:
 * - ✅ UI ENHANCEMENT: Monospace fonts for technical labels
 * - ✅ UI ENHANCEMENT: Italic text for descriptive content
 * - ✅ UI ENHANCEMENT: Enhanced loading spinner with monospace
 * - ✅ UI ENHANCEMENT: Blue glow borders on cards
 * - ✅ UI ENHANCEMENT: Section labels with wider letter-spacing
 * - ✅ All v5.0 edge detection and analysis fixes preserved
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../../types/navigation.types';
import { Theme } from '../../constants/theme';
import {
  Container,
  Text,
  Button,
  Card,
  Icon,
  LoadingSpinner,
} from '../../components';
import { ReminderCategory, ReminderPriority, ReminderStatus } from '../../types/reminder.types';
import * as GeminiService from '../../services/gemini.service';
import * as FileSystem from 'expo-file-system/legacy';
import { useReminders } from '../../hooks/useReminders';
import { usePatterns } from '../../hooks/usePatterns';
import { AIPatternAnalysis, PatternType } from '../../types/pattern.types';

type AIReviewModalProps = NativeStackScreenProps<RootStackParamList, 'AIReviewModal'>;

const DEBUG_MODE = false;

enum ErrorType {
  NETWORK = 'network',
  IMAGE_QUALITY = 'image_quality',
  PARSING = 'parsing',
  API_LIMIT = 'api_limit',
  EDGE_DETECTION = 'edge_detection',
  UNKNOWN = 'unknown',
}

interface SmartError {
  type: ErrorType;
  title: string;
  message: string;
  suggestion: string;
  icon: string;
  retryable: boolean;
}

function categorizeError(error: any): SmartError {
  const errorMessage = error?.message || error?.toString() || '';
  const errorString = errorMessage.toLowerCase();

  if (
    errorString.includes('network') ||
    errorString.includes('connection') ||
    errorString.includes('timeout') ||
    errorString.includes('fetch failed')
  ) {
    return {
      type: ErrorType.NETWORK,
      title: 'Connection Issue',
      message: 'Unable to reach AI service',
      suggestion: 'Check your internet connection and try again',
      icon: 'cloud-offline-outline',
      retryable: true,
    };
  }

  if (
    errorString.includes('blurry') ||
    errorString.includes('blur') ||
    errorString.includes('unclear') ||
    errorString.includes('quality') ||
    errorString.includes('unreadable') ||
    errorString.includes('no text detected')
  ) {
    return {
      type: ErrorType.IMAGE_QUALITY,
      title: 'Image Quality Issue',
      message: 'Photo is too blurry or unclear',
      suggestion: 'Retake with better lighting and focus. Hold steady and ensure text is clearly visible.',
      icon: 'camera-outline',
      retryable: false,
    };
  }

  if (
    errorString.includes('json') ||
    errorString.includes('parse') ||
    errorString.includes('unexpected token') ||
    errorString.includes('unexpected end')
  ) {
    return {
      type: ErrorType.PARSING,
      title: 'Analysis Failed',
      message: 'AI couldn\'t extract clear information',
      suggestion: 'Try retaking the photo with better composition. Ensure the content is well-framed and visible.',
      icon: 'scan-outline',
      retryable: true,
    };
  }

  if (
    errorString.includes('rate limit') ||
    errorString.includes('quota') ||
    errorString.includes('429') ||
    errorString.includes('too many requests')
  ) {
    return {
      type: ErrorType.API_LIMIT,
      title: 'Service Limit Reached',
      message: 'Too many requests in a short time',
      suggestion: 'Please wait a moment and try again',
      icon: 'timer-outline',
      retryable: true,
    };
  }

  if (
    errorString.includes('edge') ||
    errorString.includes('processing') ||
    errorString.includes('image_processing')
  ) {
    return {
      type: ErrorType.EDGE_DETECTION,
      title: 'Image Processing Issue',
      message: 'Edge detection encountered an error',
      suggestion: 'The analysis will continue without edge enhancement. You can still save the pattern.',
      icon: 'scan-outline',
      retryable: true,
    };
  }

  return {
    type: ErrorType.UNKNOWN,
    title: 'Analysis Error',
    message: 'AI couldn\'t process the image',
    suggestion: 'You can edit the details manually below, or retake the photo',
    icon: 'alert-circle-outline',
    retryable: true,
  };
}

export function AIReviewModal({ navigation, route }: AIReviewModalProps) {
  const { imageUri, analysisType } = route.params;
  const { createReminder } = useReminders();
  const { createPattern } = usePatterns();
  const insets = useSafeAreaInsets();

  const titleInputRef = useRef<TextInput>(null);
  const noteInputRef = useRef<TextInput>(null);
  const dateInputRef = useRef<TextInput>(null);
  const timeInputRef = useRef<TextInput>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisError, setAnalysisError] = useState<SmartError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [patternAnalysisResult, setPatternAnalysisResult] = useState<AIPatternAnalysis | null>(null);
  const [processedImages, setProcessedImages] = useState<{
    original: string;
    edges: string;
    width: number;
    height: number;
  } | null>(null);

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<ReminderCategory>(ReminderCategory.PERSONAL);
  const [priority, setPriority] = useState<ReminderPriority>(ReminderPriority.MEDIUM);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [emoji, setEmoji] = useState('📝');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!DEBUG_MODE) {
      analyzeImage();
    } else {
      setIsAnalyzing(false);
    }
  }, []);

  const imageToBase64 = async (uri: string): Promise<string> => {
    try {
      if (!uri || typeof uri !== 'string') {
        throw new Error('Invalid image URI');
      }

      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('IMAGE_NOT_FOUND');
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64 || base64.length < 1000) {
        throw new Error('IMAGE_QUALITY');
      }

      return base64;
    } catch (error) {
      throw error;
    }
  };

  const analyzeImage = async () => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      if (analysisType === 'reminder') {
        const base64 = await imageToBase64(imageUri);
        const result = await GeminiService.analyzeReminderImage(base64);
        
        if (!result.title && !result.smartNote) {
          throw new Error('NO_TEXT_DETECTED');
        }
        
        setTitle(result.title || 'Untitled Reminder');
        setNote(result.smartNote || '');
        setCategory(result.category || ReminderCategory.PERSONAL);
        setPriority(ReminderPriority.MEDIUM);
        setReminderDate(result.reminderDate || '');
        setReminderTime(result.reminderTime || '');
        setEmoji(result.emoji || '📝');

      } else {
        console.log('[AIReviewModal] Starting complete pattern analysis with edge detection...');
        
        const result = await GeminiService.analyzePatternImageComplete(imageUri);
        
        if (!result.analysis.patterns || result.analysis.patterns.length === 0) {
          throw new Error('NO_PATTERNS');
        }

        console.log('[AIReviewModal] Pattern analysis successful');
        console.log(`[AIReviewModal] Detected ${result.analysis.patterns.length} pattern(s)`);
        console.log(`[AIReviewModal] Image dimensions: ${result.images.width}x${result.images.height}`);
        console.log(`[AIReviewModal] Edge detection applied: ${result.analysis.metadata.edgeDetectionApplied}`);

        setPatternAnalysisResult(result.analysis);
        setProcessedImages(result.images);
        
        const firstPattern = result.analysis.patterns[0];
        setTitle(firstPattern?.name || 'Pattern');
        setNote(result.analysis.insights?.explanation || '');
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
    } catch (error: any) {
      console.error('[AIReviewModal] Analysis failed:', error);
      const smartError = categorizeError(error);
      setAnalysisError(smartError);
      
      if (!title) setTitle('');
      if (!note) setNote('');
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for this item.');
      return;
    }

    try {
      setIsSaving(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (analysisType === 'reminder') {
        await createReminder({
          id: `reminder_${Date.now()}`,
          title: title.trim(),
          smartNote: note.trim(),
          category,
          subcategory: category,
          priority,
          reminderDate: reminderDate || new Date().toISOString().split('T')[0],
          reminderTime: reminderTime || '12:00',
          imageUri: imageUri,
          emoji,
          status: ReminderStatus.UPCOMING,
          notificationEnabled: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as any);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        navigation.navigate('MainApp', {
          screen: 'RemindersTab',
          params: {
            screen: 'ReminderList',
            params: {},
          },
        });

      } else {
        if (patternAnalysisResult && processedImages) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          navigation.replace('PatternResultsScreen', {
            analysisResult: patternAnalysisResult,
            processedImages: processedImages,
          });

        } else {
          await createPattern({
            id: `pattern_${Date.now()}`,
            name: title.trim(),
            type: PatternType.CUSTOM,
            anchors: [],
            measurements: {},
            source: 'manual',
            imageUri: imageUri,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            userNotes: note.trim(),
          } as any);

          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          navigation.navigate('MainApp', {
            screen: 'PatternsTab',
            params: {
              screen: 'PatternLibrary',
              params: {},
            },
          });
        }
      }

    } catch (error: any) {
      console.error('[AIReviewModal] Save failed:', error);
      Alert.alert('Save Failed', error.message || 'Failed to save. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to discard this capture?',
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

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    analyzeImage();
  };

  const handleRecapture = () => {
    navigation.goBack();
  };

  const categoryConfig = {
    [ReminderCategory.PERSONAL]: { icon: 'person', color: Theme.colors.primary[500] },
    [ReminderCategory.WORK]: { icon: 'briefcase', color: Theme.colors.semantic.info },
    [ReminderCategory.HEALTH]: { icon: 'fitness', color: Theme.colors.semantic.success },
    [ReminderCategory.MONEY]: { icon: 'cash', color: Theme.colors.semantic.warning },
  };

  const priorityConfig = {
    [ReminderPriority.LOW]: { icon: 'chevron-down', color: Theme.colors.text.tertiary },
    [ReminderPriority.MEDIUM]: { icon: 'remove', color: Theme.colors.semantic.info },
    [ReminderPriority.HIGH]: { icon: 'chevron-up', color: Theme.colors.semantic.warning },
    [ReminderPriority.URGENT]: { icon: 'warning', color: Theme.colors.semantic.error },
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Theme.spacing.m }]}>
        <TouchableOpacity onPress={handleDiscard} style={styles.headerButton}>
          <Icon name="close" size="md" color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {/* ✅ ENHANCED: Monospace header */}
          <Text variant="h4" weight="600" mono>
            {analysisType === 'reminder' ? 'REVIEW_REMINDER' : 'REVIEW_PATTERN'}
          </Text>
          {/* ✅ NEW: Italic subtitle with dynamic state */}
          <Text variant="caption" color="tertiary" italic>
            {isAnalyzing ? 'AI processing...' : analysisError ? 'Edit manually below' : 'Verify AI suggestions'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
      >
        <Container padding="m">
          {/* ✅ ENHANCED: Image card with glow border */}
          <Card variant="glowBorder" elevation="sm" style={styles.imageCard}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <View style={styles.imageOverlay}>
              <View style={[
                styles.modeBadge,
                { backgroundColor: analysisType === 'reminder' 
                  ? Theme.colors.primary[500] 
                  : Theme.colors.semantic.warning 
                }
              ]}>
                <Icon 
                  name={analysisType === 'reminder' ? 'notifications' : 'sparkles'} 
                  size="sm" 
                  color={Theme.colors.background.primary} 
                />
                {/* ✅ ENHANCED: Monospace badge label */}
                <Text variant="caption" weight="700" mono customColor={Theme.colors.background.primary}>
                  {analysisType === 'reminder' ? 'REMINDER' : 'PATTERN'}
                </Text>
              </View>
            </View>
          </Card>

          {/* ✅ ENHANCED: Loading state with monospace text */}
          {isAnalyzing && (
            <Card variant="glass" elevation="md" style={styles.analysisCard}>
              <View style={styles.analysisIconContainer}>
                <Icon name="sparkles" size="md" color={Theme.colors.primary[500]} />
              </View>
              <View style={styles.analysisContent}>
                {/* ✅ ENHANCED: Monospace loading title */}
                <Text variant="bodyLarge" weight="600" mono>ANALYZING_IMAGE</Text>
                {/* ✅ NEW: Italic loading message */}
                <Text variant="caption" color="secondary" italic>
                  {retryCount > 0 
                    ? `Retry attempt ${retryCount}...` 
                    : analysisType === 'pattern'
                      ? 'Detecting patterns and processing edges...'
                      : 'AI is extracting information...'}
                </Text>
              </View>
              <LoadingSpinner size="small" />
            </Card>
          )}

          {/* ✅ ENHANCED: Error card with better styling */}
          {analysisError && (
            <Card variant="glass" elevation="md" style={styles.errorCard}>
              <View style={styles.errorHeader}>
                <View style={styles.errorIconContainer}>
                  <Icon name={analysisError.icon as any} size="md" color={Theme.colors.semantic.error} />
                </View>
                <View style={styles.errorContent}>
                  {/* ✅ ENHANCED: Monospace error title */}
                  <Text variant="bodyLarge" weight="600" mono>{analysisError.title}</Text>
                  {/* ✅ NEW: Italic error message */}
                  <Text variant="body" color="secondary" italic style={{ marginTop: 4 }}>
                    {analysisError.message}
                  </Text>
                </View>
              </View>
              
              <View style={styles.suggestionBox}>
                <Icon name="bulb-outline" size="sm" color={Theme.colors.secondary[500]} />
                {/* ✅ NEW: Italic suggestion */}
                <Text variant="caption" color="secondary" italic style={{ flex: 1, marginLeft: 8 }}>
                  {analysisError.suggestion}
                </Text>
              </View>

              <View style={styles.errorActions}>
                {analysisError.type === ErrorType.IMAGE_QUALITY ? (
                  <Button
                    label="Retake Photo"
                    variant="outline"
                    size="medium"
                    leftIcon="camera"
                    onPress={handleRecapture}
                    fullWidth
                  />
                ) : analysisError.retryable ? (
                  <Button
                    label="Try Again"
                    variant="outline"
                    size="medium"
                    leftIcon="refresh"
                    onPress={handleRetry}
                    fullWidth
                  />
                ) : null}
              </View>
            </Card>
          )}

          {!isAnalyzing && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="document-text-outline" size="sm" color={Theme.colors.primary[500]} />
                  {/* ✅ ENHANCED: Monospace section header */}
                  <Text variant="h4" mono>DETAILS</Text>
                  {analysisError && (
                    <View style={styles.manualBadge}>
                      {/* ✅ ENHANCED: Monospace badge */}
                      <Text variant="micro" mono customColor={Theme.colors.secondary[500]}>
                        MANUAL_ENTRY
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  {/* ✅ ENHANCED: Monospace input label with wider spacing */}
                  <Text variant="caption" color="secondary" weight="700" mono style={styles.inputLabel}>
                    TITLE
                  </Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      ref={titleInputRef}
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Enter title"
                      placeholderTextColor={Theme.colors.text.tertiary}
                      style={styles.textInput}
                      returnKeyType="next"
                      onSubmitEditing={() => noteInputRef.current?.focus()}
                      blurOnSubmit={false}
                      autoCorrect={false}
                      autoCapitalize="sentences"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  {/* ✅ ENHANCED: Monospace input label */}
                  <Text variant="caption" color="secondary" weight="700" mono style={styles.inputLabel}>
                    DESCRIPTION
                  </Text>
                  <View style={[styles.inputWrapper, styles.multilineWrapper]}>
                    <TextInput
                      ref={noteInputRef}
                      value={note}
                      onChangeText={setNote}
                      placeholder="Enter description or notes"
                      placeholderTextColor={Theme.colors.text.tertiary}
                      style={[styles.textInput, styles.multilineInput]}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      blurOnSubmit={false}
                      autoCorrect={false}
                    />
                  </View>
                </View>
              </View>

              {analysisType === 'reminder' && (
                <>
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Icon name="pricetags-outline" size="sm" color={Theme.colors.primary[500]} />
                      {/* ✅ ENHANCED: Monospace section header */}
                      <Text variant="h4" mono>CATEGORY</Text>
                    </View>
                    
                    <View style={styles.categoryGrid}>
                      {Object.entries(categoryConfig).map(([cat, config]) => {
                        const isSelected = category === cat;
                        return (
                          <TouchableOpacity
                            key={cat}
                            onPress={() => setCategory(cat as ReminderCategory)}
                            activeOpacity={0.7}
                            style={[
                              styles.categoryChip,
                              isSelected ? { 
                                backgroundColor: config.color,
                                borderColor: config.color 
                              } : {},
                            ]}
                          >
                            <Icon 
                              name={config.icon as any} 
                              size="sm" 
                              color={isSelected ? Theme.colors.background.primary : config.color} 
                            />
                            {/* ✅ ENHANCED: Monospace chip label */}
                            <Text
                              variant="caption"
                              weight="700"
                              mono
                              customColor={
                                isSelected
                                  ? Theme.colors.background.primary
                                  : Theme.colors.text.primary
                              }
                            >
                              {cat}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Icon name="flag-outline" size="sm" color={Theme.colors.primary[500]} />
                      {/* ✅ ENHANCED: Monospace section header */}
                      <Text variant="h4" mono>PRIORITY</Text>
                    </View>
                    
                    <View style={styles.priorityGrid}>
                      {Object.entries(priorityConfig).map(([prio, config]) => {
                        const isSelected = priority === prio;
                        return (
                          <TouchableOpacity
                            key={prio}
                            onPress={() => setPriority(prio as ReminderPriority)}
                            activeOpacity={0.7}
                            style={[
                              styles.priorityChip,
                              isSelected ? {
                                backgroundColor: config.color,
                                borderColor: config.color,
                              } : {},
                            ]}
                          >
                            <Icon 
                              name={config.icon as any} 
                              size="sm" 
                              color={isSelected ? Theme.colors.background.primary : config.color} 
                            />
                            {/* ✅ ENHANCED: Monospace chip label */}
                            <Text
                              variant="caption"
                              weight="700"
                              mono
                              customColor={
                                isSelected
                                  ? Theme.colors.background.primary
                                  : Theme.colors.text.primary
                              }
                            >
                              {prio}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Icon name="calendar-outline" size="sm" color={Theme.colors.primary[500]} />
                      {/* ✅ ENHANCED: Monospace section header */}
                      <Text variant="h4" mono>SCHEDULE</Text>
                    </View>
                    
                    <View style={styles.dateTimeRow}>
                      <View style={[styles.inputContainer, { flex: 2 }]}>
                        {/* ✅ ENHANCED: Monospace input label */}
                        <Text variant="caption" color="secondary" weight="700" mono style={styles.inputLabel}>
                          DATE
                        </Text>
                        <View style={styles.inputWrapper}>
                          <TextInput
                            ref={dateInputRef}
                            value={reminderDate}
                            onChangeText={setReminderDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={Theme.colors.text.tertiary}
                            style={styles.textInput}
                            returnKeyType="next"
                            blurOnSubmit={false}
                            onSubmitEditing={() => timeInputRef.current?.focus()}
                          />
                        </View>
                      </View>
                      <View style={[styles.inputContainer, { flex: 1 }]}>
                        {/* ✅ ENHANCED: Monospace input label */}
                        <Text variant="caption" color="secondary" weight="700" mono style={styles.inputLabel}>
                          TIME
                        </Text>
                        <View style={styles.inputWrapper}>
                          <TextInput
                            ref={timeInputRef}
                            value={reminderTime}
                            onChangeText={setReminderTime}
                            placeholder="HH:MM"
                            placeholderTextColor={Theme.colors.text.tertiary}
                            style={styles.textInput}
                            returnKeyType="done"
                            blurOnSubmit={false}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </>
          )}
        </Container>
      </ScrollView>

      {/* Footer */}
      {!isAnalyzing && (
        <View style={[styles.footerContainer, { paddingBottom: insets.bottom + Theme.spacing.m }]}>
          <View style={styles.footer}>
            <View style={styles.footerButton}>
              <Button
                label="Discard"
                variant="outline"
                size="large"
                leftIcon="trash-outline"
                onPress={handleDiscard}
                disabled={isSaving}
                fullWidth
              />
            </View>
            <View style={styles.footerButton}>
              <Button
                label={isSaving ? 'Processing...' : analysisType === 'pattern' ? 'View Results' : 'Save'}
                variant="primary"
                size="large"
                leftIcon={analysisType === 'pattern' ? 'eye' : 'checkmark'}
                onPress={handleSave}
                disabled={isSaving}
                loading={isSaving}
                fullWidth
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.m,
    paddingBottom: Theme.spacing.m,
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

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 140,
  },

  inputContainer: {
    marginBottom: Theme.spacing.m,
  },
  // ✅ ENHANCED: Wider letter-spacing for input labels
  inputLabel: {
    marginBottom: 6,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 2, // Increased from 0.5
  },
  inputWrapper: {
    height: 48,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    paddingHorizontal: Theme.spacing.m,
    justifyContent: 'center',
  },
  multilineWrapper: {
    height: 120,
    paddingVertical: Theme.spacing.m,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.text.primary,
    fontFamily: Theme.typography.fontFamily.mono,
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: 0,
  },

  imageCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Theme.spacing.m,
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: Theme.colors.background.tertiary,
  },
  imageOverlay: {
    position: 'absolute',
    top: Theme.spacing.m,
    right: Theme.spacing.m,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.full,
  },

  analysisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
    backgroundColor: `${Theme.colors.primary[500]}10`,
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  analysisIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.l,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisContent: {
    flex: 1,
    gap: 2,
  },

  errorCard: {
    marginBottom: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.error}08`,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.error}30`,
  },
  errorHeader: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  errorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.l,
    backgroundColor: `${Theme.colors.semantic.error}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContent: {
    flex: 1,
  },
  suggestionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Theme.spacing.m,
    backgroundColor: `${Theme.colors.secondary[500]}10`,
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.secondary[500]}30`,
    marginBottom: Theme.spacing.m,
  },
  errorActions: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
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
  manualBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: `${Theme.colors.secondary[500]}20`,
    borderRadius: Theme.borderRadius.s,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 2,
    borderColor: Theme.colors.border.medium,
    minWidth: 100,
  },

  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 2,
    borderColor: Theme.colors.border.medium,
    minWidth: 100,
  },

  dateTimeRow: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
  },

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
