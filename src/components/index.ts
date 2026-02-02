/**
 * VisionFlow AI - Components Index
 * Barrel exports for all UI components
 * 
 * @module components
 */

// Core Components
export { Text, Heading, Display, Caption } from './Text';
export type { TextProps, TextVariant, TextColor } from './Text';

export { Icon } from './Icon';
export type { IconProps, IconSize } from './Icon';

export { Pressable } from './Pressable';
export type { PressableProps, HapticType } from './Pressable';

export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

// Layout Components
export { Screen } from './Screen';
export type { ScreenProps } from './Screen';

export { Container } from './Container';
export type { ContainerProps, ContainerPadding } from './Container';

export { Card } from './Card';
export type { CardProps, CardElevation, CardVariant } from './Card';

export { Divider } from './Divider';
export type { DividerProps, DividerOrientation } from './Divider';

// Input Components
export { Input } from './Input';
export type { InputProps } from './Input';

export { SearchBar } from './SearchBar';
export type { SearchBarProps } from './SearchBar';

export { Checkbox } from './Checkbox';
export type { CheckboxProps } from './Checkbox';

export { DateTimePicker } from './DateTimePicker';
export type { DateTimePickerProps, DateTimePickerMode } from './DateTimePicker';

// Feedback Components
export { LoadingSpinner } from './LoadingSpinner';
export type { LoadingSpinnerProps, SpinnerSize } from './LoadingSpinner';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { ErrorBoundary } from './ErrorBoundary';

export { Toast } from './Toast';
export type { ToastProps, ToastType, ToastPosition } from './Toast';
