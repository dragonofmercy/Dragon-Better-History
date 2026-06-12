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
  return new Intl.DateTimeFormat(normalizeLocale(locale), { hour: '2-digit', minute: '2-digit', hour12: !use24 }).format(d)
}

export function formatDayHeading(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(normalizeLocale(locale), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(d)
}
