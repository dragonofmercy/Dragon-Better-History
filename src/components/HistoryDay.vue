<script setup lang="ts">
import { computed } from 'vue'
import { groupRuns, type DayGroup, type HistoryEntry as Entry } from '@/composables/useHistory'
import type { GroupMode } from '@/composables/useOptions'
import HistoryEntry from '@/components/HistoryEntry.vue'
import HistoryRun from '@/components/HistoryRun.vue'
import { formatDayHeading, formatHour } from '@/lib/dates'
import { groupByHour } from '@/lib/dayStats'
import { locale } from '@/lib/i18n'

const props = defineProps<{
  group: DayGroup
  use24: boolean
  timeBeforeTitle: boolean
  groupMode: GroupMode
  expanded: Set<string>
  isSelected: (key: string) => boolean
  flat?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', entry: Entry, ev: MouseEvent | KeyboardEvent): void
  (e: 'remove', entry: Entry): void
  (e: 'toggle-expand', key: string): void
  (e: 'remove-group', keys: string[]): void
}>()

const blocks = computed(() =>
  (props.flat ? [{ hour: -1, entries: props.group.entries }] : groupByHour(props.group.entries)).map((b) => ({
    hour: b.hour,
    items: groupRuns(b.entries, props.groupMode)
  }))
)
</script>

<template>
  <section class="mb-6">
    <h2 v-if="flat" class="dbh-day mb-2">
      <span>{{ formatDayHeading(group.date, locale) }}</span>
      <span class="dbh-rule"></span>
      <span class="dbh-count">{{ group.total ?? group.entries.length }}</span>
    </h2>
    <section v-for="b in blocks" :key="b.hour" class="dbh-hour">
      <h3 v-if="!flat" class="dbh-hour-label mono">{{ formatHour(b.hour, locale, use24) }}</h3>
      <div class="min-w-0 flex-1">
        <template v-for="it in b.items" :key="it.type === 'run' ? it.key : it.entry.key">
          <HistoryRun v-if="it.type === 'run'" :run="it" :use24="use24" :time-before-title="timeBeforeTitle" :expanded="expanded.has(it.key)" :is-selected="isSelected" @toggle-expand="emit('toggle-expand', it.key)" @remove-group="emit('remove-group', it.entries.map((e) => e.key))" @toggle="(entry, ev) => emit('toggle', entry, ev)" @remove="(entry) => emit('remove', entry)" />
          <HistoryEntry v-else :entry="it.entry" :use24="use24" :time-before-title="timeBeforeTitle" :is-selected="isSelected" @toggle="(ev) => emit('toggle', it.entry, ev)" @remove="emit('remove', it.entry)" />
        </template>
      </div>
    </section>
  </section>
</template>
