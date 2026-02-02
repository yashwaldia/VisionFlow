/**
 * VisionFlow AI - ErrorBoundary Component
 * Catches and displays React component errors
 * 
 * @module components/ErrorBoundary
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';
import { Text } from './Text';
import { Button } from './Button';
import { Container } from './Container';

/**
 * ErrorBoundary props
 */
interface ErrorBoundaryProps {
  /**
   * Child components
   */
  children: ReactNode;
  
  /**
   * Fallback UI component
   */
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  
  /**
   * Error handler callback
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * ErrorBoundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * 
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <CustomErrorUI error={error} onReset={reset} />
 *   )}
 *   onError={(error, errorInfo) => {
 *     logErrorToService(error, errorInfo);
 *   }}
 * >
 *   <Screen />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (__DEV__) {
      console.error('[ErrorBoundary] Caught error:', error);
      console.error('[ErrorBoundary] Error info:', errorInfo);
    }
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }
  
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };
  
  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;
    
    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.resetError);
      }
      
      // Default error UI
      return (
        <Container padding="xl" style={styles.container}>
          <View style={styles.content}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Text variant="display">⚠️</Text>
            </View>
            
            {/* Error Title */}
            <Text variant="h2" align="center" style={styles.title}>
              Something went wrong
            </Text>
            
            {/* Error Message */}
            <Text variant="body" color="secondary" align="center" style={styles.message}>
              We encountered an unexpected error. Please try again.
            </Text>
            
            {/* Error Details (Dev only) */}
            {__DEV__ && (
              <View style={styles.errorDetails}>
                <Text variant="caption" color="tertiary" mono style={styles.errorText}>
                  {error.name}: {error.message}
                </Text>
              </View>
            )}
            
            {/* Reset Button */}
            <Button
              label="Try Again"
              variant="primary"
              onPress={this.resetError}
              style={styles.button}
            />
          </View>
        </Container>
      );
    }
    
    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: Theme.spacing.l,
  },
  title: {
    marginBottom: Theme.spacing.m,
  },
  message: {
    marginBottom: Theme.spacing.xl,
  },
  errorDetails: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.m,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
    maxWidth: '100%',
  },
  errorText: {
    fontSize: 11,
  },
  button: {
    minWidth: 160,
  },
});
