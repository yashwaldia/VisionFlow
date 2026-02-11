/**
 * VisionFlow AI - Reminders Hook (v4.1 - Dynamic Status Calculation)
 * Complete state management for reminders
 * 
 * @module hooks/useReminders
 * 
 * CHANGELOG v4.1:
 * - ✅ Dynamic status calculation based on current date/time
 * - ✅ Auto-update overdue reminders on load
 * - ✅ Fixed upcoming/overdue count mismatch
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Reminder,
  ReminderStatus,
  ReminderCategory,
  ReminderFilters,
  ReminderSortBy,
  ReminderSortOrder,
} from '../types/reminder.types';
import * as StorageService from '../services/storage.service';
import * as NotificationService from '../services/notification.service';
import { combineDateAndTime } from '../utils/dateUtils';

/**
 * Hook return type
 */
interface UseRemindersResult {
  // Data
  reminders: Reminder[];
  filteredReminders: Reminder[];
  isLoading: boolean;
  error: string | null;
  
  // Statistics
  stats: {
    total: number;
    upcoming: number;
    done: number;
    overdue: number;
  };
  
  // CRUD Operations
  createReminder: (reminder: Reminder) => Promise<void>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  markAsDone: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  
  // Filtering & Sorting
  setFilters: (filters: ReminderFilters) => void;
  setSorting: (sortBy: ReminderSortBy, order: ReminderSortOrder) => void;
  clearFilters: () => void;
  
  // Utility
  refreshReminders: () => Promise<void>;
  getReminderById: (id: string) => Reminder | undefined;
}

/**
 * Default filters
 */
const DEFAULT_FILTERS: ReminderFilters = {
  status: 'all',
  category: 'all',
  projectId: undefined,
  dateRange: undefined,
  searchQuery: undefined,
};

// ============================================
// DYNAMIC STATUS CALCULATION (NEW v4.1)
// ============================================

/**
 * Calculate the actual current status of a reminder
 * 
 * @param reminder - Reminder to check
 * @returns Current status (overdue if past date/time, done if completed, upcoming otherwise)
 */
function calculateReminderStatus(reminder: Reminder): ReminderStatus {
  // If marked as done, always return done
  if (reminder.status === ReminderStatus.DONE) {
    return ReminderStatus.DONE;
  }
  
  // If snoozed, keep snoozed (Phase 2 feature)
  if (reminder.status === ReminderStatus.SNOOZED) {
    return ReminderStatus.SNOOZED;
  }
  
  // Calculate based on date/time
  const reminderDateTime = combineDateAndTime(
    reminder.reminderDate,
    reminder.reminderTime
  );
  
  if (!reminderDateTime) {
    console.warn(`[useReminders] Invalid date/time for reminder ${reminder.id}`);
    return ReminderStatus.UPCOMING; // Fallback
  }
  
  const now = new Date();
  
  // If date/time has passed, it's overdue
  if (reminderDateTime < now) {
    return ReminderStatus.OVERDUE;
  }
  
  // Otherwise, it's upcoming
  return ReminderStatus.UPCOMING;
}

/**
 * Update all reminders with calculated status
 * This ensures stored status matches reality
 */
function updateRemindersWithCalculatedStatus(reminders: Reminder[]): Reminder[] {
  return reminders.map(reminder => {
    const calculatedStatus = calculateReminderStatus(reminder);
    
    // If status changed, log it
    if (reminder.status !== calculatedStatus) {
      console.log(
        `[useReminders] Status updated: "${reminder.title}" from ${reminder.status} → ${calculatedStatus}`
      );
    }
    
    return {
      ...reminder,
      status: calculatedStatus,
    };
  });
}

/**
 * useReminders Hook
 */
