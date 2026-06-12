import { describe, it, expect, vi } from 'vitest'
import { groupByDay, entryKey, useHistory } from '@/composables/useHistory'

function item(url: string, time: number, title = ''): chrome.history.HistoryItem {
  return { id: url, url, title, lastVisitTime: time } as chrome.history.HistoryItem
}

describe('groupByDay', () => {
  it('groups entries by midnight and sorts days descending', () => {
    const d1 = new Date(2024, 0, 1, 10, 0).getTime()
    const d2 = new Date(2024, 0, 2, 12, 0).getTime()
    const groups = groupByDay(
      [item('https://a', d1), item('https://b', d2), item('https://c', d1)],
      new Date(2024, 0, 1, 0, 0, 0),
      new Date(2024, 0, 2, 23, 59, 59)
    )
    expect(groups.length).toBe(2)
    expect(Number(groups[0].dayKey)).toBeGreaterThan(Number(groups[1].dayKey))
    const jan1 = groups.find((g) => g.date.getDate() === 1)
    expect(jan1?.entries.length).toBe(2)
  })

  it('drops entries outside the range', () => {
    const inRange = new Date(2024, 0, 2, 12, 0).getTime()
    const outRange = new Date(2024, 0, 5, 12, 0).getTime()
    const groups = groupByDay(
      [item('https://a', inRange), item('https://b', outRange)],
      new Date(2024, 0, 2, 0, 0, 0),
      new Date(2024, 0, 2, 23, 59, 59)
    )
    expect(groups.length).toBe(1)
    expect(groups[0].entries.length).toBe(1)
  })

  it('entryKey is unique per url and visit time', () => {
    expect(entryKey(item('https://a', 1))).not.toBe(entryKey(item('https://a', 2)))
  })

  it('falls back to url when title is empty', () => {
    const groups = groupByDay([item('https://a', new Date(2024, 0, 2, 12, 0).getTime(), '')], new Date(2024, 0, 2), new Date(2024, 0, 2, 23, 59, 59))
    expect(groups[0].entries[0].title).toBe('https://a')
  })
})

describe('useHistory', () => {
  it('remove filters the deleted url from all day groups', async () => {
    const t = new Date(2024, 0, 2, 12, 0).getTime()
    vi.spyOn(chrome.history, 'search').mockResolvedValue([item('https://a', t, 'A'), item('https://b', t, 'B')] as never)
    vi.spyOn(chrome.history, 'deleteUrl').mockResolvedValue()
    const h = useHistory()
    await h.getDay(new Date(2024, 0, 2))
    expect(h.days.value[0].entries.length).toBe(2)
    await h.remove('https://a')
    expect(h.days.value[0].entries.length).toBe(1)
    expect(h.days.value[0].entries[0].url).toBe('https://b')
  })

  it('drops the day group when its last entry is removed', async () => {
    const t = new Date(2024, 0, 2, 12, 0).getTime()
    vi.spyOn(chrome.history, 'search').mockResolvedValue([item('https://a', t, 'A')] as never)
    vi.spyOn(chrome.history, 'deleteUrl').mockResolvedValue()
    const h = useHistory()
    await h.getDay(new Date(2024, 0, 2))
    expect(h.days.value.length).toBe(1)
    await h.remove('https://a')
    expect(h.days.value.length).toBe(0)
  })
})
