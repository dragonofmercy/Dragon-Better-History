export function storageGet(): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, (items) => {
      const err = chrome.runtime.lastError
      if (err) reject(new Error(err.message)); else resolve(items)
    })
  })
}

export function storageSet(items: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(items, () => {
      const err = chrome.runtime.lastError
      if (err) reject(new Error(err.message)); else resolve()
    })
  })
}

export function historySearch(query: chrome.history.HistoryQuery): Promise<chrome.history.HistoryItem[]> {
  return new Promise((resolve, reject) => {
    chrome.history.search(query, (results) => {
      const err = chrome.runtime.lastError
      if (err) reject(new Error(err.message)); else resolve(results)
    })
  })
}

export function historyDeleteUrl(details: { url: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.history.deleteUrl(details, () => {
      const err = chrome.runtime.lastError
      if (err) reject(new Error(err.message)); else resolve()
    })
  })
}

export function faviconUrl(pageUrl: string, size = 32): string {
  const url = new URL(chrome.runtime.getURL('/_favicon/'))
  url.searchParams.set('pageUrl', pageUrl)
  url.searchParams.set('size', String(size))
  return url.toString()
}
