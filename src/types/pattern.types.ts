/**
 * VisionFlow AI - Pattern Detection Type Definitions (v4.1 - Strict Classification)
 * Core types for AI-powered geometric pattern discovery
 * 
 * @module types/pattern
 * @version 4.1.0
 * 
 * CHANGELOG v4.1:
 * - 🔧 CRITICAL: Reduced to 4 strict pattern types (fibonacci, geometric, symmetry, custom)
 * - 🔧 Removed extended types to prevent UI classification errors
 * - 🔧 AI normalization maps all detections to these 4 categories
 * - ✅ Aligned with gemini.service.ts v4.1 normalization logic
 * - ✅ Maintains ContentArea (ROI), measurements, and multi-domain metadata
 * - ✅ "Geometric Repetition" now correctly maps to GEOMETRIC
 * 
 * @see Product Requirements: Section 3.1.1 - Hidden Insight Integration
 */

// ============================================
// PATTERN TYPE ENUMS (v4.1 - STRICT 4 CATEGORIES)
// ============================================

/**
 * STRICT 4-Category Pattern Classification
 * 
 * ⚠️ CRITICAL: These are the ONLY allowed pattern types in the system.
 * Matches the UI categories shown in Pattern Library screen.
 */
export enum PatternType {
  /**
   * FIBONACCI: Golden ratio, spirals, sequences
   * 
   * Maps from AI detections:
   * - fibonacci, golden_ratio, spiral, elliott_wave
   * - logarithmic_spiral, golden_angle, phyllotaxis
   * - Any pattern with φ (phi) or 1.618 relationships
   */
  FIBONACCI = 'fibonacci',
  
  /**
   * GEOMETRIC: All geometric patterns including repetition, grids, shapes
   * 
   * Maps from AI detections:
   * - geometric, geometric_repetition, repetition, grid, tile
   * - tessellation, pattern, fractal, shape, polygon
   * - triangles, squares, circles, structured layouts
   * - sacred_geometry, channel, pitchfork, wave
   * - head_shoulders, triangle, wedge, flag_pennant
   * - double_top_bottom, cup_handle, voronoi
   */
  GEOMETRIC = 'geometric',
  
  /**
   * SYMMETRY: Bilateral, radial, mirror, rotational
   * 
   * Maps from AI detections:
   * - symmetry, bilateral, radial, mirror, reflection
   * - rotational, symmetric, axis, balanced
   * - Any pattern with symmetry axes or mirror properties
   */
  SYMMETRY = 'symmetry',
  
  /**
   * CUSTOM: User-created, unknown, or ambiguous patterns
   * 
   * Maps from AI detections:
   * - unknown, unidentified, ambiguous, unclear
   * - custom (user-manually-created patterns)
   * - Fallback for anything that doesn't fit above 3 categories
   */
  CUSTOM = 'custom',
}

/**
 * Domain classification for patterns
 * (Used for insights and context, not primary classification)
 */
export enum PatternDomain {
  FINANCE = 'finance',
  NATURE = 'nature',
  ART = 'art',
  GEOMETRY = 'geometry',
  ARCHITECTURE = 'architecture',
  OTHER = 'other',
}

/**
 * Scale classification for multi-scale analysis
 */
export enum PatternScale {
  MICRO = 'micro',           // Fine details, texture-level
  MESO = 'meso',             // Mid-level structures
  MACRO = 'macro',           // Overall composition
  MULTI_SCALE = 'multi-scale', // Present at multiple scales
}

/**
 * Analysis quality assessment
 */
export enum AnalysisQuality {
  HIGH = 'high',       // Avg confidence > 0.7
  MEDIUM = 'medium',   // Avg confidence 0.5-0.7
  LOW = 'low',         // Avg confidence < 0.5
}

/**
 * Pattern complexity classification
 */
export enum PatternComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  HIGHLY_COMPLEX = 'highly_complex',
}

// ============================================
// COORDINATE & GEOMETRY TYPES
// ============================================

/**
 * Anchor point in percentage coordinates (0-100)
 * Stored as percentages to be device-independent
 */
export interface AnchorPoint {
  x: number; // 0-100 (percentage of content area width)
  y: number; // 0-100 (percentage of content area height)
}

/**
 * Content Area Detection Result (ROI - Region of Interest)
 * 
 * Identifies the actual image content, excluding UI elements like:
 * - Google Images borders and search results
 * - Watermarks in corners
 * - Browser toolbars, address bars
 * - Social media UI elements
 * - Status bars, timestamps
 * 
 * All coordinates are percentages (0-100) of FULL image dimensions.
 * Pattern anchors are then relative to this content area.
 */
export interface ContentArea {
  /** Left edge of content area (% of full image width) */
  topLeftX: number;
  
