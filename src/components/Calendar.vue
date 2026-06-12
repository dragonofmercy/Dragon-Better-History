<script setup lang="ts">
import { computed, ref } from 'vue'
import { startOfDay, normalizeLocale } from '@/lib/dates'

const props = defineProps<{ locale: string; today: Date; minYear: number }>()
const emit = defineEmits<{ (e: 'select', d: Date): void }>()

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

function prev(): void {
  const m = view.value.month - 1
  view.value = m < 0 ? { year: view.value.year - 1, month: 11 } : { year: view.value.year, month: m }
}
function next(): void {
  const m = view.value.month + 1
  view.value = m > 11 ? { year: view.value.year + 1, month: 0 } : { year: view.value.year, month: m }
}
function pick(c: Cell): void {
  if (c.disabled) return
  emit('select', startOfDay(c.date))
}
function isToday(ts: number): boolean { return ts === startOfDay(props.today).getTime() }
</script>

<template>
  <div class="text-sm">
    <div class="mb-2 flex items-center justify-between">
      <button :disabled="!canPrev" class="dbh-nav px-2 disabled:opacity-30" @click="prev">&lsaquo;</button>
      <span class="font-medium capitalize">{{ monthLabel }}</span>
      <button :disabled="!canNext" class="dbh-nav px-2 disabled:opacity-30" @click="next">&rsaquo;</button>
    </div>
    <div class="dbh-faint grid grid-cols-7 gap-0.5 text-center text-xs">
      <span v-for="w in weekdayLabels" :key="w" data-weekday>{{ w }}</span>
    </div>
    <div class="grid grid-cols-7 gap-0.5 text-center">
      <button v-for="c in cells" :key="c.ts" data-day :data-ts="c.ts" :disabled="c.disabled" class="dbh-cal-day aspect-square rounded-md text-xs disabled:opacity-25" :class="[c.inMonth ? '' : 'is-out', isToday(c.ts) ? 'is-today' : '']" @click="pick(c)">{{ c.date.getDate() }}</button>
    </div>
  </div>
</template>
