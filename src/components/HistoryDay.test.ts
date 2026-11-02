import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HistoryDay from '@/components/HistoryDay.vue'
import { formatHour } from '@/lib/dates'

function e(n: number, h: number, m: number, title = 'Same') {
  return { key: `https://x.com/${n}::${n}`, url: `https://x.com/${n}`, title, lastVisitTime: new Date(2024, 0, 2, h, m).getTime() }
}

function mountDay(entries: ReturnType<typeof e>[], props: Record<string, unknown> = {}) {
  return mount(HistoryDay, {
    props: {
      group: { dayKey: 1, date: new Date(2024, 0, 2), entries },
      locale: 'en', use24: true, timeBeforeTitle: false, groupMode: 'title', expanded: new Set<string>(), isSelected: () => false, showHeading: true, ...props
    }
  })
}

describe('HistoryDay', () => {
  it('renders one section per hour with its formatHour label', () => {
    const w = mountDay([e(1, 10, 5, 'A'), e(2, 10, 1, 'B'), e(3, 9, 30, 'C')])
    const labels = w.findAll('.dbh-hour-label').map((l) => l.text())
    expect(labels).toEqual([formatHour(10, 'en', true), formatHour(9, 'en', true)])
  })

  it('a run does not span two hours', () => {
    const w = mountDay([e(1, 10, 59), e(2, 10, 58), e(3, 9, 59), e(4, 9, 58)])
    expect(w.findAll('.dbh-count-badge').map((b) => b.text())).toEqual(['2', '2'])
    expect(w.findAll('.dbh-hour')).toHaveLength(2)
  })

  it('flat renders every entry in one block without hour labels', () => {
    const w = mountDay([e(1, 10, 5, 'A'), e(2, 9, 30, 'B')], { flat: true })
    expect(w.findAll('.dbh-hour')).toHaveLength(1)
    expect(w.find('.dbh-hour-label').exists()).toBe(false)
    expect(w.findAll('.dbh-entry')).toHaveLength(2)
  })

  it('showHeading false hides the day heading', () => {
    expect(mountDay([e(1, 10, 0)], { showHeading: false }).find('h2').exists()).toBe(false)
    expect(mountDay([e(1, 10, 0)]).find('h2').exists()).toBe(true)
  })
})