  /** Top edge of content area (% of full image height) */
  topLeftY: number;
  
  /** Right edge of content area (% of full image width) */
  bottomRightX: number;
  
  /** Bottom edge of content area (% of full image height) */
  bottomRightY: number;
  
  /** AI confidence in content area detection (0-1) */
  confidence: number;
  
  /** List of UI artifacts detected and excluded */
  detectedArtifacts: string[]; // e.g., ['google_border', 'watermark', 'toolbar']
}

// ============================================
// MEASUREMENT TYPES
// ============================================

/**
 * Enhanced mathematical measurements for patterns
 * Now includes domain-specific metrics
 */
export interface PatternMeasurements {
  // ─── GENERAL GEOMETRIC MEASUREMENTS ───
  /** Golden ratio (φ ≈ 1.618) proximity */
  goldenRatio?: number;
  
  /** Measured angles in degrees */
  angles?: number[];
  
  /** Fibonacci sequence ratios */
  fibonacciRatios?: number[];
  
  /** Symmetry axis count */
  symmetryAxes?: number;
  
  /** Node/intersection count */
  nodeCount?: number;
  
  /** Geometric ratios (width/height, etc.) */
  aspectRatio?: number;
  
  /** Distance measurements (relative to image size) */
  distances?: number[];
  
  // ─── FINANCIAL PATTERN MEASUREMENTS ───
  /** Elliott Wave count (1-5 for impulse, 1-3 for corrective) */
  waveCount?: number;
  
  /** Fibonacci retracement level (e.g., 0.382, 0.5, 0.618) */
  retracement?: number;
  
  /** Fibonacci extension level (e.g., 1.272, 1.618, 2.618) */
  extension?: number;
  
  /** Volume indicator (if visible in chart) */
  volume?: number;
  
  /** Price range or amplitude */
  priceRange?: number;
  
  // ─── NATURAL PATTERN MEASUREMENTS ───
  /** Fractal dimension (for self-similarity) */
  fractalDimension?: number;
  
  /** Branching angle (for trees, rivers, etc.) */
  branchingAngle?: number;
  
  /** Petal/leaf count (for phyllotaxis) */
  petalCount?: number;
  
  // ─── ARTISTIC PATTERN MEASUREMENTS ───
  /** Harmonic ratio for color relationships */
  harmonicRatio?: number;
  
  /** Perspective vanishing points count */
  vanishingPoints?: number;
  
  /** Composition rule compliance (0-1) */
  compositionScore?: number;
  
  /** Custom key-value measurements */
  [key: string]: number | number[] | undefined;
}

// ============================================
// PATTERN INTERFACES
// ============================================

/**
 * Core Pattern interface
 * Represents a detected or manually created geometric pattern
 */
export interface Pattern {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Pattern type classification (STRICT: only 4 allowed types) */
  type: PatternType;

  /** 
   * Subtype for additional context (freeform string)
   * 
   * Stores the original AI detection for reference/insights.
   * NOT used for primary classification.
   * 
   * Examples:
   * - type: FIBONACCI, subtype: "logarithmic_spiral"
   * - type: GEOMETRIC, subtype: "geometric_repetition"
   * - type: SYMMETRY, subtype: "bilateral"
   * - type: CUSTOM, subtype: "unknown"
   */
  subtype?: string;

  /** Human-readable pattern name */
  name: string;

  /** AI confidence score (0-1, undefined for manual patterns) */
  confidence?: number;

  /** Anchor points defining the pattern geometry (relative to content area) */
  anchors: AnchorPoint[];

  /** Mathematical measurements and properties */
  measurements: PatternMeasurements;

  /** 
   * Progressive rendering steps for staged pattern reveal
   * 
   * Array of 3-5 descriptive steps that build upon each other to reveal the pattern.
   * Each step describes what visual element to add at that stage.
   * 
   * Example for Fibonacci spiral:
   * - ["Mark center point", "Draw first quarter arc", "Add second quarter arc", "Complete full spiral", "Highlight golden ratio"]
   * 
   * Example for Elliott Wave:
   * - ["Mark wave peaks and troughs", "Connect wave progression 1-5", "Add Fibonacci retracement levels", "Highlight support/resistance zones"]
   * 
   * Used by PatternResultsScreen for animated progressive rendering matching web prototype.
   * Generated automatically by AI for detected patterns, optional for manual patterns.
   */
  overlaySteps?: string[];

  /** AI-generated insights */
  insights?: PatternInsights;

  /** Creation source */
  source: 'ai' | 'manual';

  /** Reference to original analyzed image */
  imageUri: string;

  /** Optional processed edge-detected image URI */
  edgeImageUri?: string;
  
