import { watchEffect } from 'vue'
import type { Theme } from '@/composables/useOptions'

export function useTheme(getTheme: () => Theme) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')

  function apply(): void {
    const theme = getTheme()
    const dark = theme === 'dark' || (theme === 'system' && mq.matches)
    document.documentElement.classList.toggle('dark', dark)
  }

  watchEffect(apply)
  mq.addEventListener('change', apply)

  return { apply }
}
