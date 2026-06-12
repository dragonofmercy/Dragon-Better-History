<script setup lang="ts">
defineProps<{ count: number; selectedLabel: string; deleteLabel: string; cancelLabel: string }>()
defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()
</script>

<template>
  <div v-if="count > 0" class="dbh-card flex items-center gap-2 rounded-md px-3 py-2 text-sm">
    <span class="font-semibold tabular-nums">{{ count }}</span>
    <span>{{ selectedLabel }}</span>
    <button class="dbh-btn-primary ml-auto rounded-md px-3 py-1" @click="$emit('confirm')">{{ deleteLabel }}</button>
    <button class="dbh-btn-ghost rounded-md px-3 py-1" @click="$emit('cancel')">{{ cancelLabel }}</button>
  </div>
</template>
