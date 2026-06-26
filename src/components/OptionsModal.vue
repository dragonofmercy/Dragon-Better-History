<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Options } from '@/composables/useOptions'

const props = defineProps<{ open: boolean; options: Options; t: (key: string) => string }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'save', value: Options): void }>()

const form = reactive<Options>({ ...props.options })

watch(() => props.open, (o) => { if (o) Object.assign(form, props.options) })
</script>

<template>
  <div v-if="open" class="compact fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="emit('close')">
    <div class="dbh-card w-80 rounded-lg border-0 p-5">
      <h1 class="mb-4 text-lg font-semibold">{{ t('btn_options') }}</h1>
      <label class="mb-3 flex h-9 items-center justify-between">
        <span>{{ t('options_time_12_24') }}</span>
        <input v-model="form.use24HoursFormat" type="checkbox" class="dbh-switch" />
      </label>
      <label class="mb-3 flex h-9 items-center justify-between">
        <span>{{ t('options_display_time_before_title') }}</span>
        <input v-model="form.timeBeforeTitle" type="checkbox" class="dbh-switch" />
      </label>
      <label class="mb-3 flex h-9 items-center justify-between">
        <span>{{ t('options_group_consecutive') }}</span>
        <input v-model="form.groupConsecutive" type="checkbox" class="dbh-switch" />
      </label>
      <label class="mb-5 flex h-9 items-center justify-between">
        <span>{{ t('options_popup_nb_items') }}</span>
        <input v-model.number="form.popupNbItems" type="number" min="1" class="dbh-input h-9 w-20 rounded-md px-3 text-sm" />
      </label>
      <div class="flex justify-end gap-2">
        <button class="dbh-btn-primary h-9 rounded-md px-4 text-sm" @click="emit('save', { ...form })">{{ t('btn_save') }}</button>
        <button class="dbh-btn-ghost h-9 rounded-md px-4 text-sm" @click="emit('close')">{{ t('btn_cancel') }}</button>
      </div>
    </div>
  </div>
</template>
