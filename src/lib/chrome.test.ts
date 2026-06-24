import { describe, it, expect, vi, afterEach } from 'vitest'
import { reopenDetachedAsTab } from '@/lib/chrome'

afterEach(() => { vi.restoreAllMocks() })

describe('reopenDetachedAsTab', () => {
  it('does nothing when the page is hosted in a real tab', async () => {
    vi.spyOn(chrome.tabs, 'getCurrent').mockResolvedValue({ id: 1 } as chrome.tabs.Tab)
    const createSpy = vi.spyOn(chrome.tabs, 'create')
    const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {})
    expect(await reopenDetachedAsTab()).toBe(false)
    expect(createSpy).not.toHaveBeenCalled()
    expect(closeSpy).not.toHaveBeenCalled()
  })

  it('reopens as a full tab and closes the flyout when not hosted in a tab', async () => {
    // Edge serves chrome_url_overrides.history in its narrow history hub flyout,
    // where the page has no current tab, so getCurrent resolves to undefined.
    vi.spyOn(chrome.tabs, 'getCurrent').mockResolvedValue(undefined as never)
    const createSpy = vi.spyOn(chrome.tabs, 'create').mockResolvedValue({} as never)
    const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {})
    expect(await reopenDetachedAsTab()).toBe(true)
    expect(createSpy).toHaveBeenCalledWith({ url: 'chrome-extension://testhistory.html' })
    expect(closeSpy).toHaveBeenCalled()
  })
})
