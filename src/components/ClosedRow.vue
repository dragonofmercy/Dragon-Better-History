<script setup lang="ts">
import type { ClosedSession } from '@/composables/useRecentlyClosed'
import { faviconUrl } from '@/lib/chrome'
import { formatTime } from '@/lib/dates'

const props = defineProps<{
  session: ClosedSession
  locale: string
  use24: boolean
  restoreLabel: string
  windowLabel: string
}>()

const emit = defineEmits<{ (e: 'restore'): void }>()

function time(): string { return formatTime(new Date(props.session.lastModified), props.locale, props.use24) }
</script>

<template>
  <div class="dbh-entry flex cursor-pointer select-none items-center gap-3 px-3 py-2 text-[13px]" @click="emit('restore')">
    <img v-if="session.type === 'tab'" class="h-4 w-4 shrink-0 rounded-sm" :src="faviconUrl(session.url)" alt="" />
    <span v-else class="dbh-faint flex h-4 w-4 shrink-0 items-center justify-center">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>
    </span>
    <div class="min-w-0 flex-1 truncate">
      <span class="dbh-title" :title="session.type === 'tab' ? session.url : windowLabel">{{ session.type === 'tab' ? session.title : windowLabel }}</span>
    </div>
    <span class="dbh-time mono shrink-0 text-xs">{{ time() }}</span>
    <button class="dbh-rm shrink-0" :title="restoreLabel" :aria-label="restoreLabel" @click.stop="emit('restore')">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
    </button>
  </div>
</template>
