import { ServiceLineup } from '../types';

export interface ServiceTimeRange {
  startDate: Date;
  endDate: Date;
}

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  isOngoing: boolean;
}

/**
 * Parses time string like "9:00 AM", "9:00 AM - 11:00 AM", "09:00", "14:30"
 */
function parseTimeString(timeStr?: string): { startH: number; startM: number; endH: number; endM: number } {
  if (!timeStr || !timeStr.trim()) {
    return { startH: 9, startM: 0, endH: 11, endM: 0 };
  }

  const parts = timeStr.split(/[-–—]|to/i).map(s => s.trim());

  function parseSingleTime(str: string): { h: number; m: number } {
    const match = str.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i);
    if (!match) return { h: 9, m: 0 };
    let h = parseInt(match[1], 10);
    const m = match[2] ? parseInt(match[2], 10) : 0;
    const ampm = match[3] ? match[3].toLowerCase() : null;

    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    return { h: Math.min(23, Math.max(0, h)), m: Math.min(59, Math.max(0, m)) };
  }

  const start = parseSingleTime(parts[0]);
  let end: { h: number; m: number };

  if (parts.length > 1 && parts[1]) {
    end = parseSingleTime(parts[1]);
  } else {
    // Default church service duration is 2 hours
    end = { h: (start.h + 2) % 24, m: start.m };
  }

  return { startH: start.h, startM: start.m, endH: end.h, endM: end.m };
}

/**
 * Computes exact start and end dates from service_date and service_time
 */
export function parseServiceDateTime(dateStr?: string, timeStr?: string): ServiceTimeRange {
  let year = 2026;
  let month = 11; // 1-based
  let day = 29;

  if (dateStr) {
    const dParts = dateStr.split('-');
    if (dParts.length === 3) {
      year = parseInt(dParts[0], 10) || year;
      month = parseInt(dParts[1], 10) || month;
      day = parseInt(dParts[2], 10) || day;
    }
  }

  const { startH, startM, endH, endM } = parseTimeString(timeStr);

  const startDate = new Date(year, month - 1, day, startH, startM, 0, 0);
  const endDate = new Date(year, month - 1, day, endH, endM, 0, 0);

  // If end time is earlier in the day than start time, service spans midnight
  if (endDate.getTime() <= startDate.getTime()) {
    endDate.setDate(endDate.getDate() + 1);
  }

  return { startDate, endDate };
}

export type ComputedLineupStatus = 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

/**
 * Calculates current status of a lineup based on schedule & publication status
 */
export function getLineupLifecycleStatus(lineup: ServiceLineup, now = new Date()): ComputedLineupStatus {
  if (lineup.status === 'draft') return 'draft';
  if (lineup.status === 'cancelled') return 'cancelled';
  if (lineup.status === 'completed') return 'completed';

  const { startDate, endDate } = parseServiceDateTime(lineup.service_date, lineup.service_time);
  const nowMs = now.getTime();
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  if (nowMs < startMs) {
    return 'upcoming';
  } else if (nowMs >= startMs && nowMs < endMs) {
    return 'ongoing';
  } else {
    return 'completed';
  }
}

/**
 * Calculates live countdown to the service start time (or to end time if ongoing)
 */
export function calculateServiceCountdown(lineup: ServiceLineup, now = new Date()): CountdownResult {
  const { startDate, endDate } = parseServiceDateTime(lineup.service_date, lineup.service_time);
  const nowMs = now.getTime();
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  const isOngoing = nowMs >= startMs && nowMs < endMs;
  const isExpired = nowMs >= endMs;

  let targetMs = startMs;
  if (isOngoing) {
    targetMs = endMs; // Time remaining in service
  }

  const diffMs = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired,
    isOngoing
  };
}

/**
 * Retrieves all published upcoming services in strict chronological order.
 * Nearest upcoming (or currently ongoing) service is at index [0].
 */
export function getSortedUpcomingLineups(lineups: ServiceLineup[], now = new Date()): ServiceLineup[] {
  const eligible = lineups.filter(lineup => {
    if (lineup.status === 'draft' || lineup.status === 'cancelled' || lineup.status === 'completed') {
      return false;
    }
    const { endDate } = parseServiceDateTime(lineup.service_date, lineup.service_time);
    return now.getTime() < endDate.getTime();
  });

  return eligible.sort((a, b) => {
    const aTimes = parseServiceDateTime(a.service_date, a.service_time);
    const bTimes = parseServiceDateTime(b.service_date, b.service_time);

    const aOngoing = now.getTime() >= aTimes.startDate.getTime() && now.getTime() < aTimes.endDate.getTime();
    const bOngoing = now.getTime() >= bTimes.startDate.getTime() && now.getTime() < bTimes.endDate.getTime();

    // Ongoing services take top priority
    if (aOngoing && !bOngoing) return -1;
    if (!aOngoing && bOngoing) return 1;

    // Otherwise, nearest start time first
    return aTimes.startDate.getTime() - bTimes.startDate.getTime();
  });
}

/**
 * Retrieves all completed services for Service History (reverse chronological order)
 */
export function getCompletedServiceHistory(lineups: ServiceLineup[], now = new Date()): ServiceLineup[] {
  const completed = lineups.filter(lineup => {
    if (lineup.status === 'draft' || lineup.status === 'cancelled') {
      return false;
    }
    if (lineup.status === 'completed') {
      return true;
    }
    const { endDate } = parseServiceDateTime(lineup.service_date, lineup.service_time);
    return now.getTime() >= endDate.getTime();
  });

  return completed.sort((a, b) => {
    const aTimes = parseServiceDateTime(a.service_date, a.service_time);
    const bTimes = parseServiceDateTime(b.service_date, b.service_time);
    return bTimes.startDate.getTime() - aTimes.startDate.getTime(); // Newest completed first
  });
}
