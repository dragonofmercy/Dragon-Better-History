import { createApp } from 'vue'
import HistoryApp from '@/pages/HistoryApp.vue'
import { reopenDetachedAsTab } from '@/lib/chrome'
import '@/assets/tailwind.css'

reopenDetachedAsTab().then((reopened) => {
  if (!reopened) createApp(HistoryApp).mount('#app')
})
