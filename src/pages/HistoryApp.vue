<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useOptions, type Options } from '@/composables/useOptions'
import { useI18n } from '@/composables/useI18n'
import { useTheme } from '@/composables/useTheme'
import { useHistory, type HistoryEntry } from '@/composables/useHistory'
import { useSelection } from '@/composables/useSelection'
import { startOfDay } from '@/lib/dates'
import Calendar from '@/components/Calendar.vue'
import SearchBar from '@/components/SearchBar.vue'
import ConfirmBar from '@/components/ConfirmBar.vue'
import HistoryDay from '@/components/HistoryDay.vue'
import OptionsModal from '@/components/OptionsModal.vue'

const { options, load, save } = useOptions()
const { t, locale } = useI18n()
useTheme(() => options.theme)
const history = useHistory()
const selection = useSelection()

const now = new Date()
const today = startOfDay(now)
const minYear = now.getFullYear() - 3
const optionsOpen = ref(false)
const query = ref('')
const searchBar = ref<InstanceType<typeof SearchBar> | null>(null)

const orderedKeys = computed(() => history.days.value.flatMap((g) => g.entries.map((e) => e.key)))
const totalCount = computed(() => orderedKeys.value.length)
const calendarKey = ref(0)
const selectedDay = ref<Date | null>(today)
const mainEl = ref<HTMLElement | null>(null)

function scrollMainTop(): void { mainEl.value?.scrollTo({ top: 0 }) }

const mq = window.matchMedia('(prefers-color-scheme: dark)')
const isDark = computed(() => options.theme === 'dark' || (options.theme === 'system' && mq.matches))
const themeTitle = computed(() => t(isDark.value ? 'options_theme_light' : 'options_theme_dark'))
function toggleTheme(): void { save({ theme: isDark.value ? 'light' : 'dark' }) }

onMounted(async () => {
  await load()
  await history.getDay(today)
})

function onSelectDay(d: Date): void { query.value = ''; searchBar.value?.clear(); selection.clear(); selectedDay.value = startOfDay(d); history.getDay(d); scrollMainTop() }
function onToday(): void { onSelectDay(today); calendarKey.value++ }
function onSearch(q: string): void { query.value = q; selection.clear(); selectedDay.value = null; history.search(q, today); scrollMainTop() }
function onClear(): void { query.value = ''; selection.clear(); selectedDay.value = today; history.getDay(today); scrollMainTop() }

function onToggle(entry: HistoryEntry, ev: MouseEvent): void {
  if (ev.shiftKey) selection.range(entry.key, orderedKeys.value)
  else selection.toggle(entry.key)
}

async function onRemove(entry: HistoryEntry): Promise<void> { await history.remove(entry.url); selection.clear() }

async function removeSelected(): Promise<void> {
  const keys = new Set(selection.selected.value)
  const urls = history.days.value.flatMap((g) => g.entries).filter((e) => keys.has(e.key)).map((e) => e.url)
  for (const url of new Set(urls)) await history.remove(url)
  selection.clear()
}

async function onSave(value: Options): Promise<void> { await save(value); optionsOpen.value = false; location.reload() }

function onKeydown(e: KeyboardEvent): void {
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT') return
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); selection.selectAll(orderedKeys.value) }
  else if (e.key === 'Delete' && selection.count.value > 0) { void removeSelected() }
}
</script>

<template>
  <div class="compact dbh-root flex h-screen flex-col" tabindex="0" @keydown="onKeydown" @click.self="selection.clear()">
    <header class="dbh-headerbar flex items-center gap-3 px-4 py-2.5">
      <h1 class="text-base font-bold tracking-tight">{{ t('application_title') }}</h1>
      <div class="ml-auto flex items-center gap-3">
        <ConfirmBar :count="selection.count.value" :selected-label="t('history_remove_confirm_count')" :delete-label="t('btn_delete')" :cancel-label="t('btn_cancel')" @confirm="removeSelected" @cancel="selection.clear()" />
        <div class="flex items-center gap-1">
          <button class="dbh-iconbtn rounded-md p-2" :title="t('btn_options')" @click="optionsOpen = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
          </button>
          <button class="dbh-iconbtn rounded-md p-2" :title="themeTitle" @click="toggleTheme">
            <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
          </button>
        </div>
      </div>
    </header>
    <div class="flex min-h-0 flex-1">
      <aside class="dbh-panel flex w-72 shrink-0 flex-col gap-4 overflow-y-auto p-4">
        <SearchBar ref="searchBar" :placeholder="t('search_placeholder')" @search="onSearch" @clear="onClear" />
        <div class="dbh-raised rounded-lg p-3">
          <Calendar :key="calendarKey" :locale="locale" :today="today" :selected="selectedDay" :min-year="minYear" @select="onSelectDay" />
          <a class="dbh-link mt-3 block border-t border-[color:var(--border)] pt-2 text-center text-sm" @click="onToday">{{ t('datepicker_go_today') }}</a>
        </div>
        <footer class="dbh-faint mt-auto flex flex-col items-start gap-1 text-xs">
          <img src="/icons/dom_logo.png" alt="" class="h-8 w-auto" />
          <div>Created by DragonOfMercy</div>
          <a href="https://github.com/dragonofmercy" target="_blank" class="dbh-link">https://github.com/dragonofmercy</a>
        </footer>
      </aside>
      <main ref="mainEl" class="flex-1 overflow-y-auto">
        <div class="px-6 py-6">
          <h1 v-if="history.searching.value" class="mb-3 text-xl font-semibold">{{ t('search_display') }} "{{ query }}"</h1>
          <p v-if="history.searching.value && totalCount > 0" class="dbh-muted mb-3 text-sm">{{ t('search_found', String(totalCount)) }}</p>
          <HistoryDay v-for="g in history.days.value" :key="g.dayKey" :group="g" :locale="locale" :use24="options.use24HoursFormat" :time-before-title="options.timeBeforeTitle" :empty-label="t('history_date_empty')" :remove-label="t('history_remove_single')" :is-selected="selection.isSelected" @toggle="onToggle" @remove="onRemove" />
          <p v-if="!history.days.value.length" class="dbh-muted text-sm">{{ t(history.searching.value ? 'search_empty' : 'history_date_empty') }}</p>
        </div>
      </main>
    </div>
    <OptionsModal :open="optionsOpen" :options="options" :t="t" @close="optionsOpen = false" @save="onSave" />
  </div>
</template>
