import { ref } from 'vue'
import { startOfDay, endOfDay } from '@/lib/dates'
import type { GroupMode } from '@/composables/useOptions'

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
  // Accept a pasted url: drop the scheme, a leading www. and anything after the host (port, path, query).
  const site = m[1].toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/^www\./, '').replace(/[/:?#].*$/, '')
  return { text: `${query.replace(m[0], ' ')} ${site}`.replace(/\s+/g, ' ').trim(), site }
}

export function matchesSite(url: string, site: string): boolean {
  const d = domainOf(url)
  return d === site || d.endsWith(`.${site}`)
}

// mode 'none' yields an empty key, so every entry stays single.
export function groupRuns(entries: HistoryEntry[], mode: GroupMode = 'title'): DisplayItem[] {
  const groupKey = (e: HistoryEntry): string => (mode === 'none' ? '' : mode === 'domain' ? domainOf(e.url) : e.title)
  const items: DisplayItem[] = []
  let i = 0
  while (i < entries.length) {
    const key = groupKey(entries[i])
    let j = i + 1
    while (key && j < entries.length && groupKey(entries[j]) === key) j++
    const run = entries.slice(i, j)
    // Key the run on its oldest entry (ties broken by key) so it survives a sort order change.
    if (run.length >= 2) items.push({ type: 'run', key: run.reduce((a, b) => ((b.lastVisitTime - a.lastVisitTime || (b.key < a.key ? -1 : 1)) < 0 ? b : a)).key, entries: run })
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

export function groupByDay(items: chrome.history.HistoryItem[], start?: Date, end?: Date): DayGroup[] {
  const map = new Map<number, DayGroup>()
  for (const it of items) {
    if (it.lastVisitTime == null) continue
    const d = new Date(it.lastVisitTime)
    if ((start && d < start) || (end && d > end)) continue
    const midnight = startOfDay(d)
    const key = midnight.getTime()
    let group = map.get(key)
    if (!group) { group = { dayKey: key, date: midnight, entries: [] }; map.set(key, group) }
    group.entries.push({ key: entryKey(it), url: it.url ?? '', title: it.title || (it.url ?? ''), lastVisitTime: it.lastVisitTime })
  }
  // Chrome does not guarantee chronological order (search results especially); orderDays and groupByHour rely on it.
  for (const g of map.values()) g.entries.sort((a, b) => b.lastVisitTime - a.lastVisitTime)
  return [...map.values()].sort((a, b) => b.dayKey - a.dayKey)
}

// HistoryItem.lastVisitTime is the URL's latest visit overall, not the one inside the queried range.
// For URLs revisited after `end`, look up the latest visit inside [start, end]; 0 (filtered out by callers) when there is none.
// ponytail: one getVisits call per revisited URL; batch or cache if a month of heavy history gets slow.
export async function resolveVisitTimes(items: chrome.history.HistoryItem[], start: number, end: number): Promise<chrome.history.HistoryItem[]> {
  return Promise.all(items.map(async (it) => {
    if (it.lastVisitTime == null || it.lastVisitTime <= end || !it.url) return it
    const visits = await chrome.history.getVisits({ url: it.url }).catch(() => [])
    const lastVisitTime = visits.reduce((best, v) => { const t = v.visitTime ?? 0; return t >= start && t <= end && t > best ? t : best }, 0)
    return { ...it, lastVisitTime }
  }))
}

export function useHistory() {
  const days = ref<DayGroup[]>([])
  const searching = ref(false)
  // Only the latest getDay/search may write `days`: a slow earlier query must not overwrite a newer one.
  let request = 0

  // `searching` flips together with `days`, so the heading never describes a view that is not on screen yet.
  function show(id: number, groups: DayGroup[], isSearch: boolean): boolean {
    if (id !== request) return false
    days.value = groups
    searching.value = isSearch
    return true
  }

  async function getDay(day: Date): Promise<void> {
    const start = startOfDay(day)
    const end = endOfDay(day)
    if (start.getTime() > Date.now()) return
    const id = ++request
    const results = await chrome.history.search({ text: '', startTime: start.getTime(), endTime: end.getTime(), maxResults: 0 })
    const resolved = await resolveVisitTimes(results, start.getTime(), end.getTime())
    show(id, groupByDay(resolved, start, end), false)
  }

  // The `max` most recently visited urls, whatever the day.
  async function getRecent(max: number): Promise<void> {
    const id = ++request
    const results = await chrome.history.search({ text: '', startTime: 0, maxResults: max })
    show(id, groupByDay(results), false)
  }

  // Resolves to false when a newer request superseded this one.
  async function search(query: string, today: Date, max = 0): Promise<boolean> {
    const start = new Date(1970, 0, 1)
    const end = endOfDay(today)
    const id = ++request
    const { text, site } = parseQuery(query)
    // With a site filter the cap has to apply after the client-side filtering, so fetch everything.
    const results = await chrome.history.search({ text, startTime: start.getTime(), endTime: end.getTime(), maxResults: site ? 0 : max })
    let hits = results
    if (site) {
      hits = results.filter((r) => matchesSite(r.url ?? '', site)).sort((a, b) => (b.lastVisitTime ?? 0) - (a.lastVisitTime ?? 0))
      if (max) hits = hits.slice(0, max)
    }
    return show(id, groupByDay(hits, start, end), true)
  }

  // Never rejects: a failed deleteUrl (e.g. deletion disabled by policy) leaves its entry listed, the others are removed.
  // Returns the number of urls that could not be deleted.
  async function remove(urls: string[]): Promise<number> {
    const unique = [...new Set(urls)]
    const results = await Promise.allSettled(unique.map((url) => chrome.history.deleteUrl({ url })))
    const gone = new Set(unique.filter((_, i) => results[i].status === 'fulfilled'))
    days.value = days.value
      .map((g) => { const entries = g.entries.filter((e) => !gone.has(e.url)); return entries.length === g.entries.length ? g : { ...g, entries } })
      .filter((g) => g.entries.length > 0)
    return unique.length - gone.size
  }

  return { days, searching, getDay, getRecent, search, remove }
}
