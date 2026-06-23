import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: '__MSG_application_title__',
  description: '__MSG_application_description__',
  version: pkg.version,
  default_locale: 'en',
  icons: {
    16: 'icons/icon_16.png',
    32: 'icons/icon_32.png',
    48: 'icons/icon_48.png',
    64: 'icons/icon_64.png',
    128: 'icons/icon_128.png'
  },
  permissions: ['favicon', 'history', 'tabs', 'storage', 'sessions'],
  host_permissions: ['file:///*'],
  background: {
    service_worker: 'src/background.ts'
  },
  action: {
    default_icon: { 16: 'icons/icon_16.png', 32: 'icons/icon_32.png' },
    default_title: '__MSG_application_title__'
  },
  chrome_url_overrides: {
    history: 'history.html'
  }
})
