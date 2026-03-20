/**
 * Get today's date in local YYYY-MM-DD format
 * Accounts for timezone difference - returns local calendar date, not UTC
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse a YYYY-MM-DD string into a local Date object set to midnight local time
 */
export function parseLocalDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

/**
 * Format a Date object as a readable string (e.g., "Mar 21")
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get start and end of day in UTC for database queries
 * Returns { startUTC, endUTC } for a given local date string
 */
export function getDayBoundariesUTC(localDateString: string): {
  startUTC: Date
  endUTC: Date
} {
  const localDate = parseLocalDateString(localDateString)
  // Convert local midnight to UTC
  const offsetMs = new Date(
    localDateString + 'T00:00:00'
  ).getTimezoneOffset() * 60000

  const startUTC = new Date(localDate.getTime() + offsetMs)
  const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000)

  return { startUTC, endUTC }
}
