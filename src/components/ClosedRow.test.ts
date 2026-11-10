import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ClosedRow from '@/components/ClosedRow.vue'

const session = { type: 'tab' as const, sessionId: 's1', title: 'Tab', url: 'https://a', lastModified: new Date(2024, 0, 2, 12, 0).getTime() }

function mountRow(timeBeforeTitle = false) {
  return mount(ClosedRow, { props: { session, locale: 'en', use24: true, timeBeforeTitle } })
}

describe('ClosedRow', () => {
  it('puts the time first when timeBeforeTitle is on', () => {
    expect(mountRow(false).find('.dbh-entry > :first-child').classes()).not.toContain('dbh-time')
    expect(mountRow(true).find('.dbh-entry > :first-child').classes()).toContain('dbh-time')
  })

  it('does not render a separate restore button', () => {
    expect(mountRow().find('button').exists()).toBe(false)
  })

  it('emits restore when the row is clicked', async () => {
    const wrapper = mountRow()
    await wrapper.find('.dbh-entry').trigger('click')
    expect(wrapper.emitted('restore')).toBeTruthy()
  })

  it('shows closed_restore', () => {
    expect(mountRow().text()).toContain('closed_restore')
  })

  it('restores on Enter and Space, only when the row itself is focused', async () => {
    const wrapper = mountRow()
    const row = wrapper.find('.dbh-entry')
    expect(row.attributes('tabindex')).toBe('0')
    await row.trigger('keydown', { key: 'Enter' })
    await row.trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('restore')).toHaveLength(2)
  })
})
