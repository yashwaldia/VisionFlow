/**
 * VisionFlow AI - Camera Modal (CORRECTED)
 * Full-screen camera capture interface
 * 
 * @module screens/modals/CameraModal
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../../types/navigation.types';
import { Theme } from '../../constants/theme';
import { Text, Icon, LoadingSpinner } from '../../components';
import * as ImageManipulator from 'expo-image-manipulator';

type CameraModalProps = NativeStackScreenProps<RootStackParamList, 'CameraModal'>;

/**
 * CameraModal Component
 * 
 * Features:
 * - Full-screen camera view
 * - Flash toggle
 * - Front/back camera switch
 * - Gallery picker
 * - Capture with animation
 * - Permission handling
 */
export function CameraModal({ navigation, route }: CameraModalProps) {
  const cameraRef = useRef<CameraView>(null);
  const { mode = 'reminder' } = route.params || {};

  // State
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back'); // Use string literals
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off'); // Use string literals
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Request camera permissions on mount
   */
  useEffect(() => {
    if (permission === null) {
      requestPermission();
    } else if (permission && !permission.granted) {
      Alert.alert(
        'Camera Permission Required',
        'VisionFlow needs camera access to capture reminders and patterns.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
          { text: 'Grant Permission', onPress: requestPermission },
        ]
      );
    }
  }, [permission]);

  /**
   * Handle camera capture
   */
  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing || isProcessing) return;

    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      setIsCapturing(true);

      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (!photo) {
        throw new Error('Failed to capture photo');
      }

      // Process image - compress using ImageManipulator
      setIsProcessing(true);
      const processed = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1920, height: 1920 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Navigate to AI Review with processed URI
      navigation.replace('AIReviewModal', {
        imageUri: processed.uri,
        analysisType: mode as 'reminder' | 'pattern',
        aiResult: null,
      });

    } catch (error: any) {
      console.error('[CameraModal] Capture failed:', error);
      Alert.alert('Capture Failed', error.message || 'Failed to capture photo. Please try again.');
      setIsProcessing(false);
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Handle gallery picker
   */
  const handlePickFromGallery = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Gallery Permission Required',
          'VisionFlow needs access to your photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true);
        
        // Process image - compress
        const processed = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 1920, height: 1920 } }],
          { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Navigate to AI Review
        navigation.replace('AIReviewModal', {
          imageUri: processed.uri,
          analysisType: mode as 'reminder' | 'pattern',
          aiResult: null,
        });
      }
    } catch (error: any) {
      console.error('[CameraModal] Gallery picker failed:', error);
      Alert.alert('Error', 'Failed to pick image from gallery.');
      setIsProcessing(false);
    }
  };

  /**
   * Toggle flash mode
   */
  const toggleFlash = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlashMode((current: 'off' | 'on' | 'auto') => 
      current === 'off' ? 'on' : 'off'
    );
  };

  /**
   * Toggle camera type
   */
  const toggleCameraFacing = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCameraFacing((current: 'back' | 'front') =>
      current === 'back' ? 'front' : 'back'
    );
  };

  /**
   * Handle close
   */
  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  // Loading state
  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text variant="body" color="secondary" style={styles.loadingText}>
          Requesting camera access...
        </Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="camera-outline" size="xl" color={Theme.colors.text.tertiary} />
        <Text variant="h3" style={styles.permissionTitle}>
          Camera Access Required
        </Text>
        <Text variant="body" color="secondary" align="center" style={styles.permissionText}>
          VisionFlow needs camera access to capture reminders and discover patterns.
        </Text>
      </View>
    );
  }

  // Processing overlay
  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <LoadingSpinner size="large" />
        <Text variant="h3" style={styles.processingText}>
          Processing image...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraFacing}
        flash={flashMode}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          {/* Close Button */}
          <Pressable
            onPress={handleClose}
            style={styles.topButton}
          >
            <Icon name="close" size="md" color={Theme.colors.text.primary} />
          </Pressable>

          {/* Mode Indicator */}
          <View style={styles.modeIndicator}>
            <Icon 
              name={mode === 'reminder' ? 'notifications' : 'sparkles'} 
              size="sm" 
              color={Theme.colors.text.primary} 
            />
            <Text variant="caption" weight="600" style={styles.modeText}>
              {mode === 'reminder' ? 'Reminder Mode' : 'Pattern Mode'}
            </Text>
          </View>

          {/* Flash Toggle */}
          <Pressable
            onPress={toggleFlash}
            style={styles.topButton}
          >
            <Icon 
              name={flashMode === 'on' ? 'flash' : 'flash-off'} 
              size="md" 
              color={flashMode === 'on' ? Theme.colors.primary[500] : Theme.colors.text.primary}
            />
          </Pressable>
        </View>

        {/* Grid Overlay */}
        <View style={styles.gridOverlay}>
          <View style={styles.gridLine} />
          <View style={[styles.gridLine, styles.gridLineVertical]} />
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomBar}>
          {/* Gallery Button */}
          <Pressable
            onPress={handlePickFromGallery}
            style={styles.bottomButton}
          >
            <Icon name="images-outline" size="md" color={Theme.colors.text.primary} />
          </Pressable>

          {/* Capture Button */}
          <Pressable
            onPress={handleCapture}
            disabled={isCapturing}
            style={[
              styles.captureButton,
              isCapturing && styles.captureButtonActive,
            ]}
          >
            <View style={styles.captureButtonInner}>
              {isCapturing ? (
                <ActivityIndicator size="large" color={Theme.colors.text.primary} />
              ) : (
                <View style={styles.captureButtonRing} />
              )}
            </View>
          </Pressable>

          {/* Flip Camera Button */}
          <Pressable
            onPress={toggleCameraFacing}
            style={styles.bottomButton}
          >
            <Icon name="camera-reverse-outline" size="md" color={Theme.colors.text.primary} />
          </Pressable>
        </View>

        {/* Capture Hint */}
        {!isCapturing && (
          <View style={styles.hintContainer}>
            <Text variant="caption" color="secondary" align="center">
              {mode === 'reminder' 
                ? 'Capture a clear photo of your reminder' 
                : 'Frame the pattern you want to analyze'}
            </Text>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  camera: {
    flex: 1,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  loadingText: {
    marginTop: Theme.spacing.l,
  },

  // Permission State
  permissionContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  permissionTitle: {
    marginTop: Theme.spacing.l,
    marginBottom: Theme.spacing.s,
  },
  permissionText: {
    maxWidth: 280,
  },

  // Processing State
  processingContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: Theme.spacing.l,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.m,
    paddingTop: Platform.OS === 'ios' ? 60 : Theme.spacing.l,
    paddingBottom: Theme.spacing.m,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topButton: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modeText: {
    textTransform: 'uppercase',
  },

  // Grid Overlay
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  gridLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  gridLineVertical: {
    width: 1,
    height: '100%',
    position: 'absolute',
    left: '50%',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 48 : Theme.spacing.xl,
    paddingTop: Theme.spacing.l,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bottomButton: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Capture Button
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Theme.colors.text.primary,
  },
  captureButtonActive: {
    transform: [{ scale: 0.9 }],
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonRing: {
    width: '100%',
    height: '100%',
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.text.primary,
  },

  // Hint
  hintContainer: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
});
