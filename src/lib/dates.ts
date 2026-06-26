export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

export function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

export function normalizeLocale(locale: string): string {
  return locale.replace('_', '-')
}

export function formatTime(d: Date, locale: string, use24: boolean): string {
  // Some engines/locales drop the leading zero on the hour even with hour: '2-digit'
  // (e.g. Chrome ICU in 24h French renders "9:05"). Pad the hour part ourselves so
  // times keep a constant width and line up in a monospace column.
  const parts = new Intl.DateTimeFormat(normalizeLocale(locale), { hour: '2-digit', minute: '2-digit', hour12: !use24 }).formatToParts(d)
  return parts.map((p) => (p.type === 'hour' ? p.value.padStart(2, '0') : p.value)).join('')
}

export function formatDayHeading(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(normalizeLocale(locale), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(d)
}
