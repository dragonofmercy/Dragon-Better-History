<script setup lang="ts">
import { faviconUrl } from '@/lib/chrome'
import type { SiteCount } from '@/lib/dayStats'
import { t } from '@/lib/i18n'

defineProps<{ sites: SiteCount[]; active: string | null }>()
const emit = defineEmits<{ (e: 'pick', domain: string): void }>()
</script>

<template>
  <section v-if="sites.length" class="dbh-card">
    <h2 class="mb-1.5 text-[13px] font-semibold">{{ t('history_sites_today') }}</h2>
    <button v-for="s in sites" :key="s.domain" class="dbh-site" :class="{ 'is-on': s.domain === active }" :aria-pressed="s.domain === active" @click="emit('pick', s.domain)">
      <img class="h-5 w-5 flex-none rounded-sm" :src="faviconUrl(s.url)" alt="" />
      <span class="min-w-0 flex-1 truncate">{{ s.domain }}</span>
      <span class="mono dbh-muted text-xs">{{ s.count }}</span>
    </button>
  </section>
</template>
