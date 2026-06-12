<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useOptions } from '@/composables/useOptions'
import { useI18n } from '@/composables/useI18n'
import { useTheme } from '@/composables/useTheme'
import { useHistory } from '@/composables/useHistory'
import { startOfDay } from '@/lib/dates'
import HistoryEntryRow from '@/components/HistoryEntry.vue'

const { options, load } = useOptions()
const { t, locale } = useI18n()
useTheme(() => options.theme)
const history = useHistory()
const today = startOfDay(new Date())

const entries = computed(() => history.days.value.flatMap((g) => g.entries))

onMounted(async () => {
  await load()
  await history.getDay(today, options.popupNbItems)
})

function openHistory(): void { chrome.tabs.create({ url: 'chrome://history' }) }
function noop(): void { /* popup entries are not interactive */ }
</script>

<template>
  <div class="compact dbh-root w-80 p-3">
    <div class="mb-2 flex items-center justify-between">
      <h1 class="text-sm font-semibold">{{ t('history_recent') }}</h1>
      <a class="dbh-link text-xs" @click="openHistory">{{ t('history_view_more') }}</a>
    </div>
    <div class="dbh-entries">
      <HistoryEntryRow v-for="e in entries" :key="e.key" :entry="e" :locale="locale" :use24="options.use24HoursFormat" :time-before-title="options.timeBeforeTitle" :selected="false" :remove-label="t('history_remove_single')" @toggle="noop" @remove="noop" />
    </div>
    <p v-if="!entries.length" class="dbh-muted text-xs">{{ t('history_date_empty') }}</p>
  </div>
</template>
