/**
 * VisionFlow AI - AI Review Modal (FIXED)
 * Review and edit AI-extracted data before saving
 * * @module screens/modals/AIReviewModal
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

/**
 * AIReviewModal Component
 * * Features:
 * - Display captured image
 * - AI analysis with loading state
 * - Editable extracted fields
 * - Category/priority selection
 * - Date/time picker
 * - Save to reminders or patterns
 */
export function AIReviewModal({ navigation, route }: AIReviewModalProps) {
  const { imageUri, analysisType } = route.params;
  const { createReminder } = useReminders();
  const { createPattern } = usePatterns();

  // State - AI Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // State - Extracted Data (for reminder)
  const [title, setTitle] = useState('');
  const [note, setNote] = useState(''); // Use 'smartNote' field name
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
      // FIXED: Use string literal 'base64' instead of FileSystem.EncodingType.Base64
      // This avoids TypeScript namespace import issues
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

      // Convert image to base64
      const base64 = await imageToBase64(imageUri);

      if (analysisType === 'reminder') {
        // Analyze as reminder
        const result = await GeminiService.analyzeReminderImage(base64);
        
        // Populate fields with AI suggestions (use correct property names)
        setTitle(result.title || '');
        setNote(result.smartNote || ''); // AI returns smartNote
        setCategory(result.category || ReminderCategory.PERSONAL);
        setPriority(ReminderPriority.MEDIUM); // Default since AI doesn't return priority
        setReminderDate(result.reminderDate || '');
        setReminderTime(result.reminderTime || '');
        setEmoji(result.emoji || '📝');
      } else {
        // Analyze as pattern
        const result = await GeminiService.analyzePatternImage(base64);
        // Use first pattern's name from the patterns array
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
    // Validation
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title.');
      return;
    }

    try {
      setIsSaving(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (analysisType === 'reminder') {
        // Create reminder
        await createReminder({
          id: `reminder_${Date.now()}`,
          title: title.trim(),
          smartNote: note.trim(),
          category,
          subcategory: category, // Use same as category for now
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
        
        // Navigate back to reminders list
        navigation.navigate('MainApp', {
          screen: 'RemindersTab',
          params: {
            screen: 'ReminderList',
            params: {},
          },
        });
      } else {
        // Create pattern
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

  return (
    <Screen safeAreaTop safeAreaBottom={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleDiscard}>
            <Icon name="close" size="md" color={Theme.colors.text.primary} />
          </Pressable>
          <Text variant="h4" weight="600">
            {analysisType === 'reminder' ? 'Review Reminder' : 'Review Pattern'}
          </Text>
          <View style={{ width: 24 }} />
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
            </Card>

            {/* AI Analysis Status */}
            {isAnalyzing && (
              <Card style={styles.analysisCard}>
                <LoadingSpinner size="small" />
                <Text variant="body" color="secondary" style={styles.analysisText}>
                  AI is analyzing your image...
                </Text>
              </Card>
            )}

            {analysisError && (
              <Card style={styles.errorCard}>
                <Icon name="warning-outline" size="md" color={Theme.colors.semantic.warning} />
                <View style={styles.errorContent}>
                  <Text variant="bodyLarge" weight="600">
                    Analysis Failed
                  </Text>
                  <Text variant="caption" color="secondary">
                    {analysisError}
                  </Text>
                </View>
                <Button
                  label="Retry"
                  variant="outline"
                  size="small"
                  onPress={handleRetry}
                />
              </Card>
            )}

            {/* Editable Fields */}
            {!isAnalyzing && (
              <>
                <Text variant="h4" style={styles.sectionTitle}>
                  Details
                </Text>

                <Input
                  label="Title"
                  placeholder="Enter title"
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                  containerStyle={styles.input}
                />

                <Input
                  label="Description"
                  placeholder="Enter description"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                  containerStyle={styles.input}
                />

                {analysisType === 'reminder' && (
                  <>
                    <Text variant="body" weight="600" style={styles.fieldLabel}>
                      Category
                    </Text>
                    <View style={styles.categoryGrid}>
                      {[ReminderCategory.PERSONAL, ReminderCategory.WORK, ReminderCategory.HEALTH, ReminderCategory.MONEY].map((cat) => (
                        <Pressable
                          key={cat}
                          onPress={() => setCategory(cat)}
                          style={[
                            styles.categoryChip,
                            ...(category === cat ? [styles.categoryChipActive] : []),
                          ]}
                        >
                          <Text
                            variant="caption"
                            weight="600"
                            customColor={
                              category === cat
                                ? Theme.colors.text.primary
                                : Theme.colors.text.secondary
                            }
                          >
                            {cat.toUpperCase()}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text variant="body" weight="600" style={styles.fieldLabel}>
                      Priority
                    </Text>
                    <View style={styles.priorityRow}>
                      {[ReminderPriority.LOW, ReminderPriority.MEDIUM, ReminderPriority.HIGH, ReminderPriority.URGENT].map((prio) => (
                        <Pressable
                          key={prio}
                          onPress={() => setPriority(prio)}
                          style={[
                            styles.priorityChip,
                            ...(priority === prio ? [styles.priorityChipActive] : []),
                          ]}
                        >
                          <Text
                            variant="caption"
                            weight="600"
                            customColor={
                              priority === prio
                                ? Theme.colors.text.primary
                                : Theme.colors.text.secondary
                            }
                          >
                            {prio.toUpperCase()}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <View style={styles.dateTimeRow}>
                      <Input
                        label="Date"
                        placeholder="YYYY-MM-DD"
                        value={reminderDate}
                        onChangeText={setReminderDate}
                        containerStyle={styles.dateInput}
                      />
                      <Input
                        label="Time"
                        placeholder="HH:MM"
                        value={reminderTime}
                        onChangeText={setReminderTime}
                        containerStyle={styles.timeInput}
                      />
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
            onPress={handleDiscard}
            style={styles.footerButton}
            disabled={isSaving}
          />
          <Button
            label={isSaving ? 'Saving...' : 'Save'}
            variant="primary"
            size="large"
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

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Theme.spacing.xl,
  },

  // Image
  imageCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Theme.spacing.m,
  },
  image: {
    width: '100%',
    height: 240,
    backgroundColor: Theme.colors.background.tertiary,
  },

  // Analysis Card
  analysisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  analysisText: {
    flex: 1,
  },

  // Error Card
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.warning}10`,
  },
  errorContent: {
    flex: 1,
  },

  // Form Fields
  sectionTitle: {
    marginTop: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  input: {
    marginBottom: Theme.spacing.m,
  },
  fieldLabel: {
    marginBottom: Theme.spacing.s,
    marginTop: Theme.spacing.s,
  },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.s,
    marginBottom: Theme.spacing.m,
  },
  categoryChip: {
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: Theme.colors.border.medium,
  },
  categoryChipActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },

  // Priority Row
  priorityRow: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
    marginBottom: Theme.spacing.m,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: Theme.spacing.s,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: Theme.colors.border.medium,
    alignItems: 'center',
  },
  priorityChipActive: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
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