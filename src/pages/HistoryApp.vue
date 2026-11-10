<script setup lang="ts">
import { Sun, Moon, SlidersHorizontal, ArrowDownNarrowWide, ArrowUpNarrowWide } from '@lucide/vue'
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useOptions, type GroupMode } from '@/composables/useOptions'
import { useTheme } from '@/composables/useTheme'
import { useHistory, orderDays, domainOf, type HistoryEntry } from '@/composables/useHistory'
import { useSelection } from '@/composables/useSelection'
import { useMonthDensity } from '@/composables/useMonthDensity'
import { startOfDay, endOfDay, formatDayHeading } from '@/lib/dates'
import { siteCounts, hourHistogram } from '@/lib/dayStats'
import { t, locale } from '@/lib/i18n'
import Calendar from '@/components/Calendar.vue'
import SearchBar from '@/components/SearchBar.vue'
import HistoryDay from '@/components/HistoryDay.vue'
import SiteList from '@/components/SiteList.vue'
import ActivityChart from '@/components/ActivityChart.vue'
import OptionsModal from '@/components/OptionsModal.vue'
import AppWordmark from '@/components/AppWordmark.vue'

const logo = '/icons/dom_logo.png'
const groupModes: { mode: GroupMode; label: string }[] = [
  { mode: 'none', label: 'group_list' },
  { mode: 'title', label: 'options_group_title' },
  { mode: 'domain', label: 'options_group_domain' }
]

const { options, load, save } = useOptions()
const { isDark } = useTheme(() => options.theme)
const history = useHistory()
const selection = useSelection()
const density = useMonthDensity()

const now = new Date()
const today = ref(startOfDay(now))
const minYear = now.getFullYear() - 3
const optionsOpen = ref(false)
const query = ref('')
const searchBar = ref<InstanceType<typeof SearchBar> | null>(null)
const selectedDay = ref<Date | null>(today.value)
const expanded = useSelection()
const siteFilter = ref<string | null>(null)
const removeFailed = ref(false)

const dayEntries = computed(() => history.days.value.flatMap((g) => g.entries))
const sites = computed(() => siteCounts(dayEntries.value))
const histogram = computed(() => hourHistogram(dayEntries.value))
const filteredDays = computed(() => {
  const f = siteFilter.value
  if (!f) return history.days.value
  return history.days.value.map((g) => ({ ...g, entries: g.entries.filter((e) => domainOf(e.url) === f) })).filter((g) => g.entries.length > 0)
})
const displayDays = computed(() => orderDays(filteredDays.value, options.sortOldestFirst))
const orderedKeys = computed(() => displayDays.value.flatMap((g) => g.entries.map((e) => e.key)))
const totalCount = computed(() => orderedKeys.value.length)
const summary = computed(() => t('history_summary', [String(totalCount.value), String(new Set(displayDays.value.flatMap((g) => g.entries.map((e) => domainOf(e.url))).filter(Boolean)).size)]))
const heading = computed(() => (history.searching.value ? `${t('search_display')} "${query.value}"` : siteFilter.value ?? (selectedDay.value ? formatDayHeading(selectedDay.value, locale) : '')))
const emptyMessage = computed(() => (history.searching.value ? 'search_empty' : 'history_date_empty'))

// A removal can empty the filtered domain: drop the filter so the list never shows a dead state.
watch(dayEntries, (all) => { if (siteFilter.value && !all.some((e) => domainOf(e.url) === siteFilter.value)) siteFilter.value = null })

const mainEl = ref<HTMLElement | null>(null)

const themeTitle = computed(() => t(isDark.value ? 'options_theme_light' : 'options_theme_dark'))
function toggleTheme(): void { save({ theme: isDark.value ? 'light' : 'dark' }) }

const sortLabel = computed(() => t(options.sortOldestFirst ? 'sort_oldest_label' : 'sort_newest_label'))
function toggleSort(): void { save({ sortOldestFirst: !options.sortOldestFirst }) }

