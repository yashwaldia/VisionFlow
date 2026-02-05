/**
 * VisionFlow AI - Application Configuration
 * Environment-specific settings and constants
 * 
 * @module constants/config
 */

import { Platform } from 'react-native';

/**
 * Environment Detection
 */
export const IS_DEV = __DEV__;
export const IS_PROD = !__DEV__;
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';
export const IS_WEB = Platform.OS === 'web';

/**
 * App Information
 */
export const APP_INFO = {
  name: 'VisionFlow AI',
  displayName: 'VisionFlow',
  tagline: 'Capture Intelligence, Discover Patterns',
  version: '1.0.0',
  buildNumber: '1',
  bundleId: IS_IOS ? 'com.visionflow.app' : 'com.visionflow.app',
  scheme: 'visionflow',
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Google Gemini AI
  gemini: {
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
    reminderModel: 'gemini-2.5-flash',
    patternModel: 'gemini-2.5-flash', // Advanced model for patterns
    timeout: 30000, // 30 seconds
    maxRetries: 3,
  },

  // Future: Cloud Sync API (Phase 2)
  backend: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || '',
    timeout: 15000,
  },
} as const;

/**
 * Image Processing Configuration
 */
export const IMAGE_CONFIG = {
  // Maximum image dimensions
  maxWidth: 1024,
  maxHeight: 1024,

  // Compression quality (0-1)
  quality: 0.85,

  // Supported formats
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],

  // Edge detection parameters
  edgeDetection: {
    enabled: true,
    sobelThreshold: 50,
    colorTint: '#00D4AA', // Greenish-blue
  },

  // Maximum file size (5MB)
  maxFileSizeBytes: 5 * 1024 * 1024,
} as const;

/**
 * Storage Configuration
 */
export const STORAGE_CONFIG = {
  // AsyncStorage keys (versioned for migrations)
  keys: {
    reminders: 'visionflow_reminders_v1',
    patterns: 'visionflow_patterns_v1',
    projects: 'visionflow_projects_v1',
    preferences: 'visionflow_preferences_v1',
    onboardingComplete: 'visionflow_onboarding_complete',
    lastSync: 'visionflow_last_sync',
  },

  // Storage limits
  limits: {
    maxReminders: 10000,
    maxPatterns: 5000,
    maxProjects: 500,
    maxImageStorageBytes: 50 * 1024 * 1024, // 50MB
  },
} as const;

/**
 * Notification Configuration
 */
export const NOTIFICATION_CONFIG = {
  // Check interval for due reminders (milliseconds)
  checkIntervalMs: 60000, // 1 minute

  // Advance notice options (minutes)
  advanceNoticeOptions: [0, 5, 10, 15, 30, 60, 120, 1440], // Up to 1 day

  // Default advance notice
  defaultAdvanceMinutes: 0,

  // Notification channels (Android)
  channels: {
    reminders: {
      id: 'reminders',
      name: 'Reminders',
      description: 'Notifications for upcoming reminders',
      importance: 'high',
    },
    patterns: {
      id: 'patterns',
      name: 'Pattern Discoveries',
      description: 'Notifications for new pattern discoveries',
      importance: 'default',
    },
  },
} as const;

/**
 * AI Analysis Configuration
 */
export const AI_CONFIG = {
  // Reminder extraction
  reminder: {
    systemInstructionTemplate: `You are an intelligent assistant for "VisionFlow AI". Analyze images to extract structured reminder data.

Current Date: {{CURRENT_DATE}}

Categories: Money, Work, Health, Study, Personal, Travel, Home & Utilities, Legal & Documents, Business & Finance, Family & Kids, Fitness, Events & Occasions

Rules:
1. Classify into one category with specific subcategory
2. Suggest a project name (max 20 chars) for grouping
3. Create action-oriented title (max 60 chars)
4. Write natural 1-2 line summary
5. Infer date/time from context or default to tomorrow 09:00
6. Return valid JSON only`,

    maxTokens: 2048,
    temperature: 0.7,
  },

  // Pattern detection
  pattern: {
    systemInstructionTemplate: `Analyze this image as a "Hidden-Sight Engine". Detect geometric patterns:
- Fibonacci spirals & retracements
- Sacred geometry (Flower of Life, Golden Ratio, etc.)
- Technical patterns (channels, pitchforks, waves)
- Symmetry (radial, bilateral, rotational)

Return 1-3 most prominent patterns with:
- Type and subtype
- Confidence score (0-1)
- Anchor points as percentages (0-100)
- Mathematical measurements
- Insights and explanations`,

    maxTokens: 4096,
    temperature: 0.8,
  },

  // Response schema validation
  strictSchemaValidation: true,
} as const;

