<script setup lang="ts">
import { ChevronRight, X } from '@lucide/vue'
import { domainOf, type HistoryEntry as Entry, type DisplayItem } from '@/composables/useHistory'
import HistoryEntry from '@/components/HistoryEntry.vue'
import { faviconUrl } from '@/lib/chrome'
import { t } from '@/lib/i18n'

defineProps<{
  run: Extract<DisplayItem, { type: 'run' }>
  locale: string
  use24: boolean
  timeBeforeTitle: boolean
  expanded: boolean
  isSelected: (key: string) => boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-expand'): void
  (e: 'remove-group'): void
  (e: 'toggle', entry: Entry, ev: MouseEvent | KeyboardEvent): void
  (e: 'remove', entry: Entry): void
}>()

function onKey(ev: KeyboardEvent): void {
  if (ev.target !== ev.currentTarget) return
  ev.preventDefault()
  emit('toggle-expand')
}
</script>

<template>
  <div>
    <div class="dbh-entry relative" tabindex="0" @click="emit('toggle-expand')" @keydown.enter="onKey" @keydown.space="onKey">
      <button class="dbh-chevron" :class="expanded ? 'is-open' : ''" :aria-expanded="expanded" :aria-label="expanded ? t('history_collapse_group') : t('history_expand_group')">
        <ChevronRight :size="14" :stroke-width="2.5" />
      </button>
      <img class="h-5 w-5 shrink-0 rounded-sm" :src="faviconUrl(run.entries[0].url)" alt="" />
      <div class="flex min-w-0 flex-1 items-baseline gap-2.5">
        <span class="dbh-title truncate">{{ run.entries[0].title }}</span>
        <span v-if="domainOf(run.entries[0].url)" class="dbh-muted shrink-0 text-xs">{{ domainOf(run.entries[0].url) }}</span>
        <span class="dbh-count-badge mono shrink-0">{{ run.entries.length }}</span>
      </div>
      <button class="dbh-rm" :title="t('history_remove_group')" :aria-label="t('history_remove_group')" @click.stop="emit('remove-group')">
        <X :size="14" />
      </button>
    </div>
    <template v-if="expanded">
      <HistoryEntry v-for="entry in run.entries" :key="entry.key" child :entry="entry" :locale="locale" :use24="use24" :time-before-title="timeBeforeTitle" :selected="isSelected(entry.key)" @toggle="(ev) => emit('toggle', entry, ev)" @remove="emit('remove', entry)" />
    </template>
  </div>
</template>
