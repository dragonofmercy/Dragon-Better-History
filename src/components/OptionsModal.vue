<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { GroupMode, Options, Theme } from '@/composables/useOptions'
import { t, locale } from '@/lib/i18n'
import { formatTime } from '@/lib/dates'
import { faviconUrl } from '@/lib/chrome'

const props = defineProps<{ open: boolean; options: Options }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'change', value: Partial<Options>): void }>()

const themes: { value: Theme; label: string }[] = [
  { value: 'system', label: t('options_theme_system') },
  { value: 'light', label: t('options_theme_light') },
  { value: 'dark', label: t('options_theme_dark') }
]
const groupModes: { value: GroupMode; label: string }[] = [
  { value: 'none', label: t('options_group_none') },
  { value: 'title', label: t('options_group_title') },
  { value: 'domain', label: t('options_group_domain') }
]

const sampleTime = computed(() => formatTime(new Date(2024, 0, 2, 16, 38), locale, props.options.use24HoursFormat))
const sampleIcon = faviconUrl('https://example.com')
const dialog = ref<HTMLElement | null>(null)

// Focus the drawer on open so Escape reaches its keydown handler.
watch(() => props.open, (o) => { if (o) void nextTick(() => dialog.value?.focus()) })

function checked(ev: Event): boolean { return (ev.target as HTMLInputElement).checked }

function onPopupCount(ev: Event): void {
  const n = Number((ev.target as HTMLInputElement).value)
  if (Number.isInteger(n) && n >= 1) emit('change', { popupNbItems: n })
}
</script>

<template>
  <div v-if="open" data-opt="backdrop" class="compact fixed inset-0 z-50 bg-black/50" @click.self="emit('close')">
    <div ref="dialog" role="dialog" aria-modal="true" tabindex="-1" :aria-label="t('btn_options')" class="dbh-root absolute inset-y-0 right-0 flex w-[440px] max-w-full flex-col text-sm outline-none" style="border-left: 1px solid var(--border)" @keydown.esc="emit('close')">
      <header class="flex items-center justify-between border-b border-[color:var(--border)] py-3.5 pl-6 pr-4">
        <h1 class="text-lg font-semibold">{{ t('btn_options') }}</h1>
        <button class="dbh-iconbtn flex h-10 w-10 items-center justify-center rounded-lg" :title="t('options_close')" :aria-label="t('options_close')" @click="emit('close')">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </header>

      <div class="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
        <section :aria-label="t('options_preview')">
          <h2 class="dbh-muted mb-2 text-xs font-semibold">{{ t('options_preview') }}</h2>
          <div data-opt="preview" class="flex min-h-[44px] items-center gap-2.5 rounded-lg px-3" style="background: var(--surface); border: 1px solid var(--border)">
            <span v-if="options.timeBeforeTitle" data-part="time" class="mono dbh-muted flex-none text-xs">{{ sampleTime }}</span>
            <img :src="sampleIcon" alt="" class="h-5 w-5 flex-none rounded-[5px]" />
            <span data-part="title" class="min-w-0 flex-1 truncate">{{ t('application_title') }}</span>
            <span v-if="!options.timeBeforeTitle" data-part="time" class="mono dbh-muted flex-none text-xs">{{ sampleTime }}</span>
          </div>
        </section>

        <section :aria-label="t('options_section_display')">
          <h2 class="dbh-muted mb-1 text-xs font-semibold">{{ t('options_section_display') }}</h2>
          <div class="flex min-h-[44px] items-center justify-between gap-4">
            <span>{{ t('options_theme') }}</span>
            <div role="group" :aria-label="t('options_theme')" class="flex gap-0.5 rounded-lg p-[3px]" style="background: var(--raised)">
              <button v-for="o in themes" :key="o.value" :data-opt="`theme-${o.value}`" class="dbh-seg" :class="{ 'is-on': options.theme === o.value }" :aria-pressed="options.theme === o.value" @click="emit('change', { theme: o.value })">{{ o.label }}</button>
            </div>
          </div>
          <label class="flex min-h-[44px] items-center justify-between gap-4">
            <span>{{ t('options_time_12_24') }}</span>
            <input data-opt="use24" type="checkbox" class="dbh-switch" :checked="options.use24HoursFormat" @change="emit('change', { use24HoursFormat: checked($event) })" />
          </label>
          <label class="flex min-h-[44px] items-center justify-between gap-4">
            <span>{{ t('options_display_time_before_title') }}</span>
            <input data-opt="before" type="checkbox" class="dbh-switch" :checked="options.timeBeforeTitle" @change="emit('change', { timeBeforeTitle: checked($event) })" />
          </label>
        </section>

        <section :aria-label="t('options_section_list')">
          <h2 class="dbh-muted mb-1 text-xs font-semibold">{{ t('options_section_list') }}</h2>
          <div class="flex min-h-[44px] items-center justify-between gap-4">
            <span>{{ t('options_group_mode') }}</span>
            <div role="group" :aria-label="t('options_group_mode')" class="flex gap-0.5 rounded-lg p-[3px]" style="background: var(--raised)">
              <button v-for="o in groupModes" :key="o.value" :data-opt="`group-${o.value}`" class="dbh-seg" :class="{ 'is-on': options.groupMode === o.value }" :aria-pressed="options.groupMode === o.value" @click="emit('change', { groupMode: o.value })">{{ o.label }}</button>
            </div>
          </div>
          <label class="flex min-h-[44px] items-center justify-between gap-4">
            <span>{{ t('sort_oldest_label') }}</span>
            <input data-opt="oldest" type="checkbox" class="dbh-switch" :checked="options.sortOldestFirst" @change="emit('change', { sortOldestFirst: checked($event) })" />
          </label>
        </section>

        <section :aria-label="t('options_section_popup')">
          <h2 class="dbh-muted mb-1 text-xs font-semibold">{{ t('options_section_popup') }}</h2>
          <label class="flex min-h-[44px] items-center justify-between gap-4">
            <span>{{ t('options_popup_nb_items') }}</span>
            <input data-opt="popup" type="number" min="1" step="1" class="dbh-input mono h-9 w-[72px] rounded-lg px-2.5 text-[13px]" :value="options.popupNbItems" @input="onPopupCount" />
          </label>
        </section>
      </div>

      <p class="dbh-muted border-t border-[color:var(--border)] px-6 py-3.5 text-xs">{{ t('options_live_hint') }}</p>
    </div>
  </div>
</template>
