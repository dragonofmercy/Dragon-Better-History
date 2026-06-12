import { ref } from 'vue'

export function useI18n() {
  const locale = ref<string>(chrome.i18n.getMessage('language') || 'en')

  function t(key: string, subs?: string | string[]): string {
    return chrome.i18n.getMessage(key, subs as string | string[] | undefined) || key
  }

  return { t, locale }
}
