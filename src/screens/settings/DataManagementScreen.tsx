/**
 * VisionFlow AI - Data Management Screen (FIXED)
 * Handle data backup, restoration, and storage management
 * @module screens/settings/DataManagementScreen
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share, Platform } from 'react-native';
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
      
      // Use native Share for text content
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
    // FIXED: Removed expo-document-picker dependency to prevent build errors
    // Implementation requires 'npx expo install expo-document-picker'
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
              
              // Reset local stats
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
        <Button 
            label="Back" 
            variant="ghost" 
            leftIcon="arrow-back" 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
        />
        <Text variant="h4" weight="600">Data & Storage</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Container padding="m">
          
          {/* Storage Overview */}
          <Text variant="h4" style={styles.sectionTitle}>Storage Usage</Text>
          <Card style={styles.statsCard}>
            <View style={styles.usageHeader}>
              <View style={styles.iconContainer}>
                <Icon name="server-outline" size="lg" color={Theme.colors.primary[500]} />
              </View>
              <View>
                <Text variant="h3" weight="700">{formatSize(stats.estimatedSizeBytes)}</Text>
                <Text variant="caption" color="secondary">Total Estimated Size</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="h4" weight="600">{stats.remindersCount}</Text>
                <Text variant="caption" color="tertiary">Reminders</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="h4" weight="600">{stats.patternsCount}</Text>
                <Text variant="caption" color="tertiary">Patterns</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="h4" weight="600">{stats.projectsCount}</Text>
                <Text variant="caption" color="tertiary">Projects</Text>
              </View>
            </View>
          </Card>

          {/* Backup & Restore */}
          <Text variant="h4" style={styles.sectionTitle}>Backup & Restore</Text>
          <Card style={styles.actionCard}>
            <Button
              label={isProcessing ? "Processing..." : "Export Data (JSON)"}
              variant="outline"
              leftIcon="download-outline"
              onPress={handleExport}
              disabled={isProcessing}
              style={styles.actionButton}
            />
            <Text variant="caption" color="tertiary" style={styles.actionHelp}>
              Download a JSON file containing all your reminders, patterns, and settings.
            </Text>

            <View style={styles.actionDivider} />

            <Button
              label={isProcessing ? "Processing..." : "Import Data"}
              variant="outline"
              leftIcon="cloud-upload-outline"
              onPress={handleImport}
              disabled={isProcessing}
              style={styles.actionButton}
            />
            <Text variant="caption" color="tertiary" style={styles.actionHelp}>
              Restore data from a previously exported JSON file. Current data will be merged or overwritten.
            </Text>
          </Card>

          {/* Danger Zone */}
          <Text variant="h4" style={styles.sectionTitle} customColor={Theme.colors.semantic.error}>
            Danger Zone
          </Text>
          
          {/* FIXED: Use StyleSheet.flatten to pass a single ViewStyle object instead of array */}
          <Card style={StyleSheet.flatten([styles.actionCard, styles.dangerCard])}>
            {/* FIXED: Changed variant from 'danger' to 'primary' with style override */}
            <Button
              label="Factory Reset"
              variant="primary" 
              leftIcon="trash-outline"
              onPress={handleClearData}
              disabled={isProcessing}
              style={{ backgroundColor: Theme.colors.semantic.error }}
            />
            <Text variant="caption" color="tertiary" style={styles.actionHelp}>
              Permanently delete all local data. This action cannot be undone.
            </Text>
          </Card>

        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
  },
  backButton: {
    paddingHorizontal: 0,
  },
  placeholder: {
    width: 48,
  },
  content: {
    paddingBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.m,
    marginLeft: Theme.spacing.xs,
    marginTop: Theme.spacing.m,
  },
  statsCard: {
    padding: Theme.spacing.m,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginVertical: Theme.spacing.m,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionCard: {
    padding: Theme.spacing.m,
    gap: Theme.spacing.s,
  },
  actionButton: {
    width: '100%',
  },
  actionDivider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginVertical: Theme.spacing.s,
  },
  actionHelp: {
    paddingHorizontal: Theme.spacing.xs,
  },
  dangerCard: {
    borderColor: `${Theme.colors.semantic.error}40`,
    borderWidth: 1,
  },
});