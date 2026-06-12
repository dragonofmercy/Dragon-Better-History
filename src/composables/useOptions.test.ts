import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useOptions, DEFAULT_OPTIONS } from '@/composables/useOptions'

describe('useOptions', () => {
  beforeEach(() => {
    vi.spyOn(chrome.storage.sync, 'get').mockImplementation((_keys: unknown, cb: (i: Record<string, unknown>) => void) => cb({}))
  })

  it('uses defaults when storage is empty', async () => {
    const { options, load } = useOptions()
    await load()
    expect(options.use24HoursFormat).toBe(DEFAULT_OPTIONS.use24HoursFormat)
    expect(options.popupNbItems).toBe(10)
    expect(options.theme).toBe('system')
  })

  it('loads stored values and coerces popupNbItems to a number', async () => {
    vi.spyOn(chrome.storage.sync, 'get').mockImplementation((_keys: unknown, cb: (i: Record<string, unknown>) => void) =>
      cb({ use24HoursFormat: false, timeBeforeTitle: true, popupNbItems: '25', theme: 'dark' }))
    const { options, load } = useOptions()
    await load()
    expect(options.use24HoursFormat).toBe(false)
    expect(options.timeBeforeTitle).toBe(true)
    expect(options.popupNbItems).toBe(25)
    expect(options.theme).toBe('dark')
  })

  it('save persists merged options to storage', async () => {
    const set = vi.spyOn(chrome.storage.sync, 'set').mockImplementation((_i: unknown, cb: () => void) => cb())
    const { options, save } = useOptions()
    await save({ theme: 'light' })
    expect(options.theme).toBe('light')
    expect(set).toHaveBeenCalled()
  })
})
