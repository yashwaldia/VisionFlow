/**
 * VisionFlow AI - Common Type Definitions
 * Shared types and utilities used throughout the application
 * 
 * @module types/common
 */

/**
 * Supported image MIME types
 */
export type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    timestamp: number;
    requestId?: string;
    processingTime?: number;
  };
}

/**
 * Standardized error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string; // Only in development
}

/**
 * Image processing states
 */
export enum ProcessingStage {
  IDLE = 'idle',
  COMPRESSING = 'compressing',
  ANALYZING = 'analyzing',
  EDGE_DETECTION = 'edge_detection',
  AI_PROCESSING = 'ai_processing',
  COMPLETE = 'complete',
  ERROR = 'error',
}

/**
 * Image processing state
 */
export interface ProcessingState {
  isProcessing: boolean;
  stage: ProcessingStage;
  progress?: number; // 0-100
  error?: string;
  statusMessage?: string;
}

/**
 * Image metadata after processing
 */
export interface ProcessedImage {
  /** Original image URI */
  originalUri: string;
  
  /** Resized image URI (max 1024px) */
  resizedUri: string;
  
  /** Edge-detected image URI (if applicable) */
  edgeUri?: string;
  
  /** Original dimensions */
  originalDimensions: ImageDimensions;
  
  /** Processed dimensions */
  processedDimensions: ImageDimensions;
  
  /** File size in bytes */
  fileSize: number;
  
  /** MIME type */
  mimeType: ImageMimeType;
  
  /** Processing timestamp */
  processedAt: number;
}

/**
 * Image dimensions
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Coordinate point (pixel-based)
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Rectangle bounds
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * User preferences
 */
export interface UserPreferences {
  /** Primary feature preference */
  primaryFeature: 'reminders' | 'patterns' | 'both';
  
  /** Default camera capture mode */
  defaultCaptureMode: 'reminder' | 'pattern' | 'auto';
  
  /** Theme preference */
  theme: 'light' | 'dark' | 'auto';
  
  /** Notification preferences */
  notifications: NotificationPreferences;
  
  /** Display preferences */
  display: DisplayPreferences;
  
  /** Privacy preferences */
  privacy: PrivacyPreferences;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  enabled: boolean;
  reminderAlerts: boolean;
  patternDiscoveries: boolean;
  projectUpdates: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  advanceNoticeMinutes: number; // Notify X minutes before reminder time
}

/**
 * Display preferences
 */
export interface DisplayPreferences {
  showCategoryEmojis: boolean;
  showPatternLabels: boolean;
  defaultPatternOpacity: number; // 0-1
  animationsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  compactMode: boolean;
}

/**
 * Privacy preferences
 */
export interface PrivacyPreferences {
  saveOriginalImages: boolean;
  cloudSyncEnabled: boolean; // Phase 2
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
}

/**
 * Storage keys for AsyncStorage
 */
export enum StorageKey {
  REMINDERS = 'visionflow_reminders_v1',
  PATTERNS = 'visionflow_patterns_v1',
  PROJECTS = 'visionflow_projects_v1',
  USER_PREFERENCES = 'visionflow_preferences_v1',
  ONBOARDING_COMPLETE = 'visionflow_onboarding_complete',
  LAST_SYNC = 'visionflow_last_sync',
  CACHE = 'visionflow_cache_v1',
}

/**
 * App lifecycle states
 */
export enum AppState {
  ACTIVE = 'active',
  BACKGROUND = 'background',
  INACTIVE = 'inactive',
}

/**
 * Permission status
 */
export enum PermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  UNDETERMINED = 'undetermined',
  BLOCKED = 'blocked', // User denied with "Don't ask again"
}

/**
 * Permission types
 */
export enum PermissionType {
  CAMERA = 'camera',
  NOTIFICATIONS = 'notifications',
  PHOTOS = 'photos',
  MEDIA_LIBRARY = 'media_library',
}

/**
 * Date/Time format configurations
 */
export const DATE_FORMATS = {
  STORAGE: 'YYYY-MM-DD', // ISO 8601
  DISPLAY_SHORT: 'MMM D', // Jan 15
  DISPLAY_LONG: 'MMMM D, YYYY', // January 15, 2026
  DISPLAY_WITH_DAY: 'ddd, MMM D', // Mon, Jan 15
  TIME_24H: 'HH:mm', // 14:30
  TIME_12H: 'h:mm A', // 2:30 PM
  DATETIME_FULL: 'YYYY-MM-DD HH:mm:ss',
} as const;

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  page: number;
  pageSize: number;
  totalItems?: number;
  totalPages?: number;
}

/**
 * Search result with highlighting
 */
export interface SearchResult<T> {
  item: T;
  score: number; // Relevance score 0-1
  matches?: SearchMatch[];
}

/**
 * Search match highlight
 */
export interface SearchMatch {
  field: string; // Which field matched
  indices: [number, number][]; // Character ranges that matched
  value: string; // The matched text
}

/**
 * Export format options
 */
export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  PDF = 'pdf',
  ICS = 'ics', // iCalendar for reminders
  SVG = 'svg', // For patterns
  PNG = 'png', // For patterns
}

/**
 * Share options
 */
export interface ShareOptions {
  title?: string;
  message?: string;
  url?: string;
  urls?: string[];
  type?: string; // MIME type
}

/**
 * Toast notification configuration
 */
export interface ToastConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // milliseconds
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number; // 0-100
}

/**
 * Feature flags for gradual rollout (Phase 2)
 */
export interface FeatureFlags {
  cloudSync: boolean;
  voiceInput: boolean;
  recurringReminders: boolean;
  widgets: boolean;
  collaboration: boolean;
  analytics: boolean;
}

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  name: string;
  category: 'reminder' | 'pattern' | 'project' | 'navigation' | 'user_action';
  properties?: Record<string, any>;
  timestamp: number;
}

/**
 * Type guard utilities
 */
export const isString = (value: any): value is string => typeof value === 'string';
export const isNumber = (value: any): value is number => typeof value === 'number' && !isNaN(value);
export const isBoolean = (value: any): value is boolean => typeof value === 'boolean';
export const isArray = (value: any): value is any[] => Array.isArray(value);
export const isObject = (value: any): value is object => typeof value === 'object' && value !== null && !Array.isArray(value);
export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

/**
 * Utility type: Make specific fields required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Utility type: Make specific fields optional
 */
export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type: Extract enum values
 */
export type EnumValues<T> = T[keyof T];