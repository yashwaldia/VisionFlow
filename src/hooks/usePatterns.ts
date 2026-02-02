/**
 * VisionFlow AI - Patterns Hook
 * Complete state management for pattern library
 * 
 * @module hooks/usePatterns
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Pattern,
  PatternType,
  PatternFilters,
  PatternSortBy,
  PatternSortOrder,
} from '../types/pattern.types';
import * as StorageService from '../services/storage.service';

/**
 * Hook return type
 */
interface UsePatternsResult {
  // Data
  patterns: Pattern[];
  filteredPatterns: Pattern[];
  isLoading: boolean;
  error: string | null;
  
  // Statistics
  stats: {
    total: number;
    aiGenerated: number;
    manual: number;
    favorites: number;
    byType: Record<PatternType, number>;
  };
  
  // CRUD Operations
  createPattern: (pattern: Pattern) => Promise<void>;
  updatePattern: (id: string, updates: Partial<Pattern>) => Promise<void>;
  deletePattern: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  
  // Filtering & Sorting
  setFilters: (filters: PatternFilters) => void;
  setSorting: (sortBy: PatternSortBy, order: PatternSortOrder) => void;
  clearFilters: () => void;
  
  // Utility
  refreshPatterns: () => Promise<void>;
  getPatternById: (id: string) => Pattern | undefined;
  getFavoritePatterns: () => Pattern[];
}

/**
 * Default filters
 */
const DEFAULT_FILTERS: PatternFilters = {
  type: 'all',
  source: 'all',
  minConfidence: undefined,
  tags: undefined,
  dateRange: undefined,
  isFavorite: undefined,
};

/**
 * usePatterns Hook
 */
export function usePatterns(): UsePatternsResult {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [filteredPatterns, setFilteredPatterns] = useState<Pattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters & Sorting
  const [filters, setFilters] = useState<PatternFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<PatternSortBy>('created');
  const [sortOrder, setSortOrder] = useState<PatternSortOrder>('desc');
  
  /**
   * Load patterns from storage
   */
  const loadPatterns = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await StorageService.getPatterns();
      setPatterns(data);
    } catch (err: any) {
      console.error('[usePatterns] Load failed:', err);
      setError(err.message || 'Failed to load patterns');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Initial load
   */
  useEffect(() => {
    loadPatterns();
  }, [loadPatterns]);
  
  /**
   * Apply filters and sorting
   */
  useEffect(() => {
    let result = [...patterns];
    
    // Filter by type
    if (filters.type !== 'all') {
      result = result.filter(p => p.type === filters.type);
    }
    
    // Filter by source
    if (filters.source !== 'all') {
      result = result.filter(p => p.source === filters.source);
    }
    
    // Filter by minimum confidence
    if (filters.minConfidence !== undefined) {
      result = result.filter(p => 
        p.confidence !== undefined && p.confidence >= filters.minConfidence!
      );
    }
    
    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(p =>
        p.tags && filters.tags!.some(tag => p.tags!.includes(tag))
      );
    }
    
    // Filter by date range
    if (filters.dateRange) {
      result = result.filter(p => {
        const createdDate = new Date(p.createdAt);
        const start = new Date(filters.dateRange!.start);
        const end = new Date(filters.dateRange!.end);
        return createdDate >= start && createdDate <= end;
      });
    }
    
    // Filter by favorite status
    if (filters.isFavorite !== undefined) {
      result = result.filter(p => p.isFavorite === filters.isFavorite);
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'confidence':
          const confA = a.confidence || 0;
          const confB = b.confidence || 0;
          comparison = confA - confB;
          break;
        case 'created':
          comparison = a.createdAt - b.createdAt;
          break;
        case 'updated':
          comparison = a.updatedAt - b.updatedAt;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredPatterns(result);
  }, [patterns, filters, sortBy, sortOrder]);
  
  /**
   * Calculate statistics
   */
  const stats = {
    total: patterns.length,
    aiGenerated: patterns.filter(p => p.source === 'ai').length,
    manual: patterns.filter(p => p.source === 'manual').length,
    favorites: patterns.filter(p => p.isFavorite).length,
    byType: Object.values(PatternType).reduce((acc, type) => {
      acc[type] = patterns.filter(p => p.type === type).length;
      return acc;
    }, {} as Record<PatternType, number>),
  };
  
  /**
   * Create pattern
   */
  const createPattern = useCallback(async (pattern: Pattern) => {
    try {
      const updated = await StorageService.savePattern(pattern);
      setPatterns(updated);
    } catch (err: any) {
      console.error('[usePatterns] Create failed:', err);
      throw err;
    }
  }, []);
  
  /**
   * Update pattern
   */
  const updatePattern = useCallback(async (id: string, updates: Partial<Pattern>) => {
    try {
      const updated = await StorageService.updatePattern(id, updates);
      setPatterns(updated);
    } catch (err: any) {
      console.error('[usePatterns] Update failed:', err);
      throw err;
    }
  }, []);
  
  /**
   * Delete pattern
   */
  const deletePattern = useCallback(async (id: string) => {
    try {
      const updated = await StorageService.deletePattern(id);
      setPatterns(updated);
    } catch (err: any) {
      console.error('[usePatterns] Delete failed:', err);
      throw err;
    }
  }, []);
  
  /**
   * Toggle favorite
   */
  const toggleFavorite = useCallback(async (id: string) => {
    try {
      const updated = await StorageService.togglePatternFavorite(id);
      setPatterns(updated);
    } catch (err: any) {
      console.error('[usePatterns] Toggle favorite failed:', err);
      throw err;
    }
  }, []);
  
  /**
   * Set sorting
   */
  const setSorting = useCallback((newSortBy: PatternSortBy, newSortOrder: PatternSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);
  
  /**
   * Clear filters
   */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);
  
  /**
   * Get pattern by ID
   */
  const getPatternById = useCallback((id: string) => {
    return patterns.find(p => p.id === id);
  }, [patterns]);
  
  /**
   * Get favorite patterns
   */
  const getFavoritePatterns = useCallback(() => {
    return patterns.filter(p => p.isFavorite);
  }, [patterns]);
  
  return {
    patterns,
    filteredPatterns,
    isLoading,
    error,
    stats,
    createPattern,
    updatePattern,
    deletePattern,
    toggleFavorite,
    setFilters,
    setSorting,
    clearFilters,
    refreshPatterns: loadPatterns,
    getPatternById,
    getFavoritePatterns,
  };
}
