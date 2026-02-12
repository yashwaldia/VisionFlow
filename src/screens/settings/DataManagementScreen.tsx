/**
 * VisionFlow AI - Data Management Screen (v5.0 - Hidden Inside UI Edition)
 * Enhanced cyberpunk aesthetic with monospace and italic typography
 * 
 * @module screens/settings/DataManagementScreen
 * 
 * CHANGELOG v5.0:
 * - ✅ UI ENHANCEMENT: Monospace fonts for technical labels
 * - ✅ UI ENHANCEMENT: Italic text for descriptive content
 * - ✅ All v4.0 production fixes preserved (expo-sharing)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

import { SettingsStackParamList } from '../../types/navigation.types';
import { Theme } from '../../constants/theme';
import {
  Screen,
  Container,
  Text,
  Card,
  Icon,
  Button,
  Pressable,
  LoadingSpinner,
} from '../../components';
import * as StorageService from '../../services/storage.service';

type DataManagementScreenProps = NativeStackScreenProps<SettingsStackParamList, 'DataManagement'>;

export function DataManagementScreen({ navigation }: DataManagementScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    remindersCount: 0,
    patternsCount: 0,
    projectsCount: 0,
    estimatedSizeBytes: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const storageStats = await StorageService.getStorageStats();
      setStats(storageStats);
    } catch (error) {
      console.error('[DataManagement] Failed to load stats:', error);
      Alert.alert('Error', 'Failed to calculate storage usage');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Export function using expo-sharing
  const handleExport = async () => {
    try {
      setIsProcessing(true);
      
      const jsonData = await StorageService.exportAllData();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `visionflow-backup-${timestamp}.json`;
      
      const file = new File(Paths.cache, filename);
      file.write(jsonData);
      
      const fileExists = file.exists;
      if (!fileExists) {
        throw new Error('Failed to create backup file');
      }
      
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert(
          'Sharing Unavailable',
          'File sharing is not available on this device. The backup file has been created at: ' + file.uri
        );
        return;
      }
      
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Export VisionFlow Data',
        UTI: 'public.json',
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
    } catch (error) {
      console.error('[DataManagement] Export failed:', error);
      Alert.alert(
        'Export Failed',
        'Could not generate backup data. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Import function
  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const pickedFile = result.assets[0];
      
      if (!pickedFile.name.endsWith('.json')) {
        Alert.alert(
          'Invalid File',
          'Please select a valid JSON backup file (.json)'
        );
        return;
      }

      Alert.alert(
        'Confirm Import',
        `This will replace all current data with data from:\n\n"${pickedFile.name}"\n\nYour current data will be permanently lost. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsProcessing(true);

                const file = new File(pickedFile.uri);
                const fileContent = await file.text();

                await StorageService.importAllData(fileContent);
                await loadStats();

                await Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );

                Alert.alert(
                  'Import Successful',
                  'Your data has been restored from the backup file.'
                );
              } catch (error: any) {
                console.error('[DataManagement] Import failed:', error);
                
                const errorMessage = error.code === 'IMPORT_ERROR'
                  ? 'The backup file is corrupted or invalid. Please try a different file.'
                  : 'Could not import data. Please try again.';

                Alert.alert('Import Failed', errorMessage);
              } finally {
                setIsProcessing(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('[DataManagement] File picker error:', error);
      Alert.alert(
        'Error',
        'Could not open file picker. Please try again.'
      );
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Factory Reset',
      'Are you sure you want to delete ALL data? This includes reminders, patterns, projects, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await StorageService.clearAllData();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              setStats({
                remindersCount: 0,
                patternsCount: 0,
                projectsCount: 0,
                estimatedSizeBytes: 0,
              });
              
              Alert.alert('Data Cleared', 'Application has been reset to factory settings.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <Screen>
        <Container center>
          <LoadingSpinner text="Analyzing storage..." />
        </Container>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} haptic="light" style={styles.headerButton}>
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          {/* ✅ ENHANCED: Monospace header */}
          <Text variant="h4" weight="600" mono>DATA_&_STORAGE</Text>
          {/* ✅ NEW: Italic subtitle */}
          <Text variant="caption" color="tertiary" italic>Manage your app data</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="m">
          
          {/* Storage Overview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="pie-chart-outline" size="sm" color={Theme.colors.primary[500]} />
              {/* ✅ ENHANCED: Monospace section header */}
              <Text variant="h4" mono>STORAGE_USAGE</Text>
            </View>
            
            <Card elevation="sm" style={styles.statsCard}>
              <View style={styles.usageHeader}>
                <View style={styles.mainIconContainer}>
                  <Icon name="server" size="xl" color={Theme.colors.primary[500]} />
                </View>
                <View style={styles.usageInfo}>
                  {/* ✅ ENHANCED: Monospace size display */}
                  <Text variant="h2" weight="700" mono>{formatSize(stats.estimatedSizeBytes)}</Text>
                  {/* ✅ NEW: Italic description */}
                  <Text variant="caption" color="secondary" italic>Total estimated size</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Icon name="notifications" size="sm" color={Theme.colors.primary[500]} />
                  </View>
                  {/* ✅ ENHANCED: Monospace count */}
                  <Text variant="h3" weight="700" mono>{stats.remindersCount}</Text>
                  {/* ✅ ENHANCED: Monospace label */}
                  <Text variant="caption" color="tertiary" mono>REMINDERS</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Icon name="analytics" size="sm" color={Theme.colors.semantic.info} />
                  </View>
                  {/* ✅ ENHANCED: Monospace count */}
                  <Text variant="h3" weight="700" mono>{stats.patternsCount}</Text>
                  {/* ✅ ENHANCED: Monospace label */}
                  <Text variant="caption" color="tertiary" mono>PATTERNS</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Backup & Restore */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="sync-outline" size="sm" color={Theme.colors.primary[500]} />
              {/* ✅ ENHANCED: Monospace section header */}
              <Text variant="h4" mono>BACKUP_&_RESTORE</Text>
            </View>
            
            <Card elevation="sm" style={styles.actionCard}>
              {/* Export */}
              <View style={styles.actionItem}>
                <View style={styles.actionHeader}>
                  <View style={styles.actionIconContainer}>
                    <Icon name="download" size="md" color={Theme.colors.semantic.success} />
                  </View>
                  <View style={styles.actionInfo}>
                    {/* ✅ ENHANCED: Monospace action label */}
                    <Text variant="bodyLarge" weight="600" mono>EXPORT_DATA</Text>
                    {/* ✅ NEW: Italic description */}
                    <Text variant="caption" color="secondary" italic style={styles.actionDescription}>
                      Download JSON file with all your data
                    </Text>
                  </View>
                </View>
                <Button
                  label={isProcessing ? "Exporting..." : "Export Now"}
                  variant="outline"
                  size="medium"
                  onPress={handleExport}
                  disabled={isProcessing}
                  style={styles.actionButton}
                />
              </View>

              <View style={styles.actionDivider} />

              {/* Import */}
              <View style={styles.actionItem}>
                <View style={styles.actionHeader}>
                  <View style={styles.actionIconContainer}>
                    <Icon name="cloud-upload" size="md" color={Theme.colors.semantic.info} />
                  </View>
                  <View style={styles.actionInfo}>
                    {/* ✅ ENHANCED: Monospace action label */}
                    <Text variant="bodyLarge" weight="600" mono>IMPORT_DATA</Text>
                    {/* ✅ NEW: Italic description */}
                    <Text variant="caption" color="secondary" italic style={styles.actionDescription}>
                      Restore from previously exported file
                    </Text>
                  </View>
                </View>
                <Button
                  label={isProcessing ? "Importing..." : "Import File"}
                  variant="outline"
                  size="medium"
                  onPress={handleImport}
                  disabled={isProcessing}
                  style={styles.actionButton}
                />
              </View>
            </Card>

            {/* Info Card */}
            <Card elevation="sm" style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
                {/* ✅ NEW: Italic info text */}
                <Text variant="caption" color="secondary" italic style={styles.infoText}>
                  Backups include all reminders, patterns, projects, and settings. Keep your backups safe and secure.
                </Text>
              </View>
            </Card>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="warning-outline" size="sm" color={Theme.colors.semantic.error} />
              {/* ✅ ENHANCED: Monospace danger header */}
              <Text variant="h4" mono customColor={Theme.colors.semantic.error}>DANGER_ZONE</Text>
            </View>
            
            <Card elevation="sm" style={styles.dangerCard}>
              <View style={styles.dangerHeader}>
                <View style={styles.dangerIconContainer}>
                  <Icon name="trash" size="lg" color={Theme.colors.semantic.error} />
                </View>
                <View style={styles.dangerInfo}>
                  {/* ✅ ENHANCED: Monospace danger title */}
                  <Text variant="h4" mono customColor={Theme.colors.semantic.error}>
                    FACTORY_RESET
                  </Text>
                  {/* ✅ NEW: Italic danger description */}
                  <Text variant="caption" color="secondary" italic style={styles.dangerDescription}>
                    Permanently delete all local data. This action cannot be undone and will reset the app to its initial state.
                  </Text>
                </View>
              </View>
              
              <Button
                label="Delete All Data"
                variant="primary"
                size="large"
                leftIcon="trash-outline"
                onPress={handleClearData}
                disabled={isProcessing}
                style={styles.dangerButton}
              />
            </Card>

            {/* Warning Card */}
            <Card elevation="sm" style={styles.warningCard}>
              <View style={styles.infoRow}>
                <Icon name="alert-circle" size="sm" color={Theme.colors.semantic.warning} />
                {/* ✅ NEW: Italic warning text */}
                <Text variant="caption" color="secondary" italic style={styles.infoText}>
                  Make sure to export your data before performing a factory reset. Deleted data cannot be recovered.
                </Text>
              </View>
            </Card>
          </View>

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
  scrollContent: {
    paddingBottom: 120,
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
  statsCard: {
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  mainIconContainer: {
    width: 64,
    height: 64,
    borderRadius: Theme.borderRadius.l,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  usageInfo: {
    flex: 1,
    gap: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginVertical: Theme.spacing.m,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.s,
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: Theme.borderRadius.m,
    gap: 4,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}20`,
  },
  actionCard: {
    padding: Theme.spacing.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  actionItem: {
    gap: Theme.spacing.m,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.l,
    backgroundColor: Theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}20`,
  },
  actionInfo: {
    flex: 1,
    gap: 4,
  },
  actionDescription: {
    lineHeight: 16,
  },
  actionButton: {
    width: '100%',
  },
  actionDivider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginVertical: Theme.spacing.m,
  },
  infoCard: {
    marginTop: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.info}10`,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.info}30`,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.s,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
  dangerCard: {
    backgroundColor: `${Theme.colors.semantic.error}10`,
    borderWidth: 2,
    borderColor: `${Theme.colors.semantic.error}40`,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  dangerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.l,
    backgroundColor: `${Theme.colors.semantic.error}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${Theme.colors.semantic.error}40`,
  },
  dangerInfo: {
    flex: 1,
    gap: 4,
  },
  dangerDescription: {
    lineHeight: 18,
  },
  dangerButton: {
    backgroundColor: Theme.colors.semantic.error,
    borderColor: Theme.colors.semantic.error,
  },
  warningCard: {
    marginTop: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.warning}10`,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.warning}30`,
  },
});
