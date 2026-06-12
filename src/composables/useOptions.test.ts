import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useOptions, DEFAULT_OPTIONS } from '@/composables/useOptions'

describe('useOptions', () => {
  beforeEach(() => {
    vi.spyOn(chrome.storage.sync, 'get').mockResolvedValue({} as never)
  })

  it('uses defaults when storage is empty', async () => {
    const { options, load } = useOptions()
    await load()
    expect(options.use24HoursFormat).toBe(DEFAULT_OPTIONS.use24HoursFormat)
    expect(options.popupNbItems).toBe(10)
    expect(options.theme).toBe('system')
  })

  it('loads stored values and coerces popupNbItems to a number', async () => {
    vi.spyOn(chrome.storage.sync, 'get').mockResolvedValue({ use24HoursFormat: false, timeBeforeTitle: true, popupNbItems: '25', theme: 'dark' } as never)
    const { options, load } = useOptions()
    await load()
    expect(options.use24HoursFormat).toBe(false)
    expect(options.timeBeforeTitle).toBe(true)
    expect(options.popupNbItems).toBe(25)
    expect(options.theme).toBe('dark')
  })

  it('save persists merged options to storage', async () => {
    const set = vi.spyOn(chrome.storage.sync, 'set').mockResolvedValue()
    const { options, save } = useOptions()
    await save({ theme: 'light' })
    expect(options.theme).toBe('light')
    expect(set).toHaveBeenCalled()
  })
})
