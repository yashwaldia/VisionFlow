/**
 * VisionFlow AI - Pattern Detection Type Definitions
 * Core types for AI-powered geometric pattern discovery
 * 
 * @module types/pattern
 * @see Product Requirements: Section 3.1.1 - Hidden Insight Integration
 */

/**
 * 8 comprehensive pattern types detected by AI
 */
export enum PatternType {
  FIBONACCI = 'fibonacci',
  SACRED_GEOMETRY = 'sacred_geometry',
  CHANNEL = 'channel',
  PITCHFORK = 'pitchfork',
  WAVE = 'wave',
  GEOMETRIC = 'geometric',
  SYMMETRY = 'symmetry',
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
}

/**
 * Symmetry types
 */
export enum SymmetryType {
  RADIAL = 'radial',
  BILATERAL = 'bilateral',
  ROTATIONAL = 'rotational',
  TRANSLATIONAL = 'translational',
}

/**
 * Anchor point in percentage coordinates (0-100)
 * Stored as percentages to be device-independent
 */
export interface AnchorPoint {
  x: number; // 0-100 (percentage of image width)
  y: number; // 0-100 (percentage of image height)
}

/**
 * Mathematical measurements for patterns
 */
export interface PatternMeasurements {
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
  
  /** Custom key-value measurements */
  [key: string]: number | number[] | undefined;
}

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
  subtype?: FibonacciSubtype | SacredGeometrySubtype | SymmetryType | string;

  /** Human-readable pattern name */
  name: string;

  /** AI confidence score (0-1, undefined for manual patterns) */
  confidence?: number;

  /** Anchor points defining the pattern geometry */
  anchors: AnchorPoint[];

  /** Mathematical measurements and properties */
  measurements: PatternMeasurements;

  /** AI-generated insights */
  insights?: PatternInsights;

  /** Creation source */
  source: 'ai' | 'manual';

  /** Reference to original analyzed image */
  imageUri: string;

  /** Optional processed edge-detected image URI */
  edgeImageUri?: string;

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
 * AI-generated insights for patterns
 */
export interface PatternInsights {
  /** Detailed explanation of the pattern */
  explanation: string;

  /** Hidden meaning or "secret message" */
  secretMessage: string;

  /** Social media-ready share caption */
  shareCaption: string;

  /** Mathematical significance */
  mathematicalContext?: string;

  /** Cultural or historical context */
  culturalContext?: string;
}

/**
 * AI analysis result from Gemini
 * Returned by geminiService.analyzePatternImage()
 */
export interface AIPatternAnalysis {
  /** Detected patterns (1-3 most prominent) */
  patterns: Array<{
    type: PatternType;
    subtype?: string;
    name: string;
    confidence: number;
    anchors: AnchorPoint[];
    measurements: PatternMeasurements;
  }>;

  /** Overall analysis insights */
  insights: PatternInsights;

  /** Processing metadata */
  metadata: {
    processingTime?: number;
    modelVersion?: string;
    edgeDetectionApplied: boolean;
  };
}

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
}

/**
 * Pattern type color mapping for visual distinction
 */
export const PATTERN_COLORS: Record<PatternType, string> = {
  [PatternType.FIBONACCI]: '#FACC15', // Yellow
  [PatternType.CHANNEL]: '#3B82F6', // Blue
  [PatternType.PITCHFORK]: '#10B981', // Green
  [PatternType.GEOMETRIC]: '#A855F7', // Purple
  [PatternType.WAVE]: '#06B6D4', // Cyan
  [PatternType.SYMMETRY]: '#6366F1', // Indigo
  [PatternType.SACRED_GEOMETRY]: '#F472B6', // Pink
  [PatternType.CUSTOM]: '#EF4444', // Red
};

/**
 * Pattern library filter options
 */
export interface PatternFilters {
  type?: PatternType | 'all';
  source?: 'ai' | 'manual' | 'all';
  minConfidence?: number;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  isFavorite?: boolean;
}

/**
 * Pattern sort options
 */
export type PatternSortBy = 'confidence' | 'created' | 'updated' | 'type' | 'name';
export type PatternSortOrder = 'asc' | 'desc';

export interface PatternSortConfig {
  by: PatternSortBy;
  order: PatternSortOrder;
}

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
}
