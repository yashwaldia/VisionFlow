/**
 * VisionFlow AI - Camera Hook
 * Camera access, image capture, and AI analysis
 * 
 * @module hooks/useCamera
 */

import { useState, useEffect, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { PermissionStatus } from '../types/common.types';
import { AIReminderAnalysis } from '../types/reminder.types';
import { AIPatternAnalysis } from '../types/pattern.types';
import * as ImageService from '../services/image.service';
import * as GeminiService from '../services/gemini.service';

/**
 * Capture mode
 */
export type CaptureMode = 'reminder' | 'pattern' | 'auto';

/**
 * Analysis result (union type)
 */
export type AnalysisResult = AIReminderAnalysis | AIPatternAnalysis;

/**
 * Hook return type
 */
interface UseCameraResult {
  // Permissions
  hasPermission: boolean;
  permissionStatus: PermissionStatus;
  requestPermission: () => Promise<PermissionStatus>;
  
  // Image Capture
  captureImage: () => Promise<string | null>;
  pickImageFromGallery: () => Promise<string | null>;
  
  // Image Processing
  isProcessing: boolean;
  processingStage: string;
  processedImageUri: string | null;
  
  // AI Analysis
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  analysisError: string | null;
  analyzeImage: (imageUri: string, mode: CaptureMode) => Promise<AnalysisResult | null>;
  
  // Utilities
  resetState: () => void;
}

/**
 * useCamera Hook
 */
export function useCamera(): UseCameraResult {
  // Permissions
  const [permission, requestCameraPermission] = useCameraPermissions();
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(
    PermissionStatus.UNDETERMINED
  );
  
  // Image Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [processedImageUri, setProcessedImageUri] = useState<string | null>(null);
  
  // AI Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  /**
   * Update permission status
   */
  useEffect(() => {
    if (permission?.granted) {
      setPermissionStatus(PermissionStatus.GRANTED);
    } else if (permission?.canAskAgain === false) {
      setPermissionStatus(PermissionStatus.BLOCKED);
    } else if (permission?.status === 'denied') {
      setPermissionStatus(PermissionStatus.DENIED);
    } else {
      setPermissionStatus(PermissionStatus.UNDETERMINED);
    }
  }, [permission]);
  
  /**
   * Request camera permission
   */
  const requestPermission = useCallback(async (): Promise<PermissionStatus> => {
    try {
      const result = await requestCameraPermission();
      
      if (result.granted) {
        return PermissionStatus.GRANTED;
      } else if (result.canAskAgain === false) {
        return PermissionStatus.BLOCKED;
      } else {
        return PermissionStatus.DENIED;
      }
    } catch (error) {
      console.error('[useCamera] Permission request failed:', error);
      return PermissionStatus.DENIED;
    }
  }, [requestCameraPermission]);
  
  /**
   * Capture image from camera
   * Note: Actual camera ref should be passed from component
   */
  const captureImage = useCallback(async (): Promise<string | null> => {
    try {
      // This is a placeholder - actual implementation requires camera ref
      // from the component using expo-camera's takePictureAsync
      console.warn('[useCamera] captureImage should be called with camera ref');
      return null;
    } catch (error) {
      console.error('[useCamera] Capture failed:', error);
      return null;
    }
  }, []);
  
  /**
   * Pick image from gallery
   */
  const pickImageFromGallery = useCallback(async (): Promise<string | null> => {
    try {
      // Request media library permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        console.error('[useCamera] Media library permission denied');
        return null;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        base64: false,
      });
      
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }
      
      return result.assets[0].uri;
    } catch (error) {
      console.error('[useCamera] Gallery pick failed:', error);
      return null;
    }
  }, []);
  
  /**
   * Analyze image with AI
   */
  const analyzeImage = useCallback(async (
    imageUri: string,
    mode: CaptureMode
  ): Promise<AnalysisResult | null> => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      setIsProcessing(true);
      
      // Step 1: Process image
      setProcessingStage('Optimizing image...');
      const processed = await ImageService.processImage(imageUri);
      setProcessedImageUri(processed.resizedUri);
      
      // Step 2: Validate
      setProcessingStage('Validating...');
      ImageService.validateImage(processed.resizedUri, processed.mimeType);
      
      setIsProcessing(false);
      
      // Step 3: AI Analysis
      setProcessingStage('Analyzing with AI...');
      
      let result: AnalysisResult;
      
      if (mode === 'reminder' || mode === 'auto') {
        // Try reminder analysis first
        const base64Image = await ImageService.imageToBase64(processed.resizedUri);
        result = await GeminiService.analyzeReminderImage(base64Image);
      } else {
        // Pattern analysis
        const base64Image = await ImageService.imageToBase64(processed.resizedUri);
        result = await GeminiService.analyzePatternImage(base64Image);
      }
      
      setAnalysisResult(result);
      setIsAnalyzing(false);
      return result;
      
    } catch (error: any) {
      console.error('[useCamera] Analysis failed:', error);
      setAnalysisError(error.message || 'Failed to analyze image');
      setIsAnalyzing(false);
      setIsProcessing(false);
      return null;
    }
  }, []);
  
  /**
   * Reset state
   */
  const resetState = useCallback(() => {
    setIsProcessing(false);
    setProcessingStage('');
    setProcessedImageUri(null);
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setAnalysisError(null);
  }, []);
  
  return {
    hasPermission: permissionStatus === PermissionStatus.GRANTED,
    permissionStatus,
    requestPermission,
    captureImage,
    pickImageFromGallery,
    isProcessing,
    processingStage,
    processedImageUri,
    isAnalyzing,
    analysisResult,
    analysisError,
    analyzeImage,
    resetState,
  };
}
