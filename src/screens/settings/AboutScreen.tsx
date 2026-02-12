/**
 * VisionFlow AI - About Screen (v3.0 - Hidden Inside UI Edition)
 * Enhanced cyberpunk aesthetic with monospace and italic typography
 * 
 * @module screens/settings/AboutScreen
 * 
 * CHANGELOG v3.0:
 * - ✅ UI ENHANCEMENT: Monospace fonts for technical labels
 * - ✅ UI ENHANCEMENT: Italic text for descriptive content
 * - ✅ All v2.1 harmonized features preserved
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types/navigation.types';
import { Theme } from '../../constants/theme';
import { APP_INFO, EXTERNAL_LINKS } from '../../constants/config';
import {
  Screen,
  Container,
  Text,
  Card,
  Icon,
  Pressable,
} from '../../components';

type AboutScreenProps = NativeStackScreenProps<SettingsStackParamList, 'About'>;

export function AboutScreen({ navigation }: AboutScreenProps) {
  const handleLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (err) {
      console.error('Failed to open link:', err);
    }
  };

  const renderLinkItem = (
    label: string, 
    url: string, 
    icon: string, 
    iconColor: string = Theme.colors.primary[500]
  ) => (
    <Pressable
      onPress={() => handleLink(url)}
      style={styles.linkItem}
      haptic="light"
    >
      <View style={styles.linkLeft}>
        <View style={[styles.linkIconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Icon name={icon as any} size="sm" color={iconColor} />
        </View>
        {/* ✅ ENHANCED: Monospace link label */}
        <Text variant="body" weight="600" mono>{label}</Text>
      </View>
      <Icon name="chevron-forward" size="sm" color={Theme.colors.text.tertiary} />
    </Pressable>
  );

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} haptic="light" style={styles.headerButton}>
          <Icon name="arrow-back" size="md" color={Theme.colors.text.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          {/* ✅ ENHANCED: Monospace header */}
          <Text variant="h4" weight="600" mono>ABOUT</Text>
          {/* ✅ NEW: Italic subtitle */}
          <Text variant="caption" color="tertiary" italic>App information</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="m">
          
          {/* App Logo & Info */}
          <View style={styles.appInfoContainer}>
            <View style={styles.logoContainer}>
              <Icon name="aperture" size="xl" color={Theme.colors.primary[500]} />
            </View>
            {/* ✅ ENHANCED: Monospace app name with underscore */}
            <Text variant="h1" weight="700" mono style={styles.appName}>
              VISIONFLOW_AI
            </Text>
            <View style={styles.versionBadge}>
              {/* ✅ ENHANCED: Monospace version */}
              <Text variant="caption" weight="700" mono customColor={Theme.colors.primary[500]}>
                v{APP_INFO.version}
              </Text>
            </View>
            {/* ✅ ENHANCED: Monospace build number */}
            <Text variant="caption" color="tertiary" mono style={styles.buildNumber}>
              Build {APP_INFO.buildNumber}
            </Text>
            {/* ✅ NEW: Italic tagline */}
            <Text variant="body" color="secondary" italic align="center" style={styles.tagline}>
              {APP_INFO.tagline}
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Pressable 
              style={styles.quickActionCard}
              onPress={() => handleLink(EXTERNAL_LINKS.website)}
              haptic="light"
            >
              <View style={styles.quickActionIcon}>
                <Icon name="globe" size="md" color={Theme.colors.primary[500]} />
              </View>
              {/* ✅ ENHANCED: Monospace quick action label */}
              <Text variant="caption" weight="600" mono>WEBSITE</Text>
            </Pressable>

            <Pressable 
              style={styles.quickActionCard}
              onPress={() => handleLink(EXTERNAL_LINKS.support)}
              haptic="light"
            >
              <View style={styles.quickActionIcon}>
                <Icon name="help-circle" size="md" color={Theme.colors.semantic.info} />
              </View>
              {/* ✅ ENHANCED: Monospace quick action label */}
              <Text variant="caption" weight="600" mono>SUPPORT</Text>
            </Pressable>

            <Pressable 
              style={styles.quickActionCard}
              onPress={() => handleLink(EXTERNAL_LINKS.github)}
              haptic="light"
            >
              <View style={styles.quickActionIcon}>
                <Icon name="logo-github" size="md" color={Theme.colors.text.primary} />
              </View>
              {/* ✅ ENHANCED: Monospace quick action label */}
              <Text variant="caption" weight="600" mono>GITHUB</Text>
            </Pressable>
          </View>

          {/* Connect Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="link-outline" size="sm" color={Theme.colors.primary[500]} />
              {/* ✅ ENHANCED: Monospace section header */}
              <Text variant="h4" mono>CONNECT_WITH_US</Text>
            </View>
            
            <Card elevation="sm" style={styles.linkCard}>
              {renderLinkItem('Official Website', EXTERNAL_LINKS.website, 'globe', Theme.colors.primary[500])}
              <View style={styles.divider} />
              {renderLinkItem('Get Support', EXTERNAL_LINKS.support, 'help-buoy', Theme.colors.semantic.info)}
              <View style={styles.divider} />
              {renderLinkItem('Follow on Twitter', EXTERNAL_LINKS.twitter, 'logo-twitter', '#1DA1F2')}
              <View style={styles.divider} />
              {renderLinkItem('View on GitHub', EXTERNAL_LINKS.github, 'logo-github', Theme.colors.text.primary)}
            </Card>
          </View>

          {/* Legal Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="shield-checkmark-outline" size="sm" color={Theme.colors.primary[500]} />
              {/* ✅ ENHANCED: Monospace section header */}
              <Text variant="h4" mono>LEGAL_&_PRIVACY</Text>
            </View>
            
            <Card elevation="sm" style={styles.linkCard}>
              {renderLinkItem('Privacy Policy', EXTERNAL_LINKS.privacyPolicy, 'shield-checkmark', Theme.colors.semantic.success)}
              <View style={styles.divider} />
              {renderLinkItem('Terms of Service', EXTERNAL_LINKS.termsOfService, 'document-text', Theme.colors.semantic.warning)}
            </Card>
          </View>

          {/* App Info Card */}
          <Card elevation="sm" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
              {/* ✅ ENHANCED: Monospace card header */}
              <Text variant="caption" color="secondary" weight="600" mono>ABOUT_THIS_APP</Text>
            </View>
            {/* ✅ NEW: Italic info text */}
            <Text variant="caption" color="secondary" italic style={styles.infoText}>
              VisionFlow AI is an intelligent reminder assistant that uses computer vision and AI to help you remember what matters. Built with React Native and Expo.
            </Text>
          </Card>

          {/* Tech Stack Card */}
          <Card elevation="sm" style={styles.techCard}>
            <View style={styles.techHeader}>
              <Icon name="code-slash" size="sm" color={Theme.colors.primary[500]} />
              {/* ✅ ENHANCED: Monospace card header */}
              <Text variant="caption" color="secondary" weight="600" mono>BUILT_WITH</Text>
            </View>
            <View style={styles.techGrid}>
              <View style={styles.techItem}>
                <Icon name="logo-react" size="sm" color="#61DAFB" />
                {/* ✅ ENHANCED: Monospace tech label */}
                <Text variant="caption" color="secondary" mono>React_Native</Text>
              </View>
              <View style={styles.techItem}>
                <Icon name="flash" size="sm" color={Theme.colors.semantic.warning} />
                {/* ✅ ENHANCED: Monospace tech label */}
                <Text variant="caption" color="secondary" mono>Expo</Text>
              </View>
              <View style={styles.techItem}>
                <Icon name="code" size="sm" color="#3178C6" />
                {/* ✅ ENHANCED: Monospace tech label */}
                <Text variant="caption" color="secondary" mono>TypeScript</Text>
              </View>
            </View>
          </Card>

          {/* Copyright */}
          <View style={styles.footer}>
            {/* ✅ ENHANCED: Monospace copyright */}
            <Text variant="caption" color="tertiary" mono align="center">
              © {new Date().getFullYear()} VisionFlow_AI
            </Text>
            {/* ✅ ENHANCED: Monospace rights */}
            <Text variant="caption" color="tertiary" mono align="center">
              All rights reserved
            </Text>
            {/* ✅ NEW: Italic made with love */}
            <Text variant="caption" color="tertiary" italic align="center" style={styles.madeWith}>
              Made with ❤️ for productivity
            </Text>
          </View>

        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
    ...Theme.shadows.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.m,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  
  // Scroll styles
  scrollContent: {
    paddingBottom: 120,
  },
  
  // App info styles
  appInfoContainer: {
    alignItems: 'center',
    marginVertical: Theme.spacing.xl,
    gap: Theme.spacing.s,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.m,
    borderWidth: 2,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  appName: {
    marginBottom: Theme.spacing.xs,
  },
  versionBadge: {
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: `${Theme.colors.primary[500]}20`,
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  buildNumber: {
    marginTop: 2,
  },
  tagline: {
    maxWidth: 280,
    marginTop: Theme.spacing.m,
    lineHeight: 22,
  },
  
  // Quick actions styles
  quickActionsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
    marginBottom: Theme.spacing.l,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.m,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.l,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
    gap: Theme.spacing.xs,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: Theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}20`,
  },
  
  // Section styles
  section: {
    marginBottom: Theme.spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.m,
  },
  
  // Link card styles
  linkCard: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}30`,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.m,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    flex: 1,
  },
  linkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.border.default}20`,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginLeft: Theme.spacing.m + 40 + Theme.spacing.m,
  },
  
  // Info card styles
  infoCard: {
    marginBottom: Theme.spacing.m,
    backgroundColor: `${Theme.colors.semantic.info}10`,
    borderWidth: 1,
    borderColor: `${Theme.colors.semantic.info}30`,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Theme.spacing.s,
  },
  infoText: {
    lineHeight: 18,
  },
  
  // Tech card styles
  techCard: {
    marginBottom: Theme.spacing.l,
    backgroundColor: `${Theme.colors.primary[500]}05`,
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}20`,
  },
  techHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Theme.spacing.m,
  },
  techGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: `${Theme.colors.border.default}20`,
  },
  techItem: {
    alignItems: 'center',
    gap: 6,
  },
  
  // Footer styles
  footer: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: Theme.spacing.l,
  },
  madeWith: {
    marginTop: Theme.spacing.s,
  },
});
