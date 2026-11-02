import { describe, it, expect, vi } from 'vitest'
import { useMonthDensity } from '@/composables/useMonthDensity'

describe('useMonthDensity', () => {
  it('load ignores a stale response', async () => {
    const d1 = new Date(2024, 3, 5).getTime()
    const d2 = new Date(2024, 4, 7).getTime()
    let resolveFirst!: (v: unknown[]) => void
    const search = vi.fn()
      .mockImplementationOnce(() => new Promise((r) => { resolveFirst = r }))
      .mockImplementationOnce(() => Promise.resolve([{ lastVisitTime: d2 }]))
    ;(chrome.history as unknown as { search: unknown }).search = search
    const { levels, load } = useMonthDensity()
    const first = load(2024, 3)
    await load(2024, 4)
    resolveFirst([{ lastVisitTime: d1 }])
    await first
    expect([...levels.value.keys()]).toEqual([new Date(2024, 4, 7).getTime()])
    expect(search.mock.calls[0]![0]).toMatchObject({ text: '', maxResults: 0 })
  })
})
