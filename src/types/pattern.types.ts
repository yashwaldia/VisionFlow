/**
 * VisionFlow AI - Pattern Detection Type Definitions (v4.0 - Advanced Multi-Domain)
 * Core types for AI-powered geometric pattern discovery across all domains
 * 
 * @module types/pattern
 * @version 4.0.0
 * 
 * CHANGELOG v4.0:
 * - ✅ Extended pattern types: Stock market, natural, artistic patterns (15+ new types)
 * - ✅ Added ContentArea interface for ROI (Region of Interest) detection
 * - ✅ Enhanced patterns with domain, scale, orientation metadata
 * - ✅ New measurement fields: waveCount, retracement, volume, harmonicRatio
 * - ✅ Enhanced insights: primaryDomain, patternComplexity, suggestedActions
 * - ✅ Added analysisQuality to metadata for quality assessment
 * - ✅ Support for Google Images screenshot detection and artifact filtering
 * 
 * @see Product Requirements: Section 3.1.1 - Hidden Insight Integration
 */



// ============================================
// PATTERN TYPE ENUMS
// ============================================

/**
 * Comprehensive pattern types detected by AI
 * Now supports multi-domain analysis: finance, nature, art, geometry
 */
export enum PatternType {
  // ─── MATHEMATICAL & GEOMETRIC PATTERNS ───
  FIBONACCI = 'fibonacci',
  SACRED_GEOMETRY = 'sacred_geometry',
  CHANNEL = 'channel',
  PITCHFORK = 'pitchfork',
  WAVE = 'wave',
  GEOMETRIC = 'geometric',
  SYMMETRY = 'symmetry',
  
  // ─── STOCK MARKET / FINANCIAL PATTERNS ───
  ELLIOTT_WAVE = 'elliott_wave',
  HEAD_SHOULDERS = 'head_shoulders',
  TRIANGLE = 'triangle',
  WEDGE = 'wedge',
  FLAG_PENNANT = 'flag_pennant',
  DOUBLE_TOP_BOTTOM = 'double_top_bottom',
  CUP_HANDLE = 'cup_handle',
  
  // ─── NATURAL PATTERNS ───
  FRACTAL = 'fractal',
  SPIRAL = 'spiral',
  TESSELLATION = 'tessellation',
  BRANCHING = 'branching',
  VORONOI = 'voronoi',
  
  // ─── ARTISTIC & COMPOSITION PATTERNS ───
  PERSPECTIVE = 'perspective',
  COMPOSITION = 'composition',
  COLOR_HARMONY = 'color_harmony',
  TEXTURE = 'texture',
  
  // ─── ABSTRACT / OTHER ───
  REPETITION = 'repetition',
  GRADIENT = 'gradient',
  RADIAL = 'radial',
  UNKNOWN = 'unknown',
  CUSTOM = 'custom', // User-created patterns
}

/**
 * Fibonacci pattern subtypes
 */
export enum FibonacciSubtype {
  SPIRAL = 'spiral',
  RETRACEMENT = 'retracement',
  EXTENSION = 'extension',
  SEQUENCE = 'sequence',
  GOLDEN_ANGLE = 'golden_angle',
  PHYLLOTAXIS = 'phyllotaxis', // Natural leaf/petal arrangement
}

/**
 * Sacred geometry subtypes
 */
export enum SacredGeometrySubtype {
  FLOWER_OF_LIFE = 'flower_of_life',
  METATRONS_CUBE = 'metatrons_cube',
  VESICA_PISCIS = 'vesica_piscis',
  SEED_OF_LIFE = 'seed_of_life',
  PLATONIC_SOLID = 'platonic_solid',
  GOLDEN_RATIO = 'golden_ratio',
  SRI_YANTRA = 'sri_yantra',
}

/**
 * Symmetry types
 */
export enum SymmetryType {
  RADIAL = 'radial',
  BILATERAL = 'bilateral',
  ROTATIONAL = 'rotational',
  TRANSLATIONAL = 'translational',
  GLIDE_REFLECTION = 'glide_reflection',
}

/**
 * Elliott Wave subtypes (for financial analysis)
 */
