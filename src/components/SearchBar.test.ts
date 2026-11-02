import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '@/components/SearchBar.vue'

describe('SearchBar', () => {
  it('root has no fixed flex basis (parent decides sizing)', () => {
    const w = mount(SearchBar)
    expect(w.classes()).not.toContain('basis-80')
    expect(w.classes()).not.toContain('flex-1')
  })
})
