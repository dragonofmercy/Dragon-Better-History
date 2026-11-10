import { ref } from 'vue'
import { densityLevels } from '@/lib/dayStats'
import { resolveVisitTimes } from '@/composables/useHistory'

type Levels = Map<number, 1 | 2 | 3>

export function useMonthDensity() {
  const levels = ref<Levels>(new Map())
  // Past months only change on deletion, wherever it comes from (this page, another tab, Chrome's own clear dialog).
  // The current month keeps growing, so it is never cached.
  const cache = new Map<string, Levels>()
  chrome.history.onVisitRemoved.addListener(() => cache.clear())
  let request = 0

  async function load(year: number, month: number): Promise<void> {
    const id = ++request
    const key = `${year}-${month}`
    const cached = cache.get(key)
    if (cached) { levels.value = cached; return }
    const start = new Date(year, month, 1).getTime()
    const end = new Date(year, month + 1, 1).getTime()
    const items = await chrome.history.search({ text: '', startTime: start, endTime: end, maxResults: 0 })
    const resolved = await resolveVisitTimes(items, start, end - 1)
    const result = densityLevels(resolved.filter((i) => i.lastVisitTime! >= start && i.lastVisitTime! < end))
    if (end <= Date.now()) cache.set(key, result)
    if (id === request) levels.value = result
  }

  return { levels, load }
}
