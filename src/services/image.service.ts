/**
 * VisionFlow AI - Image Processing Service
 * Image manipulation, compression, and edge detection
 * * @module services/image
 */

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { ProcessedImage, ImageDimensions, ImageMimeType } from '../types/common.types';
import { IMAGE_CONFIG } from '../constants/config';
import { Image } from 'react-native';

/**
 * Image service error
 */
class ImageProcessingError extends Error {
  constructor(message: string, public code: string, public originalError?: any) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

/**
 * Get image dimensions from URI
 */
async function getImageDimensions(uri: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(new Error(`Failed to get image dimensions: ${error}`))
    );
  });
}

/**
 * Calculate target dimensions maintaining aspect ratio
 */
function calculateTargetDimensions(
  original: ImageDimensions,
  maxWidth: number = IMAGE_CONFIG.maxWidth,
  maxHeight: number = IMAGE_CONFIG.maxHeight
): ImageDimensions {
  const { width, height } = original;
  
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }
  
  const aspectRatio = width / height;
  
  let targetWidth = width;
  let targetHeight = height;
  
  if (width > maxWidth) {
    targetWidth = maxWidth;
    targetHeight = targetWidth / aspectRatio;
  }
  
  if (targetHeight > maxHeight) {
    targetHeight = maxHeight;
    targetWidth = targetHeight * aspectRatio;
  }
  
  return {
    width: Math.round(targetWidth),
    height: Math.round(targetHeight),
  };
}

/**
 * Resize and compress image
 */
export async function processImage(
  imageUri: string,
  maxWidth: number = IMAGE_CONFIG.maxWidth,
  quality: number = IMAGE_CONFIG.quality
): Promise<ProcessedImage> {
  try {
    const originalDimensions = await getImageDimensions(imageUri);
    const targetDimensions = calculateTargetDimensions(originalDimensions, maxWidth);
    
    const manipResult = await manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: targetDimensions.width,
            height: targetDimensions.height,
          },
        },
      ],
      {
        compress: quality,
        format: SaveFormat.JPEG,
        base64: true,
      }
    );
    
    let fileSize = 0;
    try {
      const fileInfo = await FileSystem.getInfoAsync(manipResult.uri);
      fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
    } catch {
      if (manipResult.base64) {
        fileSize = (manipResult.base64.length * 3) / 4;
      }
    }
    
    const resizedUri = manipResult.base64
      ? `data:image/jpeg;base64,${manipResult.base64}`
      : manipResult.uri;
    
    return {
      originalUri: imageUri,
      resizedUri,
      originalDimensions,
      processedDimensions: targetDimensions,
      fileSize,
      mimeType: 'image/jpeg',
      processedAt: Date.now(),
    };
  } catch (error: any) {
    console.error('[Image] Processing failed:', error);
    throw new ImageProcessingError(
      'Failed to process image',
      'PROCESSING_FAILED',
      error
    );
  }
}

/**
 * Sobel edge detection algorithm
 */
export async function applyEdgeDetection(imageUri: string): Promise<string> {
  try {
    console.warn('[Image] Edge detection not implemented in React Native yet');
    return imageUri;
  } catch (error: any) {
    console.error('[Image] Edge detection failed:', error);
    throw new ImageProcessingError(
      'Failed to apply edge detection',
      'EDGE_DETECTION_FAILED',
      error
    );
  }
}

/**
 * Validate image file
 */
export function validateImage(uri: string, mimeType?: string): boolean {
  if (uri.startsWith('data:')) {
    const base64Length = uri.split(',')[1]?.length || 0;
    const sizeInBytes = (base64Length * 3) / 4;
    if (sizeInBytes > IMAGE_CONFIG.maxFileSizeBytes) {
      throw new ImageProcessingError(
        `Image too large. Maximum size: ${IMAGE_CONFIG.maxFileSizeBytes / 1024 / 1024}MB`,
        'FILE_TOO_LARGE'
      );
    }
  }
  
  if (mimeType && !IMAGE_CONFIG.supportedFormats.includes(mimeType as any)) {
    throw new ImageProcessingError(
      `Unsupported image format. Supported: ${IMAGE_CONFIG.supportedFormats.join(', ')}`,
      'UNSUPPORTED_FORMAT'
    );
  }
  
  return true;
}

/**
 * Convert image to base64
 */
export async function imageToBase64(uri: string): Promise<string> {
  try {
    if (uri.startsWith('data:')) {
      return uri;
    }
    
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    
    return `data:image/jpeg;base64,${base64}`;
  } catch (error: any) {
    console.error('[Image] Base64 conversion failed:', error);
    throw new ImageProcessingError(
      'Failed to convert image to base64',
      'BASE64_CONVERSION_FAILED',
      error
    );
  }
}

/**
 * Save base64 image to file system
 */
export async function saveBase64Image(base64: string, filename: string): Promise<string> {
  try {
    const cleanBase64 = base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const cacheDir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || '';
    
    if (!cacheDir) {
      throw new Error('No valid file system directory available');
    }
    
    const fileUri = `${cacheDir}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, cleanBase64, {
      encoding: 'base64',
    });
    
    return fileUri;
  } catch (error: any) {
    console.error('[Image] Save failed:', error);
    throw new ImageProcessingError(
      'Failed to save image',
      'SAVE_FAILED',
      error
    );
  }
}

/**
 * Delete image from file system
 */
export async function deleteImage(uri: string): Promise<void> {
  try {
    if (uri.startsWith('file://')) {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
      }
    }
  } catch (error: any) {
    console.error('[Image] Delete failed:', error);
  }
}

/**
 * Helper: Type guard for ImageMimeType
 */
function isValidMimeType(type: string): type is ImageMimeType {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(type);
}

/**
 * Get image file info
 */
export async function getImageInfo(uri: string): Promise<{
  size: number;
  dimensions: ImageDimensions;
  mimeType: ImageMimeType;
}> {
  try {
    const dimensions = await getImageDimensions(uri);
    
    let size = 0;
    if (uri.startsWith('file://')) {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      size = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
    } else if (uri.startsWith('data:')) {
      const base64Length = uri.split(',')[1]?.length || 0;
      size = (base64Length * 3) / 4;
    }
    
    let mimeType: ImageMimeType = 'image/jpeg';
    
    if (uri.startsWith('data:')) {
      const dataPrefix = uri.substring(0, uri.indexOf(';'));
      const extractedType = dataPrefix.substring(5); // Remove 'data:'
      
      if (isValidMimeType(extractedType)) {
        mimeType = extractedType;
      }
    }
    
    return { size, dimensions, mimeType };
  } catch (error: any) {
    throw new ImageProcessingError(
      'Failed to get image info',
      'INFO_FAILED',
      error
    );
  }
}