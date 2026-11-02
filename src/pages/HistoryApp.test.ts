import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import HistoryApp from '@/pages/HistoryApp.vue'

const at = (h: number, m: number) => new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), h, m).getTime()
let items: { url: string; title: string; lastVisitTime: number }[] = []
const c = chrome as unknown as { history: { search: unknown; deleteUrl: unknown }; storage: { sync: { set: ReturnType<typeof vi.fn> } } }

async function mountApp() {
  const w = mount(HistoryApp, { attachTo: document.body })
  await flushPromises()
  return w
}
const rows = (w: Awaited<ReturnType<typeof mountApp>>) => w.findAll('.dbh-entry')

beforeEach(() => {
  Element.prototype.scrollTo = vi.fn()
  items = [
    { url: 'https://a.com/1', title: 'A1', lastVisitTime: at(10, 5) },
    { url: 'https://a.com/2', title: 'A2', lastVisitTime: at(10, 4) },
    { url: 'https://b.com/1', title: 'B1', lastVisitTime: at(9, 3) }
  ]
  c.history.search = vi.fn(async () => items.slice())
  c.history.deleteUrl = vi.fn(async ({ url }: { url: string }) => { items = items.filter((i) => i.url !== url) })
  c.storage.sync.set = vi.fn(async () => {})
  document.body.innerHTML = ''
})

describe('HistoryApp', () => {
  it('clicking a site filters the list and toggling clears it', async () => {
    const w = await mountApp()
    expect(rows(w)).toHaveLength(3)
    await w.findAll('.dbh-site').find((s) => s.text().includes('b.com'))!.trigger('click')
    expect(rows(w)).toHaveLength(1)
    await w.find('.dbh-site.is-on').trigger('click')
    expect(rows(w)).toHaveLength(3)
  })

  it('filter resets when its last entry is deleted', async () => {
    const w = await mountApp()
    await w.findAll('.dbh-site').find((s) => s.text().includes('b.com'))!.trigger('click')
    await rows(w)[0].find('.dbh-rm').trigger('click')
    await flushPromises()
    expect(rows(w)).toHaveLength(2)
    expect(w.find('.dbh-site.is-on').exists()).toBe(false)
  })

  it('changing day clears the filter', async () => {
    const w = await mountApp()
    await w.findAll('.dbh-site')[0].trigger('click')
    expect(w.find('.dbh-site.is-on').exists()).toBe(true)
    await w.find('a.dbh-link').trigger('click')
    await flushPromises()
    expect(w.find('.dbh-site.is-on').exists()).toBe(false)
    expect(rows(w)).toHaveLength(3)
  })

  it('Ctrl+A selects only visible entries while filtered', async () => {
    const w = await mountApp()
    await w.findAll('.dbh-site').find((s) => s.text().includes('a.com'))!.trigger('click')
    await w.find('.dbh-root').trigger('keydown', { key: 'a', ctrlKey: true })
    expect(w.find('[role="status"]').text()).toContain('2')
  })

  it('selection bar appears with the count and deletes', async () => {
    const w = await mountApp()
    expect(w.find('[role="status"]').exists()).toBe(false)
    await rows(w)[0].trigger('click')
    expect(w.find('[role="status"]').text()).toContain('1')
    await w.find('.dbh-danger').trigger('click')
    await flushPromises()
    expect(rows(w)).toHaveLength(2)
    expect(w.find('[role="status"]').exists()).toBe(false)
  })

  it('group segmented control saves groupMode', async () => {
    const w = await mountApp()
    const seg = w.findAll('[aria-label="options_group_title"], .dbh-seg').filter((b) => b.text() === 'options_group_domain')[0]
    await seg.trigger('click')
    expect(c.storage.sync.set).toHaveBeenCalledWith(expect.objectContaining({ groupMode: 'domain' }))
  })

  it('sort button saves sortOldestFirst', async () => {
    const w = await mountApp()
    await w.find('.dbh-sort').trigger('click')
    expect(c.storage.sync.set).toHaveBeenCalledWith(expect.objectContaining({ sortOldestFirst: true }))
  })

  it('sort icon follows the sort order', async () => {
    const w = await mountApp()
    const icon = () => w.find('.dbh-sort path').attributes('d')
    const before = icon()
    await w.find('.dbh-sort').trigger('click')
    expect(icon()).not.toBe(before)
  })

  it('search hides the histogram and the site list', async () => {
    const w = await mountApp()
    expect(w.find('.dbh-chart').exists()).toBe(true)
    expect(w.find('.dbh-site').exists()).toBe(true)
    vi.useFakeTimers()
    await w.find('input').setValue('a')
    vi.advanceTimersByTime(600)
    vi.useRealTimers()
    await flushPromises()
    expect(w.find('.dbh-chart').exists()).toBe(false)
    expect(w.find('.dbh-site').exists()).toBe(false)
  })

  async function searchFor(w: Awaited<ReturnType<typeof mountApp>>, q: string) {
    vi.useFakeTimers()
    await w.find('input').setValue(q)
    vi.advanceTimersByTime(600)
    vi.useRealTimers()
    await flushPromises()
  }

  it('Delete and Ctrl+A are ignored while the options drawer is open', async () => {
    const w = await mountApp()
    await rows(w)[0].trigger('click')
    await w.find('[aria-label="btn_options"]').trigger('click')
    await w.find('.dbh-root').trigger('keydown', { key: 'Delete' })
    await w.find('.dbh-root').trigger('keydown', { key: 'a', ctrlKey: true })
    await flushPromises()
    expect(c.history.deleteUrl).not.toHaveBeenCalled()
    expect(w.find('[role="status"]').text()).toContain('1')
  })

  it('picking a day during a search stays on that day', async () => {
    const w = await mountApp()
    await searchFor(w, 'a')
    const picked = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 2)
    w.findComponent({ name: 'Calendar' }).vm.$emit('select', picked)
    await flushPromises()
    const calls = (c.history.search as ReturnType<typeof vi.fn>).mock.calls
    expect(calls[calls.length - 1]![0]).toMatchObject({ text: '', startTime: picked.getTime() })
    expect(w.find('.dbh-cal-day.is-selected').text()).toBe(String(picked.getDate()))
  })

  it('clearing a non-empty search returns to today', async () => {
    const w = await mountApp()
    await searchFor(w, 'a')
    await w.find('input').setValue('')
    await flushPromises()
    const calls = (c.history.search as ReturnType<typeof vi.fn>).mock.calls
    expect(calls[calls.length - 1]![0]).toMatchObject({ text: '' })
    expect(w.find('.dbh-chart').exists()).toBe(true)
  })

  it('a search with no results shows only the empty message', async () => {
    const w = await mountApp()
    items = []
    await searchFor(w, 'zzz')
    expect(w.text()).toContain('search_empty')
    expect(w.text()).not.toContain('search_found')
  })
})
