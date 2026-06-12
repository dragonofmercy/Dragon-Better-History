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
    <input v-model="value" :placeholder="placeholder" type="text" spellcheck="false" autocapitalize="off" class="dbh-input w-full rounded-md px-3 py-1.5 text-sm" />
    <button v-if="value" class="dbh-rm absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center" aria-label="clear" @click="clear">
      <svg viewBox="0 0 15 15" width="11" height="11" fill="currentColor"><path d="M14.1 1.6L8.2 7.5l5.9 5.9-.7.7L7.5 8.2l-5.9 5.9-.7-.7L6.8 7.5.9 1.6l.7-.7L7.5 6.8 13.4.9z" /></svg>
    </button>
  </div>
</template>
