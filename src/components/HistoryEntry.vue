<script setup lang="ts">
import type { HistoryEntry } from '@/composables/useHistory'
import { faviconUrl } from '@/lib/chrome'
import { formatTime } from '@/lib/dates'

const props = defineProps<{
  entry: HistoryEntry
  locale: string
  use24: boolean
  timeBeforeTitle: boolean
  selected: boolean
  removeLabel: string
}>()

const emit = defineEmits<{ (e: 'toggle', ev: MouseEvent): void; (e: 'remove'): void }>()

function time(): string { return formatTime(new Date(props.entry.lastVisitTime), props.locale, props.use24) }
</script>

<template>
  <div class="flex cursor-pointer select-none items-center gap-3 rounded-md px-4 py-2.5 text-sm" :class="selected ? 'glass-card-selected' : 'glass-card'" @click="emit('toggle', $event)">
    <span v-if="timeBeforeTitle" class="w-14 shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">{{ time() }}</span>
    <img class="h-4 w-4 shrink-0" :src="faviconUrl(entry.url)" alt="" />
    <a class="flex-1 truncate text-blue-700 hover:underline dark:text-blue-300" :href="entry.url" :title="entry.url" target="_blank" @click.stop>{{ entry.title }}</a>
    <span v-if="!timeBeforeTitle" class="shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">{{ time() }}</span>
    <button class="shrink-0 text-neutral-400 hover:text-red-500" :title="removeLabel" @click.stop="emit('remove')">
      <svg viewBox="0 0 15 15" width="12" height="12" fill="currentColor"><path d="M14.1 1.6L8.2 7.5l5.9 5.9-.7.7L7.5 8.2l-5.9 5.9-.7-.7L6.8 7.5.9 1.6l.7-.7L7.5 6.8 13.4.9z" /></svg>
    </button>
  </div>
</template>
