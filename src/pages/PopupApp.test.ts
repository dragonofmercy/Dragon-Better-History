import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PopupApp from '@/pages/PopupApp.vue'
import HistoryEntryRow from '@/components/HistoryEntry.vue'
import ClosedRow from '@/components/ClosedRow.vue'
import SearchBar from '@/components/SearchBar.vue'

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

describe('PopupApp layout', () => {
  const item = { id: '1', url: 'https://a.com/x', title: 'A', lastVisitTime: Date.now() }

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(chrome.history, 'search').mockResolvedValue([item] as never)
  })

  it('tabs are segmented and switch panels', async () => {
    vi.spyOn(chrome.sessions, 'getRecentlyClosed').mockResolvedValue([{ lastModified: 1, tab: { sessionId: 's1', title: 'T', url: 'https://t.com' } }] as never)
    const wrapper = mount(PopupApp)
    await flushPromises()
    const tabs = wrapper.findAll('[role="group"] button')
    expect(tabs).toHaveLength(2)
    expect(tabs[0].attributes('aria-pressed')).toBe('true')
    expect(wrapper.findComponent(SearchBar).exists()).toBe(true)
    await tabs[1].trigger('click')
    await flushPromises()
    expect(tabs[1].attributes('aria-pressed')).toBe('true')
    expect(wrapper.findComponent(SearchBar).exists()).toBe(false)
    expect(wrapper.findComponent(ClosedRow).exists()).toBe(true)
  })

  it('row click opens the entry in a new tab via chrome.tabs.create', async () => {
    const wrapper = mount(PopupApp)
    await flushPromises()
    await wrapper.findComponent(HistoryEntryRow).trigger('click')
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://a.com/x' })
  })

  it('the footer link opens history.html', async () => {
    const wrapper = mount(PopupApp)
    await flushPromises()
    const more = wrapper.find('a.dbh-more, button.dbh-more')
    expect(more.text()).toContain('history_view_more')
    await more.trigger('click')
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'chrome-extension://testhistory.html' })
  })
})
