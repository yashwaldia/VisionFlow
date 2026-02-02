/**
 * VisionFlow AI - Design System
 * Complete theme configuration following 2026 standards
 * 
 * @module constants/theme
 * @see Product Requirements: Section 1.3 - UI/UX Design System
 */

/**
 * Color Palette
 * Following Material You 3.0 and iOS 18 design principles
 */
export const Colors = {
  // Primary Brand Colors
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main brand color
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
  },

  // Dark Background System
  background: {
    primary: '#0A0A0F', // Main background
    secondary: '#1A1A24', // Elevated surfaces (cards)
    tertiary: '#2A2A38', // Higher elevation
    overlay: 'rgba(0, 0, 0, 0.6)', // Modal backdrop
  },

  // Text Colors
  text: {
    primary: '#FFFFFF', // 100% opacity
    secondary: '#E5E5EA', // 70% opacity
    tertiary: '#8B8B9A', // 50% opacity
    disabled: '#3C3C43', // 30% opacity
    inverse: '#0A0A0F', // For light backgrounds
  },

  // Category-Specific Colors (12 categories)
  category: {
    money: {
      light: '#10B981',
      main: '#059669',
      dark: '#047857',
      gradient: ['#10B981', '#059669', '#047857'],
    },
    work: {
      light: '#3B82F6',
      main: '#2563EB',
      dark: '#1D4ED8',
      gradient: ['#3B82F6', '#2563EB', '#1D4ED8'],
    },
    health: {
      light: '#F43F5E',
      main: '#E11D48',
      dark: '#BE123C',
      gradient: ['#F43F5E', '#E11D48', '#BE123C'],
    },
    study: {
      light: '#F59E0B',
      main: '#D97706',
      dark: '#B45309',
      gradient: ['#F59E0B', '#D97706', '#B45309'],
    },
    personal: {
      light: '#14B8A6',
      main: '#0D9488',
      dark: '#0F766E',
      gradient: ['#14B8A6', '#0D9488', '#0F766E'],
    },
    travel: {
      light: '#0EA5E9',
      main: '#0284C7',
      dark: '#0369A1',
      gradient: ['#0EA5E9', '#0284C7', '#0369A1'],
    },
    home: {
      light: '#F97316',
      main: '#EA580C',
      dark: '#C2410C',
      gradient: ['#F97316', '#EA580C', '#C2410C'],
    },
    legal: {
      light: '#64748B',
      main: '#475569',
      dark: '#334155',
      gradient: ['#64748B', '#475569', '#334155'],
    },
    business: {
      light: '#6366F1',
      main: '#4F46E5',
      dark: '#4338CA',
      gradient: ['#6366F1', '#4F46E5', '#4338CA'],
    },
    family: {
      light: '#EC4899',
      main: '#DB2777',
      dark: '#BE185D',
      gradient: ['#EC4899', '#DB2777', '#BE185D'],
    },
    fitness: {
      light: '#EF4444',
      main: '#DC2626',
      dark: '#B91C1C',
      gradient: ['#EF4444', '#DC2626', '#B91C1C'],
    },
    events: {
      light: '#8B5CF6',
      main: '#7C3AED',
      dark: '#6D28D9',
      gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'],
    },
  },

  // Pattern Type Colors
  pattern: {
    fibonacci: '#FACC15',
    channel: '#3B82F6',
    pitchfork: '#10B981',
    geometric: '#A855F7',
    wave: '#06B6D4',
    symmetry: '#6366F1',
    sacredGeometry: '#F472B6',
    custom: '#EF4444',
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#EAB308',
    info: '#3B82F6',
  },

  // UI State Colors
  state: {
    active: '#6366F1',
    inactive: '#64748B',
    hover: 'rgba(255, 255, 255, 0.1)',
    pressed: 'rgba(255, 255, 255, 0.05)',
    focus: 'rgba(99, 102, 241, 0.3)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },

  // Border Colors
  border: {
    default: 'rgba(255, 255, 255, 0.1)',
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.15)',
    strong: 'rgba(255, 255, 255, 0.3)',
  },
} as const;

/**
 * Typography System
 * SF Pro Display / Roboto with consistent hierarchy
 */
export const Typography = {
  // Font Families
  fontFamily: {
    primary: 'System', // Uses platform default (SF Pro / Roboto)
    mono: 'monospace', // For timestamps and code
  },

  // Font Sizes
  fontSize: {
    micro: 10,
    caption: 12,
    body: 14,
    bodyLarge: 16,
    h4: 18,
    h3: 20,
    h2: 24,
    h1: 32,
    display: 40,
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line Heights (1.5x font size for readability)
  lineHeight: {
    micro: 15,
    caption: 18,
    body: 21,
    bodyLarge: 24,
    h4: 27,
    h3: 30,
    h2: 36,
    h1: 48,
    display: 60,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

/**
 * Spacing System
 * 8pt base unit grid
 */
export const Spacing = {
  xxs: 4,
  xs: 8,
  s: 12,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Semantic spacing
  screenPadding: {
    horizontal: 16,
    vertical: 24,
  },
  cardPadding: 16,
  sectionGap: 24,
  itemGap: 12,
} as const;

/**
 * Border Radius System
 */
export const BorderRadius = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  full: 9999, // Pill shape
} as const;

/**
 * Shadow System
 * Depth layers for elevation
 */
export const Shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

/**
 * Animation Durations (milliseconds)
 */
export const AnimationDuration = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;

/**
 * Animation Easing Functions
 */
export const AnimationEasing = {
  easeIn: [0.4, 0, 1, 1] as const,
  easeOut: [0, 0, 0.2, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
} as const;

/**
 * Component-Specific Dimensions
 */
export const Dimensions = {
  // Touchable minimum (iOS HIG / Material)
  touchableMin: 44,

  // Button heights
  button: {
    small: 36,
    medium: 44,
    large: 52,
  },

  // Input heights
  input: {
    default: 48,
    large: 56,
  },

  // Bottom tab bar
  tabBar: {
    height: 60,
    iconSize: 24,
  },

  // Header
  header: {
    height: 56,
  },

  // FAB (Floating Action Button)
  fab: {
    size: 56,
    iconSize: 24,
  },

  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },

  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },
} as const;

/**
 * Z-Index Layering
 */
export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

/**
 * Opacity Values
 */
export const Opacity = {
  disabled: 0.3,
  secondary: 0.5,
  tertiary: 0.7,
  full: 1.0,
} as const;

/**
 * Glassmorphism Effect
 */
export const Glassmorphism = {
  blur: 20,
  tint: 'rgba(255, 255, 255, 0.1)',
  borderColor: 'rgba(255, 255, 255, 0.2)',
} as const;

/**
 * Complete Theme Object
 */
export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  animation: {
    duration: AnimationDuration,
    easing: AnimationEasing,
  },
  dimensions: Dimensions,
  zIndex: ZIndex,
  opacity: Opacity,
  glassmorphism: Glassmorphism,
} as const;

export type ThemeType = typeof Theme;
