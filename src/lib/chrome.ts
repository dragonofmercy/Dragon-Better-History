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

export function sessionsGetRecentlyClosed(filter?: chrome.sessions.Filter): Promise<chrome.sessions.Session[]> {
  return chrome.sessions.getRecentlyClosed(filter)
}

export function sessionsRestore(sessionId: string): Promise<chrome.sessions.Session> {
  return chrome.sessions.restore(sessionId)
}

// Edge serves chrome_url_overrides.history inside its narrow history hub flyout
// instead of a full browser tab (Chrome opens it as a normal tab). A page shown in
// that flyout is not hosted by a tab, so chrome.tabs.getCurrent() resolves to
// undefined; when that happens we reopen the history page as a real full-width tab
// and close the flyout. Returns true when it reopened (caller should skip mounting).
export async function reopenDetachedAsTab(path = 'history.html'): Promise<boolean> {
  const tab = await chrome.tabs.getCurrent()
  if (tab) return false
  await chrome.tabs.create({ url: chrome.runtime.getURL(path) })
  window.close()
  return true
}

export function faviconUrl(pageUrl: string, size = 32): string {
  const url = new URL(chrome.runtime.getURL('/_favicon/'))
  url.searchParams.set('pageUrl', pageUrl)
  url.searchParams.set('size', String(size))
  return url.toString()
}
