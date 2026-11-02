import { ref } from 'vue'
import { densityLevels } from '@/lib/dayStats'

export function useMonthDensity() {
  const levels = ref(new Map<number, 1 | 2 | 3>())
  let request = 0

  async function load(year: number, month: number): Promise<void> {
    const id = ++request
    const items = await chrome.history.search({ text: '', startTime: new Date(year, month, 1).getTime(), endTime: new Date(year, month + 1, 1).getTime(), maxResults: 0 })
    if (id === request) levels.value = densityLevels(items)
  }

  return { levels, load }
}
