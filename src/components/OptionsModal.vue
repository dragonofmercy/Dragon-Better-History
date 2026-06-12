<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Options, Theme } from '@/composables/useOptions'

const props = defineProps<{ open: boolean; options: Options; t: (key: string) => string }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'save', value: Options): void }>()

const form = reactive<Options>({ ...props.options })
const themes: Theme[] = ['system', 'light', 'dark']

watch(() => props.open, (o) => { if (o) Object.assign(form, props.options) })
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="emit('close')">
    <div class="w-80 rounded-lg bg-white p-5 text-neutral-800 shadow-xl dark:bg-neutral-800 dark:text-neutral-200">
      <h1 class="mb-4 text-lg font-semibold">{{ t('btn_options') }}</h1>
      <label class="mb-3 flex items-center justify-between">
        <span>{{ t('options_time_12_24') }}</span>
        <input v-model="form.use24HoursFormat" type="checkbox" />
      </label>
      <label class="mb-3 flex items-center justify-between">
        <span>{{ t('options_display_time_before_title') }}</span>
        <input v-model="form.timeBeforeTitle" type="checkbox" />
      </label>
      <label class="mb-3 flex items-center justify-between">
        <span>{{ t('options_popup_nb_items') }}</span>
        <input v-model.number="form.popupNbItems" type="number" min="1" class="w-20 rounded border border-neutral-300 px-2 py-1 dark:border-neutral-600 dark:bg-neutral-700" />
      </label>
      <label class="mb-4 flex items-center justify-between">
        <span>{{ t('options_theme') }}</span>
        <select v-model="form.theme" class="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-600 dark:bg-neutral-700">
          <option v-for="th in themes" :key="th" :value="th">{{ t('options_theme_' + th) }}</option>
        </select>
      </label>
      <div class="flex justify-end gap-2">
        <button class="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700" @click="emit('save', { ...form })">{{ t('btn_save') }}</button>
        <button class="rounded bg-neutral-300 px-3 py-1 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500" @click="emit('close')">{{ t('btn_cancel') }}</button>
      </div>
    </div>
  </div>
</template>
