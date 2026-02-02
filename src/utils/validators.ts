/**
 * VisionFlow AI - Validators
 * Input validation functions with TypeScript type guards
 * 
 * @module utils/validators
 */

import { VALIDATION_RULES } from '../constants/config';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation (RFC 5322 simplified)
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Phone number validation (US format)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's 10 digits (US) or 11 digits starting with 1
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === '1');
}

/**
 * Indian phone number validation
 */
export function isValidIndianPhone(phone: string): boolean {
  if (!phone) return false;
  
  const cleaned = phone.replace(/\D/g, '');
  
  // Indian numbers: 10 digits starting with 6-9, or 12 digits starting with 91
  if (cleaned.length === 10) {
    return /^[6-9]\d{9}$/.test(cleaned);
  }
  
  if (cleaned.length === 12) {
    return /^91[6-9]\d{9}$/.test(cleaned);
  }
  
  return false;
}

/**
 * Required field validation
 */
export function isRequired(value: any): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: false, error: 'This field is required' };
  }
  
  if (typeof value === 'string' && value.trim().length === 0) {
    return { isValid: false, error: 'This field is required' };
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return { isValid: false, error: 'At least one item is required' };
  }
  
  return { isValid: true };
}

/**
 * String length validation
 */
export function validateLength(
  value: string,
  min: number = 0,
  max: number = Infinity
): ValidationResult {
  if (!value) {
    return { isValid: min === 0, error: 'Value is required' };
  }
  
  const length = value.length;
  
  if (length < min) {
    return { isValid: false, error: `Minimum length is ${min} characters` };
  }
  
  if (length > max) {
    return { isValid: false, error: `Maximum length is ${max} characters` };
  }
  
  return { isValid: true };
}

/**
 * Number range validation
 */
export function validateRange(
  value: number,
  min: number = -Infinity,
  max: number = Infinity
): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: 'Value must be a number' };
  }
  
  if (value < min) {
    return { isValid: false, error: `Value must be at least ${min}` };
  }
  
  if (value > max) {
    return { isValid: false, error: `Value must be at most ${max}` };
  }
  
  return { isValid: true };
}

/**
 * Date validation (not in the past)
 */
export function isValidFutureDate(dateString: string): ValidationResult {
  if (!dateString) {
    return { isValid: false, error: 'Date is required' };
  }
  
  try {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Invalid date format' };
    }
    
    if (date < today) {
      return { isValid: false, error: 'Date cannot be in the past' };
    }
    
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid date' };
  }
}

/**
 * Time validation (HH:MM format)
 */
export function isValidTime(timeString: string): ValidationResult {
  if (!timeString) {
    return { isValid: false, error: 'Time is required' };
  }
  
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  
  if (!timeRegex.test(timeString)) {
    return { isValid: false, error: 'Invalid time format (use HH:MM)' };
  }
  
  return { isValid: true };
}

/**
 * Reminder title validation
 */
export function validateReminderTitle(title: string): ValidationResult {
  const required = isRequired(title);
  if (!required.isValid) return required;
  
  return validateLength(
    title,
    1,
    VALIDATION_RULES.reminder.titleMaxLength
  );
}

/**
 * Reminder note validation
 */
export function validateReminderNote(note: string): ValidationResult {
  if (!note) return { isValid: true }; // Optional field
  
  return validateLength(
    note,
    0,
    VALIDATION_RULES.reminder.noteMaxLength
  );
}

/**
 * Project name validation
 */
export function validateProjectName(name: string): ValidationResult {
  const required = isRequired(name);
  if (!required.isValid) return required;
  
  return validateLength(
    name,
    VALIDATION_RULES.project.nameMinLength,
    VALIDATION_RULES.project.nameMaxLength
  );
}

/**
 * Project description validation
 */
export function validateProjectDescription(description: string): ValidationResult {
  if (!description) return { isValid: true }; // Optional field
  
  return validateLength(
    description,
    0,
    VALIDATION_RULES.project.descriptionMaxLength
  );
}

/**
 * Pattern confidence validation
 */
export function validatePatternConfidence(confidence: number): ValidationResult {
  return validateRange(
    confidence,
    VALIDATION_RULES.pattern.minConfidence,
    1.0
  );
}

/**
 * Password strength validation
 */
export function validatePasswordStrength(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  const strengthCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
  
  if (strengthCount < 3) {
    return { 
      isValid: false, 
      error: 'Password must contain uppercase, lowercase, number, and special character' 
    };
  }
  
  return { isValid: true };
}

/**
 * Alphanumeric validation
 */
export function isAlphanumeric(value: string): boolean {
  if (!value) return false;
  return /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * Alphabetic validation
 */
export function isAlphabetic(value: string): boolean {
  if (!value) return false;
  return /^[a-zA-Z]+$/.test(value);
}

/**
 * Numeric validation
 */
export function isNumeric(value: string): boolean {
  if (!value) return false;
  return /^\d+$/.test(value);
}

/**
 * Integer validation
 */
export function isInteger(value: any): boolean {
  return Number.isInteger(value);
}

/**
 * Positive number validation
 */
export function isPositive(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Array validation (non-empty)
 */
export function isNonEmptyArray(value: any): boolean {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Object validation (non-empty)
 */
export function isNonEmptyObject(value: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
}

/**
 * UUID validation (v4)
 */
export function isValidUUID(value: string): boolean {
  if (!value) return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Hex color validation
 */
export function isValidHexColor(value: string): boolean {
  if (!value) return false;
  
  const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
  return hexRegex.test(value);
}

/**
 * Credit card number validation (Luhn algorithm)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  if (!cardNumber) return false;
  
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * JSON validation
 */
export function isValidJSON(value: string): boolean {
  if (!value) return false;
  
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Image file extension validation
 */
export function isValidImageExtension(filename: string): boolean {
  if (!filename) return false;
  
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  
  return validExtensions.includes(extension);
}

/**
 * Combine multiple validations
 */
export function validateAll(...validations: ValidationResult[]): ValidationResult {
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation;
    }
  }
  
  return { isValid: true };
}

/**
 * Type guard: check if value is string
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * Type guard: check if value is number
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard: check if value is boolean
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard: check if value is array
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

/**
 * Type guard: check if value is object
 */
export function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard: check if value is null or undefined
 */
export function isNullish(value: any): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Type guard: check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
