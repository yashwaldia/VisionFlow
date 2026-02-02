/**
 * VisionFlow AI - Reminders Hook
 * Complete state management for reminders
 * 
 * @module hooks/useReminders
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
   * Load reminders from storage
   */
  const loadReminders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await StorageService.getReminders();
      setReminders(data);
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
   * Apply filters and sorting
   */
    useEffect(() => {
    let result = [...reminders];
    
    // Filter by status
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
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
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
   * Calculate statistics
   */
  const stats = {
    total: reminders.length,
    upcoming: reminders.filter(r => r.status === ReminderStatus.UPCOMING).length,
    done: reminders.filter(r => r.status === ReminderStatus.DONE).length,
    overdue: reminders.filter(r => {
      if (r.status !== ReminderStatus.UPCOMING) return false;
      const reminderDate = new Date(`${r.reminderDate}T${r.reminderTime}`);
      return reminderDate < new Date();
    }).length,
  };
  
  /**
   * Create reminder
   */
  const createReminder = useCallback(async (reminder: Reminder) => {
    try {
      const updated = await StorageService.saveReminder(reminder);
      setReminders(updated);
      
      // Schedule notification
      if (reminder.status === ReminderStatus.UPCOMING) {
        await NotificationService.scheduleReminderNotification(reminder);
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
      const updated = await StorageService.updateReminder(id, updates);
      setReminders(updated);
      
      // Reschedule notification if date/time changed
      const updatedReminder = updated.find(r => r.id === id);
      if (updatedReminder && updatedReminder.status === ReminderStatus.UPCOMING) {
        await NotificationService.scheduleReminderNotification(updatedReminder);
      }
    } catch (err: any) {
      console.error('[useReminders] Update failed:', err);
      throw err;
    }
  }, []);
  
  /**
   * Delete reminder
   */
  const deleteReminder = useCallback(async (id: string) => {
    try {
      const updated = await StorageService.deleteReminder(id);
      setReminders(updated);
    } catch (err: any) {
      console.error('[useReminders] Delete failed:', err);
      throw err;
    }
  }, []);
  
  /**
   * Mark as done
   */
  const markAsDone = useCallback(async (id: string) => {
    try {
      const updated = await StorageService.updateReminderStatus(id, ReminderStatus.DONE);
      setReminders(updated);
      await NotificationService.updateBadgeCount();
    } catch (err: any) {
      console.error('[useReminders] Mark as done failed:', err);
      throw err;
    }
  }, []);
  
  /**
   * Bulk delete
   */
  const bulkDelete = useCallback(async (ids: string[]) => {
    try {
      const updated = await StorageService.bulkDeleteReminders(ids);
      setReminders(updated);
    } catch (err: any) {
      console.error('[useReminders] Bulk delete failed:', err);
      throw err;
    }
  }, []);
  
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
