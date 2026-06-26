import { describe, it, expect } from 'vitest'
import { useSelection } from '@/composables/useSelection'

const keys = ['a', 'b', 'c', 'd', 'e']

describe('useSelection', () => {
  it('toggles a single key', () => {
    const s = useSelection()
    s.toggle('a')
    expect(s.isSelected('a')).toBe(true)
    expect(s.count.value).toBe(1)
    s.toggle('a')
    expect(s.isSelected('a')).toBe(false)
  })

  it('selects a contiguous range from the last toggled key', () => {
    const s = useSelection()
    s.toggle('b')
    s.range('d', keys)
    expect(s.isSelected('b')).toBe(true)
    expect(s.isSelected('c')).toBe(true)
    expect(s.isSelected('d')).toBe(true)
    expect(s.count.value).toBe(3)
  })

  it('range works regardless of direction', () => {
    const s = useSelection()
    s.toggle('d')
    s.range('b', keys)
    expect(s.count.value).toBe(3)
    expect(s.isSelected('c')).toBe(true)
  })

  it('selectAll selects every key and clear empties', () => {
    const s = useSelection()
    s.selectAll(keys)
    expect(s.count.value).toBe(5)
    s.clear()
    expect(s.count.value).toBe(0)
  })
})
