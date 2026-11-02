<script setup lang="ts">
import { computed } from 'vue'
import { t } from '@/lib/i18n'

const props = defineProps<{ counts: number[] }>()
const max = computed(() => Math.max(1, ...props.counts))
const height = (n: number): number => (n ? Math.round(6 + (n / max.value) * 34) : 2)
</script>

<template>
  <div class="dbh-chart w-60 flex-none" role="img" :aria-label="t('history_activity_chart')">
    <div class="flex h-10 items-end gap-0.5">
      <span v-for="(n, i) in counts" :key="i" class="flex-1 rounded-sm" :style="{ height: height(n) + 'px', background: n ? 'var(--link)' : 'var(--border)' }"></span>
    </div>
    <div class="mono dbh-muted mt-1 flex justify-between text-[11px]"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
  </div>
</template>
