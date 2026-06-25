import { ref } from 'vue'
import { historySearch, historyDeleteUrl } from '@/lib/chrome'
import { startOfDay, endOfDay } from '@/lib/dates'

export interface HistoryEntry {
  key: string
  url: string
  title: string
  lastVisitTime: number
}

export interface DayGroup {
  dayKey: string
  date: Date
  entries: HistoryEntry[]
}

export function entryKey(item: { url?: string; lastVisitTime?: number }): string {
  return `${item.url}::${item.lastVisitTime}`
}

export function groupByDay(items: chrome.history.HistoryItem[], start: Date, end: Date): DayGroup[] {
  const map = new Map<string, DayGroup>()
  for (const it of items) {
    if (it.lastVisitTime == null) continue
    const d = new Date(it.lastVisitTime)
    if (d < start || d > end) continue
    const midnight = startOfDay(d)
    const key = midnight.getTime().toString()
    let group = map.get(key)
    if (!group) { group = { dayKey: key, date: midnight, entries: [] }; map.set(key, group) }
    group.entries.push({ key: entryKey(it), url: it.url ?? '', title: it.title || (it.url ?? ''), lastVisitTime: it.lastVisitTime })
  }
  return [...map.values()].sort((a, b) => Number(b.dayKey) - Number(a.dayKey))
}

export function useHistory() {
  const days = ref<DayGroup[]>([])
  const loading = ref(false)
  const searching = ref(false)

  async function getDay(day: Date, max = 0): Promise<void> {
    const start = startOfDay(day)
    const end = endOfDay(day)
    if (start.getTime() > Date.now()) return
    loading.value = true
    searching.value = false
    const results = await historySearch({ text: '', startTime: start.getTime(), endTime: end.getTime(), maxResults: max })
    days.value = groupByDay(results, start, end)
    loading.value = false
  }

  async function search(query: string, today: Date, max = 0): Promise<void> {
    const start = new Date(1970, 0, 1)
    const end = endOfDay(today)
    loading.value = true
    searching.value = true
    const results = await historySearch({ text: query, startTime: start.getTime(), endTime: end.getTime(), maxResults: max })
    days.value = groupByDay(results, start, end)
    loading.value = false
  }

  async function remove(url: string): Promise<void> {
    await historyDeleteUrl({ url })
    days.value = days.value
      .map((g) => ({ ...g, entries: g.entries.filter((e) => e.url !== url) }))
      .filter((g) => g.entries.length > 0)
  }

  return { days, loading, searching, getDay, search, remove }
}
