// Edge serves chrome_url_overrides.history inside its narrow history hub flyout
// instead of a full browser tab (Chrome opens it as a normal tab). A page shown in
// that flyout is not hosted by a tab, so chrome.tabs.getCurrent() resolves to
// undefined; when that happens we reopen the history page as a real full-width tab
// and close the flyout. Returns true when it reopened (caller should skip mounting).
export async function reopenDetachedAsTab(): Promise<boolean> {
  const tab = await chrome.tabs.getCurrent()
  if (tab) return false
  await chrome.tabs.create({ url: chrome.runtime.getURL('history.html') })
  window.close()
  return true
}

export function faviconUrl(pageUrl: string): string {
  const url = new URL(chrome.runtime.getURL('/_favicon/'))
  url.searchParams.set('pageUrl', pageUrl)
  url.searchParams.set('size', '32')
  return url.toString()
}
