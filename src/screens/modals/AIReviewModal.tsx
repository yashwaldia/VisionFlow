/**
 * VisionFlow AI - AI Review Modal (Professional v2.0 - FIXED)
 * Review and edit AI-extracted data before saving
 * 
 * @module screens/modals/AIReviewModal
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../../types/navigation.types';
import { Theme } from '../../constants/theme';
import {
  Screen,
  Container,
  Text,
  Button,
  Input,
  Card,
  Icon,
  Pressable,
  LoadingSpinner,
} from '../../components';
import { ReminderCategory, ReminderPriority, ReminderStatus } from '../../types/reminder.types';
import * as GeminiService from '../../services/gemini.service';
import * as FileSystem from 'expo-file-system';
import { useReminders } from '../../hooks/useReminders';
import { usePatterns } from '../../hooks/usePatterns';
import { PatternType } from '../../types/pattern.types';

type AIReviewModalProps = NativeStackScreenProps<RootStackParamList, 'AIReviewModal'>;

export function AIReviewModal({ navigation, route }: AIReviewModalProps) {
  const { imageUri, analysisType } = route.params;
  const { createReminder } = useReminders();
  const { createPattern } = usePatterns();

  // State - AI Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // State - Extracted Data
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<ReminderCategory>(ReminderCategory.PERSONAL);
  const [priority, setPriority] = useState<ReminderPriority>(ReminderPriority.MEDIUM);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [emoji, setEmoji] = useState('📝');

  // State - Saving
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Perform AI analysis on mount
   */
  useEffect(() => {
    analyzeImage();
  }, []);

  /**
   * Convert image URI to base64
   */
  const imageToBase64 = async (uri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      return base64;
    } catch (error) {
      console.error('[AIReviewModal] Base64 conversion failed:', error);
      throw new Error('Failed to process image');
    }
  };

  /**
   * Analyze image with Gemini AI
   */
  const analyzeImage = async () => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      const base64 = await imageToBase64(imageUri);

      if (analysisType === 'reminder') {
        const result = await GeminiService.analyzeReminderImage(base64);
        
        setTitle(result.title || '');
        setNote(result.smartNote || '');
        setCategory(result.category || ReminderCategory.PERSONAL);
        setPriority(ReminderPriority.MEDIUM);
        setReminderDate(result.reminderDate || '');
        setReminderTime(result.reminderTime || '');
        setEmoji(result.emoji || '📝');
      } else {
        const result = await GeminiService.analyzePatternImage(base64);
        const firstPattern = result.patterns[0];
        setTitle(firstPattern?.name || 'Pattern');
        setNote(result.insights?.explanation || '');
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('[AIReviewModal] Analysis failed:', error);
      setAnalysisError(error.message || 'AI analysis failed. Please edit manually.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title.');
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
        await createPattern({
          id: `pattern_${Date.now()}`,
          name: title.trim(),
          type: PatternType.CUSTOM,
          anchors: [],
          measurements: {},
          source: 'ai',
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
    } catch (error: any) {
      console.error('[AIReviewModal] Save failed:', error);
      Alert.alert('Save Failed', error.message || 'Failed to save. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle discard
   */
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

  /**
   * Handle retry analysis
   */
  const handleRetry = () => {
    analyzeImage();
  };

  // Category config
  const categoryConfig = {
    [ReminderCategory.PERSONAL]: { icon: 'person', color: Theme.colors.primary[500] },
    [ReminderCategory.WORK]: { icon: 'briefcase', color: Theme.colors.semantic.info },
    [ReminderCategory.HEALTH]: { icon: 'fitness', color: Theme.colors.semantic.success },
    [ReminderCategory.MONEY]: { icon: 'cash', color: Theme.colors.semantic.warning },
  };

  // Priority config
  const priorityConfig = {
    [ReminderPriority.LOW]: { icon: 'chevron-down', color: Theme.colors.text.tertiary },
    [ReminderPriority.MEDIUM]: { icon: 'remove', color: Theme.colors.semantic.info },
    [ReminderPriority.HIGH]: { icon: 'chevron-up', color: Theme.colors.semantic.warning },
    [ReminderPriority.URGENT]: { icon: 'warning', color: Theme.colors.semantic.error },
  };

  return (
    <Screen safeAreaTop safeAreaBottom={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleDiscard} haptic="light" style={styles.headerButton}>
            <Icon name="close" size="md" color={Theme.colors.text.primary} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text variant="h4" weight="600">
              {analysisType === 'reminder' ? 'Review Reminder' : 'Review Pattern'}
            </Text>
            <Text variant="caption" color="tertiary">
              Edit AI suggestions
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Container padding="m">
            {/* Image Preview */}
            <Card style={styles.imageCard}>
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
                  <Text variant="caption" weight="700" customColor={Theme.colors.background.primary}>
                    {analysisType === 'reminder' ? 'REMINDER' : 'PATTERN'}
                  </Text>
                </View>
              </View>
            </Card>

            {/* AI Analysis Status */}
            {isAnalyzing && (
              <Card style={styles.analysisCard}>
                <View style={styles.analysisIconContainer}>
                  <Icon name="sparkles" size="md" color={Theme.colors.primary[500]} />
                </View>
                <View style={styles.analysisContent}>
                  <Text variant="bodyLarge" weight="600">Analyzing Image</Text>
                  <Text variant="caption" color="secondary">
                    AI is extracting information from your photo...
                  </Text>
                </View>
                <LoadingSpinner size="small" />
              </Card>
            )}

            {analysisError && (
              <Card style={styles.errorCard}>
                <View style={styles.errorIconContainer}>
                  <Icon name="warning" size="md" color={Theme.colors.semantic.error} />
                </View>
                <View style={styles.errorContent}>
                  <Text variant="bodyLarge" weight="600">Analysis Failed</Text>
                  <Text variant="caption" color="secondary">
                    {analysisError}
                  </Text>
                </View>
                <Pressable onPress={handleRetry} style={styles.retryButton} haptic="light">
                  <Icon name="refresh" size="sm" color={Theme.colors.primary[500]} />
                </Pressable>
              </Card>
            )}

            {/* Editable Fields */}
            {!isAnalyzing && (
              <>
                {/* Title & Description Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="document-text-outline" size="sm" color={Theme.colors.primary[500]} />
                    <Text variant="h4">Details</Text>
                  </View>

                  <Input
                    label="Title"
                    placeholder="Enter title"
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                    containerStyle={styles.input}
                    leftIcon="create-outline"
                  />

                  <Input
                    label="Description"
                    placeholder="Enter description or notes"
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={4}
                    containerStyle={styles.input}
                    leftIcon="chatbox-outline"
                  />
                </View>

                {analysisType === 'reminder' && (
                  <>
                    {/* Category Section */}
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Icon name="pricetags-outline" size="sm" color={Theme.colors.primary[500]} />
                        <Text variant="h4">Category</Text>
                      </View>
                      
                      <View style={styles.categoryGrid}>
                        {Object.entries(categoryConfig).map(([cat, config]) => {
                          const isSelected = category === cat;
                          return (
                            <Pressable
                            key={cat}
                            onPress={() => setCategory(cat as ReminderCategory)}
                            haptic="light"
                            style={[
                              styles.categoryChip,
                              // ✅ FIXED: Use conditional array spreading
                              ...(isSelected ? [{ 
                                backgroundColor: config.color,
                                borderColor: config.color 
                              }] : []),
                            ]}
                          >

                              <Icon 
                                name={config.icon as any} 
                                size="sm" 
                                color={isSelected ? Theme.colors.background.primary : config.color} 
                              />
                              <Text
                                variant="caption"
                                weight="700"
                                customColor={
                                  isSelected
                                    ? Theme.colors.background.primary
                                    : Theme.colors.text.primary
                                }
                              >
                                {cat}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    {/* Priority Section */}
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Icon name="flag-outline" size="sm" color={Theme.colors.primary[500]} />
                        <Text variant="h4">Priority</Text>
                      </View>
                      
                      <View style={styles.priorityGrid}>
                        {Object.entries(priorityConfig).map(([prio, config]) => {
                          const isSelected = priority === prio;
                          return (
                          <Pressable
                            key={prio}
                            onPress={() => setPriority(prio as ReminderPriority)}
                            haptic="light"
                            style={[
                              styles.priorityChip,
                              // ✅ FIXED: Use conditional array spreading
                              ...(isSelected ? [{
                                backgroundColor: config.color,
                                borderColor: config.color,
                              }] : []),
                            ]}
                          >

                              <Icon 
                                name={config.icon as any} 
                                size="sm" 
                                color={isSelected ? Theme.colors.background.primary : config.color} 
                              />
                              <Text
                                variant="caption"
                                weight="700"
                                customColor={
                                  isSelected
                                    ? Theme.colors.background.primary
                                    : Theme.colors.text.primary
                                }
                              >
                                {prio}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    {/* Date & Time Section */}
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Icon name="calendar-outline" size="sm" color={Theme.colors.primary[500]} />
                        <Text variant="h4">Schedule</Text>
                      </View>
                      
                      <View style={styles.dateTimeRow}>
                        <Input
                          label="Date"
                          placeholder="YYYY-MM-DD"
                          value={reminderDate}
                          onChangeText={setReminderDate}
                          containerStyle={styles.dateInput}
                          leftIcon="calendar"
                        />
                        <Input
                          label="Time"
                          placeholder="HH:MM"
                          value={reminderTime}
                          onChangeText={setReminderTime}
                          containerStyle={styles.timeInput}
                          leftIcon="time"
                        />
                      </View>
                    </View>
                  </>
                )}
              </>
            )}
          </Container>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Button
            label="Discard"
            variant="outline"
            size="large"
            leftIcon="trash-outline"
            onPress={handleDiscard}
            style={styles.footerButton}
            disabled={isSaving}
          />
          <Button
            label={isSaving ? 'Saving...' : 'Save'}
            variant="primary"
            size="large"
            leftIcon="checkmark"
            onPress={handleSave}
            style={styles.footerButtonPrimary}
            disabled={isAnalyzing || isSaving}
            loading={isSaving}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
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

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Image Preview
  imageCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Theme.spacing.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
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

  // Analysis Card
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

  // Error Card
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.error}10`,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.error}30`,
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
    gap: 2,
  },
  retryButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  section: {
    marginBottom: Theme.spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.m,
  },
  input: {
    marginBottom: Theme.spacing.m,
  },

  // Category Grid
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

  // Priority Grid
  priorityGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
  },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 2,
    borderColor: Theme.colors.border.medium,
  },

  // Date/Time Row
  dateTimeRow: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
  },
  dateInput: {
    flex: 2,
  },
  timeInput: {
    flex: 1,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
  },
  footerButton: {
    flex: 1,
  },
  footerButtonPrimary: {
    flex: 2,
  },
});