function onSite(domain: string): void { siteFilter.value = siteFilter.value === domain ? null : domain; selection.clear() }
function onMonth(year: number, month: number): void { density.load(year, month).catch(() => {}) }

// The page can stay open past midnight: roll `today` over so the new day becomes selectable and searchable.
let midnightTimer: ReturnType<typeof setTimeout> | undefined
function scheduleMidnight(): void {
  midnightTimer = setTimeout(() => { today.value = startOfDay(new Date()); scheduleMidnight() }, endOfDay(today.value).getTime() + 1 - Date.now())
}
onUnmounted(() => { window.removeEventListener('keydown', onKeydown); clearTimeout(midnightTimer) })

onMounted(() => { window.addEventListener('keydown', onKeydown); scheduleMidnight(); return Promise.all([load(), history.getDay(today.value)]) })

function resetView(): void { removeFailed.value = false; siteFilter.value = null; expanded.clear(); selection.clear(); mainEl.value?.scrollTo({ top: 0 }) }
function onSelectDay(d: Date): void { resetView(); query.value = ''; searchBar.value?.clear(); selectedDay.value = startOfDay(d); history.getDay(d) }
function onToday(): void { onSelectDay(today.value) }
// The day stays selected until the results are on screen; a superseded search must not deselect a day picked meanwhile.
async function onSearch(q: string): Promise<void> { resetView(); query.value = q; if (await history.search(q, today.value)) selectedDay.value = null }
function onClear(): void { if (query.value) onSelectDay(today.value) }

function onToggle(entry: HistoryEntry, ev: MouseEvent | KeyboardEvent): void {
  if (ev.shiftKey) selection.range(entry.key, orderedKeys.value)
  else selection.toggle(entry.key)
}

async function removeUrls(urls: string[]): Promise<void> { removeFailed.value = (await history.remove(urls)) > 0; selection.clear() }

async function onRemove(entry: HistoryEntry): Promise<void> { await removeUrls([entry.url]) }

async function removeSelected(): Promise<void> {
  const keys = selection.selected.value
  await removeUrls(dayEntries.value.filter((e) => keys.has(e.key)).map((e) => e.url))
}

// Bound on window: after a deletion the focus falls back to <body>, outside any element of the app.
function onKeydown(e: KeyboardEvent): void {
  if (optionsOpen.value) return
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT') return
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); selection.selectAll(orderedKeys.value) }
  else if (e.key === 'Delete' && selection.count.value > 0) { void removeSelected() }
}
</script>

