/**
 * VisionFlow AI - Design System (v2.1 - Harmonized Edition)
 * Cyberpunk/Tactical interface configuration with enforced consistency
 * 
 * @module constants/theme
 * @see Product Requirements: Section 1.3 - UI/UX Design System
 * 
 * CHANGELOG v2.1:
 * - Added explicit typography variants for screen consistency
 * - Added safe area spacing helpers
 * - Clarified font weight usage (removed 'heavy', standardized to '700')
 * - Added component spacing guidelines
 */


/**
 * Color Palette
 * Aesthetic: "Hidden-Sight" // Cyberpunk // Tactical HUD
 */
export const Colors = {
  // Primary: Electric Blue (The Scanner Eye)
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#3b82f6', // CORE BRAND COLOR (Electric Blue)
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Secondary: Neural Amber (Data/Processing)
  secondary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Amber Glow
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Dark Background System (OLED Optimized)
  background: {
    primary: '#020203',   // Deepest Void (Main)
    secondary: '#08080A', // Card Surface
    tertiary: '#121216',  // Elevated Surface
    overlay: 'rgba(2, 2, 3, 0.85)', // Modal Backdrop
    scanline: 'rgba(59, 130, 246, 0.03)', // Subtle grid texture
  },

  // Text Colors (High Contrast Data)
  text: {
    primary: '#F3F4F6',   // 100% (Crisp White/Grey)
    secondary: '#9CA3AF', // 70% (Muted Blue-Grey)
    tertiary: '#6B7280',  // 50% (Dimmed Data)
    disabled: '#374151',  // 30%
    inverse: '#020203',   // For light backgrounds
    accent: '#3b82f6',    // Highlighted Data
  },

  // Category-Specific Colors (Retained & Tuned for Dark Mode)
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

  // Pattern Type Colors (Neon/Cyberpunk)
  pattern: {
    fibonacci: '#FACC15', // Yellow
    channel: '#3B82F6',   // Blue
    pitchfork: '#10B981', // Green
    geometric: '#A855F7', // Purple
    wave: '#06B6D4',      // Cyan
    symmetry: '#6366F1',  // Indigo
    sacredGeometry: '#F472B6', // Pink
    custom: '#EF4444',    // Red
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },

  // UI State Colors
  state: {
    active: '#3B82F6',
    inactive: '#6B7280',
    hover: 'rgba(255, 255, 255, 0.08)',
    pressed: 'rgba(59, 130, 246, 0.15)',
    focus: 'rgba(59, 130, 246, 0.3)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },

  // Border Colors (Thin, Precise Lines)
  border: {
    default: 'rgba(255, 255, 255, 0.08)',
    light: 'rgba(255, 255, 255, 0.04)',
    medium: 'rgba(255, 255, 255, 0.12)',
    strong: 'rgba(255, 255, 255, 0.25)',
    active: 'rgba(59, 130, 246, 0.5)',
    glow: 'rgba(59, 130, 246, 0.3)',
  },
} as const;


/**
 * Typography System
 * SF Pro Display / Roboto with consistent hierarchy
 * 
 * USAGE GUIDELINES:
 * - h1: Large feature titles (Home screen "VisionFlow AI")
 * - h2: Screen titles (RemindersScreen, PatternsScreen, etc.)
 * - h3: Section headers within screens
 * - h4: Subsection headers, card titles
 * - bodyLarge: Important body text, list items
 * - body: Default text, descriptions
 * - caption: Secondary info, metadata
 * - micro: Tiny labels, badges, status indicators
 */
export const Typography = {
  // Font Families
  fontFamily: {
    primary: 'System',
    mono: 'monospace', // For timestamps, data, HUD labels
  },

  // Raw Font Sizes (use variants below instead)
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

  // Font Weights (STANDARDIZED - removed 'heavy')
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const, // Use this for all headers
  },

  // Raw Line Heights
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
    widest: 1.5, // For "VISIONFLOW" headers
  },

  /**
   * 🆕 TYPOGRAPHY VARIANTS (Use these in Text component)
   * Each variant combines fontSize, lineHeight, and fontWeight
   */
  variants: {
    // Display (Hero text - rare use)
    display: {
      fontSize: 40,
      lineHeight: 60,
      fontWeight: '700' as const,
      letterSpacing: 1.5,
    },

    // Headings
    h1: {
      fontSize: 32,
      lineHeight: 48,
      fontWeight: '700' as const,
      letterSpacing: 0,
    },
    h2: {
      fontSize: 24,
      lineHeight: 36,
      fontWeight: '700' as const,
      letterSpacing: 0,
    },
    h3: {
      fontSize: 20,
      lineHeight: 30,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    h4: {
      fontSize: 18,
      lineHeight: 27,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },

    // Body Text
    bodyLarge: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    body: {
      fontSize: 14,
      lineHeight: 21,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },

    // Small Text
    caption: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    micro: {
      fontSize: 10,
      lineHeight: 15,
      fontWeight: '600' as const, // Bold for visibility
      letterSpacing: 0.5,
    },
  },
} as const;


