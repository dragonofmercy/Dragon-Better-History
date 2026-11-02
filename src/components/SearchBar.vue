<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { t } from '@/lib/i18n'

const emit = defineEmits<{ (e: 'search', q: string): void; (e: 'clear'): void }>()

const input = ref<HTMLInputElement | null>(null)
const value = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

watch(value, (v) => {
  if (timer) clearTimeout(timer)
  if (v.trim() === '') { emit('clear'); return }
  timer = setTimeout(() => emit('search', v), 500)
})

onMounted(() => input.value?.focus())

function clear(): void { value.value = '' }
defineExpose({ clear })
</script>

<template>
  <label class="dbh-input dbh-muted flex h-11 min-w-0 max-w-[720px] items-center gap-2.5 rounded-[10px] px-3.5">
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
    <input ref="input" v-model="value" :placeholder="t('search_placeholder')" :aria-label="t('search_placeholder')" type="text" spellcheck="false" autocapitalize="off" class="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none" style="color: var(--text)" />
    <button v-if="value" type="button" class="dbh-rm !opacity-100" aria-label="clear" @click.prevent="clear">
      <svg viewBox="0 0 15 15" width="11" height="11" fill="currentColor"><path d="M14.1 1.6L8.2 7.5l5.9 5.9-.7.7L7.5 8.2l-5.9 5.9-.7-.7L6.8 7.5.9 1.6l.7-.7L7.5 6.8 13.4.9z" /></svg>
    </button>
  </label>
</template>