export function useReminders(): UseRemindersResult {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters & Sorting
  const [filters, setFilters] = useState<ReminderFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<ReminderSortBy>('date');
  const [sortOrder, setSortOrder] = useState<ReminderSortOrder>('asc');
  
  /**
   * Load reminders from storage (v4.1 - with status update)
   */
  const loadReminders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load from storage
      const data = await StorageService.getReminders();
      
      // Update statuses based on current date/time
      const updatedData = updateRemindersWithCalculatedStatus(data);
      
      // Save back to storage if any status changed
      const hasChanges = data.some((original, index) => 
        original.status !== updatedData[index].status
      );
      
      if (hasChanges) {
        console.log('[useReminders] Auto-updating overdue reminders in storage...');
        await StorageService.saveReminders(updatedData);
      }
      
      setReminders(updatedData);
    } catch (err: any) {
      console.error('[useReminders] Load failed:', err);
      setError(err.message || 'Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Initial load
   */
  useEffect(() => {
    loadReminders();
  }, [loadReminders]);
  
  /**
   * Apply filters and sorting (v4.1 - uses calculated status)
   */
  useEffect(() => {
    let result = [...reminders];
    
    // Filter by status (now uses calculated status)
    if (filters.status !== 'all') {
      result = result.filter(r => r.status === filters.status);
    }
    
    // Filter by category
    if (filters.category !== 'all') {
      result = result.filter(r => r.category === filters.category);
    }
    
    // Filter by project
    if (filters.projectId) {
      result = result.filter(r => r.projectId === filters.projectId);
    }
    
    // Filter by date range
    if (filters.dateRange) {
      result = result.filter(r => {
        const reminderDate = new Date(r.reminderDate);
        const start = new Date(filters.dateRange!.start);
        const end = new Date(filters.dateRange!.end);
        return reminderDate >= start && reminderDate <= end;
      });
    }
    
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.smartNote.toLowerCase().includes(query) ||
        r.subcategory.toLowerCase().includes(query) ||
        r.projectName?.toLowerCase().includes(query)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          const dateA = new Date(`${a.reminderDate}T${a.reminderTime}`);
          const dateB = new Date(`${b.reminderDate}T${b.reminderTime}`);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'created':
          comparison = a.createdAt - b.createdAt;
          break;
        case 'updated':
          comparison = a.updatedAt - b.updatedAt;
          break;
        case 'priority':
          // Priority sorting (if defined)
          const priorityOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
          const prioA = a.priority ? priorityOrder[a.priority] : 0;
          const prioB = b.priority ? priorityOrder[b.priority] : 0;
          comparison = prioA - prioB;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredReminders(result);
  }, [reminders, filters, sortBy, sortOrder]);
  
  /**
   * Calculate statistics (v4.1 - FIXED: uses calculated status)
   */
  const stats = {
    total: reminders.length,
    upcoming: reminders.filter(r => r.status === ReminderStatus.UPCOMING).length,
    done: reminders.filter(r => r.status === ReminderStatus.DONE).length,
    overdue: reminders.filter(r => r.status === ReminderStatus.OVERDUE).length,
  };
  
  /**
   * Create reminder
   */
  const createReminder = useCallback(async (reminder: Reminder) => {
    try {
      // Calculate initial status
      const reminderWithStatus = {
        ...reminder,
        status: calculateReminderStatus(reminder),
      };
      
      // Save reminder first
      const updated = await StorageService.saveReminder(reminderWithStatus);
      setReminders(updateRemindersWithCalculatedStatus(updated));
      
      // Schedule notification only if upcoming and user has enabled alerts
      if (reminderWithStatus.status === ReminderStatus.UPCOMING) {
        const userPrefs = await StorageService.getUserPreferences();
        
        if (userPrefs.notifications.reminderAlerts) {
          try {
            const notificationId = await NotificationService.scheduleReminderNotification(reminderWithStatus);
            
            // Store notification ID with reminder
            const updatedWithNotif = await StorageService.updateReminder(reminder.id, { notificationId });
            setReminders(updateRemindersWithCalculatedStatus(updatedWithNotif));
          } catch (notifErr) {
            console.error('[useReminders] Failed to schedule notification:', notifErr);
            // Don't throw - reminder was saved successfully
          }
        }
      }
    } catch (err: any) {
      console.error('[useReminders] Create failed:', err);
      throw err;
    }
  }, []);
  
  /**
   * Update reminder
   */
  const updateReminder = useCallback(async (id: string, updates: Partial<Reminder>) => {
    try {
      // Get current reminder before updating
      const currentReminder = reminders.find(r => r.id === id);
      
      // Update reminder in storage
      let updated = await StorageService.updateReminder(id, updates);
      
      // Recalculate status after update
      updated = updateRemindersWithCalculatedStatus(updated);
      setReminders(updated);
      
      // Handle notification rescheduling
      const updatedReminder = updated.find(r => r.id === id);
      if (updatedReminder && updatedReminder.status === ReminderStatus.UPCOMING) {
        const userPrefs = await StorageService.getUserPreferences();
        
        if (userPrefs.notifications.reminderAlerts) {
          try {
            // Cancel old notification if exists
            if (currentReminder?.notificationId) {
              await NotificationService.cancelNotification(currentReminder.notificationId);
            }
            
            // Schedule new notification
            const newNotificationId = await NotificationService.scheduleReminderNotification(updatedReminder);
            
            // Store new notification ID
            const finalUpdated = await StorageService.updateReminder(id, { notificationId: newNotificationId });
            setReminders(updateRemindersWithCalculatedStatus(finalUpdated));
          } catch (notifErr) {
            console.error('[useReminders] Failed to reschedule notification:', notifErr);
          }
        }
      }
    } catch (err: any) {
      console.error('[useReminders] Update failed:', err);
      throw err;
    }
  }, [reminders]);
  
  /**
   * Delete reminder
   */
  const deleteReminder = useCallback(async (id: string) => {
    try {
      // Get reminder to access notification ID
      const reminder = reminders.find(r => r.id === id);
      
      // Cancel notification if exists
      if (reminder?.notificationId) {
        try {
          await NotificationService.cancelNotification(reminder.notificationId);
        } catch (notifErr) {
          console.error('[useReminders] Failed to cancel notification:', notifErr);
          // Continue with deletion
        }
      }
      
      // Delete from storage
      const updated = await StorageService.deleteReminder(id);
      setReminders(updateRemindersWithCalculatedStatus(updated));
    } catch (err: any) {
      console.error('[useReminders] Delete failed:', err);
      throw err;
    }
  }, [reminders]);
  
  /**
   * Mark as done
   */
  const markAsDone = useCallback(async (id: string) => {
    try {
      // Get reminder to access notification ID
      const reminder = reminders.find(r => r.id === id);
      
      // Cancel notification if exists
      if (reminder?.notificationId) {
        try {
          await NotificationService.cancelNotification(reminder.notificationId);
        } catch (notifErr) {
          console.error('[useReminders] Failed to cancel notification:', notifErr);
          // Continue with status update
        }
      }
      
      // Update status
      const updated = await StorageService.updateReminderStatus(id, ReminderStatus.DONE);
      setReminders(updateRemindersWithCalculatedStatus(updated));
      await NotificationService.updateBadgeCount();
    } catch (err: any) {
      console.error('[useReminders] Mark as done failed:', err);
      throw err;
    }
  }, [reminders]);
  
  /**
   * Bulk delete
   */
  const bulkDelete = useCallback(async (ids: string[]) => {
    try {
      // Cancel notifications for all reminders being deleted
      const remindersToDelete = reminders.filter(r => ids.includes(r.id));
      
      for (const reminder of remindersToDelete) {
        if (reminder.notificationId) {
          try {
            await NotificationService.cancelNotification(reminder.notificationId);
          } catch (notifErr) {
            console.error(`[useReminders] Failed to cancel notification for ${reminder.id}:`, notifErr);
            // Continue with other cancellations
          }
        }
      }
      
      // Delete from storage
      const updated = await StorageService.bulkDeleteReminders(ids);
      setReminders(updateRemindersWithCalculatedStatus(updated));
    } catch (err: any) {
      console.error('[useReminders] Bulk delete failed:', err);
      throw err;
    }
  }, [reminders]);
  
  /**
   * Set sorting
   */
  const setSorting = useCallback((newSortBy: ReminderSortBy, newSortOrder: ReminderSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);
  
  /**
   * Clear filters
   */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);
  
  /**
   * Get reminder by ID
   */
  const getReminderById = useCallback((id: string) => {
    return reminders.find(r => r.id === id);
  }, [reminders]);
  
  return {
    reminders,
    filteredReminders,
    isLoading,
    error,
    stats,
    createReminder,
    updateReminder,
    deleteReminder,
    markAsDone,
    bulkDelete,
    setFilters,
    setSorting,
    clearFilters,
    refreshReminders: loadReminders,
    getReminderById,
  };
}
