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
import SearchBar from '@/components/SearchBar.vue'

const { options, load } = useOptions()
const { t, locale } = useI18n()
useTheme(() => options.theme)
const history = useHistory()
const closed = useRecentlyClosed()
const today = startOfDay(new Date())
const tab = ref<'recent' | 'closed'>('recent')
const closedLoaded = ref(false)

const entries = computed(() => history.days.value.flatMap((g) => g.entries))

onMounted(async () => {
  await load()
  await history.getDay(today, options.popupNbItems)
})

async function ensureClosed(): Promise<void> {
  if (closedLoaded.value) return
  closedLoaded.value = true
  await closed.load(options.popupNbItems)
}

function selectTab(next: 'recent' | 'closed'): void {
  tab.value = next
  if (next === 'closed') void ensureClosed()
}

function openHistory(): void { chrome.tabs.create({ url: chrome.runtime.getURL('history.html') }) }
function noop(): void { /* popup history entries are not interactive */ }
</script>

<template>
  <div class="compact dbh-root flex max-h-[600px] w-124 flex-col">
    <header class="dbh-headerbar flex shrink-0 items-center gap-1 px-3 py-2" role="tablist">
      <button class="dbh-tab rounded-md px-2 py-1 text-sm font-semibold" :class="tab === 'recent' ? 'is-active' : ''" role="tab" :aria-selected="tab === 'recent'" @click="selectTab('recent')">{{ t('history_recent') }}</button>
      <button class="dbh-tab rounded-md px-2 py-1 text-sm font-semibold" :class="tab === 'closed' ? 'is-active' : ''" role="tab" :aria-selected="tab === 'closed'" @click="selectTab('closed')">{{ t('tab_recently_closed') }}</button>
      <button class="dbh-iconbtn ml-auto flex h-7 w-7 items-center justify-center rounded-md" :title="t('history_view_more')" :aria-label="t('history_view_more')" @click="openHistory">
        <svg viewBox="0 0 15 15" width="15" height="15" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 13H3V4h4V3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9h-1v4zM9 2v1h2.293L6.146 8.146l.708.708L12 3.707V6h1V2H9z" /></svg>
      </button>
    </header>
    <div class="min-h-0 flex-1 overflow-y-auto p-3" role="tabpanel">
      <div v-show="tab === 'recent'">
        <SearchBar :placeholder="t('search_placeholder')" class="mb-2" @search="(q) => history.search(q, today, options.popupNbItems)" @clear="() => history.getDay(today, options.popupNbItems)" />
        <div class="dbh-entries">
          <HistoryEntryRow v-for="e in entries" :key="e.key" :entry="e" :locale="locale" :use24="options.use24HoursFormat" :time-before-title="options.timeBeforeTitle" :selected="false" :removable="false" remove-label="" @toggle="noop" />
        </div>
        <p v-if="!entries.length" class="dbh-muted text-xs">{{ history.searching.value ? t('search_empty') : t('history_date_empty') }}</p>
      </div>
      <div v-show="tab === 'closed'">
        <p v-if="closed.loading.value" class="dbh-muted text-xs">{{ t('closed_loading') }}</p>
        <p v-else-if="closed.error.value" class="dbh-muted text-xs">{{ t('closed_error') }}</p>
        <template v-else>
          <div class="dbh-entries">
            <ClosedRow
              v-for="s in closed.sessions.value"
              :key="s.type + '-' + s.sessionId"
              :session="s"
              :locale="locale"
              :use24="options.use24HoursFormat"
              :window-label="s.type === 'window' ? t('closed_window_tabs', String(s.tabCount)) : ''"
              @restore="closed.restore(s.sessionId)"
            />
          </div>
          <p v-if="!closed.sessions.value.length" class="dbh-muted text-xs">{{ t('closed_empty') }}</p>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dbh-tab { opacity: 0.55; }
.dbh-tab.is-active { opacity: 1; text-decoration: underline; text-underline-offset: 4px; }
.dbh-tab:hover { opacity: 0.85; }
</style>
