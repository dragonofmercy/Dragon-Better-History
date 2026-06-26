import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HistoryRun from '@/components/HistoryRun.vue'

const entries = [
  { key: 'https://fb/1::1', url: 'https://fb/1', title: 'Facebook', lastVisitTime: new Date(2024, 0, 2, 12, 0).getTime() },
  { key: 'https://fb/2::2', url: 'https://fb/2', title: 'Facebook', lastVisitTime: new Date(2024, 0, 2, 12, 1).getTime() }
]
const run = { type: 'run' as const, key: 'https://fb/1::1', title: 'Facebook', entries }

function mountRun(props: Record<string, unknown> = {}) {
  return mount(HistoryRun, {
    props: { run, locale: 'en', use24: true, timeBeforeTitle: false, expanded: false, isSelected: () => false, removeLabel: 'remove', groupRemoveLabel: 'remove group', ...props }
  })
}

describe('HistoryRun', () => {
  it('shows the count badge and hides children when collapsed', () => {
    const w = mountRun()
    expect(w.text()).toContain('x2')
    expect(w.findAll('.dbh-run-children').length).toBe(0)
  })

  it('renders children entries when expanded', () => {
    const w = mountRun({ expanded: true })
    expect(w.find('.dbh-run-children').exists()).toBe(true)
    expect(w.findAll('.dbh-run-children .dbh-entry').length).toBe(2)
  })

  it('emits toggle-expand when the chevron is clicked', async () => {
    const w = mountRun()
    await w.find('.dbh-chevron').trigger('click')
    expect(w.emitted('toggle-expand')).toBeTruthy()
  })

  it('emits toggle-expand when the header body is clicked', async () => {
    const w = mountRun()
    await w.find('.dbh-entry').trigger('click')
    expect(w.emitted('toggle-expand')).toBeTruthy()
  })

  it('emits remove-group (not toggle-expand) when the header cross is clicked', async () => {
    const w = mountRun()
    await w.find('.dbh-entry > button.dbh-rm').trigger('click')
    expect(w.emitted('remove-group')).toBeTruthy()
    expect(w.emitted('toggle-expand')).toBeFalsy()
  })
})
