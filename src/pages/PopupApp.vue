<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useOptions } from '@/composables/useOptions'
import { useTheme } from '@/composables/useTheme'
import { useHistory } from '@/composables/useHistory'
import { useRecentlyClosed } from '@/composables/useRecentlyClosed'
import { startOfDay } from '@/lib/dates'
import { t, locale } from '@/lib/i18n'
import HistoryEntryRow from '@/components/HistoryEntry.vue'
import ClosedRow from '@/components/ClosedRow.vue'
import SearchBar from '@/components/SearchBar.vue'

const { options, load } = useOptions()
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

function openEntry(url: string): void { chrome.tabs.create({ url }) }

function openHistory(): void { chrome.tabs.create({ url: chrome.runtime.getURL('history.html') }) }
</script>

<template>
  <div class="compact dbh-root flex max-h-[600px] w-[496px] flex-col">
    <div class="flex shrink-0 flex-col gap-2 px-3 pb-2 pt-3">
      <div class="flex gap-0.5 rounded-lg bg-[var(--raised)] p-[3px]" role="group">
        <button
          v-for="id in (['recent', 'closed'] as const)"
          :key="id"
          class="h-9 flex-1 rounded-md text-[13px]"
          :class="tab === id ? 'bg-[var(--accent)] font-medium text-[var(--on-accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'"
          :aria-pressed="tab === id"
          @click="selectTab(id)"
        >{{ id === 'recent' ? t('history_recent') : t('tab_recently_closed') }}</button>
      </div>
      <SearchBar v-show="tab === 'recent'" @search="(q) => history.search(q, today, options.popupNbItems)" @clear="() => history.getDay(today, options.popupNbItems)" />
    </div>
    <div class="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
      <div v-show="tab === 'recent'">
        <HistoryEntryRow
          v-for="e in entries"
          :key="e.key"
          :entry="e"
          :locale="locale"
          :use24="options.use24HoursFormat"
          :time-before-title="options.timeBeforeTitle"
          :removable="false"
          :show-domain="false"
          @toggle="openEntry(e.url)"
        />
        <p v-if="!entries.length" class="dbh-muted my-8 text-center">{{ history.searching.value ? t('search_empty') : t('history_date_empty') }}</p>
      </div>
      <div v-show="tab === 'closed'">
        <p v-if="closed.loading.value" class="dbh-muted my-8 text-center">{{ t('closed_loading') }}</p>
        <p v-else-if="closed.error.value" class="dbh-muted my-8 text-center">{{ t('closed_error') }}</p>
        <template v-else>
          <ClosedRow
            v-for="s in closed.sessions.value"
            :key="s.type + '-' + s.sessionId"
            :session="s"
            :locale="locale"
            :use24="options.use24HoursFormat"
            @restore="closed.restore(s.sessionId)"
          />
          <p v-if="!closed.sessions.value.length" class="dbh-muted my-8 text-center">{{ t('closed_empty') }}</p>
        </template>
      </div>
    </div>
    <a class="dbh-more flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 border-t border-[var(--border)] text-[13px] font-medium text-[var(--link)] hover:bg-[var(--hover)]" href="#" @click.prevent="openHistory">
      {{ t('history_view_more') }}
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </a>
  </div>
</template>
