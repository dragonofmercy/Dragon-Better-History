import { describe, it, expect } from 'vitest'
import { startOfDay, endOfDay, normalizeLocale, formatTime, formatDayHeading } from '@/lib/dates'

describe('dates', () => {
  it('startOfDay zeroes the time', () => {
    const d = startOfDay(new Date(2024, 4, 9, 13, 30, 15))
    expect(d.getHours()).toBe(0)
    expect(d.getMinutes()).toBe(0)
    expect(d.getSeconds()).toBe(0)
  })

  it('endOfDay maxes the time', () => {
    const d = endOfDay(new Date(2024, 4, 9, 1, 2, 3))
    expect(d.getHours()).toBe(23)
    expect(d.getMinutes()).toBe(59)
    expect(d.getSeconds()).toBe(59)
  })

  it('normalizeLocale converts underscore to dash', () => {
    expect(normalizeLocale('zh_CN')).toBe('zh-CN')
    expect(normalizeLocale('en')).toBe('en')
  })

  it('formatTime respects the 24h flag', () => {
    const d = new Date(2024, 0, 1, 14, 5)
    expect(formatTime(d, 'en', true)).toMatch(/14:05/)
    expect(formatTime(d, 'en', false)).toMatch(/2:05/)
  })

  it('formatDayHeading returns a non-empty localized string', () => {
    const d = new Date(2024, 0, 1)
    expect(formatDayHeading(d, 'en').length).toBeGreaterThan(0)
  })
})
