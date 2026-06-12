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
  <div v-if="open" class="compact fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="emit('close')">
    <div class="dbh-card w-80 rounded-lg p-5 shadow-xl">
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
        <input v-model.number="form.popupNbItems" type="number" min="1" class="dbh-input w-20 rounded-md px-2 py-1" />
      </label>
      <label class="mb-4 flex items-center justify-between">
        <span>{{ t('options_theme') }}</span>
        <select v-model="form.theme" class="dbh-input rounded-md px-2 py-1">
          <option v-for="th in themes" :key="th" :value="th">{{ t('options_theme_' + th) }}</option>
        </select>
      </label>
      <div class="flex justify-end gap-2">
        <button class="dbh-btn-primary rounded-md px-3 py-1" @click="emit('save', { ...form })">{{ t('btn_save') }}</button>
        <button class="dbh-btn-ghost rounded-md px-3 py-1" @click="emit('close')">{{ t('btn_cancel') }}</button>
      </div>
    </div>
  </div>
</template>
