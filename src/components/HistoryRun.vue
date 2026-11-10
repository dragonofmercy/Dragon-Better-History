<script setup lang="ts">
import { ChevronRight, X } from '@lucide/vue'
import type { HistoryEntry as Entry, DisplayItem } from '@/composables/useHistory'
import HistoryEntry from '@/components/HistoryEntry.vue'
import { faviconUrl } from '@/lib/chrome'
import { t } from '@/lib/i18n'

defineProps<{
  run: Extract<DisplayItem, { type: 'run' }>
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
</script>

<template>
  <div>
    <div class="dbh-entry relative" tabindex="0" @click="emit('toggle-expand')" @keydown.enter.space.self.prevent="emit('toggle-expand')">
      <button class="dbh-chevron" :class="expanded ? 'is-open' : ''" :aria-expanded="expanded" :aria-label="expanded ? t('history_collapse_group') : t('history_expand_group')">
        <ChevronRight :size="14" :stroke-width="2.5" />
      </button>
      <img class="h-5 w-5 shrink-0 rounded-sm" :src="faviconUrl(run.entries[0].url)" alt="" loading="lazy" />
      <div class="flex min-w-0 flex-1 items-baseline gap-2.5">
        <span class="dbh-title truncate">{{ run.entries[0].title }}</span>
        <span v-if="run.entries[0].domain" class="dbh-muted shrink-0 text-xs">{{ run.entries[0].domain }}</span>
        <span class="dbh-count-badge shrink-0 self-center">{{ run.entries.length }}</span>
      </div>
      <button class="dbh-rm" :title="t('history_remove_group')" :aria-label="t('history_remove_group')" @click.stop="emit('remove-group')">
        <X :size="14" />
      </button>
    </div>
    <template v-if="expanded">
      <HistoryEntry v-for="entry in run.entries" :key="entry.key" child :entry="entry" :use24="use24" :time-before-title="timeBeforeTitle" :is-selected="isSelected" @toggle="(ev) => emit('toggle', entry, ev)" @remove="emit('remove', entry)" />
    </template>
  </div>
</template>
