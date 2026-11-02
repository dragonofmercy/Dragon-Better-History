import { domainOf, type HistoryEntry } from '@/composables/useHistory'
import { startOfDay } from '@/lib/dates'

export interface HourBlock { hour: number; entries: HistoryEntry[] }
export interface SiteCount { domain: string; count: number; url: string }

export function groupByHour(entries: HistoryEntry[]): HourBlock[] {
  const blocks: HourBlock[] = []
  for (const e of entries) {
    const hour = new Date(e.lastVisitTime).getHours()
    const last = blocks[blocks.length - 1]
    if (last && last.hour === hour) last.entries.push(e)
    else blocks.push({ hour, entries: [e] })
  }
  return blocks
}

export function siteCounts(entries: HistoryEntry[], limit = 6): SiteCount[] {
  const map = new Map<string, SiteCount>()
  for (const e of entries) {
    const domain = /^https?:/.test(e.url) ? domainOf(e.url) : ''
    if (!domain) continue
    const s = map.get(domain)
    if (s) s.count++
    else map.set(domain, { domain, count: 1, url: e.url })
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain)).slice(0, limit)
}

export function hourHistogram(entries: HistoryEntry[]): number[] {
  const h = new Array<number>(24).fill(0)
  for (const e of entries) h[new Date(e.lastVisitTime).getHours()]++
  return h
}

export function densityLevels(items: { lastVisitTime?: number }[]): Map<number, 1 | 2 | 3> {
  const counts = new Map<number, number>()
  for (const i of items) {
    if (i.lastVisitTime === undefined) continue
    const k = startOfDay(new Date(i.lastVisitTime)).getTime()
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  const max = Math.max(0, ...counts.values())
  const out = new Map<number, 1 | 2 | 3>()
  for (const [k, n] of counts) out.set(k, n / max <= 1 / 3 ? 1 : n / max <= 2 / 3 ? 2 : 3)
  return out
}
