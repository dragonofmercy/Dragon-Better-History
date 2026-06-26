<script setup lang="ts">
import { computed } from 'vue'
import { groupRuns, type DayGroup, type DisplayItem, type HistoryEntry as Entry } from '@/composables/useHistory'
import HistoryEntry from '@/components/HistoryEntry.vue'
import HistoryRun from '@/components/HistoryRun.vue'
import { formatDayHeading } from '@/lib/dates'

const props = defineProps<{
  group: DayGroup
  locale: string
  use24: boolean
  timeBeforeTitle: boolean
  groupConsecutive: boolean
  expanded: Set<string>
  emptyLabel: string
  removeLabel: string
  groupRemoveLabel: string
  isSelected: (key: string) => boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', entry: Entry, ev: MouseEvent): void
  (e: 'remove', entry: Entry): void
  (e: 'toggle-expand', key: string): void
  (e: 'toggle-select', keys: string[]): void
  (e: 'remove-group', keys: string[]): void
}>()

const items = computed<DisplayItem[]>(() =>
  props.groupConsecutive ? groupRuns(props.group.entries) : props.group.entries.map((entry) => ({ type: 'single', entry }))
)
</script>

<template>
  <section class="mb-6">
    <h2 class="dbh-day mb-2">
      <span>{{ formatDayHeading(group.date, locale) }}</span>
      <span class="dbh-rule"></span>
      <span v-if="group.entries.length" class="dbh-count">{{ group.entries.length }}</span>
    </h2>
    <div v-if="group.entries.length" class="dbh-entries">
      <template v-for="it in items" :key="it.type === 'run' ? it.key : it.entry.key">
        <HistoryRun v-if="it.type === 'run'" :run="it" :locale="locale" :use24="use24" :time-before-title="timeBeforeTitle" :expanded="expanded.has(it.key)" :is-selected="isSelected" :remove-label="removeLabel" :group-remove-label="groupRemoveLabel" @toggle-expand="emit('toggle-expand', it.key)" @toggle-select="emit('toggle-select', it.entries.map((e) => e.key))" @remove-group="emit('remove-group', it.entries.map((e) => e.key))" @toggle="(entry, ev) => emit('toggle', entry, ev)" @remove="(entry) => emit('remove', entry)" />
        <HistoryEntry v-else :entry="it.entry" :locale="locale" :use24="use24" :time-before-title="timeBeforeTitle" :selected="isSelected(it.entry.key)" :remove-label="removeLabel" @toggle="(ev) => emit('toggle', it.entry, ev)" @remove="emit('remove', it.entry)" />
      </template>
    </div>
    <div v-else class="dbh-muted px-3 py-2 text-sm">{{ emptyLabel }}</div>
  </section>
</template>
