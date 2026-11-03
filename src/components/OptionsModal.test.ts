import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OptionsModal from '@/components/OptionsModal.vue'
import { DEFAULT_OPTIONS, type Options } from '@/composables/useOptions'

function mountModal(over: Partial<Options> = {}) {
  return mount(OptionsModal, { props: { open: true, options: { ...DEFAULT_OPTIONS, ...over } } })
}

describe('OptionsModal', () => {
  it('toggling 24h emits change with use24HoursFormat', async () => {
    const w = mountModal()
    await w.find('[data-opt="use24"]').setValue(false)
    expect(w.emitted('change')![0]).toEqual([{ use24HoursFormat: false }])
  })

  it('theme segmented emits change', async () => {
    const w = mountModal()
    await w.find('[data-opt="theme-dark"]').trigger('click')
    expect(w.emitted('change')![0]).toEqual([{ theme: 'dark' }])
  })

  it('group segmented uses options_group_none', () => {
    const w = mountModal()
    expect(w.find('[data-opt="group-none"]').text()).toBe('options_group_none')
  })

  it('group segmented emits change', async () => {
    const w = mountModal()
    await w.find('[data-opt="group-domain"]').trigger('click')
    expect(w.emitted('change')![0]).toEqual([{ groupMode: 'domain' }])
  })

  it('an empty or 0 popup count emits no change', async () => {
    const w = mountModal()
    const input = w.find('[data-opt="popup"]')
    await input.setValue('')
    await input.setValue('0')
    expect(w.emitted('change')).toBeUndefined()
    await input.setValue('7')
    expect(w.emitted('change')![0]).toEqual([{ popupNbItems: 7 }])
  })

  it('Escape and backdrop click emit close', async () => {
    const w = mountModal()
    await w.find('[data-opt="backdrop"]').trigger('click')
    await w.find('[role="dialog"]').trigger('keydown', { key: 'Escape' })
    expect(w.emitted('close')).toHaveLength(2)
  })

  it('dense switch emits dense', async () => {
    const w = mountModal()
    await w.find('[data-opt="dense"]').setValue(true)
    expect(w.emitted('change')![0]).toEqual([{ dense: true }])
  })

  it('sort switch emits sortOldestFirst', async () => {
    const w = mountModal()
    await w.find('[data-opt="oldest"]').setValue(true)
    expect(w.emitted('change')![0]).toEqual([{ sortOldestFirst: true }])
  })
})