/**
 * UI/UX Configuration
 */
export const UI_CONFIG = {
  // Animation settings
  animations: {
    enabled: true,
    reducedMotion: false, // Respect system preference
    defaultDuration: 300,
  },

  // Haptic feedback
  haptics: {
    enabled: true,
    patterns: {
      light: 'light',
      medium: 'medium',
      heavy: 'heavy',
      success: 'notificationSuccess',
      warning: 'notificationWarning',
      error: 'notificationError',
    },
  },

  // Gestures
  gestures: {
    swipeToDeleteEnabled: true,
    pullToRefreshEnabled: true,
    longPressDuration: 500, // milliseconds
  },

  // List rendering
  lists: {
    initialNumToRender: 10,
    maxToRenderPerBatch: 10,
    windowSize: 10,
    updateCellsBatchingPeriod: 50,
  },

  // Toast notifications
  toast: {
    duration: 3000,
    position: 'bottom' as const,
    offset: 100,
  },
} as const;

/**
 * Feature Flags
 * Control feature availability for gradual rollout
 */
export const FEATURE_FLAGS = {
  // Phase 1 (MVP)
  coreReminders: true,
  corePatterns: true,
  projects: true,
  localStorage: true,
  nativeNotifications: true,

  // Phase 2 (Post-Launch)
  cloudSync: false,
  recurringReminders: false,
  voiceInput: false,
  widgets: false,
  collaboration: false,

  // Phase 3 (Future)
  aiInsightsReport: false,
  patternBasedScheduling: false,
  multiLanguage: false,
  watchApp: false,

  // Development
  debugMode: IS_DEV,
  analytics: IS_PROD,
  crashReporting: IS_PROD,
} as const;

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  reminder: {
    titleMaxLength: 60,
    noteMaxLength: 500,
    projectNameMaxLength: 20,
    minDate: new Date().toISOString().split('T')[0], // Today
  },

  project: {
    nameMinLength: 1,
    nameMaxLength: 20,
    descriptionMaxLength: 200,
  },

  pattern: {
    minAnchors: 2,
    maxAnchors: 20,
    minConfidence: 0.3,
    notesMaxLength: 500,
  },
} as const;

/**
 * Default Values
 */
export const DEFAULTS = {
  userPreferences: {
    primaryFeature: 'both' as const,
    defaultCaptureMode: 'auto' as const,
    theme: 'dark' as const,
    notifications: {
      enabled: true,
      reminderAlerts: true,
      patternDiscoveries: false,
      projectUpdates: false,
      soundEnabled: true,
      vibrationEnabled: true,
      advanceNoticeMinutes: 0,
    },
    display: {
      showCategoryEmojis: true,
      showPatternLabels: true,
      defaultPatternOpacity: 0.8,
      animationsEnabled: true,
      hapticFeedbackEnabled: true,
      compactMode: false,
    },
    privacy: {
      saveOriginalImages: true,
      cloudSyncEnabled: false,
      analyticsEnabled: true,
      crashReportingEnabled: true,
    },
  },

  patternRenderConfig: {
    visible: true,
    opacity: 0.8,
    showAnchors: true,
    showLabels: true,
    animated: true,
    blendMode: 'screen' as const,
    lineWidth: 2,
  },
} as const;

/**
 * External Links
 */
export const EXTERNAL_LINKS = {
  website: 'https://visionflow.app',
  privacyPolicy: 'https://visionflow.app/privacy',
  termsOfService: 'https://visionflow.app/terms',
  support: 'https://visionflow.app/support',
  github: 'https://github.com/visionflow/app',
  twitter: 'https://twitter.com/visionflowai',
  discord: 'https://discord.gg/visionflow',
} as const;

/**
 * Deep Linking Prefixes
 */
export const DEEP_LINK_PREFIXES = ['visionflow://', 'https://visionflow.app'];

/**
 * Export entire config
 */
export const Config = {
  app: APP_INFO,
  api: API_CONFIG,
  image: IMAGE_CONFIG,
  storage: STORAGE_CONFIG,
  notifications: NOTIFICATION_CONFIG,
  ai: AI_CONFIG,
  ui: UI_CONFIG,
  features: FEATURE_FLAGS,
  validation: VALIDATION_RULES,
  defaults: DEFAULTS,
  links: EXTERNAL_LINKS,
} as const;

export type ConfigType = typeof Config;
