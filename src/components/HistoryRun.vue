<script setup lang="ts">
import type { HistoryEntry as Entry, DisplayItem } from '@/composables/useHistory'
import HistoryEntry from '@/components/HistoryEntry.vue'
import { faviconUrl } from '@/lib/chrome'

defineProps<{
  run: Extract<DisplayItem, { type: 'run' }>
  locale: string
  use24: boolean
  timeBeforeTitle: boolean
  expanded: boolean
  isSelected: (key: string) => boolean
  removeLabel: string
  groupRemoveLabel: string
}>()

const emit = defineEmits<{
  (e: 'toggle-expand'): void
  (e: 'remove-group'): void
  (e: 'toggle', entry: Entry, ev: MouseEvent): void
  (e: 'remove', entry: Entry): void
}>()
</script>

<template>
  <div>
    <div class="dbh-entry flex cursor-pointer select-none items-center gap-3 px-3 py-2 text-[13px]" @click="emit('toggle-expand')">
      <button class="dbh-chevron shrink-0" :class="expanded ? 'is-open' : ''" :aria-expanded="expanded" @click.stop="emit('toggle-expand')">
        <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor"><path d="M5 3l6 5-6 5z" /></svg>
      </button>
      <img class="h-4 w-4 shrink-0 rounded-sm" :src="faviconUrl(run.entries[0].url)" alt="" />
      <div class="min-w-0 flex-1 truncate">
        <span class="dbh-title">{{ run.title }}</span>
      </div>
      <span class="dbh-count-badge mono shrink-0 text-xs">x{{ run.entries.length }}</span>
      <button class="dbh-rm shrink-0" :title="groupRemoveLabel" @click.stop="emit('remove-group')">
        <svg viewBox="0 0 15 15" width="12" height="12" fill="currentColor"><path d="M14.1 1.6L8.2 7.5l5.9 5.9-.7.7L7.5 8.2l-5.9 5.9-.7-.7L6.8 7.5.9 1.6l.7-.7L7.5 6.8 13.4.9z" /></svg>
      </button>
    </div>
    <div v-if="expanded" class="dbh-run-children">
      <HistoryEntry v-for="entry in run.entries" :key="entry.key" :entry="entry" :locale="locale" :use24="use24" :time-before-title="timeBeforeTitle" :selected="isSelected(entry.key)" :remove-label="removeLabel" @toggle="(ev) => emit('toggle', entry, ev)" @remove="emit('remove', entry)" />
    </div>
  </div>
</template>
