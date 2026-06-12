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
    <button v-if="value" class="dbh-rm absolute right-2 top-1/2 -translate-y-1/2" aria-label="clear" @click="clear">x</button>
  </div>
</template>
