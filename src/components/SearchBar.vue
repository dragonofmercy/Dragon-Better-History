<script setup lang="ts">
import { ref, watch } from 'vue'

defineProps<{ placeholder: string }>()
const emit = defineEmits<{ (e: 'search', q: string): void; (e: 'clear'): void }>()

const value = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

watch(value, (v) => {
  if (timer) clearTimeout(timer)
  if (v.trim() === '') { emit('clear'); return }
  timer = setTimeout(() => emit('search', v), 500)
})

function clear(): void { value.value = '' }
defineExpose({ clear })
</script>

<template>
  <div class="relative">
    <input v-model="value" :placeholder="placeholder" type="text" spellcheck="false" autocapitalize="off" class="w-full rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800" />
    <button v-if="value" class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600" aria-label="clear" @click="clear">x</button>
  </div>
</template>