  // ─── ENHANCED METADATA ───
  /** Pattern domain classification */
  domain?: PatternDomain;
  
  /** Scale classification (micro/meso/macro) */
  scale?: PatternScale;
  
  /** Pattern orientation in degrees (0-360, where 0 is horizontal) */
  orientation?: number;

  /** Creation timestamp */
  createdAt: number;

  /** Last updated timestamp */
  updatedAt: number;

  /** User notes or annotations */
  userNotes?: string;

  /** Tags for organization */
  tags?: string[];

  /** Favorite flag */
  isFavorite?: boolean;
}

/**
 * Enhanced AI-generated insights for patterns
 */
export interface PatternInsights {
  /** Detailed explanation of the pattern (2-3 sentences) */
  explanation: string;

  /** Hidden meaning or "secret message" */
  secretMessage: string;

  /** Social media-ready share caption */
  shareCaption: string;

  /** Mathematical significance */
  mathematicalContext?: string;

  /** Cultural or historical context */
  culturalContext?: string;
  
  // ─── ENHANCED INSIGHTS ───
  /** Primary domain of detected patterns */
  primaryDomain: PatternDomain;
  
  /** Overall pattern complexity */
  patternComplexity: PatternComplexity;
  
  /** Actionable suggestions based on pattern type */
  suggestedActions?: string[]; // e.g., ["Buy signal detected", "Wait for confirmation"]
}

// ============================================
// AI ANALYSIS TYPES
// ============================================

/**
 * Enhanced AI analysis result from Gemini
 * Returned by geminiService.analyzePatternImage()
 * 
 * Version 4.1 - All pattern types pre-normalized to 4 allowed categories
 */
export interface AIPatternAnalysis {
  /** 
   * Content area detection
   * 
   * Identifies actual image content, excluding:
   * - Google Images borders/UI
   * - Watermarks
   * - Browser elements
   * - Social media overlays
   * 
   * All pattern anchors are relative to this content area.
   */
  contentArea: ContentArea;
  
  /** Detected patterns (1-3 most prominent) */
  patterns: Array<{
    type: PatternType;
    subtype?: string;
    name: string;
    confidence: number;
    anchors: AnchorPoint[];
    measurements: PatternMeasurements;
    overlaySteps: string[]; // Now required (fallback added if missing)
    
    // ─── METADATA ───
    /** Domain classification */
    domain: PatternDomain;
    
    /** Scale classification */
    scale: PatternScale;
    
    /** Pattern orientation in degrees */
    orientation: number;
  }>;

  /** Overall analysis insights */
  insights: PatternInsights;

  /** Processing metadata */
  metadata: {
    processingTime: number;
    modelVersion: string;
    edgeDetectionApplied: boolean;
    
    /** Analysis quality assessment */
    analysisQuality: AnalysisQuality;
  };
}

// ============================================
// RENDERING CONFIGURATION
// ============================================

/**
 * Pattern rendering configuration
 */
export interface PatternRenderConfig {
  /** Pattern visibility */
  visible: boolean;

  /** Overlay opacity (0-1) */
  opacity: number;

  /** Show anchor points */
  showAnchors: boolean;

  /** Show labels and measurements */
  showLabels: boolean;

  /** Animation enabled */
  animated: boolean;

  /** Canvas blend mode */
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'lighten' | 'darken';

  /** Line width for pattern rendering */
  lineWidth: number;

  /** Color override (hex color) */
  colorOverride?: string;

  /** 
   * Current overlay step for progressive rendering (0-based index)
   * 
   * When using overlaySteps, this controls which step is currently visible.
   * - 0: Show first step only
   * - 1: Show steps 0-1
   * - 2: Show steps 0-2
   * - etc.
   * 
   * Set to undefined or patterns.overlaySteps.length - 1 to show complete pattern.
   */
  currentOverlayStep?: number;
  
  /** Animation duration for step transitions (ms) */
  stepTransitionDuration?: number;
}

// ============================================
// COLOR MAPPINGS (v4.1 - CORRECTED TO 4 TYPES)
// ============================================

/**
 * Pattern type color mapping
 * 
 * ⚠️ CRITICAL: Only 4 entries, matching PatternType enum
 */
export const PATTERN_COLORS: Record<PatternType, string> = {
  [PatternType.FIBONACCI]: '#FACC15',    // Yellow
  [PatternType.GEOMETRIC]: '#A855F7',    // Purple
  [PatternType.SYMMETRY]: '#6366F1',     // Indigo
  [PatternType.CUSTOM]: '#EF4444',       // Red
};

/**
 * Pattern type icon mapping
 */
