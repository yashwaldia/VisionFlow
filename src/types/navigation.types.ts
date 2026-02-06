/**
 * VisionFlow AI - Navigation Type Definitions
 * Type-safe routing for React Navigation
 * 
 * @module types/navigation
 * @see React Navigation TypeScript Guide
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Reminder, ReminderCategory } from './reminder.types';
import type { Pattern, PatternType, AIPatternAnalysis } from './pattern.types';
import type { Project } from './project.types'; // ✅ ADDED

/**
 * Root Stack Navigator
 * Top-level navigation structure
 */
export type RootStackParamList = {
  // Onboarding flow (shown once on first launch)
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  
  // Main app (bottom tab navigator)
  MainApp: NavigatorScreenParams<MainTabParamList>;
  
  // Global modals (accessible from anywhere)
  CameraModal: {
    mode?: 'reminder' | 'pattern' | 'auto';
  };
  AIReviewModal: {
    imageUri: string;
    analysisType: 'reminder' | 'pattern';
    aiResult: any; // Will be AIReminderAnalysis | AIPatternAnalysis
  };
  PatternResultsScreen: {
    analysisResult: AIPatternAnalysis;
    processedImages: {
      original: string;
      edges: string;
      width: number;
      height: number;
    };
  };
  PermissionsModal: {
    permission: 'camera' | 'notifications' | 'photos';
    returnRoute?: keyof RootStackParamList;
  };
  
  // ✅ Reminder modals (fullScreenModal presentation)
  CreateReminderScreen: {
    imageUri?: string;
    aiSuggestion?: any; // AIReminderAnalysis
  };
  EditReminderScreen: {
    reminder: Reminder;
  };
  
  // ✅ Project modals (fullScreenModal presentation - matches Reminder pattern)
  CreateProjectScreen: {
    suggestedName?: string;
    suggestedCategory?: ReminderCategory;
  };
  EditProjectScreen: {
    project: Project;
  };
};

/**
 * Onboarding Stack Navigator
 * First-time user experience
 */
export type OnboardingStackParamList = {
  Welcome: undefined;
  ChoosePath: undefined;
  Permissions: undefined;
};

/**
 * Main Tab Navigator
 * Bottom navigation bar (5 tabs)
 */
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  RemindersTab: NavigatorScreenParams<ReminderStackParamList>;
  PatternsTab: NavigatorScreenParams<PatternStackParamList>;
  ProjectsTab: NavigatorScreenParams<ProjectStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

/**
 * Home Stack Navigator
 * Dashboard and quick actions
 */
export type HomeStackParamList = {
  Home: undefined;
  Search: {
    initialQuery?: string;
    scope?: 'reminders' | 'patterns' | 'projects' | 'all';
  };
};

/**
 * Reminder Stack Navigator
 * Reminder management screens
 * 
 * NOTE: CreateReminder and EditReminder moved to RootStackParamList
 * as fullScreenModals to properly hide tab bar
 */
export type ReminderStackParamList = {
  ReminderList: {
    filterCategory?: ReminderCategory;
    filterProjectId?: string;
  };
  ReminderDetail: {
    reminderId: string;
  };
  // ❌ REMOVED: CreateReminder and EditReminder (now CreateReminderScreen and EditReminderScreen in RootStackParamList)
};

/**
 * Pattern Stack Navigator
 * Pattern discovery and library
 */
export type PatternStackParamList = {
  PatternLibrary: {
    filterType?: PatternType;
  };
  PatternViewer: {
    patternId?: string;
    imageUri?: string;
    aiAnalysis?: any; // AIPatternAnalysis
  };
  PatternDetail: {
    patternId: string;
  };
  PatternEditor: {
    patternId?: string; // Undefined for new manual pattern
    imageUri: string;
  };
};

/**
 * Project Stack Navigator
 * Project management screens
 * 
 * NOTE: CreateProject and EditProject moved to RootStackParamList
 * as fullScreenModals to properly hide tab bar (matches Reminder pattern)
 */
export type ProjectStackParamList = {
  ProjectList: undefined;
  ProjectDetail: {
    projectId: string;
  };
  ProjectAnalytics: {
    projectId: string;
  };
  // ❌ REMOVED: CreateProject and EditProject (now CreateProjectScreen and EditProjectScreen in RootStackParamList)
};

/**
 * Settings Stack Navigator
 * App configuration screens
 */
export type SettingsStackParamList = {
  SettingsHome: undefined;
  NotificationSettings: undefined;
  ThemeSettings: undefined;
  DataManagement: undefined;
  About: undefined;
  DebugMode: undefined; // Development only
};

/**
 * Deep linking configuration
 * URL structure: visionflow://[route]/[params]
 */
export const DEEP_LINK_CONFIG = {
  prefixes: ['visionflow://', 'https://visionflow.app'],
  config: {
    screens: {
      MainApp: {
        screens: {
          RemindersTab: {
            screens: {
              ReminderDetail: 'reminders/:reminderId',
            },
          },
          PatternsTab: {
            screens: {
              PatternDetail: 'patterns/:patternId',
            },
          },
          ProjectsTab: {
            screens: {
              ProjectDetail: 'projects/:projectId',
            },
          },
        },
      },
    },
  },
};

/**
 * Bottom tab navigator icons
 */
export const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  HomeTab: 'home',
  RemindersTab: 'camera',
  PatternsTab: 'sparkles',
  ProjectsTab: 'folder',
  SettingsTab: 'settings',
};

/**
 * Bottom tab navigator labels
 */
export const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  HomeTab: 'Home',
  RemindersTab: 'Reminders',
  PatternsTab: 'Patterns',
  ProjectsTab: 'Projects',
  SettingsTab: 'Settings',
};

/**
 * Type helper for useNavigation hook
 * Usage: const navigation = useNavigation<AppNavigation>();
 */
export type AppNavigation = {
  navigate: <RouteName extends keyof RootStackParamList>(
    ...args: undefined extends RootStackParamList[RouteName]
      ? [RouteName] | [RouteName, RootStackParamList[RouteName]]
      : [RouteName, RootStackParamList[RouteName]]
  ) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  reset: (state: any) => void;
};

/**
 * Type helper for useRoute hook
 * Usage: const route = useRoute<AppRoute<'ReminderDetail'>>();
 */
export type AppRoute<RouteName extends keyof RootStackParamList> = {
  key: string;
  name: RouteName;
  params: RootStackParamList[RouteName];
};
