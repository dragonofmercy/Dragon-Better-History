<script setup lang="ts">
import type { HistoryEntry } from '@/composables/useHistory'
import { faviconUrl } from '@/lib/chrome'
import { formatTime } from '@/lib/dates'

const props = withDefaults(defineProps<{
  entry: HistoryEntry
  locale: string
  use24: boolean
  timeBeforeTitle: boolean
  selected: boolean
  removeLabel: string
  removable?: boolean
}>(), { removable: true })

const emit = defineEmits<{ (e: 'toggle', ev: MouseEvent): void; (e: 'remove'): void }>()

function time(): string { return formatTime(new Date(props.entry.lastVisitTime), props.locale, props.use24) }
</script>

<template>
  <div class="dbh-entry flex cursor-pointer select-none items-center gap-3 px-3 py-2 text-[13px]" :class="selected ? 'is-selected' : ''" @click="emit('toggle', $event)">
    <span v-if="timeBeforeTitle" class="dbh-time mono shrink-0 text-xs">{{ time() }}</span>
    <img class="h-4 w-4 shrink-0 rounded-sm" :src="faviconUrl(entry.url)" alt="" />
    <div class="min-w-0 flex-1 truncate">
      <a class="dbh-title hover:underline" :href="entry.url" :title="entry.url" target="_blank" @click.stop>{{ entry.title }}</a>
    </div>
    <span v-if="!timeBeforeTitle" class="dbh-time mono shrink-0 text-xs">{{ time() }}</span>
    <button v-if="removable" class="dbh-rm shrink-0" :title="removeLabel" @click.stop="emit('remove')">
      <svg viewBox="0 0 15 15" width="12" height="12" fill="currentColor"><path d="M14.1 1.6L8.2 7.5l5.9 5.9-.7.7L7.5 8.2l-5.9 5.9-.7-.7L6.8 7.5.9 1.6l.7-.7L7.5 6.8 13.4.9z" /></svg>
    </button>
  </div>
</template>
