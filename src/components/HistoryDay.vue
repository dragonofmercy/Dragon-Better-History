<script setup lang="ts">
import type { DayGroup, HistoryEntry as Entry } from '@/composables/useHistory'
import HistoryEntry from '@/components/HistoryEntry.vue'
import { formatDayHeading } from '@/lib/dates'

defineProps<{
  group: DayGroup
  locale: string
  use24: boolean
  timeBeforeTitle: boolean
  emptyLabel: string
  removeLabel: string
  isSelected: (key: string) => boolean
}>()

const emit = defineEmits<{ (e: 'toggle', entry: Entry, ev: MouseEvent): void; (e: 'remove', entry: Entry): void }>()
</script>

<template>
  <section class="mb-6">
    <h2 class="mb-2 text-base font-semibold capitalize">{{ formatDayHeading(group.date, locale) }}</h2>
    <div v-if="group.entries.length">
      <HistoryEntry v-for="entry in group.entries" :key="entry.key" :entry="entry" :locale="locale" :use24="use24" :time-before-title="timeBeforeTitle" :selected="isSelected(entry.key)" :remove-label="removeLabel" @toggle="(ev) => emit('toggle', entry, ev)" @remove="emit('remove', entry)" />
    </div>
    <div v-else class="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">{{ emptyLabel }}</div>
  </section>
</template>
