/**
 * Utility functions for validating, normalizing, and formatting event and service times.
 * Handles 12-hour AM/PM, 24-hour formats, and time ranges safely while gracefully
 * rejecting corrupted or invalid inputs such as '1:ABC'.
 */

export interface ParsedTime {
  hours: number; // 0-23
  minutes: number; // 0-59
  formatted12: string; // e.g. "8:00 AM", "1:00 PM"
  formatted24: string; // e.g. "08:00", "13:00"
}

/**
 * Validates and parses a single time string.
 * Supports:
 * - "8:00 AM", "08:00 AM", "8:00am", "8:00 PM", "12:30 PM", "1:00 PM"
 * - "8 AM", "8pm", "12 PM"
 * - "08:00", "13:00", "14:30", "23:59", "00:00"
 * Returns null if the string is invalid, contains letters other than AM/PM (like "1:ABC"),
 * or has out-of-range hours/minutes.
 */
export function parseValidTime(timeStr?: string | null): ParsedTime | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const trimmed = timeStr.trim();
  if (!trimmed) return null;

  // Reject strings containing letters other than A, M, P (e.g. "1:ABC", "test")
  if (/[^0-9:\s.ampAMP]/.test(trimmed)) {
    return null;
  }

  // Pattern 1: HH:MM with optional seconds and optional AM/PM
  // Examples: "8:00 AM", "14:30", "08:00pm", "1:05", "12:00:00 PM"
  const standardMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap]\.?m\.?)?$/i);
  if (standardMatch) {
    let hours = parseInt(standardMatch[1], 10);
    const minutes = parseInt(standardMatch[2], 10);
    const meridiem = standardMatch[3]?.toLowerCase().replace(/\./g, '');

    if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) {
      return null;
    }

    if (meridiem) {
      // In 12-hour format with AM/PM, hour must be between 1 and 12
      if (hours < 1 || hours > 12) return null;
      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;
    } else {
      // 24-hour format (or simple numeric hour)
      if (hours < 0 || hours > 23) return null;
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const formatted12 = `${displayHours}:${displayMinutes} ${period}`;
    const formatted24 = `${hours.toString().padStart(2, '0')}:${displayMinutes}`;

    return { hours, minutes, formatted12, formatted24 };
  }

  // Pattern 2: Hour only with AM/PM (e.g. "8 AM", "8pm", "12 PM")
  const hourOnlyMatch = trimmed.match(/^(\d{1,2})\s*([ap]\.?m\.?)?$/i);
  if (hourOnlyMatch && hourOnlyMatch[2]) {
    let hours = parseInt(hourOnlyMatch[1], 10);
    const meridiem = hourOnlyMatch[2].toLowerCase().replace(/\./g, '');
    if (isNaN(hours) || hours < 1 || hours > 12) return null;
    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const formatted12 = `${displayHours}:00 ${period}`;
    const formatted24 = `${hours.toString().padStart(2, '0')}:00`;

    return { hours, minutes: 0, formatted12, formatted24 };
  }

  return null;
}

/**
 * Checks whether a given string is a valid time format.
 */
export function isValidTime(timeStr?: string | null): boolean {
  if (!timeStr || !timeStr.trim()) return false;
  const trimmed = timeStr.trim();

  // Support range validation
  const rangeParts = trimmed.split(/[-–—]|\bto\b/i).map(s => s.trim());
  if (rangeParts.length === 2 && rangeParts[0] && rangeParts[1]) {
    return parseValidTime(rangeParts[0]) !== null && parseValidTime(rangeParts[1]) !== null;
  }

  return parseValidTime(trimmed) !== null;
}

/**
 * Parses and formats a display time string.
 * Handles single times ("8:00 AM", "13:00") and time ranges ("4:00 PM – 6:00 PM").
 * If the input is invalid (e.g. "1:ABC" or corrupted text), returns null so
 * the UI can handle it gracefully instead of rendering broken characters.
 */
export function formatDisplayTime(timeStr?: string | null): string | null {
  if (!timeStr || !timeStr.trim()) return null;
  const trimmed = timeStr.trim();

  // Range support (e.g. "4:00 PM - 6:00 PM", "4:00 PM – 6:00 PM", "9:00 AM to 11:00 AM")
  const rangeParts = trimmed.split(/[-–—]|\bto\b/i).map(s => s.trim());
  if (rangeParts.length === 2 && rangeParts[0] && rangeParts[1]) {
    const start = parseValidTime(rangeParts[0]);
    const end = parseValidTime(rangeParts[1]);
    if (start && end) {
      return `${start.formatted12} – ${end.formatted12}`;
    }
    if (start) return start.formatted12;
    return null;
  }

  const parsed = parseValidTime(trimmed);
  return parsed ? parsed.formatted12 : null;
}

/**
 * Common, convenient church worship & rehearsal time suggestions
 */
export const DEFAULT_TIME_SUGGESTIONS: string[] = [
  '7:00 AM',
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '10:30 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM'
];

/**
 * Compares two time strings chronologically.
 * Returns:
 *   negative number if timeA is earlier than timeB
 *   0 if timeA and timeB are identical
 *   positive number if timeA is later than timeB
 * Returns null if either time string cannot be parsed.
 */
export function compareTimes(timeA?: string | null, timeB?: string | null): number | null {
  const parsedA = parseValidTime(timeA);
  const parsedB = parseValidTime(timeB);
  if (!parsedA || !parsedB) return null;

  const minutesA = parsedA.hours * 60 + parsedA.minutes;
  const minutesB = parsedB.hours * 60 + parsedB.minutes;
  return minutesA - minutesB;
}

/**
 * Validates that an event end time is strictly after the start time.
 */
export function isEndTimeAfterStartTime(startTime?: string | null, endTime?: string | null): boolean {
  const diff = compareTimes(startTime, endTime);
  if (diff === null) return true;
  return diff < 0;
}
