<script setup lang="ts">
import { PanelTop } from '@lucide/vue'
import { computed } from 'vue'
import type { ClosedSession } from '@/composables/useRecentlyClosed'
import { faviconUrl } from '@/lib/chrome'
import { formatTime } from '@/lib/dates'
import { t } from '@/lib/i18n'

const props = defineProps<{
  session: ClosedSession
  locale: string
  use24: boolean
  timeBeforeTitle: boolean
}>()

const emit = defineEmits<{ (e: 'restore'): void }>()

const time = computed(() => formatTime(new Date(props.session.lastModified), props.locale, props.use24))
const label = computed(() => (props.session.type === 'tab' ? props.session.title : t('closed_window_tabs', String(props.session.tabCount))))
const tooltip = computed(() => (props.session.type === 'tab' ? props.session.url : label.value))
</script>

<template>
  <div class="dbh-entry group" tabindex="0" @click="emit('restore')" @keydown.enter.space.self.prevent="emit('restore')">
    <span v-if="timeBeforeTitle" class="dbh-time mono shrink-0 text-xs">{{ time }}</span>
    <img v-if="session.type === 'tab'" class="h-4 w-4 shrink-0 rounded-sm" :src="faviconUrl(session.url)" alt="" loading="lazy" />
    <span v-else class="dbh-faint flex h-4 w-4 shrink-0 items-center justify-center">
      <PanelTop :size="14" />
    </span>
    <div class="min-w-0 flex-1 truncate">
      <span class="dbh-title" :title="tooltip">{{ label }}</span>
    </div>
    <span class="shrink-0 text-xs font-medium text-[var(--link)] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">{{ t('closed_restore') }}</span>
    <span v-if="!timeBeforeTitle" class="dbh-time mono shrink-0 text-xs">{{ time }}</span>
  </div>
</template>
