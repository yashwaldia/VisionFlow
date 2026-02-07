/**
 * VisionFlow AI - HUD Elements Component
 * Corner brackets and tactical overlays for pattern display
 * 
 * @module components/patterns/HUDElements
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';
import { Text } from '../Text';

interface HUDElementsProps {
  patternCount: number;
  showStatus?: boolean;
}

export function HUDElements({ patternCount, showStatus = true }: HUDElementsProps) {
  return (
    <>
      {/* Corner Brackets */}
      <View style={styles.hudCorners} pointerEvents="none">
        <View style={[styles.hudCorner, styles.hudCornerTL]} />
        <View style={[styles.hudCorner, styles.hudCornerTR]} />
        <View style={[styles.hudCorner, styles.hudCornerBL]} />
        <View style={[styles.hudCorner, styles.hudCornerBR]} />
      </View>

      {/* Status Badge */}
      {showStatus && (
        <View style={styles.statusBadge} pointerEvents="none">
          <View style={styles.statusDot} />
          <Text variant="micro" weight="700" customColor={Theme.colors.primary[500]}>
            {patternCount} NODE{patternCount !== 1 ? 'S' : ''} • DATA_LOCKED
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  hudCorners: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  hudCorner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: Theme.colors.primary[500],
    borderWidth: 2,
  },
  hudCornerTL: {
    top: 12,
    left: 12,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 4,
  },
  hudCornerTR: {
    top: 12,
    right: 12,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 4,
  },
  hudCornerBL: {
    bottom: 12,
    left: 12,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 4,
  },
  hudCornerBR: {
    bottom: 12,
    right: 12,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 4,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${Theme.colors.background.primary}95`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary[500],
  },
});
