import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ClosedRow from '@/components/ClosedRow.vue'

const session = { type: 'tab' as const, sessionId: 's1', title: 'Tab', url: 'https://a', lastModified: new Date(2024, 0, 2, 12, 0).getTime() }

function mountRow() {
  return mount(ClosedRow, { props: { session, locale: 'en', use24: true, windowLabel: '' } })
}

describe('ClosedRow', () => {
  it('does not render a separate restore button', () => {
    expect(mountRow().find('button').exists()).toBe(false)
  })

  it('emits restore when the row is clicked', async () => {
    const wrapper = mountRow()
    await wrapper.find('.dbh-entry').trigger('click')
    expect(wrapper.emitted('restore')).toBeTruthy()
  })
})
