<script setup lang="ts">
import { computed } from 'vue'
import type { ClosedSession } from '@/composables/useRecentlyClosed'
import { faviconUrl } from '@/lib/chrome'
import { formatTime } from '@/lib/dates'
import { t } from '@/lib/i18n'

const props = defineProps<{
  session: ClosedSession
  locale: string
  use24: boolean
}>()

const emit = defineEmits<{ (e: 'restore'): void }>()

const time = computed(() => formatTime(new Date(props.session.lastModified), props.locale, props.use24))
const label = computed(() => (props.session.type === 'tab' ? props.session.title : t('closed_window_tabs', String(props.session.tabCount))))
const tooltip = computed(() => (props.session.type === 'tab' ? props.session.url : label.value))
</script>

<template>
  <div class="dbh-entry flex cursor-pointer select-none items-center gap-3 px-3 py-2 text-[13px]" @click="emit('restore')">
    <img v-if="session.type === 'tab'" class="h-4 w-4 shrink-0 rounded-sm" :src="faviconUrl(session.url)" alt="" />
    <span v-else class="dbh-faint flex h-4 w-4 shrink-0 items-center justify-center">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>
    </span>
    <div class="min-w-0 flex-1 truncate">
      <span class="dbh-title" :title="tooltip">{{ label }}</span>
    </div>
    <span class="dbh-time mono shrink-0 text-xs">{{ time }}</span>
  </div>
</template>