/**
 * Spacing System
 * 4px Base Grid
 */
export const Spacing = {
  none: 0,
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

  /**
   * 🆕 SAFE AREA HELPERS
   * Use these for consistent bottom spacing above tab bar
   */
  safeArea: {
    bottomTabBar: 64,        // Tab bar height
    bottomPadding: 80,       // Tab bar + 16px spacing
    bottomPaddingLarge: 96,  // For lists with FABs
  },
} as const;


/**
 * Border Radius System (Squircle / Tech)
 */
export const BorderRadius = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;


/**
 * Shadow System
 * Updated with Glow effects for HUD
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
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  // HUD Glow
  glow: {
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
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
  touchableMin: 44,
  button: {
    small: 32,
    medium: 44,
    large: 52,
  },
  input: {
    default: 48,
    large: 56,
  },
  tabBar: {
    height: 64,
    iconSize: 24,
  },
  header: {
    height: 56,
  },
  fab: {
    size: 56,
    iconSize: 24,
  },
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },
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
  disabled: 0.4,
  secondary: 0.6,
  tertiary: 0.8,
  full: 1.0,
} as const;


/**
 * Glassmorphism Effect
 */
export const Glassmorphism = {
  blur: 20,
  tint: 'rgba(10, 10, 15, 0.6)',
  borderColor: 'rgba(255, 255, 255, 0.08)',
  borderWidth: 1,
} as const;


/**
 * 🆕 COMPONENT STYLE PRESETS
 * Reusable style objects for common components
 */
export const ComponentStyles = {
  /**
   * Filter Chips (for Reminders, Patterns, Projects screens)
   * USE THIS EVERYWHERE for consistency
   */
  filterChip: {
    base: {
      paddingHorizontal: Spacing.m,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full, // Always full for pill shape
      backgroundColor: Colors.background.tertiary,
      borderWidth: 1,
      borderColor: Colors.border.medium,
    },
    active: {
      backgroundColor: `${Colors.primary[500]}20`, // 20% opacity
      borderColor: Colors.primary[500],
    },
  },

  /**
   * Card Styles
   */
  card: {
    base: {
      backgroundColor: Colors.background.secondary,
      borderRadius: BorderRadius.m,
      padding: Spacing.cardPadding,
      borderWidth: 1,
      borderColor: Colors.border.default,
    },
    elevated: {
      ...Shadows.md,
    },
  },

  /**
   * Screen Header
   */
  screenHeader: {
    paddingHorizontal: Spacing.screenPadding.horizontal,
    paddingVertical: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.background.secondary,
  },
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
  componentStyles: ComponentStyles, // 🆕 NEW
  
  // HUD-specific configs
  hud: {
    scanlineOpacity: 0.05,
    activeBorderWidth: 1,
  },
} as const;


export type ThemeType = typeof Theme;
