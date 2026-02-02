/**
 * VisionFlow AI - Reminder Detail Screen
 * View and manage a single reminder
 * 
 * @module screens/ReminderDetailScreen
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReminderStackParamList } from '../types/navigation.types';
import { ReminderStatus } from '../types/reminder.types';
import { Theme } from '../constants/theme';
import {
  Screen,
  Container,
  Text,
  Button,
  Card,
  Icon,
  Pressable,
  LoadingSpinner,
} from '../components';
import { useReminders } from '../hooks/useReminders';
import * as Haptics from 'expo-haptics';

type ReminderDetailScreenProps = NativeStackScreenProps<ReminderStackParamList, 'ReminderDetail'>;

/**
 * ReminderDetailScreen Component
 */
export function ReminderDetailScreen({ navigation, route }: ReminderDetailScreenProps) {
  const { reminderId } = route.params;
  const { getReminderById, markAsDone, deleteReminder } = useReminders();
  const [reminder, setReminder] = useState(getReminderById(reminderId));

  useEffect(() => {
    setReminder(getReminderById(reminderId));
  }, [reminderId, getReminderById]);

  if (!reminder) {
    return (
      <Screen>
        <Container padding="m">
          <Text variant="h3">Reminder not found</Text>
          <Button label="Go Back" onPress={() => navigation.goBack()} />
        </Container>
      </Screen>
    );
  }

  const handleMarkDone = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await markAsDone(reminder.id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark as done');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await deleteReminder(reminder.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete reminder');
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
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <Text variant="h4" weight="600">Reminder Details</Text>
        <Pressable onPress={handleDelete}>
          <Icon name="trash-outline" size="md" color={Theme.colors.semantic.error} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Container padding="m">
          {/* Image */}
          {reminder.imageUri && (
            <Card style={styles.imageCard}>
              <Image source={{ uri: reminder.imageUri }} style={styles.image} resizeMode="cover" />
            </Card>
          )}

          {/* Title & Emoji */}
          <View style={styles.titleRow}>
            <Text variant="h1">{reminder.emoji}</Text>
            <Text variant="h2" style={styles.title}>{reminder.title}</Text>
          </View>

          {/* Details Card */}
          <Card style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Icon name="calendar-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="body" color="secondary">Date:</Text>
              <Text variant="body" weight="600">{reminder.reminderDate}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="time-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="body" color="secondary">Time:</Text>
              <Text variant="body" weight="600">{reminder.reminderTime}</Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="pricetag-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="body" color="secondary">Category:</Text>
              <Text variant="body" weight="600">{reminder.category}</Text>
            </View>

            {reminder.projectName && (
              <View style={styles.detailRow}>
                <Icon name="folder-outline" size="sm" color={Theme.colors.text.secondary} />
                <Text variant="body" color="secondary">Project:</Text>
                <Text variant="body" weight="600">{reminder.projectName}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Icon name="flag-outline" size="sm" color={Theme.colors.text.secondary} />
              <Text variant="body" color="secondary">Status:</Text>
              <Text variant="body" weight="600">{reminder.status}</Text>
            </View>
          </Card>

          {/* Smart Note */}
          <Text variant="h4" style={styles.sectionTitle}>Details</Text>
          <Card>
            <Text variant="body">{reminder.smartNote}</Text>
          </Card>
        </Container>
      </ScrollView>

      {/* Footer Actions */}
      {reminder.status === ReminderStatus.UPCOMING && (
        <View style={styles.footer}>
          <Button
            label="Mark as Done"
            variant="primary"
            size="large"
            leftIcon="checkmark-circle-outline"
            onPress={handleMarkDone}
          />
        </View>
      )}
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
  imageCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Theme.spacing.m,
  },
  image: {
    width: '100%',
    height: 240,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  title: {
    flex: 1,
  },
  detailsCard: {
    marginBottom: Theme.spacing.l,
    gap: Theme.spacing.m,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.m,
  },
  footer: {
    padding: Theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
  },
});
