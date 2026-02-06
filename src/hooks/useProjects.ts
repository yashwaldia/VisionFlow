/**
 * VisionFlow AI - Projects Hook
 * Complete state management for projects
 * 
 * @module hooks/useProjects
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Project,
  ProjectWithStats,
  ProjectFilters,
  ProjectSortBy,
  ProjectSortOrder,
} from '../types/project.types';
import { ReminderCategory } from '../types/reminder.types';
import * as StorageService from '../services/storage.service';

/**
 * Hook return type
 */
interface UseProjectsResult {
  // Data
  projects: Project[];
  projectsWithStats: ProjectWithStats[];
  filteredProjects: ProjectWithStats[];
  isLoading: boolean;
  error: string | null;
  
  // CRUD Operations
  createProject: (project: Project) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Filtering & Sorting
  setFilters: (filters: ProjectFilters) => void;
  setSorting: (sortBy: ProjectSortBy, order: ProjectSortOrder) => void;
  clearFilters: () => void;
  
  // Utility
  refreshProjects: () => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
  getProjectByName: (name: string) => Project | undefined;
  getProjectsByCategory: (category: ReminderCategory) => Project[];
}

/**
 * Default filters
 */
const DEFAULT_FILTERS: ProjectFilters = {
  category: 'all',
  isArchived: false,
  hasReminders: undefined,
  searchQuery: undefined,
};

/**
 * useProjects Hook
 */
export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsWithStats, setProjectsWithStats] = useState<ProjectWithStats[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters & Sorting
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<ProjectSortBy>('updated');
  const [sortOrder, setSortOrder] = useState<ProjectSortOrder>('desc');
  
  /**
   * Load projects from storage
   */
  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await StorageService.getProjects();
      setProjects(data);
      
      // Load stats for each project
      const withStats = await Promise.all(
        data.map(async (project) => {
          const stats = await StorageService.getProjectStats(project.id);
          return {
            ...project,
            stats: stats || {
              projectId: project.id,
              totalReminders: 0,
              upcomingCount: 0,
              doneCount: 0,
              overdueCount: 0,
              completionRate: 0,
              lastActivityAt: project.updatedAt,
              categoryBreakdown: {},
            },
          };
        })
      );
      
      setProjectsWithStats(withStats);
    } catch (err: any) {
      console.error('[useProjects] Load failed:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Update projectsWithStats when projects change
   * ✅ NEW: Sync stats immediately when projects update
   */
  useEffect(() => {
    const syncStats = async () => {
      const withStats = await Promise.all(
        projects.map(async (project) => {
          const stats = await StorageService.getProjectStats(project.id);
          return {
            ...project,
            stats: stats || {
              projectId: project.id,
              totalReminders: 0,
              upcomingCount: 0,
              doneCount: 0,
              overdueCount: 0,
              completionRate: 0,
              lastActivityAt: project.updatedAt,
              categoryBreakdown: {},
            },
          };
        })
      );
      setProjectsWithStats(withStats);
    };
    
    if (projects.length > 0 || projectsWithStats.length > 0) {
      syncStats();
    }
  }, [projects]); // ✅ Only depends on projects, not projectsWithStats
  
  /**
   * Initial load
   */
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);
  
  /**
   * Apply filters and sorting
   */
  useEffect(() => {
    let result = [...projectsWithStats];
    
    // Filter by category
    if (filters.category !== 'all') {
      result = result.filter(p => p.primaryCategory === filters.category);
    }
    
    // Filter by archived status
    if (filters.isArchived !== undefined) {
      result = result.filter(p => p.isArchived === filters.isArchived);
    }
    
    // Filter by reminder count
    if (filters.hasReminders !== undefined) {
      result = result.filter(p => 
        filters.hasReminders 
          ? p.stats.totalReminders > 0 
          : p.stats.totalReminders === 0
      );
    }
    
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = a.createdAt - b.createdAt;
          break;
        case 'updated':
          comparison = a.updatedAt - b.updatedAt;
          break;
        case 'reminderCount':
          comparison = a.stats.totalReminders - b.stats.totalReminders;
          break;
        case 'completionRate':
          comparison = a.stats.completionRate - b.stats.completionRate;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredProjects(result);
  }, [projectsWithStats, filters, sortBy, sortOrder]);
  
  /**
   * Create project
   * ✅ FIXED: No more double reload - matches Reminder pattern
   */
  const createProject = useCallback(async (project: Project) => {
    try {
      const updated = await StorageService.saveProject(project);
      setProjects(updated); // ✅ Single state update triggers useEffect above
    } catch (err: any) {
      console.error('[useProjects] Create failed:', err);
      throw err;
    }
  }, []); // ✅ No dependencies
  
  /**
   * Update project
   * ✅ FIXED: No more double reload - matches Reminder pattern
   */
  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      const updated = await StorageService.updateProject(id, updates);
      setProjects(updated); // ✅ Single state update triggers useEffect above
    } catch (err: any) {
      console.error('[useProjects] Update failed:', err);
      throw err;
    }
  }, []); // ✅ No dependencies
  
  /**
   * Delete project
   * ✅ FIXED: No more double reload - matches Reminder pattern
   */
  const deleteProject = useCallback(async (id: string) => {
    try {
      const { projects: updated } = await StorageService.deleteProject(id);
      setProjects(updated); // ✅ Single state update triggers useEffect above
    } catch (err: any) {
      console.error('[useProjects] Delete failed:', err);
      throw err;
    }
  }, []); // ✅ No dependencies
  
  /**
   * Set sorting
   */
  const setSorting = useCallback((newSortBy: ProjectSortBy, newSortOrder: ProjectSortOrder) => {
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
   * Get project by ID
   */
  const getProjectById = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);
  
  /**
   * Get project by name (case-insensitive)
   */
  const getProjectByName = useCallback((name: string) => {
    return projects.find(p => p.name.toLowerCase() === name.toLowerCase());
  }, [projects]);
  
  /**
   * Get projects by category
   */
  const getProjectsByCategory = useCallback((category: ReminderCategory) => {
    return projects.filter(p => p.primaryCategory === category);
  }, [projects]);
  
  return {
    projects,
    projectsWithStats,
    filteredProjects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    setFilters,
    setSorting,
    clearFilters,
    refreshProjects: loadProjects,
    getProjectById,
    getProjectByName,
    getProjectsByCategory,
  };
}
