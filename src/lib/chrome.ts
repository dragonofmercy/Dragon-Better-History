// The MV3 chrome.* APIs return promises when called without a callback, so the
// composables can await them directly. These thin wrappers keep the call sites typed.

export function storageGet(): Promise<Record<string, unknown>> {
  return chrome.storage.sync.get(null)
}

export function storageSet(items: Record<string, unknown>): Promise<void> {
  return chrome.storage.sync.set(items)
}

export function historySearch(query: chrome.history.HistoryQuery): Promise<chrome.history.HistoryItem[]> {
  return chrome.history.search(query)
}

export function historyDeleteUrl(details: { url: string }): Promise<void> {
  return chrome.history.deleteUrl(details)
}

export function sessionsGetRecentlyClosed(): Promise<chrome.sessions.Session[]> {
  return chrome.sessions.getRecentlyClosed()
}

export function sessionsRestore(sessionId: string): Promise<chrome.sessions.Session> {
  return chrome.sessions.restore(sessionId)
}

export function faviconUrl(pageUrl: string, size = 32): string {
  const url = new URL(chrome.runtime.getURL('/_favicon/'))
  url.searchParams.set('pageUrl', pageUrl)
  url.searchParams.set('size', String(size))
  return url.toString()
}
