import { describe, it, expect, vi, afterEach } from 'vitest'
import { normalizeSessions, useRecentlyClosed } from '@/composables/useRecentlyClosed'

afterEach(() => { vi.restoreAllMocks() })

function tabSession(sessionId: string, url: string, title: string, lastModified: number): chrome.sessions.Session {
  return { lastModified, tab: { sessionId, url, title } as chrome.tabs.Tab }
}

function windowSession(sessionId: string, tabCount: number, lastModified: number): chrome.sessions.Session {
  return { lastModified, window: { sessionId, tabs: Array.from({ length: tabCount }, () => ({})) } as chrome.windows.Window }
}

describe('normalizeSessions', () => {
  it('normalizes tabs and windows, newest first', () => {
    const out = normalizeSessions([tabSession('t1', 'https://a', 'A', 100), windowSession('w1', 3, 200)])
    expect(out[0]).toEqual({ type: 'window', sessionId: 'w1', tabCount: 3, lastModified: 200000 })
    expect(out[1]).toEqual({ type: 'tab', sessionId: 't1', url: 'https://a', title: 'A', lastModified: 100000 })
  })

  it('converts lastModified seconds to milliseconds', () => {
    expect(normalizeSessions([tabSession('t1', 'https://a', 'A', 5)])[0].lastModified).toBe(5000)
  })

  it('falls back to url when the tab title is empty', () => {
    expect(normalizeSessions([tabSession('t1', 'https://a', '', 1)])[0]).toMatchObject({ title: 'https://a' })
  })

  it('skips entries without a sessionId or with neither tab nor window', () => {
    const out = normalizeSessions([
      { lastModified: 1, tab: { url: 'https://a', title: 'A' } as chrome.tabs.Tab },
      { lastModified: 2 } as chrome.sessions.Session,
      tabSession('t1', 'https://b', 'B', 3)
    ])
    expect(out).toHaveLength(1)
    expect(out[0].sessionId).toBe('t1')
  })
})

describe('useRecentlyClosed', () => {
  it('load fetches and normalizes sessions', async () => {
    vi.spyOn(chrome.sessions, 'getRecentlyClosed').mockResolvedValue([tabSession('t1', 'https://a', 'A', 100)] as never)
    const rc = useRecentlyClosed()
    await rc.load()
    expect(rc.sessions.value).toHaveLength(1)
    expect(rc.sessions.value[0].sessionId).toBe('t1')
  })

  it('restore calls sessions.restore with the id and refetches', async () => {
    const getSpy = vi.spyOn(chrome.sessions, 'getRecentlyClosed').mockResolvedValue([tabSession('t1', 'https://a', 'A', 100)] as never)
    const restoreSpy = vi.spyOn(chrome.sessions, 'restore').mockResolvedValue({} as never)
    const rc = useRecentlyClosed()
    await rc.load()
    await rc.restore('t1')
    expect(restoreSpy).toHaveBeenCalledWith('t1')
    expect(getSpy).toHaveBeenCalledTimes(2)
  })
})
