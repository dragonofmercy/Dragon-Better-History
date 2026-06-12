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
})
