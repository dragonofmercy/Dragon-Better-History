<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { startOfDay, normalizeLocale } from '@/lib/dates'
import { t } from '@/lib/i18n'

const props = defineProps<{ locale: string; today: Date; minYear: number; selected?: Date | null; density?: Map<number, 1 | 2 | 3> }>()
const emit = defineEmits<{ (e: 'select', d: Date): void; (e: 'month-change', year: number, month: number): void }>()

const view = ref({ year: props.today.getFullYear(), month: props.today.getMonth() })

const firstDayOfWeek = computed<number>(() => {
  try {
    const info = (new Intl.Locale(normalizeLocale(props.locale)) as unknown as { weekInfo?: { firstDay?: number } }).weekInfo
    return info?.firstDay ?? 1
  } catch { return 1 }
})

const weekdayLabels = computed<string[]>(() => {
  const fmt = new Intl.DateTimeFormat(normalizeLocale(props.locale), { weekday: 'short' })
  const labels: string[] = []
  for (let i = 0; i < 7; i++) {
    const isoDay = (firstDayOfWeek.value - 1 + i) % 7
    labels.push(fmt.format(new Date(2024, 0, 1 + isoDay)))
  }
  return labels
})

const monthLabel = computed(() => new Intl.DateTimeFormat(normalizeLocale(props.locale), { month: 'long', year: 'numeric' }).format(new Date(view.value.year, view.value.month, 1)))

interface Cell { date: Date; ts: number; inMonth: boolean; disabled: boolean }

const cells = computed<Cell[]>(() => {
  const first = new Date(view.value.year, view.value.month, 1)
  const firstWeekdayMon = (first.getDay() + 6) % 7
  const offset = (firstWeekdayMon - (firstDayOfWeek.value - 1) + 7) % 7
  const start = new Date(view.value.year, view.value.month, 1 - offset)
  const todayMid = startOfDay(props.today).getTime()
  const minTs = new Date(props.minYear, 0, 1).getTime()
  const out: Cell[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    const ts = startOfDay(d).getTime()
    out.push({ date: d, ts, inMonth: d.getMonth() === view.value.month, disabled: ts > todayMid || ts < minTs })
  }
  return out
})

const canPrev = computed(() => view.value.year > props.minYear || view.value.month > 0)
const canNext = computed(() => new Date(view.value.year, view.value.month + 1, 1) <= props.today)

// ponytail: density reloads only on month change, so deletions show after the next navigation
function emitMonth(): void { emit('month-change', view.value.year, view.value.month) }
onMounted(emitMonth)

function prev(): void {
  const m = view.value.month - 1
  view.value = m < 0 ? { year: view.value.year - 1, month: 11 } : { year: view.value.year, month: m }
  emitMonth()
}
function next(): void {
  const m = view.value.month + 1
  view.value = m > 11 ? { year: view.value.year + 1, month: 0 } : { year: view.value.year, month: m }
  emitMonth()
}
function pick(c: Cell): void {
  if (c.disabled) return
  emit('select', startOfDay(c.date))
}
function level(ts: number): string { const l = props.density?.get(ts); return l ? `is-h${l}` : '' }
function isToday(ts: number): boolean { return ts === startOfDay(props.today).getTime() }
function isSelected(ts: number): boolean { return props.selected != null && startOfDay(props.selected).getTime() === ts }
</script>

<template>
  <div class="text-sm">
    <div class="mb-2 flex items-center justify-between">
      <span class="font-bold capitalize">{{ monthLabel }}</span>
      <span class="flex gap-1">
        <button data-prev :disabled="!canPrev" :aria-label="t('calendar_prev_month')" class="dbh-nav rounded px-1.5 disabled:opacity-30" @click="prev">
          <ChevronLeft :size="16" />
        </button>
        <button data-next :disabled="!canNext" :aria-label="t('calendar_next_month')" class="dbh-nav rounded px-1.5 disabled:opacity-30" @click="next">
          <ChevronRight :size="16" />
        </button>
      </span>
    </div>
    <div class="dbh-faint grid grid-cols-7 gap-0.5 text-center text-xs">
      <span v-for="w in weekdayLabels" :key="w" data-weekday>{{ w }}</span>
    </div>
    <div class="grid grid-cols-7 gap-0.5 text-center">
      <button v-for="c in cells" :key="c.ts" data-day :data-ts="c.ts" :disabled="c.disabled" class="dbh-cal-day aspect-square rounded-md text-xs disabled:opacity-25" :class="[c.inMonth ? '' : 'is-out', level(c.ts), isToday(c.ts) ? 'is-today' : '', isSelected(c.ts) ? 'is-selected' : '']" @click="pick(c)">{{ c.date.getDate() }}</button>
    </div>
  </div>
</template>
