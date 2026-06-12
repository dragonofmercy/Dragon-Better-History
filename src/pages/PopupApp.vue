<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useOptions } from '@/composables/useOptions'
import { useI18n } from '@/composables/useI18n'
import { useTheme } from '@/composables/useTheme'
import { useHistory } from '@/composables/useHistory'
import { useRecentlyClosed } from '@/composables/useRecentlyClosed'
import { startOfDay } from '@/lib/dates'
import HistoryEntryRow from '@/components/HistoryEntry.vue'
import ClosedRow from '@/components/ClosedRow.vue'

const { options, load } = useOptions()
const { t, locale } = useI18n()
useTheme(() => options.theme)
const history = useHistory()
const closed = useRecentlyClosed()
const today = startOfDay(new Date())
const tab = ref<'recent' | 'closed'>('recent')

const entries = computed(() => history.days.value.flatMap((g) => g.entries))

onMounted(async () => {
  await load()
  await history.getDay(today, options.popupNbItems)
  await closed.load()
})

function selectTab(next: 'recent' | 'closed'): void {
  tab.value = next
  if (next === 'closed') void closed.load()
}

function openHistory(): void { chrome.tabs.create({ url: 'chrome://history' }) }
function noop(): void { /* popup history entries are not interactive */ }
</script>

<template>
  <div class="compact dbh-root w-96">
    <header class="dbh-headerbar flex items-center gap-1 px-3 py-2">
      <button class="dbh-tab rounded-md px-2 py-1 text-sm font-semibold" :class="tab === 'recent' ? 'is-active' : ''" @click="selectTab('recent')">{{ t('history_recent') }}</button>
      <button class="dbh-tab rounded-md px-2 py-1 text-sm font-semibold" :class="tab === 'closed' ? 'is-active' : ''" @click="selectTab('closed')">{{ t('tab_recently_closed') }}</button>
      <button class="dbh-iconbtn ml-auto flex h-7 w-7 items-center justify-center rounded-md" :title="t('history_view_more')" :aria-label="t('history_view_more')" @click="openHistory">
        <svg viewBox="0 0 15 15" width="15" height="15" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 13H3V4h4V3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9h-1v4zM9 2v1h2.293L6.146 8.146l.708.708L12 3.707V6h1V2H9z" /></svg>
      </button>
    </header>
    <div class="p-3">
      <div v-if="tab === 'recent'">
        <div class="dbh-entries">
          <HistoryEntryRow v-for="e in entries" :key="e.key" :entry="e" :locale="locale" :use24="options.use24HoursFormat" :time-before-title="options.timeBeforeTitle" :selected="false" :remove-label="t('history_remove_single')" @toggle="noop" @remove="noop" />
        </div>
        <p v-if="!entries.length" class="dbh-muted text-xs">{{ t('history_date_empty') }}</p>
      </div>
      <div v-else>
        <div class="dbh-entries">
          <ClosedRow v-for="s in closed.sessions.value" :key="s.sessionId" :session="s" :locale="locale" :use24="options.use24HoursFormat" :restore-label="t('closed_restore')" :window-label="s.type === 'window' ? t('closed_window_tabs', String(s.tabCount)) : ''" @restore="closed.restore(s.sessionId)" />
        </div>
        <p v-if="!closed.sessions.value.length" class="dbh-muted text-xs">{{ t('closed_empty') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dbh-tab { opacity: 0.55; }
.dbh-tab.is-active { opacity: 1; }
.dbh-tab:hover { opacity: 0.85; }
</style>
