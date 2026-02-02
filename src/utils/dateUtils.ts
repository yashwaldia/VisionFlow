/**
 * VisionFlow AI - Date Utilities
 * Date parsing, formatting, and manipulation helpers
 * 
 * @module utils/dateUtils
 */

/**
 * Date format options
 */
export type DateFormat = 
  | 'full'           // Monday, February 2, 2026
  | 'long'           // February 2, 2026
  | 'medium'         // Feb 2, 2026
  | 'short'          // 02/02/2026
  | 'iso'            // 2026-02-02
  | 'time'           // 11:30 AM
  | 'datetime'       // Feb 2, 2026, 11:30 AM
  | 'relative';      // 5 minutes ago

/**
 * Parse date string to Date object
 * Handles multiple formats: ISO, MM/DD/YYYY, natural language
 */
export function parseDate(dateString: string): Date | null {
  try {
    // ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString + 'T00:00:00');
      return isValidDate(date) ? date : null;
    }

    // ISO datetime (YYYY-MM-DDTHH:mm:ss)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateString)) {
      const date = new Date(dateString);
      return isValidDate(date) ? date : null;
    }

    // MM/DD/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const date = new Date(dateString);
      return isValidDate(date) ? date : null;
    }

    // Timestamp (milliseconds)
    if (/^\d+$/.test(dateString)) {
      const timestamp = parseInt(dateString, 10);
      const date = new Date(timestamp);
      return isValidDate(date) ? date : null;
    }

    // Try generic Date constructor as fallback
    const date = new Date(dateString);
    return isValidDate(date) ? date : null;
  } catch (error) {
    console.error('[dateUtils] Parse error:', error);
    return null;
  }
}

/**
 * Format date to human-readable string
 */
export function formatDate(date: Date | string | number, format: DateFormat = 'medium'): string {
  try {
    const dateObj = toDate(date);
    if (!dateObj) return '';

    switch (format) {
      case 'full':
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

      case 'medium':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

      case 'short':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });

      case 'iso':
        return dateObj.toISOString().split('T')[0];

      case 'time':
        return dateObj.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

      case 'datetime':
        return `${formatDate(dateObj, 'medium')}, ${formatDate(dateObj, 'time')}`;

      case 'relative':
        return getRelativeTime(dateObj);

      default:
        return dateObj.toLocaleDateString();
    }
  } catch (error) {
    console.error('[dateUtils] Format error:', error);
    return '';
  }
}

/**
 * Get relative time string (e.g., "5 minutes ago", "in 2 hours")
 */
