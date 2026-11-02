import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HistoryEntryRow from '@/components/HistoryEntry.vue'

const entry = { key: 'https://a.com/x::1', url: 'https://www.a.com/x', title: 'A', lastVisitTime: new Date(2024, 0, 2, 12, 0).getTime() }

function mountRow(removable?: boolean) {
  return mount(HistoryEntryRow, {
    props: { entry, locale: 'en', use24: true, timeBeforeTitle: false, ...(removable === undefined ? {} : { removable }) }
  })
}

describe('HistoryEntry', () => {
  it('renders the remove button by default', () => {
    expect(mountRow().find('button.dbh-rm').exists()).toBe(true)
  })

  it('hides the remove button when removable is false', () => {
    expect(mountRow(false).find('button.dbh-rm').exists()).toBe(false)
  })

  it('row click emits toggle', async () => {
    const w = mountRow()
    await w.find('.dbh-entry').trigger('click')
    expect(w.emitted('toggle')).toHaveLength(1)
  })

  it('title link click does not emit toggle', async () => {
    const w = mountRow()
    await w.find('a.dbh-title').trigger('click')
    expect(w.emitted('toggle')).toBeFalsy()
  })

  it('remove click emits remove only', async () => {
    const w = mountRow()
    await w.find('button.dbh-rm').trigger('click')
    expect(w.emitted('remove')).toHaveLength(1)
    expect(w.emitted('toggle')).toBeFalsy()
  })

  it('Enter and Space on the row emit toggle', async () => {
    const w = mountRow()
    await w.find('.dbh-entry').trigger('keydown', { key: 'Enter' })
    await w.find('.dbh-entry').trigger('keydown', { key: ' ' })
    expect(w.emitted('toggle')).toHaveLength(2)
  })

  it('Enter on the remove button does not emit toggle', async () => {
    const w = mountRow()
    await w.find('button.dbh-rm').trigger('keydown', { key: 'Enter' })
    expect(w.emitted('toggle')).toBeFalsy()
  })

  it('the domain is shown', () => {
    expect(mountRow().text()).toContain('a.com')
  })

  it('hides the domain when showDomain is false', () => {
    const w = mount(HistoryEntryRow, { props: { entry, locale: 'en', use24: true, timeBeforeTitle: false, showDomain: false } })
    expect(w.text()).not.toContain('a.com')
  })

  it('renders no checkbox', () => {
    expect(mountRow().find('input[type="checkbox"]').exists()).toBe(false)
  })
})
