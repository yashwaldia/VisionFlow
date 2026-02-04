/**
 * VisionFlow AI - About Screen (Professional v2.0)
 * App information, legal links, and version details
 * 
 * @module screens/settings/AboutScreen
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
        <Text variant="body" weight="600">{label}</Text>
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
          <Text variant="h4" weight="600">About</Text>
          <Text variant="caption" color="tertiary">App information</Text>
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
            <Text variant="h1" weight="700" style={styles.appName}>
              {APP_INFO.displayName}
            </Text>
            <View style={styles.versionBadge}>
              <Text variant="caption" weight="700" customColor={Theme.colors.primary[500]}>
                v{APP_INFO.version}
              </Text>
            </View>
            <Text variant="caption" color="tertiary" style={styles.buildNumber}>
              Build {APP_INFO.buildNumber}
            </Text>
            <Text variant="body" color="secondary" align="center" style={styles.tagline}>
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
              <Text variant="caption" weight="600">Website</Text>
            </Pressable>

            <Pressable 
              style={styles.quickActionCard}
              onPress={() => handleLink(EXTERNAL_LINKS.support)}
              haptic="light"
            >
              <View style={styles.quickActionIcon}>
                <Icon name="help-circle" size="md" color={Theme.colors.semantic.info} />
              </View>
              <Text variant="caption" weight="600">Support</Text>
            </Pressable>

            <Pressable 
              style={styles.quickActionCard}
              onPress={() => handleLink(EXTERNAL_LINKS.github)}
              haptic="light"
            >
              <View style={styles.quickActionIcon}>
                <Icon name="logo-github" size="md" color={Theme.colors.text.primary} />
              </View>
              <Text variant="caption" weight="600">GitHub</Text>
            </Pressable>
          </View>

          {/* Connect Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="link-outline" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="h4">Connect With Us</Text>
            </View>
            
            <Card style={styles.linkCard}>
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
              <Text variant="h4">Legal & Privacy</Text>
            </View>
            
            <Card style={styles.linkCard}>
              {renderLinkItem('Privacy Policy', EXTERNAL_LINKS.privacyPolicy, 'shield-checkmark', Theme.colors.semantic.success)}
              <View style={styles.divider} />
              {renderLinkItem('Terms of Service', EXTERNAL_LINKS.termsOfService, 'document-text', Theme.colors.semantic.warning)}
            </Card>
          </View>

          {/* App Info Card */}
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Icon name="information-circle" size="sm" color={Theme.colors.semantic.info} />
              <Text variant="caption" color="secondary" weight="600">ABOUT THIS APP</Text>
            </View>
            <Text variant="caption" color="secondary" style={styles.infoText}>
              VisionFlow AI is an intelligent reminder assistant that uses computer vision and AI to help you remember what matters. Built with React Native and Expo.
            </Text>
          </Card>

          {/* Tech Stack Card */}
          <Card style={styles.techCard}>
            <View style={styles.techHeader}>
              <Icon name="code-slash" size="sm" color={Theme.colors.primary[500]} />
              <Text variant="caption" color="secondary" weight="600">BUILT WITH</Text>
            </View>
            <View style={styles.techGrid}>
              <View style={styles.techItem}>
                <Icon name="logo-react" size="sm" color="#61DAFB" />
                <Text variant="caption" color="secondary">React Native</Text>
              </View>
              <View style={styles.techItem}>
                <Icon name="flash" size="sm" color={Theme.colors.semantic.warning} />
                <Text variant="caption" color="secondary">Expo</Text>
              </View>
              <View style={styles.techItem}>
                <Icon name="code" size="sm" color="#3178C6" />
                <Text variant="caption" color="secondary">TypeScript</Text>
              </View>
            </View>
          </Card>

          {/* Copyright */}
          <View style={styles.footer}>
            <Text variant="caption" color="tertiary" align="center">
              © {new Date().getFullYear()} VisionFlow AI
            </Text>
            <Text variant="caption" color="tertiary" align="center">
              All rights reserved
            </Text>
            <Text variant="caption" color="tertiary" align="center" style={styles.madeWith}>
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
    backgroundColor: `${Theme.colors.primary[500]}15`,
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
    backgroundColor: `${Theme.colors.primary[500]}15`,
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
