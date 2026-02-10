/**
 * VisionFlow AI - Application Configuration
 * Environment-specific settings and constants
 * 
 * @module constants/config
 * @version 4.0.0 - Cost-Optimized & Multi-Domain Ready
 * 
 * COST OPTIMIZATION NOTES:
 * - Using gemini-2.5-flash (FREE tier model)
 * - Reduced token limits to minimize costs
 * - Lower temperature for consistency (reduces retries)
 * - Optimized for single-pass accurate responses
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
    
    // 💰 COST OPTIMIZATION: Using FREE tier models
    reminderModel: 'gemini-2.0-flash-exp', // Free tier, fast responses
    patternModel: 'gemini-2.0-flash-exp',  // Free tier, good for structured output
    
    timeout: 30000,
    maxRetries: 2, // Reduced from 3 to save API calls
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
  // 💰 COST OPTIMIZATION: Smaller images = faster processing = lower costs
  maxWidth: 1024,   // Reduced from 2048 - sufficient for pattern detection
  maxHeight: 1024,  // Reduced from 2048
  
  // Compression quality (0-1)
  quality: 0.85, // Good balance between quality and file size
  
  // Maximum file size (10MB)
  maxFileSizeBytes: 10 * 1024 * 1024,
  
  // Supported formats
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp'] as const,
  
  // Edge Detection Configuration
  edgeDetectionApiUrl: process.env.EXPO_PUBLIC_EDGE_DETECTION_API || '',
  
  edgeDetection: {
    enabled: true,
    algorithm: 'sobel' as const, // 'sobel' is faster than 'canny'
    threshold: 50,
    colorScheme: 'cyan-green' as const,
    
    strategy: {
      preferBackend: Boolean(process.env.EXPO_PUBLIC_EDGE_DETECTION_API) && 
                     process.env.FORCE_CLIENT_SIDE_EDGE_DETECTION !== 'true',
      fallbackToClient: true,
    },
    
    timeout: 12000, // Reduced from 15s to fail faster
    maxRetries: 1,  // Single retry to avoid wasting time
  },
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
    edgeDetectionCache: 'visionflow_edge_cache_v1',
  },

  // Storage limits
  limits: {
    maxReminders: 10000,
    maxPatterns: 5000,
    maxProjects: 500,
    maxImageStorageBytes: 50 * 1024 * 1024, // 50MB
    maxEdgeCacheBytes: 10 * 1024 * 1024,     // 10MB
  },
  
  // Cache settings
  cache: {
    edgeDetection: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxSize: 50,
    },
  },
} as const;

/**
 * Notification Configuration
 */