export function getRelativeTime(date: Date | string | number): string {
  try {
    const dateObj = toDate(date);
    if (!dateObj) return '';

    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const absDiffMs = Math.abs(diffMs);
    const isPast = diffMs < 0;

    // Seconds
    if (absDiffMs < 60 * 1000) {
      return 'Just now';
    }

    // Minutes
    if (absDiffMs < 60 * 60 * 1000) {
      const minutes = Math.floor(absDiffMs / (60 * 1000));
      return isPast
        ? `${minutes} minute${minutes > 1 ? 's' : ''} ago`
        : `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    // Hours
    if (absDiffMs < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(absDiffMs / (60 * 60 * 1000));
      return isPast
        ? `${hours} hour${hours > 1 ? 's' : ''} ago`
        : `in ${hours} hour${hours > 1 ? 's' : ''}`;
    }

    // Days
    if (absDiffMs < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(absDiffMs / (24 * 60 * 60 * 1000));
      return isPast
        ? `${days} day${days > 1 ? 's' : ''} ago`
        : `in ${days} day${days > 1 ? 's' : ''}`;
    }

    // Weeks
    if (absDiffMs < 30 * 24 * 60 * 60 * 1000) {
      const weeks = Math.floor(absDiffMs / (7 * 24 * 60 * 60 * 1000));
      return isPast
        ? `${weeks} week${weeks > 1 ? 's' : ''} ago`
        : `in ${weeks} week${weeks > 1 ? 's' : ''}`;
    }

    // Months
    if (absDiffMs < 365 * 24 * 60 * 60 * 1000) {
      const months = Math.floor(absDiffMs / (30 * 24 * 60 * 60 * 1000));
      return isPast
        ? `${months} month${months > 1 ? 's' : ''} ago`
        : `in ${months} month${months > 1 ? 's' : ''}`;
    }

    // Years
    const years = Math.floor(absDiffMs / (365 * 24 * 60 * 60 * 1000));
    return isPast
      ? `${years} year${years > 1 ? 's' : ''} ago`
      : `in ${years} year${years > 1 ? 's' : ''}`;
  } catch (error) {
    console.error('[dateUtils] Relative time error:', error);
    return '';
  }
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string | number): boolean {
  const dateObj = toDate(date);
  if (!dateObj) return false;

  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(date: Date | string | number): boolean {
  const dateObj = toDate(date);
  if (!dateObj) return false;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    dateObj.getDate() === tomorrow.getDate() &&
    dateObj.getMonth() === tomorrow.getMonth() &&
    dateObj.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string | number): boolean {
  const dateObj = toDate(date);
  if (!dateObj) return false;
  return dateObj.getTime() < new Date().getTime();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string | number): boolean {
  const dateObj = toDate(date);
  if (!dateObj) return false;
  return dateObj.getTime() > new Date().getTime();
}

/**
 * Check if date is overdue (past + not today)
 */
export function isOverdue(date: Date | string | number): boolean {
  return isPast(date) && !isToday(date);
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string | number, days: number): Date {
  const dateObj = toDate(date) || new Date();
  const result = new Date(dateObj);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add hours to a date
 */
export function addHours(date: Date | string | number, hours: number): Date {
  const dateObj = toDate(date) || new Date();
  const result = new Date(dateObj);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date | string | number, minutes: number): Date {
  const dateObj = toDate(date) || new Date();
  const result = new Date(dateObj);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Get start of day (00:00:00)
 */
export function startOfDay(date: Date | string | number): Date {
  const dateObj = toDate(date) || new Date();
  const result = new Date(dateObj);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day (23:59:59)
 */
export function endOfDay(date: Date | string | number): Date {
  const dateObj = toDate(date) || new Date();
  const result = new Date(dateObj);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get difference between two dates in milliseconds
 */
export function getDiffInMs(date1: Date | string | number, date2: Date | string | number): number {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  if (!d1 || !d2) return 0;
  return Math.abs(d1.getTime() - d2.getTime());
}

/**
 * Get difference between two dates in days
 */
export function getDiffInDays(date1: Date | string | number, date2: Date | string | number): number {
  const diffMs = getDiffInMs(date1, date2);
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * Format time (HH:MM in 24-hour format)
 */
export function formatTime24(hours: number, minutes: number): string {
  const h = hours.toString().padStart(2, '0');
  const m = minutes.toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Parse time string (HH:MM) to {hours, minutes}
 */
export function parseTime(timeString: string): { hours: number; minutes: number } | null {
  const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
}

/**
 * Combine date and time strings into Date object
 */
export function combineDateAndTime(dateString: string, timeString: string): Date | null {
  try {
    const date = parseDate(dateString);
    const time = parseTime(timeString);

    if (!date || !time) return null;

    const result = new Date(date);
    result.setHours(time.hours, time.minutes, 0, 0);
    return result;
  } catch (error) {
    console.error('[dateUtils] Combine error:', error);
    return null;
  }
}

/**
 * Validate if date is valid Date object
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Convert various date inputs to Date object
 */
export function toDate(date: Date | string | number | null | undefined): Date | null {
  if (date === null || date === undefined) return null;
  if (isValidDate(date)) return date;
  if (typeof date === 'string') return parseDate(date);
  if (typeof date === 'number') return new Date(date);
  return null;
}

/**
 * Get current date in ISO format (YYYY-MM-DD)
 */
export function getCurrentDateISO(): string {
  return formatDate(new Date(), 'iso');
}

/**
 * Get current time in 24-hour format (HH:MM)
 */
export function getCurrentTime24(): string {
  const now = new Date();
  return formatTime24(now.getHours(), now.getMinutes());
}

/**
 * Check if date is within range
 */
export function isDateInRange(
  date: Date | string | number,
  start: Date | string | number,
  end: Date | string | number
): boolean {
  const d = toDate(date);
  const s = toDate(start);
  const e = toDate(end);

  if (!d || !s || !e) return false;

  const time = d.getTime();
  return time >= s.getTime() && time <= e.getTime();
}
