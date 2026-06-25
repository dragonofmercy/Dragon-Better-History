import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PopupApp from '@/pages/PopupApp.vue'
import SearchBar from '@/components/SearchBar.vue'

function item(url: string, time: number, title = ''): chrome.history.HistoryItem {
  return { id: url, url, title, lastVisitTime: time } as chrome.history.HistoryItem
}

describe('PopupApp search', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a search bar in the recent tab', async () => {
    vi.spyOn(chrome.history, 'search').mockResolvedValue([] as never)
    const wrapper = mount(PopupApp)
    await flushPromises()
    expect(wrapper.findComponent(SearchBar).exists()).toBe(true)
  })

  it('search event triggers history.search limited to popupNbItems', async () => {
    const spy = vi.spyOn(chrome.history, 'search').mockResolvedValue([] as never)
    const wrapper = mount(PopupApp)
    await flushPromises()
    spy.mockClear()
    wrapper.findComponent(SearchBar).vm.$emit('search', 'foo')
    await flushPromises()
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ text: 'foo', maxResults: 10 }))
  })

  it('clear event reloads the recent list (empty text search)', async () => {
    const spy = vi.spyOn(chrome.history, 'search').mockResolvedValue([] as never)
    const wrapper = mount(PopupApp)
    await flushPromises()
    spy.mockClear()
    wrapper.findComponent(SearchBar).vm.$emit('clear')
    await flushPromises()
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ text: '', maxResults: 10 }))
  })

  it('shows search_empty when a search returns nothing', async () => {
    const spy = vi.spyOn(chrome.history, 'search').mockResolvedValue([] as never)
    const wrapper = mount(PopupApp)
    await flushPromises()
    wrapper.findComponent(SearchBar).vm.$emit('search', 'zzz')
    await flushPromises()
    expect(wrapper.text()).toContain('search_empty')
    expect(wrapper.text()).not.toContain('history_date_empty')
  })
})
