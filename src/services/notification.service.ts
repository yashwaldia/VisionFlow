/**
 * VisionFlow AI - Notification Service
 * Native push notifications for reminders
 * 
 * @module services/notification
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder, ReminderStatus } from '../types/reminder.types';
import { PermissionStatus } from '../types/common.types';
import { NOTIFICATION_CONFIG } from '../constants/config';
import { getReminders } from './storage.service';

/**
 * Configure notification behavior
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Notification service error
 */
class NotificationError extends Error {
  constructor(message: string, public code: string, public originalError?: any) {
    super(message);
    this.name = 'NotificationError';
  }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermission(): Promise<PermissionStatus> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return PermissionStatus.GRANTED;
    }
    
    const { status } = await Notifications.requestPermissionsAsync();
    
    switch (status) {
      case 'granted':
        return PermissionStatus.GRANTED;
      case 'denied':
        return PermissionStatus.DENIED;
      default:
        return PermissionStatus.UNDETERMINED;
    }
  } catch (error: any) {
    console.error('[Notification] Permission request failed:', error);
    throw new NotificationError(
      'Failed to request notification permission',
      'PERMISSION_REQUEST_FAILED',
      error
    );
  }
}

/**
 * Get notification permission status
 */
export async function getNotificationPermissionStatus(): Promise<PermissionStatus> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    
    switch (status) {
      case 'granted':
        return PermissionStatus.GRANTED;
      case 'denied':
        return PermissionStatus.DENIED;
      default:
        return PermissionStatus.UNDETERMINED;
    }
  } catch (error: any) {
    console.error('[Notification] Permission check failed:', error);
    return PermissionStatus.UNDETERMINED;
  }
}

/**
 * Create Android notification channels
 */
export async function createNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  
  try {
    // Reminders channel
    await Notifications.setNotificationChannelAsync(
      NOTIFICATION_CONFIG.channels.reminders.id,
      {
        name: NOTIFICATION_CONFIG.channels.reminders.name,
        description: NOTIFICATION_CONFIG.channels.reminders.description,
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
      }
    );
    
    // Patterns channel
    await Notifications.setNotificationChannelAsync(
      NOTIFICATION_CONFIG.channels.patterns.id,
      {
        name: NOTIFICATION_CONFIG.channels.patterns.name,
        description: NOTIFICATION_CONFIG.channels.patterns.description,
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      }
    );
  } catch (error: any) {
    console.error('[Notification] Channel creation failed:', error);
  }
}

/**
 * Schedule notification for a reminder
 */
export async function scheduleReminderNotification(
  reminder: Reminder,
  advanceMinutes: number = 0
): Promise<string> {
  try {
    const permissionStatus = await getNotificationPermissionStatus();
    if (permissionStatus !== PermissionStatus.GRANTED) {
      throw new NotificationError(
        'Notification permission not granted',
        'PERMISSION_DENIED'
      );
    }
    
    // Calculate trigger time
    const reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
    const triggerTime = new Date(reminderDateTime.getTime() - advanceMinutes * 60 * 1000);
    
    // Don't schedule if in the past
    if (triggerTime <= new Date()) {
      throw new NotificationError(
        'Cannot schedule notification for past time',
        'INVALID_TIME'
      );
    }
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${reminder.emoji} ${reminder.title}`,
        body: reminder.smartNote,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          reminderId: reminder.id,
          type: 'reminder',
        },
        categoryIdentifier: NOTIFICATION_CONFIG.channels.reminders.id,
      },
      trigger: {
        date: triggerTime,
        channelId: NOTIFICATION_CONFIG.channels.reminders.id,
      },
    });
    
    console.log(`[Notification] Scheduled for ${triggerTime.toLocaleString()}, ID: ${notificationId}`);
    return notificationId;
    
  } catch (error: any) {
    console.error('[Notification] Schedule failed:', error);
    
    if (error instanceof NotificationError) {
      throw error;
    }
    
    throw new NotificationError(
      'Failed to schedule notification',
      'SCHEDULE_FAILED',
      error
    );
  }
}

/**
 * Cancel scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`[Notification] Cancelled ID: ${notificationId}`);
  } catch (error: any) {
    console.error('[Notification] Cancel failed:', error);
    // Don't throw - cancelling non-existent notification is not critical
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notification] Cancelled all scheduled notifications');
  } catch (error: any) {
    console.error('[Notification] Cancel all failed:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error: any) {
    console.error('[Notification] Get scheduled failed:', error);
    return [];
  }
}

/**
 * Send immediate notification (testing)
 */
export async function sendImmediateNotification(
  title: string,
  body: string,
  data?: any
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data,
      },
      trigger: null, // Immediate
    });
  } catch (error: any) {
    console.error('[Notification] Immediate notification failed:', error);
  }
}

/**
 * Set up notification listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
): () => void {
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('[Notification] Received:', notification);
      onNotificationReceived?.(notification);
    }
  );
  
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('[Notification] Tapped:', response);
      onNotificationTapped?.(response);
    }
  );
  
  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Reschedule all upcoming reminders
 * Call this on app startup or when preferences change
 */
export async function rescheduleAllReminders(advanceMinutes: number = 0): Promise<void> {
  try {
    // Cancel all existing notifications
    await cancelAllNotifications();
    
    // Get all upcoming reminders
    const reminders = await getReminders();
    const upcomingReminders = reminders.filter(
      (r) => r.status === ReminderStatus.UPCOMING
    );
    
    let scheduledCount = 0;
    
    for (const reminder of upcomingReminders) {
      try {
        await scheduleReminderNotification(reminder, advanceMinutes);
        scheduledCount++;
      } catch (error) {
        console.error(`[Notification] Failed to schedule reminder ${reminder.id}:`, error);
      }
    }
    
    console.log(`[Notification] Rescheduled ${scheduledCount} reminders`);
  } catch (error: any) {
    console.error('[Notification] Reschedule all failed:', error);
  }
}

/**
 * Get badge count (number of upcoming reminders)
 */
export async function updateBadgeCount(): Promise<void> {
  try {
    const reminders = await getReminders();
    const upcomingCount = reminders.filter(
      (r) => r.status === ReminderStatus.UPCOMING
    ).length;
    
    await Notifications.setBadgeCountAsync(upcomingCount);
  } catch (error: any) {
    console.error('[Notification] Badge update failed:', error);
  }
}

/**
 * Clear badge count
 */
export async function clearBadgeCount(): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error: any) {
    console.error('[Notification] Clear badge failed:', error);
  }
}
