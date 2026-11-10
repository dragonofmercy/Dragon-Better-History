<script setup lang="ts">
import { Search, X } from '@lucide/vue'
import { onMounted, ref, watch } from 'vue'
import { t } from '@/lib/i18n'

const emit = defineEmits<{ (e: 'search', q: string): void; (e: 'clear'): void }>()

const input = ref<HTMLInputElement | null>(null)
const value = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

watch(value, (v) => {
  if (timer) clearTimeout(timer)
  if (v.trim() === '') { emit('clear'); return }
  timer = setTimeout(() => emit('search', v), 100)
})

onMounted(() => input.value?.focus())

function clear(): void { value.value = '' }
defineExpose({ clear })
</script>

<template>
  <label class="dbh-input dbh-muted flex h-9 min-w-0 max-w-[720px] items-center gap-2.5 rounded-lg px-3.5">
    <Search :size="16" />
    <input ref="input" v-model="value" :placeholder="t('search_placeholder')" :aria-label="t('search_placeholder')" type="text" spellcheck="false" autocapitalize="off" class="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none" style="color: var(--text)" />
    <button v-if="value" type="button" class="dbh-rm" :aria-label="t('search_clear')" @click.prevent="clear">
      <X :size="11" />
    </button>
  </label>
</template>