export enum ElliottWaveSubtype {
  IMPULSE = 'impulse',           // 5-wave uptrend
  CORRECTIVE = 'corrective',     // 3-wave pullback
  DIAGONAL = 'diagonal',         // Leading/ending diagonal
  ZIGZAG = 'zigzag',
  FLAT = 'flat',
  TRIANGLE = 'triangle',
}

/**
 * Domain classification for patterns
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
  
  // ─── FINANCIAL PATTERN MEASUREMENTS (NEW) ───
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
  
  // ─── NATURAL PATTERN MEASUREMENTS (NEW) ───
  /** Fractal dimension (for self-similarity) */
  fractalDimension?: number;
  
  /** Branching angle (for trees, rivers, etc.) */
  branchingAngle?: number;
  
  /** Petal/leaf count (for phyllotaxis) */
  petalCount?: number;
  
  // ─── ARTISTIC PATTERN MEASUREMENTS (NEW) ───
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

  /** Pattern type classification */
  type: PatternType;

  /** Subtype for specific pattern categories */
  subtype?: FibonacciSubtype | SacredGeometrySubtype | SymmetryType | ElliottWaveSubtype | string;

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
  
  // ─── ENHANCED METADATA (NEW) ───
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
  
  // ─── ENHANCED INSIGHTS (NEW) ───
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
 * Version 4.0 adds ROI detection and multi-domain support
 */
export interface AIPatternAnalysis {
  /** 
   * Content area detection (NEW in v4.0)
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
    
    // ─── NEW FIELDS (v4.0) ───
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
    
    /** Analysis quality assessment (NEW in v4.0) */
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
// COLOR MAPPINGS
// ============================================

/**
 * Enhanced pattern type color mapping for visual distinction
 * Now includes all new pattern types
 */
export const PATTERN_COLORS: Record<PatternType, string> = {
  // Mathematical & Geometric
  [PatternType.FIBONACCI]: '#FACC15',        // Yellow
  [PatternType.SACRED_GEOMETRY]: '#F472B6',  // Pink
  [PatternType.CHANNEL]: '#3B82F6',          // Blue
  [PatternType.PITCHFORK]: '#10B981',        // Green
  [PatternType.WAVE]: '#06B6D4',             // Cyan
  [PatternType.GEOMETRIC]: '#A855F7',        // Purple
  [PatternType.SYMMETRY]: '#6366F1',         // Indigo
  
  // Stock Market / Financial
  [PatternType.ELLIOTT_WAVE]: '#14B8A6',     // Teal
  [PatternType.HEAD_SHOULDERS]: '#F59E0B',   // Amber
  [PatternType.TRIANGLE]: '#8B5CF6',         // Violet
  [PatternType.WEDGE]: '#EC4899',            // Pink
  [PatternType.FLAG_PENNANT]: '#10B981',     // Emerald
  [PatternType.DOUBLE_TOP_BOTTOM]: '#F97316', // Orange
  [PatternType.CUP_HANDLE]: '#06B6D4',       // Cyan
  
  // Natural Patterns
  [PatternType.FRACTAL]: '#84CC16',          // Lime
  [PatternType.SPIRAL]: '#FBBF24',           // Yellow
  [PatternType.TESSELLATION]: '#A78BFA',     // Purple
  [PatternType.BRANCHING]: '#34D399',        // Green
  [PatternType.VORONOI]: '#60A5FA',          // Blue
  
  // Artistic & Composition
  [PatternType.PERSPECTIVE]: '#818CF8',      // Indigo
  [PatternType.COMPOSITION]: '#F472B6',      // Pink
  [PatternType.COLOR_HARMONY]: '#FB923C',    // Orange
  [PatternType.TEXTURE]: '#A3E635',          // Lime
  
  // Abstract / Other
  [PatternType.REPETITION]: '#C084FC',       // Purple
  [PatternType.GRADIENT]: '#22D3EE',         // Cyan
  [PatternType.RADIAL]: '#FB7185',           // Rose
  [PatternType.UNKNOWN]: '#9CA3AF',          // Gray
  [PatternType.CUSTOM]: '#EF4444',           // Red
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
  
  /** Content area for coordinate transformation (NEW) */
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
