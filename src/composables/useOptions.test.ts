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

  it('defaults groupMode to none and loads the stored value', async () => {
    const { options, load } = useOptions()
    await load()
    expect(options.groupMode).toBe('none')
    vi.spyOn(chrome.storage.sync, 'get').mockResolvedValue({ groupMode: 'domain' } as never)
    const second = useOptions()
    await second.load()
    expect(second.options.groupMode).toBe('domain')
  })

  it('migrates the legacy groupConsecutive option without keeping it', async () => {
    vi.spyOn(chrome.storage.sync, 'get').mockResolvedValue({ groupConsecutive: true } as never)
    const { options, load } = useOptions()
    await load()
    expect(options.groupMode).toBe('title')
    expect(options).not.toHaveProperty('groupConsecutive')
  })

  it('prefers a stored groupMode over the legacy option', async () => {
    vi.spyOn(chrome.storage.sync, 'get').mockResolvedValue({ groupMode: 'none', groupConsecutive: true } as never)
    const { options, load } = useOptions()
    await load()
    expect(options.groupMode).toBe('none')
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
    expect(set).toHaveBeenCalledWith({ theme: 'light' })
  })
})
