/**
 * VisionFlow AI - Camera Modal (v3.0 - SafeArea Edition)
 * Full-screen camera capture interface with universal SafeArea support
 * 
 * @module screens/modals/CameraModal
 * 
 * CHANGELOG v3.0:
 * - ✅ Added comprehensive SafeArea support using react-native-safe-area-context
 * - ✅ All UI elements respect safe area insets (top, bottom, left, right)
 * - ✅ Works universally across all devices (notch, dynamic island, home indicator)
 * - ✅ Maintains existing opacity fixes from v2.1
 * - ✅ Added dynamic positioning for loading/permission states
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
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../../types/navigation.types';
import { Theme } from '../../constants/theme';
import { Text, Icon, LoadingSpinner } from '../../components';
import * as ImageManipulator from 'expo-image-manipulator';

type CameraModalProps = NativeStackScreenProps<RootStackParamList, 'CameraModal'>;

/**
 * CameraModal Component
 */
export function CameraModal({ navigation, route }: CameraModalProps) {
  const cameraRef = useRef<CameraView>(null);
  const { mode = 'reminder' } = route.params || {};
  
  // SafeArea insets - Universal solution for all devices
  const insets = useSafeAreaInsets();

  // State
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
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
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (!photo) {
        throw new Error('Failed to capture photo');
      }

      setIsProcessing(true);
      const processed = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1920 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );

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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Gallery Permission Required',
          'VisionFlow needs access to your photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true);
        
        const processed = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 1920 } }],
          { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
        );

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
    setFlashMode((current) => current === 'off' ? 'on' : 'off');
  };

  /**
   * Toggle camera facing
   */
  const toggleCameraFacing = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCameraFacing((current) => current === 'back' ? 'front' : 'back');
  };

  /**
   * Handle close
   */
  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  // Loading state with SafeArea
  if (!permission) {
    return (
      <View style={[
        styles.loadingContainer,
        {
          paddingTop: insets.top + Theme.spacing.xl,
          paddingBottom: insets.bottom + Theme.spacing.xl,
          paddingLeft: insets.left + Theme.spacing.xl,
          paddingRight: insets.right + Theme.spacing.xl,
        }
      ]}>
        <View style={styles.loadingIconContainer}>
          <Icon name="camera" size="xl" color={Theme.colors.primary[500]} />
        </View>
        <LoadingSpinner size="large" />
        <Text variant="h3" style={styles.loadingTitle}>
          Initializing Camera
        </Text>
        <Text variant="body" color="secondary" align="center" style={styles.loadingText}>
          Requesting camera access...
        </Text>
      </View>
    );
  }

  // Permission denied with SafeArea
  if (!permission.granted) {
    return (
      <View style={[
        styles.permissionContainer,
        {
          paddingTop: insets.top + Theme.spacing.xl,
          paddingBottom: insets.bottom + Theme.spacing.xl,
          paddingLeft: insets.left + Theme.spacing.xl,
          paddingRight: insets.right + Theme.spacing.xl,
        }
      ]}>
        <View style={styles.permissionIconContainer}>
          <Icon name="ban" size="xl" color={Theme.colors.semantic.error} />
        </View>
        <Text variant="h2" style={styles.permissionTitle}>
          Camera Access Required
        </Text>
        <Text variant="body" color="secondary" align="center" style={styles.permissionText}>
          VisionFlow needs camera access to capture reminders and discover patterns from your photos.
        </Text>
        <Pressable 
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <Icon name="camera" size="sm" color={Theme.colors.background.primary} />
          <Text variant="body" weight="600" customColor={Theme.colors.background.primary}>
            Grant Camera Access
          </Text>
        </Pressable>
      </View>
    );
  }

  // Processing overlay with SafeArea
  if (isProcessing) {
    return (
      <View style={[
        styles.processingContainer,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }
      ]}>
        <View style={styles.processingContent}>
          <LoadingSpinner size="large" />
          <Text variant="h2" style={styles.processingTitle}>
            Processing Image
          </Text>
          <Text variant="body" color="secondary" align="center">
            Optimizing and preparing for AI analysis...
          </Text>
        </View>
      </View>
    );
  }

  const modeConfig = mode === 'reminder' 
    ? { icon: 'notifications', label: 'Reminder Mode', color: Theme.colors.primary[500] }
    : { icon: 'sparkles', label: 'Pattern Mode', color: Theme.colors.semantic.warning };

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraFacing}
        flash={flashMode}
      >
        {/* Top Bar with SafeArea */}
        <View style={[
          styles.topBar,
          {
            paddingTop: insets.top + Theme.spacing.m,
            paddingLeft: Math.max(insets.left, Theme.spacing.m),
            paddingRight: Math.max(insets.right, Theme.spacing.m),
          }
        ]}>
          {/* Close Button */}
          <Pressable onPress={handleClose} style={styles.topButton}>
            <View style={styles.buttonInner}>
              <Icon name="close" size="md" color={Theme.colors.text.primary} />
            </View>
          </Pressable>

          {/* Mode Indicator */}
          <View style={styles.modeIndicator}>
            <View style={[styles.modeIconContainer, { backgroundColor: `${modeConfig.color}30` }]}>
              <Icon name={modeConfig.icon as any} size="sm" color={modeConfig.color} />
            </View>
            <Text variant="caption" weight="700" style={styles.modeText}>
              {modeConfig.label.toUpperCase()}
            </Text>
          </View>

          {/* Flash Toggle */}
          <Pressable onPress={toggleFlash} style={styles.topButton}>
            <View style={[
              styles.buttonInner,
              flashMode === 'on' && styles.buttonInnerActive
            ]}>
              <Icon 
                name={flashMode === 'on' ? 'flash' : 'flash-off'} 
                size="md" 
                color={flashMode === 'on' ? Theme.colors.primary[500] : Theme.colors.text.primary}
              />
            </View>
          </Pressable>
        </View>

        {/* Grid Overlay (Rule of Thirds) */}
        <View style={styles.gridOverlay} pointerEvents="none">
          <View style={styles.gridRow}>
            <View style={styles.gridCell} />
            <View style={[styles.gridCell, styles.gridCellBorder]} />
            <View style={styles.gridCell} />
          </View>
          <View style={[styles.gridRow, styles.gridRowBorder]}>
            <View style={styles.gridCell} />
            <View style={[styles.gridCell, styles.gridCellBorder]} />
            <View style={styles.gridCell} />
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridCell} />
            <View style={[styles.gridCell, styles.gridCellBorder]} />
            <View style={styles.gridCell} />
          </View>
        </View>

        {/* Center Focus Frame */}
        <View style={styles.focusFrame} pointerEvents="none">
          <View style={[styles.focusCorner, styles.focusCornerTL]} />
          <View style={[styles.focusCorner, styles.focusCornerTR]} />
          <View style={[styles.focusCorner, styles.focusCornerBL]} />
          <View style={[styles.focusCorner, styles.focusCornerBR]} />
        </View>

        {/* Bottom Controls with SafeArea */}
        <View style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(insets.bottom + Theme.spacing.m, Theme.spacing.xl),
            paddingLeft: Math.max(insets.left, Theme.spacing.xl),
            paddingRight: Math.max(insets.right, Theme.spacing.xl),
          }
        ]}>
          {/* Gallery Button */}
          <Pressable onPress={handlePickFromGallery} style={styles.sideButton}>
            <View style={styles.buttonInner}>
              <Icon name="images" size="md" color={Theme.colors.text.primary} />
            </View>
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
            <View style={[
              styles.captureButtonInner,
              { backgroundColor: modeConfig.color }
            ]}>
              {isCapturing ? (
                <ActivityIndicator size="large" color={Theme.colors.background.primary} />
              ) : (
                <Icon name="camera" size="lg" color={Theme.colors.background.primary} />
              )}
            </View>
          </Pressable>

          {/* Flip Camera Button */}
          <Pressable onPress={toggleCameraFacing} style={styles.sideButton}>
            <View style={styles.buttonInner}>
              <Icon name="camera-reverse" size="md" color={Theme.colors.text.primary} />
            </View>
          </Pressable>
        </View>

        {/* Capture Hint with SafeArea awareness */}
        {!isCapturing && (
          <View style={[
            styles.hintContainer,
            {
              bottom: Math.max(insets.bottom + 180, 200),
            }
          ]}>
            <View style={styles.hintBubble}>
              <Icon 
                name={mode === 'reminder' ? 'bulb' : 'scan'} 
                size="sm" 
                color={Theme.colors.text.primary} 
              />
              <Text variant="caption" weight="600" style={styles.hintText}>
                {mode === 'reminder' 
                  ? 'Capture a clear photo of your reminder' 
                  : 'Frame the pattern you want to analyze'}
              </Text>
            </View>
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
  
  // Loading State - ✅ SafeArea handled via dynamic padding
  loadingContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Theme.spacing.l,
  },
  loadingIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Theme.colors.primary[500]}20`, // ✅ 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  loadingTitle: {
    marginTop: Theme.spacing.m,
  },
  loadingText: {
    maxWidth: 280,
  },

  // Permission State - ✅ SafeArea handled via dynamic padding
  permissionContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Theme.spacing.l,
  },
  permissionIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Theme.colors.semantic.error}20`, // ✅ 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${Theme.colors.semantic.error}30`,
  },
  permissionTitle: {
    marginTop: Theme.spacing.m,
  },
  permissionText: {
    maxWidth: 300,
    lineHeight: 22,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
    paddingHorizontal: Theme.spacing.l,
    paddingVertical: Theme.spacing.m,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.primary[500],
    marginTop: Theme.spacing.m,
  },

  // Processing State - ✅ SafeArea handled via dynamic padding
  processingContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContent: {
    alignItems: 'center',
    gap: Theme.spacing.l,
    paddingHorizontal: Theme.spacing.xl,
  },
  processingTitle: {
    marginTop: Theme.spacing.m,
  },

  // Top Bar - ✅ SafeArea handled via dynamic padding (removed hardcoded iOS padding)
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Theme.spacing.m,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  topButton: {
    width: 52,
    height: 52,
  },
  buttonInner: {
    width: '100%',
    height: '100%',
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonInnerActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: Theme.colors.primary[500],
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modeIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeText: {
    fontSize: 11,
    letterSpacing: 1,
  },

  // Grid Overlay
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gridRowBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  gridCell: {
    flex: 1,
  },
  gridCellBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  // Focus Frame
  focusFrame: {
    position: 'absolute',
    top: '25%',
    left: '12.5%',
    right: '12.5%',
    bottom: '25%',
  },
  focusCorner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: Theme.colors.primary[500],
    borderWidth: 3,
  },
  focusCornerTL: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: Theme.borderRadius.m,
  },
  focusCornerTR: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: Theme.borderRadius.m,
  },
  focusCornerBL: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: Theme.borderRadius.m,
  },
  focusCornerBR: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: Theme.borderRadius.m,
  },

  // Bottom Bar - ✅ SafeArea handled via dynamic padding (removed hardcoded iOS padding)
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: Theme.spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sideButton: {
    width: 60,
    height: 60,
  },

  // Capture Button
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Theme.colors.text.primary,
  },
  captureButtonActive: {
    transform: [{ scale: 0.92 }],
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hint - ✅ SafeArea handled via dynamic bottom position
  hintContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  hintBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.s,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 12,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxWidth: 320,
  },
  hintText: {
    flex: 1,
  },
});