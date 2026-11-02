import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Calendar from '@/components/Calendar.vue'

const today = new Date(2024, 4, 15) // 15 May 2024

describe('Calendar', () => {
  it('renders 7 weekday labels and 42 day cells', () => {
    const wrapper = mount(Calendar, { props: { locale: 'en', today, minYear: 2021 } })
    expect(wrapper.findAll('[data-weekday]').length).toBe(7)
    expect(wrapper.findAll('button[data-day]').length).toBe(42)
  })

  it('disables future days', () => {
    const wrapper = mount(Calendar, { props: { locale: 'en', today, minYear: 2021 } })
    const future = wrapper.findAll('button[data-day]').find((b) => b.attributes('data-ts') === String(new Date(2024, 4, 16).getTime()))
    expect(future?.attributes('disabled')).toBeDefined()
  })

  it('emits select with a midnight date when a day is clicked', async () => {
    const wrapper = mount(Calendar, { props: { locale: 'en', today, minYear: 2021 } })
    const cell = wrapper.findAll('button[data-day]').find((b) => b.attributes('data-ts') === String(new Date(2024, 4, 10).getTime()))
    await cell?.trigger('click')
    const events = wrapper.emitted('select')
    expect(events).toBeTruthy()
    const emitted = events?.[0]?.[0] as Date
    expect(emitted.getHours()).toBe(0)
    expect(emitted.getDate()).toBe(10)
  })

  it('emits month-change on mount and on next/prev', async () => {
    const wrapper = mount(Calendar, { props: { locale: 'en', today, minYear: 2021 } })
    expect(wrapper.emitted('month-change')?.[0]).toEqual([2024, 4])
    await wrapper.find('[data-prev]').trigger('click')
    expect(wrapper.emitted('month-change')?.[1]).toEqual([2024, 3])
    await wrapper.find('[data-next]').trigger('click')
    expect(wrapper.emitted('month-change')?.[2]).toEqual([2024, 4])
  })

  it('a day with density 2 has class is-h2', () => {
    const ts = new Date(2024, 4, 10).getTime()
    const wrapper = mount(Calendar, { props: { locale: 'en', today, minYear: 2021, density: new Map([[ts, 2 as const]]) } })
    expect(wrapper.find(`[data-ts="${ts}"]`).classes()).toContain('is-h2')
  })

  it('the selected day keeps is-selected', () => {
    const ts = new Date(2024, 4, 10).getTime()
    const wrapper = mount(Calendar, { props: { locale: 'en', today, minYear: 2021, selected: new Date(ts), density: new Map([[ts, 3 as const]]) } })
    expect(wrapper.find(`[data-ts="${ts}"]`).classes()).toContain('is-selected')
  })
})
