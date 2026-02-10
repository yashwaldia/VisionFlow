/**
 * VisionFlow AI - Reminder Type Definitions
 * Core types for AI-powered reminder extraction and management
 * 
 * @module types/reminder
 * @see Product Requirements: Section 3.1.1 - Core Features
 */


/**
 * 12 comprehensive reminder categories with visual gradients
 * Each category has specific subcategories for precise classification
 */
export enum ReminderCategory {
  MONEY = 'Money',
  WORK = 'Work',
  HEALTH = 'Health',
  STUDY = 'Study',
  PERSONAL = 'Personal',
  TRAVEL = 'Travel',
  HOME_UTILITIES = 'Home & Utilities',
  LEGAL_DOCUMENTS = 'Legal & Documents',
  BUSINESS_FINANCE = 'Business & Finance',
  FAMILY_KIDS = 'Family & Kids',
  FITNESS = 'Fitness',
  EVENTS_OCCASIONS = 'Events & Occasions',
}


/**
 * Reminder lifecycle status
 */
export enum ReminderStatus {
  UPCOMING = 'upcoming',
  DONE = 'done',
  OVERDUE = 'overdue', // Auto-calculated if date < now
  SNOOZED = 'snoozed',
}


/**
 * Priority levels for reminders (Phase 2 feature)
 */
export enum ReminderPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}


/**
 * Subcategory definitions per category
 * AI uses these for intelligent classification
 */
export const CATEGORY_SUBCATEGORIES: Record<ReminderCategory, string[]> = {
  [ReminderCategory.MONEY]: [
    'Loan Given',
    'Loan Taken',
    'Credit Card Payment',
    'EMI',
    'Rent',
    'Salary',
    'Investment',
  ],
  [ReminderCategory.WORK]: [
    'Boss Task',
    'Client Project',
    'Meeting',
    'Call',
    'Deadline',
    'Office Note',
  ],
  [ReminderCategory.HEALTH]: [
    'Medicine Schedule',
    'Doctor Appointment',
    'Lab Test',
    'Prescription',
    'Follow-up',
  ],
  [ReminderCategory.STUDY]: [
    'Exam',
    'Assignment',
    'Project',
    'Class Schedule',
    'Timetable',
    'Self Study',
  ],
  [ReminderCategory.PERSONAL]: [
    'Shopping List',
    'Daily Task',
    'Personal Note',
    'Hobby',
    'Journal',
  ],
  [ReminderCategory.TRAVEL]: [
    'Flight Ticket',
    'Train Ticket',
    'Hotel Booking',
    'Packing List',
    'Visa',
    'Itinerary',
  ],
  [ReminderCategory.HOME_UTILITIES]: [
    'Electricity Bill',
    'Water Bill',
    'Gas Refill',
    'Appliance Service',
    'Maintenance',
    'Repair',
  ],
  [ReminderCategory.LEGAL_DOCUMENTS]: [
    'Insurance Expiry',
    'Warranty',
    'License Renewal',
    'Tax Filing',
    'ID Renewal',
    'Policy',
  ],
  [ReminderCategory.BUSINESS_FINANCE]: [
    'Vendor Payment',
    'Inventory',
    'Sales Report',
    'GST Filing',
    'Business Meeting',
    'Invoice',
  ],
  [ReminderCategory.FAMILY_KIDS]: [
    'School Event',
    'Vaccination',
    'Pocket Money',
    'Birthday',
    'Parent Care',
    'Kids Activity',
  ],
  [ReminderCategory.FITNESS]: [
    'Workout Plan',
    'Gym Schedule',
    'Diet Plan',
    'Step Goal',
    'Yoga Class',
  ],
  [ReminderCategory.EVENTS_OCCASIONS]: [
    'Festival',
    'Wedding',
    'Party',
    'Concert',
    'Celebration',
    'Anniversary',
  ],
};


/**
 * Category emoji mapping for visual identification
 */
export const CATEGORY_EMOJIS: Record<ReminderCategory, string> = {
  [ReminderCategory.MONEY]: '💰',
  [ReminderCategory.WORK]: '💼',
  [ReminderCategory.HEALTH]: '❤️',
  [ReminderCategory.STUDY]: '📚',
  [ReminderCategory.PERSONAL]: '🏠',
  [ReminderCategory.TRAVEL]: '✈️',
  [ReminderCategory.HOME_UTILITIES]: '🛠️',
  [ReminderCategory.LEGAL_DOCUMENTS]: '📄',
  [ReminderCategory.BUSINESS_FINANCE]: '📊',
  [ReminderCategory.FAMILY_KIDS]: '👨‍👩‍👧',
  [ReminderCategory.FITNESS]: '🏋️',
  [ReminderCategory.EVENTS_OCCASIONS]: '🎉',
};


/**
 * Core Reminder interface
 * Represents a single actionable reminder extracted from an image
 */
export interface Reminder {
  /** Unique identifier (UUID v4) */
  id: string;


  /** Category classification */
  category: ReminderCategory;


  /** Specific subcategory (e.g., "Loan Given", "Meeting") */
  subcategory: string;


  /** Optional project association */
  projectId?: string;
  projectName?: string;


  /** Action-oriented title (max 60 chars) */
  title: string;


  /** Natural language summary (1-2 lines) */
  smartNote: string;


  /** Reminder date (ISO 8601: YYYY-MM-DD) */
  reminderDate: string;


  /** Reminder time (HH:MM 24-hour format) */
  reminderTime: string;


  /** Category-specific emoji */
  emoji: string;


  /** Current status */
  status: ReminderStatus;


  /** Priority level (Phase 2) */
  priority?: ReminderPriority;


  /** Creation timestamp (Unix milliseconds) */
  createdAt: number;


  /** Last updated timestamp */
  updatedAt: number;


  /** Optional reference to captured image (Base64 or URI) */
  imageUri?: string;


  /** Notification ID from scheduled notification (for cancellation) */
  notificationId?: string;


  /** Optional recurring reminder configuration (Phase 2) */
  recurrence?: RecurrenceConfig;


  /** Flag for notification sent */
  notificationSent?: boolean;
}


/**
 * Recurrence configuration (Phase 2 feature)
 */
export interface RecurrenceConfig {
  pattern: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number; // e.g., every 2 days
  endDate?: string;
  daysOfWeek?: number[]; // For weekly: [0=Sun, 1=Mon, ...]
  dayOfMonth?: number; // For monthly
}


/**
 * AI analysis result from Gemini
 * Returned by geminiService.analyzeReminderImage()
 */
export interface AIReminderAnalysis {
  category: ReminderCategory;
  subcategory: string;
  projectName: string;
  title: string;
  smartNote: string;
  reminderDate: string;
  reminderTime: string;
  emoji: string;
  confidence?: number; // AI confidence score (0-1)
}


/**
 * Reminder filter options
 */
export interface ReminderFilters {
  category?: ReminderCategory | 'all';
  status?: ReminderStatus | 'all';
  projectId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}


/**
 * Reminder sort options
 */
export type ReminderSortBy = 'date' | 'created' | 'updated' | 'priority' | 'category';
export type ReminderSortOrder = 'asc' | 'desc';


export interface ReminderSortConfig {
  by: ReminderSortBy;
  order: ReminderSortOrder;
}