export const PATTERN_ICONS: Record<PatternType, string> = {
  [PatternType.FIBONACCI]: '🌀',      // Spiral
  [PatternType.GEOMETRIC]: '🔷',      // Diamond/geometric shape
  [PatternType.SYMMETRY]: '🦋',       // Butterfly
  [PatternType.CUSTOM]: '✨',         // Custom
};

/**
 * Domain-specific color schemes
 */
export const DOMAIN_COLORS: Record<PatternDomain, string> = {
  [PatternDomain.FINANCE]: '#10B981',       // Green (money)
  [PatternDomain.NATURE]: '#84CC16',        // Lime (organic)
  [PatternDomain.ART]: '#F472B6',           // Pink (creative)
  [PatternDomain.GEOMETRY]: '#A855F7',      // Purple (mathematical)
  [PatternDomain.ARCHITECTURE]: '#6366F1',  // Indigo (structural)
  [PatternDomain.OTHER]: '#9CA3AF',         // Gray (neutral)
};

// ============================================
// FILTER & SORT TYPES
// ============================================

/**
 * Enhanced pattern library filter options
 */
export interface PatternFilters {
  type?: PatternType | 'all';
  source?: 'ai' | 'manual' | 'all';
  domain?: PatternDomain | 'all';
  scale?: PatternScale | 'all';
  minConfidence?: number;
  tags?: string[];
  dateRange?: {
    start: string; // ISO 8601 format
    end: string;   // ISO 8601 format
  };
  isFavorite?: boolean;
  analysisQuality?: AnalysisQuality | 'all';
}

/**
 * Pattern sort options
 */
export type PatternSortBy = 
  | 'confidence' 
  | 'created' 
  | 'updated' 
  | 'type' 
  | 'name'
  | 'domain'
  | 'complexity';

export type PatternSortOrder = 'asc' | 'desc';

export interface PatternSortConfig {
  by: PatternSortBy;
  order: PatternSortOrder;
}

// ============================================
// EDITOR STATE
// ============================================

/**
 * Canvas interaction state for pattern editor
 */
export interface PatternEditorState {
  mode: 'view' | 'edit' | 'create';
  selectedPatternId?: string;
  selectedAnchorIndex?: number;
  isDragging: boolean;
  previewAnchors: AnchorPoint[];
  renderConfig: PatternRenderConfig;
  
  /** Content area for coordinate transformation */
  contentArea?: ContentArea;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Pattern statistics for analytics
 */
export interface PatternStatistics {
  totalPatterns: number;
  byType: Record<PatternType, number>;
  byDomain: Record<PatternDomain, number>;
  averageConfidence: number;
  mostCommonPattern: PatternType;
  mostCommonDomain: PatternDomain;
  favoriteCount: number;
}

/**
 * Export format options
 */
export type PatternExportFormat = 'json' | 'svg' | 'image' | 'pdf';

/**
 * Pattern sharing options
 */
export interface PatternShareConfig {
  includeImage: boolean;
  includeInsights: boolean;
  includeMeasurements: boolean;
  watermark?: string;
  format: PatternExportFormat;
}

// ============================================
// TYPE GUARDS & VALIDATORS (NEW v4.1)
// ============================================

/**
 * Type guard: Check if value is valid PatternType
 */
export function isValidPatternType(value: string): value is PatternType {
  return Object.values(PatternType).includes(value as PatternType);
}

/**
 * Validate pattern type at runtime
 * Throws error if invalid (should never happen with v4.1 normalization)
 */
export function validatePatternType(type: string): PatternType {
  if (!isValidPatternType(type)) {
    console.error(`[Pattern] ❌ Invalid pattern type: "${type}". Falling back to CUSTOM.`);
    return PatternType.CUSTOM;
  }
  return type as PatternType;
}

/**
 * Get user-friendly pattern type label
 */
export function getPatternTypeLabel(type: PatternType): string {
  const labels: Record<PatternType, string> = {
    [PatternType.FIBONACCI]: 'Fibonacci',
    [PatternType.GEOMETRIC]: 'Geometric',
    [PatternType.SYMMETRY]: 'Symmetry',
    [PatternType.CUSTOM]: 'Custom',
  };
  return labels[type] || 'Unknown';
}

/**
 * Get pattern type description
 */
export function getPatternTypeDescription(type: PatternType): string {
  const descriptions: Record<PatternType, string> = {
    [PatternType.FIBONACCI]: 'Golden ratio, spirals, and Fibonacci sequences found in nature and mathematics',
    [PatternType.GEOMETRIC]: 'Geometric shapes, grids, repetition, and structured patterns',
    [PatternType.SYMMETRY]: 'Bilateral, radial, or mirror symmetry creating balance and harmony',
    [PatternType.CUSTOM]: 'User-defined or unclassified patterns',
  };
  return descriptions[type] || 'Unknown pattern type';
}
