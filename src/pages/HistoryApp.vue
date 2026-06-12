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

onMounted(async () => {
  await load()
  await history.getDay(today)
})

function onSelectDay(d: Date): void { query.value = ''; searchBar.value?.clear(); selection.clear(); history.getDay(d) }
function onToday(): void { onSelectDay(today); calendarKey.value++ }
function onSearch(q: string): void { query.value = q; selection.clear(); history.search(q, today) }
function onClear(): void { query.value = ''; selection.clear(); history.getDay(today) }

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
  <div class="compact dbh-root flex h-screen" tabindex="0" @keydown="onKeydown" @click.self="selection.clear()">
    <aside class="dbh-panel flex w-72 shrink-0 flex-col gap-4 p-4">
      <h1 class="text-lg font-bold">{{ t('application_title') }}</h1>
      <SearchBar ref="searchBar" :placeholder="t('search_placeholder')" @search="onSearch" @clear="onClear" />
      <Calendar :key="calendarKey" :locale="locale" :today="today" :min-year="minYear" @select="onSelectDay" />
      <a class="dbh-link text-sm" @click="onToday">{{ t('datepicker_go_today') }}</a>
      <a class="dbh-link text-sm" @click="optionsOpen = true">{{ t('btn_options') }}</a>
      <footer class="dbh-faint mt-auto flex flex-col items-start gap-1 text-xs">
        <img src="/icons/dom_logo.png" alt="" class="h-8 w-auto" />
        <div>Created by DragonOfMercy</div>
        <a href="https://github.com/dragonofmercy" target="_blank" class="dbh-link">https://github.com/dragonofmercy</a>
      </footer>
    </aside>
    <main class="flex-1 overflow-y-auto p-6">
      <ConfirmBar :count="selection.count.value" :selected-label="t('history_remove_confirm_count')" :delete-label="t('btn_delete')" :cancel-label="t('btn_cancel')" class="mb-4" @confirm="removeSelected" @cancel="selection.clear()" />
      <h1 v-if="history.searching.value" class="mb-3 text-xl font-semibold">{{ t('search_display') }} "{{ query }}"</h1>
      <p v-if="history.searching.value && totalCount > 0" class="dbh-muted mb-3 text-sm">{{ t('search_found', String(totalCount)) }}</p>
      <HistoryDay v-for="g in history.days.value" :key="g.dayKey" :group="g" :locale="locale" :use24="options.use24HoursFormat" :time-before-title="options.timeBeforeTitle" :empty-label="t('history_date_empty')" :remove-label="t('history_remove_single')" :is-selected="selection.isSelected" @toggle="onToggle" @remove="onRemove" />
      <p v-if="!history.days.value.length" class="dbh-muted text-sm">{{ t(history.searching.value ? 'search_empty' : 'history_date_empty') }}</p>
    </main>
    <OptionsModal :open="optionsOpen" :options="options" :t="t" @close="optionsOpen = false" @save="onSave" />
  </div>
</template>
