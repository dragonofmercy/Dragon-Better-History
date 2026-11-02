import { describe, it, expect } from 'vitest'
import { groupByHour, siteCounts, hourHistogram, densityLevels } from '@/lib/dayStats'
import type { HistoryEntry } from '@/composables/useHistory'

const at = (y: number, m: number, d: number, h: number, url = 'https://a.com/'): HistoryEntry => ({
  key: `${url}${h}`, url, title: url, lastVisitTime: new Date(y, m, d, h, 5).getTime(),
})

describe('dayStats', () => {
  it('groupByHour keeps consecutive same-hour entries together', () => {
    const blocks = groupByHour([at(2024, 4, 9, 16), at(2024, 4, 9, 15), at(2024, 4, 9, 16)])
    expect(blocks.map((b) => b.hour)).toEqual([16, 15, 16])
    expect(blocks.map((b) => b.entries.length)).toEqual([1, 1, 1])
  })

  it('siteCounts skips empty hosts, strips www, honors limit', () => {
    const e = [at(2024, 4, 9, 1, 'https://www.a.com/x'), at(2024, 4, 9, 2, 'https://a.com/y'), at(2024, 4, 9, 3, 'https://b.com/'), at(2024, 4, 9, 4, 'chrome://settings')]
    expect(siteCounts(e)).toEqual([{ domain: 'a.com', count: 2, url: 'https://www.a.com/x' }, { domain: 'b.com', count: 1, url: 'https://b.com/' }])
    expect(siteCounts(e, 1)).toHaveLength(1)
  })

  it('hourHistogram has 24 buckets', () => {
    const h = hourHistogram([at(2024, 4, 9, 3), at(2024, 4, 9, 3), at(2024, 4, 9, 20)])
    expect(h).toHaveLength(24)
    expect(h[3]).toBe(2)
    expect(h[20]).toBe(1)
  })

  it('densityLevels maps counts to 1..3 and ignores missing times', () => {
    const items = [at(2024, 4, 1, 1), at(2024, 4, 2, 1), at(2024, 4, 2, 2), at(2024, 4, 3, 1), at(2024, 4, 3, 2), at(2024, 4, 3, 3), {}]
    const m = densityLevels(items)
    expect([...m.values()]).toEqual([1, 2, 3])
    expect(m.size).toBe(3)
  })
})
