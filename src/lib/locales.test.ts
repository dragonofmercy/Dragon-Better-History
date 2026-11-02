import { describe, it, expect } from 'vitest'

const langs = ['en', 'fr', 'de', 'it', 'es', 'tr', 'zh_CN', 'bg', 'ru']
const files = import.meta.glob<Record<string, unknown>>('../../public/_locales/*/messages.json', { eager: true, import: 'default' })
const load = (l: string) => files[`../../public/_locales/${l}/messages.json`]

const NEW_KEYS = [
  'history_sites_today', 'history_summary', 'history_filter_empty', 'history_activity_chart', 'history_expand_group', 'history_collapse_group',
  'calendar_prev_month', 'calendar_next_month', 'group_list', 'sort_newest_label', 'sort_oldest_label',
  'options_close', 'options_preview', 'options_section_display', 'options_section_list', 'options_section_popup', 'options_live_hint',
]

describe('locales', () => {
  it('every locale has the same keys as en', () => {
    const en = Object.keys(load('en')).sort()
    for (const l of langs) expect(Object.keys(load(l)).sort(), l).toEqual(en)
  })

  it('en contains the new keys', () => {
    const en = load('en')
    for (const k of NEW_KEYS) expect(en, k).toHaveProperty(k)
  })
})
