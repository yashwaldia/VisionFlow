/**
 * VisionFlow AI - Data Management Screen (v4.0 - Production Fix)
 * Handle data backup, restoration, and storage management
 * 
 * @module screens/settings/DataManagementScreen
 * 
 * CHANGELOG v4.0:
 * - 🔧 CRITICAL FIX: Using expo-sharing instead of Share.share() for Android compatibility
 * - 🔧 FIXED: WhatsApp "empty message" error resolved
 * - 🔧 FIXED: Download option now appears in share sheet
 * - 🔧 FIXED: File properly written before sharing
 * - ✅ Works with WhatsApp, Email, Drive, all apps
 * 
 * CHANGELOG v3.0:
 * - ✅ Import function fully implemented
 * - ✅ Uses expo-document-picker for file selection
 * - ✅ Validates and confirms before import
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing'; // 🔧 CRITICAL: Use expo-sharing for file sharing

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

  // 🔧 FIXED: Export function using expo-sharing
  const handleExport = async () => {
    try {
      setIsProcessing(true);
      
      // Step 1: Get JSON data from storage service
      const jsonData = await StorageService.exportAllData();
      
      // Step 2: Generate timestamped filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `visionflow-backup-${timestamp}.json`;
      
      // Step 3: Create file and write data
      const file = new File(Paths.cache, filename);
      file.write(jsonData); // Synchronous write
      
      // Step 4: Verify file was created
      const fileExists = file.exists;  // ✅ No await, no parentheses
      if (!fileExists) {
        throw new Error('Failed to create backup file');
      }
      
      // Step 5: Check if sharing is available
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert(
          'Sharing Unavailable',
          'File sharing is not available on this device. The backup file has been created at: ' + file.uri
        );
        return;
      }
      
      // Step 6: Share the file using expo-sharing (works on both iOS and Android)
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Export VisionFlow Data',
        UTI: 'public.json', // iOS Universal Type Identifier
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

  // ✅ Import function (already working correctly)
  const handleImport = async () => {
    try {
      // Step 1: Pick file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      // User canceled
      if (result.canceled) {
        return;
      }

      // Get the selected file
      const pickedFile = result.assets[0];
      
      // Validate file extension
      if (!pickedFile.name.endsWith('.json')) {
        Alert.alert(
          'Invalid File',
          'Please select a valid JSON backup file (.json)'
        );
        return;
      }

      // Step 2: Show confirmation dialog
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

                // Step 3: Read file content
                const file = new File(pickedFile.uri);
                const fileContent = await file.text();

                // Step 4: Import data (validates and applies)
                await StorageService.importAllData(fileContent);

                // Step 5: Reload stats
                await loadStats();

                // Step 6: Success feedback
                await Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );

                Alert.alert(
                  'Import Successful',
                  'Your data has been restored from the backup file.'
                );
              } catch (error: any) {
                console.error('[DataManagement] Import failed:', error);
                
                // Handle specific error codes from storage service
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
          <Text variant="h4" weight="600">Data & Storage</Text>
          <Text variant="caption" color="tertiary">Manage your app data</Text>
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
              <Text variant="h4">Storage Usage</Text>
            </View>
            
            <Card elevation="sm" style={styles.statsCard}>
              <View style={styles.usageHeader}>
                <View style={styles.mainIconContainer}>
                  <Icon name="server" size="xl" color={Theme.colors.primary[500]} />
                </View>
                <View style={styles.usageInfo}>
                  <Text variant="h2" weight="700">{formatSize(stats.estimatedSizeBytes)}</Text>
                  <Text variant="caption" color="secondary">Total estimated size</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Icon name="notifications" size="sm" color={Theme.colors.primary[500]} />
                  </View>
                  <Text variant="h3" weight="700">{stats.remindersCount}</Text>
                  <Text variant="caption" color="tertiary">Reminders</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Icon name="analytics" size="sm" color={Theme.colors.semantic.info} />
                  </View>
                  <Text variant="h3" weight="700">{stats.patternsCount}</Text>
                  <Text variant="caption" color="tertiary">Patterns</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Icon name="folder" size="sm" color={Theme.colors.semantic.warning} />
                  </View>
                  <Text variant="h3" weight="700">{stats.projectsCount}</Text>
                  <Text variant="caption" color="tertiary">Projects</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Backup & Restore */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="sync-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Backup & Restore</Text>
            </View>
            
            <Card elevation="sm" style={styles.actionCard}>
              {/* Export */}
              <View style={styles.actionItem}>
                <View style={styles.actionHeader}>
                  <View style={styles.actionIconContainer}>
                    <Icon name="download" size="md" color={Theme.colors.semantic.success} />
                  </View>
                  <View style={styles.actionInfo}>
                    <Text variant="bodyLarge" weight="600">Export Data</Text>
                    <Text variant="caption" color="secondary" style={styles.actionDescription}>
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
                    <Text variant="bodyLarge" weight="600">Import Data</Text>
                    <Text variant="caption" color="secondary" style={styles.actionDescription}>
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
                <Text variant="caption" color="secondary" style={styles.infoText}>
                  Backups include all reminders, patterns, projects, and settings. Keep your backups safe and secure.
                </Text>
              </View>
            </Card>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="warning-outline" size="sm" color={Theme.colors.semantic.error} />
              <Text variant="h4" customColor={Theme.colors.semantic.error}>Danger Zone</Text>
            </View>
            
            <Card elevation="sm" style={styles.dangerCard}>
              <View style={styles.dangerHeader}>
                <View style={styles.dangerIconContainer}>
                  <Icon name="trash" size="lg" color={Theme.colors.semantic.error} />
                </View>
                <View style={styles.dangerInfo}>
                  <Text variant="h4" customColor={Theme.colors.semantic.error}>
                    Factory Reset
                  </Text>
                  <Text variant="caption" color="secondary" style={styles.dangerDescription}>
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
                <Text variant="caption" color="secondary" style={styles.infoText}>
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
