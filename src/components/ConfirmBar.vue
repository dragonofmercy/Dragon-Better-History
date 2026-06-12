<script setup lang="ts">
defineProps<{ count: number; selectedLabel: string; deleteLabel: string; cancelLabel: string }>()
defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()
</script>

<template>
  <div v-if="count > 0" class="flex items-center gap-2 rounded bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800">
    <span class="font-semibold tabular-nums">{{ count }}</span>
    <span>{{ selectedLabel }}</span>
    <button class="ml-auto rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700" @click="$emit('confirm')">{{ deleteLabel }}</button>
    <button class="rounded bg-neutral-300 px-3 py-1 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500" @click="$emit('cancel')">{{ cancelLabel }}</button>
  </div>
</template>
