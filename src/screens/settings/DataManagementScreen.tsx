/**
 * VisionFlow AI - Data Management Screen (v2.1 - Harmonized Edition)
 * Handle data backup, restoration, and storage management
 * 
 * @module screens/settings/DataManagementScreen
 * 
 * CHANGELOG v2.1:
 * - ✅ Fixed main icon container opacity (15% → 20%)
 * - ✅ Added header shadow for separation
 * - ✅ Added card elevation for visual depth
 * - ✅ Scroll padding already adequate for tab bar (120px)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

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

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const jsonData = await StorageService.exportAllData();
      
      await Share.share({
        message: jsonData,
        title: 'VisionFlow AI Backup',
      });

    } catch (error) {
      console.error('[DataManagement] Export failed:', error);
      Alert.alert('Export Failed', 'Could not generate backup data.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    Alert.alert(
      'Import Feature Unavailable',
      'This feature requires the "expo-document-picker" package to be installed. Please add it to your project to enable file imports.'
    );
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
      {/* Header - ✅ ENHANCED: Added shadow */}
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

            {/* Info Card - ✅ ENHANCED: Added elevation */}
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

            {/* Warning Card - ✅ ENHANCED: Added elevation */}
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
  // Header styles - ✅ ENHANCED: Added shadow
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
    ...Theme.shadows.sm, // ✅ ADDED: Header shadow for depth
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
  
  // Scroll styles - ✅ Already adequate for tab bar (120px)
  scrollContent: {
    paddingBottom: 120,
  },
  
  // Section styles
  section: {
    marginBottom: Theme.spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.m,
  },
  
  // Stats card styles - ✅ Card elevation added via elevation="sm" prop + FIXED opacity
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
    backgroundColor: `${Theme.colors.primary[500]}20`, // ✅ FIXED: 20% opacity (was 15%)
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
  
  // Action card styles - ✅ Card elevation added via elevation="sm" prop
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
  
  // Info card styles - ✅ Card elevation added via elevation="sm" prop
  infoCard: {
    marginTop: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.info}10`, // ✅ Kept at 10% (intentionally subtle)
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
  
  // Danger card styles - ✅ Card elevation added via elevation="sm" prop
  dangerCard: {
    backgroundColor: `${Theme.colors.semantic.error}10`, // ✅ Kept at 10% (intentionally subtle)
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
    backgroundColor: `${Theme.colors.semantic.error}20`, // ✅ Already correct at 20%
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
  
  // Warning card styles - ✅ Card elevation added via elevation="sm" prop
  warningCard: {
    marginTop: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.warning}10`, // ✅ Kept at 10% (intentionally subtle)
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.warning}30`,
  },
});
