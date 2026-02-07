/**
 * VisionFlow AI - Pattern Rendering Hook
 * SVG path generation and pattern visualization logic
 * 
 * @module hooks/usePatternRendering
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { PatternType, Pattern, AnchorPoint } from '../types/pattern.types';
import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_HEIGHT = SCREEN_WIDTH * (3 / 4);

/**
 * Convert percentage coordinates to display pixels
 */
export function anchorToPixels(x: number, y: number): { x: number; y: number } {
  return {
    x: (x / 100) * SCREEN_WIDTH,
    y: (y / 100) * IMAGE_HEIGHT,
  };
}

/**
 * Generate Fibonacci spiral path (REAL implementation)
 * Uses golden ratio (φ = 1.618) for progressive arc growth
 */
function generateFibonacciSpiralPath(
  anchors: AnchorPoint[],
  measurements: any
): string {
  if (anchors.length < 1) return '';

  const center = anchorToPixels(anchors[0].x, anchors[0].y);
  const goldenRatio = measurements.goldenRatio || 1.618;
  
  // Starting radius (distance to second anchor if exists)
  let radius = anchors.length > 1
    ? Math.sqrt(
        Math.pow(anchorToPixels(anchors[1].x, anchors[1].y).x - center.x, 2) +
        Math.pow(anchorToPixels(anchors[1].x, anchors[1].y).y - center.y, 2)
      ) / 3
    : 20;

  let path = `M ${center.x} ${center.y + radius}`;
  
  // Generate 4 quarter-arcs (full spiral)
  const quarters = 4;
  const totalRotation = Math.PI * 2; // Full circle
  const angleStep = totalRotation / quarters;
  
  let currentAngle = Math.PI / 2; // Start at bottom
  let currentRadius = radius;
  
  for (let i = 0; i < quarters; i++) {
    const nextAngle = currentAngle + angleStep;
    const nextRadius = currentRadius * Math.pow(goldenRatio, angleStep / (Math.PI / 2));
    
    // Calculate arc endpoint
    const endX = center.x + nextRadius * Math.cos(nextAngle);
    const endY = center.y + nextRadius * Math.sin(nextAngle);
    
    // Use elliptical arc for smooth golden ratio growth
    // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
    path += ` A ${currentRadius} ${currentRadius} 0 0 1 ${endX} ${endY}`;
    
    currentAngle = nextAngle;
    currentRadius = nextRadius;
  }
  
  return path;
}

/**
 * Generate wave pattern path (smooth bezier curves)
 */
function generateWavePath(anchors: AnchorPoint[]): string {
  if (anchors.length < 2) return '';
  
  const points = anchors.map(a => anchorToPixels(a.x, a.y));
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
    const cp1y = points[i - 1].y;
    const cp2x = points[i - 1].x + (2 * (points[i].x - points[i - 1].x)) / 3;
    const cp2y = points[i].y;
    
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
  }
  
  return path;
}

/**
 * Generate geometric/symmetry closed polygon path
 */
function generatePolygonPath(anchors: AnchorPoint[]): string {
  if (anchors.length < 3) return '';
  
  const points = anchors.map(a => anchorToPixels(a.x, a.y));
  const path = points.map((p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ') + ' Z';
  
  return path;
}

/**
 * Generate channel/pitchfork parallel lines
 */
function generateChannelPath(anchors: AnchorPoint[]): string {
  if (anchors.length < 2) return '';
  
  const points = anchors.map(a => anchorToPixels(a.x, a.y));
  return points.map((p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ');
}

/**
 * Main path generation router
 */
export function generatePatternPath(
  pattern: Pattern
): string {
  const { type, anchors, measurements } = pattern;
  
  switch (type) {
    case PatternType.FIBONACCI:
      return generateFibonacciSpiralPath(anchors, measurements);
    
    case PatternType.WAVE:
      return generateWavePath(anchors);
    
    case PatternType.GEOMETRIC:
    case PatternType.SYMMETRY:
    case PatternType.SACRED_GEOMETRY:
      return generatePolygonPath(anchors);
    
    case PatternType.CHANNEL:
    case PatternType.PITCHFORK:
      return generateChannelPath(anchors);
    
    default:
      return generateChannelPath(anchors);
  }
}

/**
 * Get pattern stroke dash array
 */
export function getPatternDashArray(type: PatternType): string | undefined {
  if (type === PatternType.CHANNEL || type === PatternType.PITCHFORK) {
    return '10 10';
  }
  return undefined;
}

/**
 * Get pattern fill opacity
 */
export function getPatternFillOpacity(type: PatternType): number {
  if (
    type === PatternType.GEOMETRIC ||
    type === PatternType.SACRED_GEOMETRY
  ) {
    return 0.15;
  }
  return 0;
}

/**
 * Hook for pattern rendering utilities
 */
export function usePatternRendering(pattern: Pattern) {
  const path = useMemo(() => generatePatternPath(pattern), [pattern]);
  const dashArray = useMemo(() => getPatternDashArray(pattern.type), [pattern.type]);
  const fillOpacity = useMemo(() => getPatternFillOpacity(pattern.type), [pattern.type]);
  
  return {
    path,
    dashArray,
    fillOpacity,
    anchorToPixels,
  };
}