<template>
  <div class="compact dbh-root flex h-screen flex-col" :class="{ 'is-dense': options.dense }" @click.self="selection.clear()">
    <header class="dbh-headerbar flex flex-wrap items-center gap-4 px-6 py-3.5">
      <h1 class="w-[296px] flex-none"><AppWordmark /></h1>
      <SearchBar ref="searchBar" class="flex-1 basis-80" @search="onSearch" @clear="onClear" />
      <div class="ml-auto flex items-center gap-1">
        <button class="dbh-iconbtn flex h-10 w-10 items-center justify-center rounded-lg" :title="themeTitle" :aria-label="themeTitle" @click="toggleTheme">
          <Sun v-if="isDark" :size="18" />
          <Moon v-else :size="18" />
        </button>
        <button class="dbh-iconbtn flex h-10 w-10 items-center justify-center rounded-lg" :title="t('btn_options')" :aria-label="t('btn_options')" @click="optionsOpen = true">
          <SlidersHorizontal :size="18" />
        </button>
      </div>
    </header>
    <div class="flex min-h-0 flex-1">
      <aside class="dbh-panel flex w-[304px] shrink-0 flex-col gap-7 overflow-y-auto p-6">
        <div class="dbh-card">
          <Calendar :locale="locale" :today="today" :selected="selectedDay" :min-year="minYear" :density="density.levels.value" @select="onSelectDay" @month-change="onMonth" />
          <button type="button" class="dbh-link mt-3 block w-full border-t border-[color:var(--border)] pt-2 text-center text-sm" @click="onToday">{{ t('datepicker_go_today') }}</button>
        </div>
        <SiteList v-if="!history.searching.value" :sites="sites" :active="siteFilter" @pick="onSite" />
        <footer class="dbh-muted mt-auto flex flex-col gap-2 text-xs">
          <img :src="logo" alt="DragonOfMercy" class="h-12 w-12" />
          <div>
            <div>{{ t('footer_created_by', 'DragonOfMercy') }}</div>
            <a href="https://github.com/dragonofmercy" target="_blank" class="dbh-link">https://github.com/dragonofmercy</a>
          </div>
        </footer>
      </aside>
      <main ref="mainEl" class="min-w-0 flex-1 overflow-y-auto">
        <div class="px-8 pb-8 pt-6">
          <div class="mb-6 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div class="min-w-[280px] flex-1">
              <h2 class="text-[30px] font-semibold leading-tight tracking-tight">{{ heading }}</h2>
              <p v-if="history.searching.value && totalCount > 0" class="dbh-muted mt-1.5">{{ t('search_found', String(totalCount)) }}</p>
              <p v-else-if="!history.searching.value" class="dbh-muted mt-1.5">{{ summary }}</p>
            </div>
            <ActivityChart v-if="!history.searching.value" :counts="histogram" />
          </div>
          <div class="mb-4 flex flex-wrap items-center gap-2">
            <div v-if="!history.searching.value" role="group" class="dbh-segs">
              <button v-for="g in groupModes" :key="g.mode" class="dbh-seg" :class="{ 'is-on': options.groupMode === g.mode }" :aria-pressed="options.groupMode === g.mode" @click="save({ groupMode: g.mode })">{{ t(g.label) }}</button>
            </div>
            <button class="dbh-seg dbh-sort ml-auto flex items-center gap-1.5" @click="toggleSort">
              <ArrowDownNarrowWide v-if="options.sortOldestFirst" :size="14" />
              <ArrowUpNarrowWide v-else :size="14" />
              {{ sortLabel }}
            </button>
          </div>
          <p v-if="removeFailed" role="alert" class="mb-4 rounded-lg border border-[color:var(--border)] px-3.5 py-2.5 text-sm" style="color: #da373c">{{ t('history_remove_error') }}</p>
          <HistoryDay v-for="g in displayDays" :key="g.dayKey" :group="g" :use24="options.use24HoursFormat" :time-before-title="options.timeBeforeTitle" :group-mode="history.searching.value ? 'none' : options.groupMode" :expanded="expanded.selected.value" :is-selected="selection.isSelected" :flat="history.searching.value" @toggle="onToggle" @remove="onRemove" @toggle-expand="expanded.toggle" @remove-group="selection.selectAll" />
          <p v-if="!displayDays.length" class="dbh-muted border-t border-[color:var(--border)] py-12 text-center">{{ t(emptyMessage) }}</p>
          <div v-if="selection.count.value > 0" class="sticky bottom-5 mt-4 flex justify-center">
            <div role="status" class="flex items-center gap-3 rounded-xl py-2 pl-[18px] pr-2 shadow-lg" style="background: var(--raised); border: 1px solid var(--border)">
              <span><strong class="mono font-medium">{{ selection.count.value }}</strong> {{ t('history_remove_confirm_count') }}</span>
              <button class="dbh-iconbtn h-9 rounded-lg px-3" @click="selection.clear()">{{ t('btn_cancel') }}</button>
              <button class="dbh-danger h-9 rounded-lg px-3.5" @click="removeSelected">{{ t('btn_delete') }}</button>
            </div>
          </div>
        </div>
      </main>
    </div>
    <OptionsModal :open="optionsOpen" :options="options" @close="optionsOpen = false" @change="save" />
  </div>
</template>
