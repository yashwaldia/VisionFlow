/**
 * VisionFlow AI - About Screen
 * App information, legal links, and version details
 * @module screens/settings/AboutScreen
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Linking, Image } from 'react-native';
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
  Button,
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

  const renderLinkItem = (label: string, url: string, icon: string) => (
    <Pressable
      onPress={() => handleLink(url)}
      style={styles.linkItem}
      haptic="light"
    >
      <View style={styles.linkLeft}>
        <Icon name={icon as any} size="sm" color={Theme.colors.text.secondary} />
        <Text variant="body" style={styles.linkText}>{label}</Text>
      </View>
      <Icon name="open-outline" size="sm" color={Theme.colors.text.tertiary} />
    </Pressable>
  );

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Button 
            label="Back" 
            variant="ghost" 
            leftIcon="arrow-back" 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
        />
        <Text variant="h4" weight="600">About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Container padding="m">
          
          {/* App Logo & Info */}
          <View style={styles.appInfoContainer}>
            <View style={styles.logoContainer}>
              <Icon name="aperture" size="xl" color={Theme.colors.primary[500]} />
            </View>
            <Text variant="h2" weight="700" style={styles.appName}>
              {APP_INFO.displayName}
            </Text>
            <Text variant="body" color="secondary" style={styles.version}>
              Version {APP_INFO.version} ({APP_INFO.buildNumber})
            </Text>
            <Text variant="caption" color="tertiary" align="center" style={styles.tagline}>
              {APP_INFO.tagline}
            </Text>
          </View>

          {/* Links Section */}
          <Text variant="h4" style={styles.sectionTitle}>Connect</Text>
          <Card style={styles.card}>
            {renderLinkItem('Website', EXTERNAL_LINKS.website, 'globe-outline')}
            <View style={styles.divider} />
            {renderLinkItem('Support', EXTERNAL_LINKS.support, 'help-buoy-outline')}
            <View style={styles.divider} />
            {renderLinkItem('Twitter', EXTERNAL_LINKS.twitter, 'logo-twitter')}
            <View style={styles.divider} />
            {renderLinkItem('GitHub', EXTERNAL_LINKS.github, 'logo-github')}
          </Card>

          {/* Legal Section */}
          <Text variant="h4" style={styles.sectionTitle}>Legal</Text>
          <Card style={styles.card}>
            {renderLinkItem('Privacy Policy', EXTERNAL_LINKS.privacyPolicy, 'shield-checkmark-outline')}
            <View style={styles.divider} />
            {renderLinkItem('Terms of Service', EXTERNAL_LINKS.termsOfService, 'document-text-outline')}
          </Card>

          {/* Copyright */}
          <View style={styles.footer}>
            <Text variant="caption" color="tertiary" align="center">
              © {new Date().getFullYear()} VisionFlow AI. All rights reserved.
            </Text>
          </View>

        </Container>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.secondary,
  },
  backButton: {
    paddingHorizontal: 0,
  },
  placeholder: {
    width: 48,
  },
  content: {
    paddingBottom: Theme.spacing.xl,
  },
  appInfoContainer: {
    alignItems: 'center',
    marginVertical: Theme.spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: `${Theme.colors.primary[500]}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.m,
    borderWidth: 1,
    borderColor: `${Theme.colors.primary[500]}30`,
  },
  appName: {
    marginBottom: Theme.spacing.xs,
  },
  version: {
    marginBottom: Theme.spacing.m,
  },
  tagline: {
    maxWidth: 260,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.m,
    marginLeft: Theme.spacing.xs,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.m,
    backgroundColor: 'transparent',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  linkText: {
    fontSize: Theme.typography.fontSize.body,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginLeft: Theme.spacing.m,
  },
  footer: {
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.l,
  },
});