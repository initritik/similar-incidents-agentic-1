/**
 * Utility functions for handling date/time conversions from backend ISO strings.
 */

/**
 * Parse an ISO datetime string or return null if invalid.
 * Handles both UTC and timezone-aware ISO strings.
 */
export function parseISO(isoString: string | null | undefined): Date | null {
  if (!isoString) return null;
  try {
    const date = new Date(isoString);
    // Validate that the date is valid
    if (Number.isNaN(date.getTime())) {
      console.warn(`Invalid ISO date string: ${isoString}`);
      return null;
    }
    return date;
  } catch (e) {
    console.warn(`Failed to parse ISO date: ${isoString}`, e);
    return null;
  }
}

/**
 * Format an ISO date string to a human-readable time string.
 * Example: "12:30:45"
 */
export function formatTime(
  isoString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = parseISO(isoString);
  if (!date) return "—";

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    ...options,
  });
}

/**
 * Format an ISO date string to a human-readable date string.
 * Example: "May 1, 2026"
 */
export function formatDate(
  isoString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = parseISO(isoString);
  if (!date) return "—";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

/**
 * Format an ISO date string to a full datetime string.
 * Example: "May 1, 2026 at 12:30:45"
 */
export function formatDateTime(
  isoString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = parseISO(isoString);
  if (!date) return "—";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    ...options,
  });
}

/**
 * Get the duration between two ISO date strings in milliseconds.
 */
export function getDuration(
  startISO: string | null | undefined,
  endISO: string | null | undefined,
): number | null {
  const start = parseISO(startISO);
  const end = parseISO(endISO);

  if (!start || !end) return null;
  return end.getTime() - start.getTime();
}

/**
 * Format a duration in milliseconds to a human-readable string.
 * Example: "2 minutes 30 seconds"
 */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || ms < 0) return "—";

  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  if (seconds > 0 || parts.length === 0)
    parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);

  return parts.join(" ");
}
