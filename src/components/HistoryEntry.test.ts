import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HistoryEntryRow from '@/components/HistoryEntry.vue'

const entry = { key: 'https://a::1', url: 'https://a', title: 'A', lastVisitTime: new Date(2024, 0, 2, 12, 0).getTime() }

function mountRow(removable?: boolean) {
  return mount(HistoryEntryRow, {
    props: { entry, locale: 'en', use24: true, timeBeforeTitle: false, selected: false, removeLabel: 'remove', ...(removable === undefined ? {} : { removable }) }
  })
}

describe('HistoryEntry', () => {
  it('renders the remove button by default', () => {
    expect(mountRow().find('button.dbh-rm').exists()).toBe(true)
  })

  it('hides the remove button when removable is false', () => {
    expect(mountRow(false).find('button.dbh-rm').exists()).toBe(false)
  })
})
