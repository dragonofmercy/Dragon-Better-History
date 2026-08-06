// chrome.i18n.getMessage is synchronous and the locale never changes at runtime,
// so plain module constants beat a composable: no ref, no per-component instance.
export const locale = chrome.i18n.getMessage('language') || 'en'

export function t(key: string, subs?: string | string[]): string {
  return chrome.i18n.getMessage(key, subs) || key
}
