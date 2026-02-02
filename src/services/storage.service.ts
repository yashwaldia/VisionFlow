/**
 * VisionFlow AI - Storage Service
 * Type-safe AsyncStorage wrapper with error handling and migrations
 * 
 * @module services/storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder, ReminderStatus } from '../types/reminder.types';
import { Pattern } from '../types/pattern.types';
import { Project, ProjectStats } from '../types/project.types';
import { UserPreferences } from '../types/common.types';
import { STORAGE_CONFIG, DEFAULTS } from '../constants/config';

/**
 * Storage error types
 */
class StorageError extends Error {
  constructor(message: string, public code: string, public originalError?: any) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Generic storage get with error handling
 */
async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue === null) {
      return defaultValue;
    }
    return JSON.parse(jsonValue) as T;
  } catch (error) {
    console.error(`[Storage] Failed to get ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Generic storage set with error handling
 */
async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`[Storage] Failed to set ${key}:`, error);
    throw new StorageError(
      `Failed to save data to storage`,
      'STORAGE_WRITE_ERROR',
      error
    );
  }
}

/**
 * Generic storage remove
 */
async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`[Storage] Failed to remove ${key}:`, error);
    throw new StorageError(
      `Failed to remove data from storage`,
      'STORAGE_DELETE_ERROR',
      error
    );
  }
}

/**
 * Clear all app data (factory reset)
 */
export async function clearAllData(): Promise<void> {
  try {
    const keys = Object.values(STORAGE_CONFIG.keys);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('[Storage] Failed to clear all data:', error);
    throw new StorageError(
      'Failed to clear application data',
      'STORAGE_CLEAR_ERROR',
      error
    );
  }
}

// ============================================
// REMINDER OPERATIONS
// ============================================

/**
 * Get all reminders
 */
export async function getReminders(): Promise<Reminder[]> {
  return getItem<Reminder[]>(STORAGE_CONFIG.keys.reminders, []);
}

/**
 * Save a new reminder (adds to beginning of list)
 */
export async function saveReminder(reminder: Reminder): Promise<Reminder[]> {
  const reminders = await getReminders();
  
  // Check storage limit
  if (reminders.length >= STORAGE_CONFIG.limits.maxReminders) {
    throw new StorageError(
      `Maximum reminder limit (${STORAGE_CONFIG.limits.maxReminders}) reached`,
      'STORAGE_LIMIT_EXCEEDED'
    );
  }
  
  const updated = [reminder, ...reminders];
  await setItem(STORAGE_CONFIG.keys.reminders, updated);
  return updated;
}

/**
 * Update existing reminder
 */
export async function updateReminder(reminderId: string, updates: Partial<Reminder>): Promise<Reminder[]> {
  const reminders = await getReminders();
  const index = reminders.findIndex(r => r.id === reminderId);
  
  if (index === -1) {
    throw new StorageError(
      `Reminder with ID ${reminderId} not found`,
      'REMINDER_NOT_FOUND'
    );
  }
  
  reminders[index] = {
    ...reminders[index],
    ...updates,
    updatedAt: Date.now(),
  };
  
  await setItem(STORAGE_CONFIG.keys.reminders, reminders);
  return reminders;
}

/**
 * Update reminder status
 */
export async function updateReminderStatus(
  reminderId: string,
  status: ReminderStatus
): Promise<Reminder[]> {
  return updateReminder(reminderId, { status });
}

/**
 * Delete reminder by ID
 */
export async function deleteReminder(reminderId: string): Promise<Reminder[]> {
  const reminders = await getReminders();
  const updated = reminders.filter(r => r.id !== reminderId);
  await setItem(STORAGE_CONFIG.keys.reminders, updated);
  return updated;
}

/**
 * Get reminder by ID
 */
export async function getReminderById(reminderId: string): Promise<Reminder | null> {
  const reminders = await getReminders();
  return reminders.find(r => r.id === reminderId) || null;
}

/**
 * Bulk delete reminders
 */
export async function bulkDeleteReminders(reminderIds: string[]): Promise<Reminder[]> {
  const reminders = await getReminders();
  const idsSet = new Set(reminderIds);
  const updated = reminders.filter(r => !idsSet.has(r.id));
  await setItem(STORAGE_CONFIG.keys.reminders, updated);
  return updated;
}

// ============================================
// PATTERN OPERATIONS
// ============================================

/**
 * Get all patterns
 */
export async function getPatterns(): Promise<Pattern[]> {
  return getItem<Pattern[]>(STORAGE_CONFIG.keys.patterns, []);
}

/**
 * Save a new pattern
 */
export async function savePattern(pattern: Pattern): Promise<Pattern[]> {
  const patterns = await getPatterns();
  
  // Check storage limit
  if (patterns.length >= STORAGE_CONFIG.limits.maxPatterns) {
    throw new StorageError(
      `Maximum pattern limit (${STORAGE_CONFIG.limits.maxPatterns}) reached`,
      'STORAGE_LIMIT_EXCEEDED'
    );
  }
  
  const updated = [pattern, ...patterns];
  await setItem(STORAGE_CONFIG.keys.patterns, updated);
  return updated;
}

/**
 * Update existing pattern
 */
export async function updatePattern(patternId: string, updates: Partial<Pattern>): Promise<Pattern[]> {
  const patterns = await getPatterns();
  const index = patterns.findIndex(p => p.id === patternId);
  
  if (index === -1) {
    throw new StorageError(
      `Pattern with ID ${patternId} not found`,
      'PATTERN_NOT_FOUND'
    );
  }
  
  patterns[index] = {
    ...patterns[index],
    ...updates,
    updatedAt: Date.now(),
  };
  
  await setItem(STORAGE_CONFIG.keys.patterns, patterns);
  return patterns;
}

/**
 * Delete pattern by ID
 */
export async function deletePattern(patternId: string): Promise<Pattern[]> {
  const patterns = await getPatterns();
  const updated = patterns.filter(p => p.id !== patternId);
  await setItem(STORAGE_CONFIG.keys.patterns, updated);
  return updated;
}

/**
 * Get pattern by ID
 */
export async function getPatternById(patternId: string): Promise<Pattern | null> {
  const patterns = await getPatterns();
  return patterns.find(p => p.id === patternId) || null;
}

/**
 * Toggle pattern favorite status
 */
export async function togglePatternFavorite(patternId: string): Promise<Pattern[]> {
  const patterns = await getPatterns();
  const index = patterns.findIndex(p => p.id === patternId);
  
  if (index === -1) {
    throw new StorageError(
      `Pattern with ID ${patternId} not found`,
      'PATTERN_NOT_FOUND'
    );
  }
  
  patterns[index].isFavorite = !patterns[index].isFavorite;
  patterns[index].updatedAt = Date.now();
  
  await setItem(STORAGE_CONFIG.keys.patterns, patterns);
  return patterns;
}

// ============================================
// PROJECT OPERATIONS
// ============================================

/**
 * Get all projects
 */
export async function getProjects(): Promise<Project[]> {
  return getItem<Project[]>(STORAGE_CONFIG.keys.projects, []);
}

/**
 * Save a new project
 */
export async function saveProject(project: Project): Promise<Project[]> {
  const projects = await getProjects();
  
  // Check storage limit
  if (projects.length >= STORAGE_CONFIG.limits.maxProjects) {
    throw new StorageError(
      `Maximum project limit (${STORAGE_CONFIG.limits.maxProjects}) reached`,
      'STORAGE_LIMIT_EXCEEDED'
    );
  }
  
  const updated = [project, ...projects];
  await setItem(STORAGE_CONFIG.keys.projects, updated);
  return updated;
}

/**
 * Update existing project
 */
export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project[]> {
  const projects = await getProjects();
  const index = projects.findIndex(p => p.id === projectId);
  
  if (index === -1) {
    throw new StorageError(
      `Project with ID ${projectId} not found`,
      'PROJECT_NOT_FOUND'
    );
  }
  
  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: Date.now(),
  };
  
  await setItem(STORAGE_CONFIG.keys.projects, projects);
  return projects;
}

/**
 * Delete project and unlink all associated reminders
 */
export async function deleteProject(projectId: string): Promise<{
  projects: Project[];
  reminders: Reminder[];
}> {
  // Remove project
  const projects = await getProjects();
  const updatedProjects = projects.filter(p => p.id !== projectId);
  
  // Unlink reminders
  const reminders = await getReminders();
  const updatedReminders = reminders.map(r => {
    if (r.projectId === projectId) {
      const { projectId: _, projectName: __, ...rest } = r;
      return { ...rest, updatedAt: Date.now() } as Reminder;
    }
    return r;
  });
  
  // Save both
  await setItem(STORAGE_CONFIG.keys.projects, updatedProjects);
  await setItem(STORAGE_CONFIG.keys.reminders, updatedReminders);
  
  return { projects: updatedProjects, reminders: updatedReminders };
}

/**
 * Find project by name (case-insensitive)
 */
export async function findProjectByName(name: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find(p => p.id === projectId) || null;
}

/**
 * Calculate project statistics
 */
export async function getProjectStats(projectId: string): Promise<ProjectStats | null> {
  const reminders = await getReminders();
  const projectReminders = reminders.filter(r => r.projectId === projectId);
  
  if (projectReminders.length === 0) {
    return null;
  }
  
  const now = new Date();
  const upcomingCount = projectReminders.filter(r => r.status === ReminderStatus.UPCOMING).length;
  const doneCount = projectReminders.filter(r => r.status === ReminderStatus.DONE).length;
  const overdueCount = projectReminders.filter(r => {
    if (r.status !== ReminderStatus.UPCOMING) return false;
    const reminderDate = new Date(`${r.reminderDate}T${r.reminderTime}`);
    return reminderDate < now;
  }).length;
  
  // Category breakdown
  const categoryBreakdown: Partial<Record<string, number>> = {};
  projectReminders.forEach(r => {
    categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + 1;
  });
  
  // Next upcoming reminder
  const upcomingReminders = projectReminders
    .filter(r => r.status === ReminderStatus.UPCOMING)
    .sort((a, b) => {
      const dateA = new Date(`${a.reminderDate}T${a.reminderTime}`);
      const dateB = new Date(`${b.reminderDate}T${b.reminderTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  
  const nextReminderDate = upcomingReminders[0]?.reminderDate;
  
  // Last activity
  const lastActivityAt = Math.max(...projectReminders.map(r => r.updatedAt));
  
  return {
    projectId,
    totalReminders: projectReminders.length,
    upcomingCount,
    doneCount,
    overdueCount,
    completionRate: projectReminders.length > 0 ? doneCount / projectReminders.length : 0,
    nextReminderDate,
    lastActivityAt,
    categoryBreakdown,
  };
}

// ============================================
// USER PREFERENCES
// ============================================

/**
 * Get user preferences
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  return getItem<UserPreferences>(
    STORAGE_CONFIG.keys.preferences,
    DEFAULTS.userPreferences
  );
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  updates: Partial<UserPreferences>
): Promise<UserPreferences> {
  const current = await getUserPreferences();
  const updated = { ...current, ...updates };
  await setItem(STORAGE_CONFIG.keys.preferences, updated);
  return updated;
}

// ============================================
// ONBOARDING
// ============================================

/**
 * Check if onboarding is complete
 */
export async function isOnboardingComplete(): Promise<boolean> {
  return getItem<boolean>(STORAGE_CONFIG.keys.onboardingComplete, false);
}

/**
 * Mark onboarding as complete
 */
export async function setOnboardingComplete(complete: boolean = true): Promise<void> {
  await setItem(STORAGE_CONFIG.keys.onboardingComplete, complete);
}

// ============================================
// UTILITIES
// ============================================

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{
  remindersCount: number;
  patternsCount: number;
  projectsCount: number;
  estimatedSizeBytes: number;
}> {
  const [reminders, patterns, projects] = await Promise.all([
    getReminders(),
    getPatterns(),
    getProjects(),
  ]);
  
  // Rough size estimation
  const estimatedSizeBytes =
    JSON.stringify(reminders).length +
    JSON.stringify(patterns).length +
    JSON.stringify(projects).length;
  
  return {
    remindersCount: reminders.length,
    patternsCount: patterns.length,
    projectsCount: projects.length,
    estimatedSizeBytes,
  };
}

/**
 * Export all data as JSON
 */
export async function exportAllData(): Promise<string> {
  const [reminders, patterns, projects, preferences] = await Promise.all([
    getReminders(),
    getPatterns(),
    getProjects(),
    getUserPreferences(),
  ]);
  
  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      reminders,
      patterns,
      projects,
      preferences,
    },
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Import data from JSON (overwrites existing)
 */
export async function importAllData(jsonString: string): Promise<void> {
  try {
    const importData = JSON.parse(jsonString);
    
    if (!importData.version || !importData.data) {
      throw new Error('Invalid export file format');
    }
    
    const { reminders, patterns, projects, preferences } = importData.data;
    
    await Promise.all([
      reminders && setItem(STORAGE_CONFIG.keys.reminders, reminders),
      patterns && setItem(STORAGE_CONFIG.keys.patterns, patterns),
      projects && setItem(STORAGE_CONFIG.keys.projects, projects),
      preferences && setItem(STORAGE_CONFIG.keys.preferences, preferences),
    ]);
  } catch (error) {
    throw new StorageError(
      'Failed to import data. File may be corrupted.',
      'IMPORT_ERROR',
      error
    );
  }
}
