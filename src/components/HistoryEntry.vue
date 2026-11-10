<script setup lang="ts">
import { X } from '@lucide/vue'
import { computed } from 'vue'
import { domainOf, type HistoryEntry } from '@/composables/useHistory'
import { faviconUrl } from '@/lib/chrome'
import { formatTime } from '@/lib/dates'
import { t, locale } from '@/lib/i18n'

const props = withDefaults(defineProps<{
  entry: HistoryEntry
  use24: boolean
  timeBeforeTitle: boolean
  selected?: boolean
  removable?: boolean
  child?: boolean
  showDomain?: boolean
}>(), { selected: false, removable: true, child: false, showDomain: true })

const emit = defineEmits<{ (e: 'toggle', ev: MouseEvent | KeyboardEvent): void; (e: 'remove'): void }>()

const time = computed(() => formatTime(new Date(props.entry.lastVisitTime), locale, props.use24))
const domain = computed(() => domainOf(props.entry.url))
</script>

<template>
  <div class="dbh-entry" :class="[selected ? 'is-selected' : '', child ? 'is-child' : '']" tabindex="0" @click="emit('toggle', $event)" @keydown.enter.space.self.prevent="emit('toggle', $event)">
    <span v-if="timeBeforeTitle" class="dbh-time mono shrink-0 text-xs">{{ time }}</span>
    <img class="h-5 w-5 shrink-0 rounded-sm" :src="faviconUrl(entry.url)" alt="" loading="lazy" />
    <div class="flex min-w-0 flex-1 items-baseline gap-2.5">
      <a class="dbh-title truncate underline-offset-4 hover:underline" :href="entry.url" :title="entry.url" target="_blank" @click.stop>{{ entry.title }}</a>
      <span v-if="showDomain && domain" class="dbh-muted shrink-0 text-xs">{{ domain }}</span>
    </div>
    <span v-if="!timeBeforeTitle" class="dbh-time mono shrink-0 text-xs">{{ time }}</span>
    <button v-if="removable" class="dbh-rm" :title="t('history_remove_single')" :aria-label="t('history_remove_single')" @click.stop="emit('remove')">
      <X :size="14" />
    </button>
  </div>
</template>
