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

  it('ignores items outside the requested month', async () => {
    const inside = new Date(2024, 4, 7).getTime()
    const outside = new Date(2024, 5, 2).getTime()
    ;(chrome.history as unknown as { search: unknown }).search = vi.fn(async () => [{ lastVisitTime: inside }, { lastVisitTime: outside }])
    const { levels, load } = useMonthDensity()
    await load(2024, 4)
    expect([...levels.value.keys()]).toEqual([inside])
  })

  it('serves a past month from the cache until a visit is removed', async () => {
    const search = vi.fn(async () => [{ lastVisitTime: new Date(2024, 4, 7).getTime() }])
    ;(chrome.history as unknown as { search: unknown }).search = search
    const onRemoved = vi.spyOn(chrome.history.onVisitRemoved, 'addListener')
    const { load } = useMonthDensity()
    await load(2024, 4)
    await load(2024, 4)
    expect(search).toHaveBeenCalledTimes(1)
    onRemoved.mock.calls[0]![0]({ allHistory: false })
    await load(2024, 4)
    expect(search).toHaveBeenCalledTimes(2)
  })

  it('never caches the current month', async () => {
    const search = vi.fn(async () => [])
    ;(chrome.history as unknown as { search: unknown }).search = search
    const { load } = useMonthDensity()
    const now = new Date()
    await load(now.getFullYear(), now.getMonth())
    await load(now.getFullYear(), now.getMonth())
    expect(search).toHaveBeenCalledTimes(2)
  })
})
