import { computed, ref, watchEffect, type ComputedRef } from 'vue'
import type { Theme } from '@/composables/useOptions'

export function useTheme(getTheme: () => Theme): { isDark: ComputedRef<boolean> } {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const systemDark = ref(mq.matches)
  mq.addEventListener('change', () => { systemDark.value = mq.matches })

  const theme = computed(getTheme)
  const isDark = computed(() => theme.value === 'dark' || (theme.value === 'system' && systemDark.value))

  watchEffect(() => document.documentElement.classList.toggle('dark', isDark.value))

  return { isDark }
}
