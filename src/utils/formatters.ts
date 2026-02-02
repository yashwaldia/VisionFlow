/**
 * VisionFlow AI - Formatters
 * Text, number, currency, and data formatting utilities
 * 
 * @module utils/formatters
 */

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalize first letter of string
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Convert string to title case
 */
export function toTitleCase(text: string): string {
  if (!text) return '';
  const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'via'];
  
  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Always capitalize first and last word
      if (index === 0 || index === text.split(' ').length - 1) {
        return capitalize(word);
      }
      // Don't capitalize small words
      if (smallWords.includes(word)) {
        return word;
      }
      return capitalize(word);
    })
    .join(' ');
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, decimals: number = 0): string {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency (default: USD)
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is invalid
    return `$${formatNumber(amount, 2)}`;
  }
}

/**
 * Format currency for Indian Rupee (₹)
 */
export function formatINR(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Format file size (bytes to human-readable)
 */
export function formatFileSize(bytes: number): string {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Format phone number (US format)
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Return original if format is unrecognized
  return phone;
}

/**
 * Format Indian phone number
 */
export function formatIndianPhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format: +91 XXXXX XXXXX
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }

  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Pluralize word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}

/**
 * Format list of items with commas and "and"
 * Example: ["Apple", "Banana", "Orange"] => "Apple, Banana, and Orange"
 */
export function formatList(items: string[], conjunction: string = 'and'): string {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const last = items[items.length - 1];
  const rest = items.slice(0, -1);
  return `${rest.join(', ')}, ${conjunction} ${last}`;
}

/**
 * Format initials from name
 * Example: "John Doe" => "JD"
 */
export function getInitials(name: string, maxLength: number = 2): string {
  if (!name) return '';

  const words = name.trim().split(/\s+/);
  const initials = words
    .map(word => word[0])
    .filter(Boolean)
    .join('')
    .toUpperCase();

  return initials.slice(0, maxLength);
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) return '0s';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return pluralize(days, 'day');
  }
  if (hours > 0) {
    return pluralize(hours, 'hour');
  }
  if (minutes > 0) {
    return pluralize(minutes, 'minute');
  }
  return pluralize(seconds, 'second');
}

/**
 * Mask sensitive text (e.g., credit card numbers)
 */
export function maskText(text: string, visibleChars: number = 4, maskChar: string = '*'): string {
  if (!text || text.length <= visibleChars) return text;

  const visible = text.slice(-visibleChars);
  const masked = maskChar.repeat(text.length - visibleChars);
  return masked + visible;
}

/**
 * Remove extra whitespace and trim
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(text: string): string {
  if (!text) return '';
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(text: string): string {
  if (!text) return '';
  return text
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Format confidence score as percentage
 */
export function formatConfidence(confidence: number): string {
  if (typeof confidence !== 'number' || isNaN(confidence)) return '0%';
  const percentage = Math.round(confidence * 100);
  return `${percentage}%`;
}

/**
 * Format array to comma-separated string
 */
export function formatArray(arr: any[], maxItems: number = 3): string {
  if (!arr || arr.length === 0) return '';
  
  if (arr.length <= maxItems) {
    return arr.join(', ');
  }

  const visible = arr.slice(0, maxItems);
  const remaining = arr.length - maxItems;
  return `${visible.join(', ')} +${remaining} more`;
}

/**
 * Format boolean to Yes/No
 */
export function formatBoolean(value: boolean): string {
  return value ? 'Yes' : 'No';
}

/**
 * Format coordinates (latitude, longitude)
 */
export function formatCoordinates(lat: number, lng: number, decimals: number = 6): string {
  return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`;
}

/**
 * Slugify text (convert to URL-friendly format)
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