export const NOTIFICATION_CONFIG = {
  checkIntervalMs: 60000, // 1 minute
  advanceNoticeOptions: [0, 5, 10, 15, 30, 60, 120, 1440],
  defaultAdvanceMinutes: 0,

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
 * 
 * 💰 COST OPTIMIZATION STRATEGY:
 * - Low temperature (0.25-0.3) = More consistent output = Fewer retries
 * - Reduced maxTokens = Lower costs per request
 * - Structured JSON output = No wasted tokens on explanations
 * - Single-pass accuracy = No need for multiple attempts
 */
export const AI_CONFIG = {
  // Reminder extraction
  reminder: {
    temperature: 0.25,   // Very low for consistent structured output
    maxTokens: 1024,     // Sufficient for reminder extraction
    topK: 20,            // Limits vocabulary for focused responses
    topP: 0.85,          // Nucleus sampling for quality
  },

  // Pattern detection (💰 OPTIMIZED FOR COST)
  pattern: {
    temperature: 0.25,   // 🔧 REDUCED from 0.3 - more deterministic = fewer retries
    maxTokens: 3072,     // 🔧 REDUCED from 4096 - still enough for complex patterns
    topK: 20,            // 🔧 ADDED - limits token choices for consistency
    topP: 0.85,          // 🔧 ADDED - nucleus sampling for quality control
  },

  strictSchemaValidation: true,
} as const;

/**
 * UI/UX Configuration
 */
export const UI_CONFIG = {
  // Animation settings
  animations: {
    enabled: true,
    reducedMotion: false,
    defaultDuration: 300,
    
    // Pattern overlay animations
    patternOverlay: {
      sonarPulseDuration: 2000,
      sonarRingCount: 3,
      sonarStagger: 0.33,
      flowAnimationSpeed: 30,
      spiralDrawDuration: 3000,
    },
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
    longPressDuration: 500,
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
  
  // Pattern results screen
  patternResults: {
    hudCornerSize: 32,
    hudCornerBorderWidth: 3,
    hudCornerOffset: 24,
    labelOffsetX: 16,
    labelOffsetY: 24,
    labelCollisionDetection: true,
    showLiveDataBadge: true,
    showConfidencePercentage: true,
    showMeasurements: true,
  },
} as const;

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  // Phase 1 (MVP)
  coreReminders: true,
  corePatterns: true,
  projects: true,
  localStorage: true,
  nativeNotifications: true,
  edgeDetection: true,

  // Phase 2 (Post-Launch)
  cloudSync: false,
  recurringReminders: false,
  voiceInput: false,
  widgets: false,
  collaboration: false,
  
  // Backend features
  backendEdgeDetection: Boolean(process.env.EXPO_PUBLIC_EDGE_DETECTION_API),

  // Phase 3 (Future)
  aiInsightsReport: false,
  patternBasedScheduling: false,
  multiLanguage: false,
  watchApp: false,

  // Development
  debugMode: IS_DEV,
  analytics: IS_PROD,
  crashReporting: IS_PROD,
  logEdgeDetectionPerformance: IS_DEV || process.env.DEBUG_PERFORMANCE === 'true',
  showEdgeDetectionFallbackNotice: IS_DEV,
  
  // 💰 Cost monitoring
  logTokenUsage: IS_DEV || process.env.LOG_TOKEN_USAGE === 'true',
  warnOnHighTokenUsage: true,
} as const;

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  reminder: {
    titleMaxLength: 60,
    noteMaxLength: 500,
    projectNameMaxLength: 20,
    minDate: new Date().toISOString().split('T')[0],
  },

  project: {
    nameMinLength: 1,
    nameMaxLength: 20,
    descriptionMaxLength: 200,
  },

  pattern: {
    minAnchors: 2,
    maxAnchors: 20,
    minConfidence: 0.25,  // Lowered from 0.3 to allow more patterns
    notesMaxLength: 500,
  },
  
  image: {
    minWidth: 100,
    minHeight: 100,
    maxWidth: 4096,
    maxHeight: 4096,
    maxFileSizeBytes: IMAGE_CONFIG.maxFileSizeBytes,
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
    edgeDetection: {
      preferBackend: true,
      cacheResults: true,
      showProcessingIndicator: true,
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
    colorOverride: undefined,
  },
} as const;

/**
 * Performance Monitoring Thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  imageProcessing: {
    warning: 2000,   // Reduced from 3000ms
    critical: 4000,  // Reduced from 5000ms
  },
  edgeDetection: {
    warning: 4000,   // Reduced from 5000ms
    critical: 8000,  // Reduced from 10000ms
  },
  aiAnalysis: {
    warning: 8000,   // Reduced from 10000ms
    critical: 15000, // Reduced from 20000ms
  },
  
  // 💰 Token usage monitoring
  tokenUsage: {
    reminder: {
      warning: 800,    // Warn if approaching 1024 limit
      critical: 1000,  // Critical if exceeding expected usage
    },
    pattern: {
      warning: 2500,   // Warn if approaching 3072 limit
      critical: 2900,  // Critical if exceeding expected usage
    },
  },
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  edgeDetection: {
    backendUnavailable: 'Edge detection service is temporarily unavailable. Using fallback processing.',
    backendProtected: 'Backend is protected. Please disable Vercel authentication or use client-side fallback.',
    timeout: 'Edge detection is taking longer than expected. Please try again.',
    failed: 'Unable to process edge detection. Original image will be used.',
    invalidResponse: 'Received invalid response from edge detection service.',
  },
  imageProcessing: {
    tooLarge: 'Image is too large. Maximum size is 10MB.',
    invalidFormat: 'Unsupported image format. Please use JPEG, PNG, or WebP.',
    processingFailed: 'Failed to process image. Please try again.',
  },
  ai: {
    tokenLimitExceeded: 'Response too long. Please try with a simpler image.',
    rateLimitExceeded: 'Too many requests. Please wait a moment and try again.',
    apiKeyInvalid: 'AI service is not configured. Please check your API key.',
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
  
  docs: {
    edgeDetectionSetup: 'https://docs.visionflow.app/edge-detection',
    backendDeployment: 'https://docs.visionflow.app/backend-setup',
    costOptimization: 'https://docs.visionflow.app/cost-optimization',
  },
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
  performance: PERFORMANCE_THRESHOLDS,
  errors: ERROR_MESSAGES,
  links: EXTERNAL_LINKS,
} as const;

export type ConfigType = typeof Config;
