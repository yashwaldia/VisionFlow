/**
 * VisionFlow AI - Project Type Definitions
 * Types for project-based reminder organization
 * 
 * @module types/project
 * @see Product Requirements: Section 3.1.1 - Project Grouping System
 */

import { ReminderCategory } from './reminder.types';

/**
 * Project color scheme
 * Derived from primary category but customizable
 */
export enum ProjectColor {
  EMERALD = 'emerald',
  BLUE = 'blue',
  ROSE = 'rose',
  AMBER = 'amber',
  TEAL = 'teal',
  SKY = 'sky',
  ORANGE = 'orange',
  SLATE = 'slate',
  INDIGO = 'indigo',
  PINK = 'pink',
  RED = 'red',
  VIOLET = 'violet',
}

/**
 * Project icon options (emoji-based)
 */
export type ProjectIcon = string; // Emoji character

/**
 * Core Project interface
 * Represents a logical grouping of related reminders
 */
export interface Project {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Project name (max 20 chars for UI consistency) */
  name: string;

  /** Primary category this project belongs to */
  primaryCategory: ReminderCategory;

  /** Optional description */
  description?: string;

  /** Project icon (emoji) */
  icon: ProjectIcon;

  /** Color scheme */
  color: ProjectColor;

  /** Creation timestamp */
  createdAt: number;

  /** Last updated timestamp */
  updatedAt: number;

  /** Archive status (Phase 2) */
  isArchived?: boolean;

  /** Completion target date (Phase 2) */
  targetDate?: string;

  /** Custom metadata */
  metadata?: {
    totalBudget?: number;
    estimatedHours?: number;
    tags?: string[];
    [key: string]: any;
  };
}

/**
 * Project statistics
 * Calculated from associated reminders
 */
export interface ProjectStats {
  projectId: string;
  
  /** Total reminder count */
  totalReminders: number;
  
  /** Breakdown by status */
  upcomingCount: number;
  doneCount: number;
  overdueCount: number;
  
  /** Progress percentage (done / total) */
  completionRate: number;
  
  /** Next upcoming reminder date */
  nextReminderDate?: string;
  
  /** Most recent activity timestamp */
  lastActivityAt: number;
  
  /** Category distribution */
  categoryBreakdown: Partial<Record<ReminderCategory, number>>;
}

/**
 * Project with embedded statistics
 */
export interface ProjectWithStats extends Project {
  stats: ProjectStats;
}

/**
 * Project filter options
 */
export interface ProjectFilters {
  category?: ReminderCategory | 'all';
  isArchived?: boolean;
  hasReminders?: boolean;
  searchQuery?: string;
}

/**
 * Project sort options
 */
export type ProjectSortBy = 'name' | 'created' | 'updated' | 'reminderCount' | 'completionRate';
export type ProjectSortOrder = 'asc' | 'desc';

export interface ProjectSortConfig {
  by: ProjectSortBy;
  order: ProjectSortOrder;
}

/**
 * Category to default color mapping
 */
export const CATEGORY_DEFAULT_COLORS: Record<ReminderCategory, ProjectColor> = {
  [ReminderCategory.MONEY]: ProjectColor.EMERALD,
  [ReminderCategory.WORK]: ProjectColor.BLUE,
  [ReminderCategory.HEALTH]: ProjectColor.ROSE,
  [ReminderCategory.STUDY]: ProjectColor.AMBER,
  [ReminderCategory.PERSONAL]: ProjectColor.TEAL,
  [ReminderCategory.TRAVEL]: ProjectColor.SKY,
  [ReminderCategory.HOME_UTILITIES]: ProjectColor.ORANGE,
  [ReminderCategory.LEGAL_DOCUMENTS]: ProjectColor.SLATE,
  [ReminderCategory.BUSINESS_FINANCE]: ProjectColor.INDIGO,
  [ReminderCategory.FAMILY_KIDS]: ProjectColor.PINK,
  [ReminderCategory.FITNESS]: ProjectColor.RED,
  [ReminderCategory.EVENTS_OCCASIONS]: ProjectColor.VIOLET,
};

/**
 * AI project name suggestion
 * Returned by AI analysis for auto-grouping
 */
export interface ProjectSuggestion {
  name: string;
  category: ReminderCategory;
  confidence: number;
  reason?: string; // Why this grouping was suggested
}
