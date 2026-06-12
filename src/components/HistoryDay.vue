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
    <h2 class="dbh-day mb-2">
      <span>{{ formatDayHeading(group.date, locale) }}</span>
      <span class="dbh-rule"></span>
      <span v-if="group.entries.length" class="dbh-count">{{ group.entries.length }}</span>
    </h2>
    <div v-if="group.entries.length" class="dbh-entries">
      <HistoryEntry v-for="entry in group.entries" :key="entry.key" :entry="entry" :locale="locale" :use24="use24" :time-before-title="timeBeforeTitle" :selected="isSelected(entry.key)" :remove-label="removeLabel" @toggle="(ev) => emit('toggle', entry, ev)" @remove="emit('remove', entry)" />
    </div>
    <div v-else class="dbh-muted px-3 py-2 text-sm">{{ emptyLabel }}</div>
  </section>
</template>
