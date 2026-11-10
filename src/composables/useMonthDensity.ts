import { ref } from 'vue'
import { densityLevels } from '@/lib/dayStats'
import { resolveVisitTimes } from '@/composables/useHistory'

export function useMonthDensity() {
  const levels = ref(new Map<number, 1 | 2 | 3>())
  let request = 0

  async function load(year: number, month: number): Promise<void> {
    const id = ++request
    const start = new Date(year, month, 1).getTime()
    const end = new Date(year, month + 1, 1).getTime()
    const items = await chrome.history.search({ text: '', startTime: start, endTime: end, maxResults: 0 })
    const resolved = await resolveVisitTimes(items, start, end - 1)
    if (id === request) levels.value = densityLevels(resolved.filter((i) => i.lastVisitTime !== undefined && i.lastVisitTime >= start && i.lastVisitTime < end))
  }

  return { levels, load }
}
