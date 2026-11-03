import { ref } from 'vue'
import { startOfDay, endOfDay } from '@/lib/dates'

export interface HistoryEntry {
  key: string
  url: string
  title: string
  lastVisitTime: number
}

export interface DayGroup {
  dayKey: number
  date: Date
  entries: HistoryEntry[]
}

export type DisplayItem =
  | { type: 'single'; entry: HistoryEntry }
  | { type: 'run'; key: string; entries: HistoryEntry[] }

export function domainOf(url: string): string {
  if (!/^https?:/.test(url)) return ''
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' }
}

// Splits a "site:example.com" operator out of a search query; the domain stays in the text so Chrome narrows the results.
export function parseQuery(query: string): { text: string; site: string } {
  const m = /(?:^|\s)site:(\S+)/i.exec(query)
  if (!m) return { text: query, site: '' }
  const site = m[1].toLowerCase().replace(/^www\./, '')
  return { text: `${query.replace(m[0], ' ')} ${site}`.replace(/\s+/g, ' ').trim(), site }
}

export function matchesSite(url: string, site: string): boolean {
  const d = domainOf(url)
  return d === site || d.endsWith(`.${site}`)
}

export function groupRuns(entries: HistoryEntry[], mode: 'title' | 'domain' = 'title'): DisplayItem[] {
  const groupKey = (e: HistoryEntry): string => (mode === 'domain' ? domainOf(e.url) : e.title)
  const items: DisplayItem[] = []
  let i = 0
  while (i < entries.length) {
    const key = groupKey(entries[i])
    let j = i + 1
    while (key && j < entries.length && groupKey(entries[j]) === key) j++
    const run = entries.slice(i, j)
    if (run.length >= 2) items.push({ type: 'run', key: run[0].key, entries: run })
    else items.push({ type: 'single', entry: run[0] })
    i = j
  }
  return items
}

export function orderDays(days: DayGroup[], oldestFirst: boolean): DayGroup[] {
  if (!oldestFirst) return days
  return days.map((g) => ({ ...g, entries: [...g.entries].reverse() })).reverse()
}

export function entryKey(item: { url?: string; lastVisitTime?: number }): string {
  return `${item.url}::${item.lastVisitTime}`
}

export function groupByDay(items: chrome.history.HistoryItem[], start: Date, end: Date): DayGroup[] {
  const map = new Map<number, DayGroup>()
  for (const it of items) {
    if (it.lastVisitTime == null) continue
    const d = new Date(it.lastVisitTime)
    if (d < start || d > end) continue
    const midnight = startOfDay(d)
    const key = midnight.getTime()
    let group = map.get(key)
    if (!group) { group = { dayKey: key, date: midnight, entries: [] }; map.set(key, group) }
    group.entries.push({ key: entryKey(it), url: it.url ?? '', title: it.title || (it.url ?? ''), lastVisitTime: it.lastVisitTime })
  }
  return [...map.values()].sort((a, b) => b.dayKey - a.dayKey)
}

export function useHistory() {
  const days = ref<DayGroup[]>([])
  const searching = ref(false)

  async function getDay(day: Date, max = 0): Promise<void> {
    const start = startOfDay(day)
    const end = endOfDay(day)
    if (start.getTime() > Date.now()) return
    searching.value = false
    const results = await chrome.history.search({ text: '', startTime: start.getTime(), endTime: end.getTime(), maxResults: max })
    days.value = groupByDay(results, start, end)
  }

  async function search(query: string, today: Date, max = 0): Promise<void> {
    const start = new Date(1970, 0, 1)
    const end = endOfDay(today)
    searching.value = true
    const { text, site } = parseQuery(query)
    const results = await chrome.history.search({ text, startTime: start.getTime(), endTime: end.getTime(), maxResults: max })
    days.value = groupByDay(site ? results.filter((r) => matchesSite(r.url ?? '', site)) : results, start, end)
  }

  async function remove(url: string): Promise<void> {
    await chrome.history.deleteUrl({ url })
    days.value = days.value
      .map((g) => ({ ...g, entries: g.entries.filter((e) => e.url !== url) }))
      .filter((g) => g.entries.length > 0)
  }

  return { days, searching, getDay, search, remove }
}
