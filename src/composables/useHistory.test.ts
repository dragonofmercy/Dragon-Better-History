import { describe, it, expect, vi } from 'vitest'
import { groupByDay, entryKey, groupRuns, takeEntries, orderDays, domainOf, parseQuery, matchesSite, useHistory } from '@/composables/useHistory'

function item(url: string, time: number, title = ''): chrome.history.HistoryItem {
  return { id: url, url, title, lastVisitTime: time } as chrome.history.HistoryItem
}

function entry(url: string, title: string, time = 1): { key: string; url: string; title: string; lastVisitTime: number; domain: string } {
  return { key: `${url}::${time}`, url, title, lastVisitTime: time, domain: domainOf(url) }
}

describe('groupRuns', () => {
  it('groups 2+ consecutive same-title entries into a run', () => {
    const items = groupRuns([entry('https://fb/1', 'Facebook', 1), entry('https://fb/2', 'Facebook', 2), entry('https://fb/3', 'Facebook', 3)])
    expect(items.length).toBe(1)
    expect(items[0].type).toBe('run')
    if (items[0].type === 'run') {
      expect(items[0].entries.length).toBe(3)
      expect(items[0].key).toBe('https://fb/1::1')
      expect(items[0].entries[0].title).toBe('Facebook')
    }
  })

  it('keeps a lone entry as a single', () => {
    const items = groupRuns([entry('https://a', 'A', 1)])
    expect(items[0].type).toBe('single')
  })

  it('splits identical titles that are not adjacent into separate items', () => {
    const items = groupRuns([
      entry('https://fb/1', 'Facebook', 1), entry('https://fb/2', 'Facebook', 2),
      entry('https://w', 'Wiki', 3),
      entry('https://fb/3', 'Facebook', 4), entry('https://fb/4', 'Facebook', 5)
    ])
    expect(items.map((i) => i.type)).toEqual(['run', 'single', 'run'])
  })

  it('preserves order', () => {
    const items = groupRuns([entry('https://a', 'A', 1), entry('https://b/1', 'B', 2), entry('https://b/2', 'B', 3)])
    expect(items[0].type).toBe('single')
    expect(items[1].type).toBe('run')
  })

  it('groups consecutive entries by domain, ignoring www and differing titles', () => {
    const items = groupRuns([entry('https://www.github.com/a', 'A', 1), entry('https://github.com/b', 'B', 2)], 'domain')
    expect(items.length).toBe(1)
  })

  it('keeps subdomains apart and never groups urls without a domain', () => {
    const subdomains = groupRuns([entry('https://mail.google.com/', 'M', 1), entry('https://docs.google.com/', 'D', 2)], 'domain')
    expect(subdomains.map((i) => i.type)).toEqual(['single', 'single'])
    const files = groupRuns([entry('file:///a.txt', 'A', 1), entry('file:///b.txt', 'B', 2)], 'domain')
    expect(files.map((i) => i.type)).toEqual(['single', 'single'])
  })
})

describe('orderDays', () => {
  const days = [
    { dayKey: 2, date: new Date(2024, 0, 2), entries: [entry('https://b2', 'B2', 4), entry('https://b1', 'B1', 3)] },
    { dayKey: 1, date: new Date(2024, 0, 1), entries: [entry('https://a2', 'A2', 2), entry('https://a1', 'A1', 1)] }
  ]

  it('returns the input untouched when newest first', () => {
    expect(orderDays(days, false)).toBe(days)
  })

  it('reverses both the days and their entries when oldest first', () => {
    const out = orderDays(days, true)
    expect(out.map((g) => g.dayKey)).toEqual([1, 2])
    expect(out.flatMap((g) => g.entries.map((e) => e.lastVisitTime))).toEqual([1, 2, 3, 4])
  })

  it('does not mutate the input', () => {
    orderDays(days, true)
    expect(days[0].entries[0].lastVisitTime).toBe(4)
  })
})

describe('groupByDay', () => {
  it('groups entries by midnight and sorts days descending', () => {
    const d1 = new Date(2024, 0, 1, 10, 0).getTime()
    const d2 = new Date(2024, 0, 2, 12, 0).getTime()
    const groups = groupByDay(
      [item('https://a', d1), item('https://b', d2), item('https://c', d1)],
      new Date(2024, 0, 1, 0, 0, 0),
      new Date(2024, 0, 2, 23, 59, 59)
    )
    expect(groups.length).toBe(2)
    expect(Number(groups[0].dayKey)).toBeGreaterThan(Number(groups[1].dayKey))
    const jan1 = groups.find((g) => g.date.getDate() === 1)
    expect(jan1?.entries.length).toBe(2)
  })

  it('sorts entries newest first within a day regardless of input order', () => {
    const t = (h: number): number => new Date(2024, 0, 1, h).getTime()
    const [g] = groupByDay([item('https://a', t(9)), item('https://b', t(14)), item('https://c', t(11))], new Date(2024, 0, 1), new Date(2024, 0, 1, 23, 59, 59))
    expect(g.entries.map((e) => e.url)).toEqual(['https://b', 'https://c', 'https://a'])
  })

  it('drops entries outside the range', () => {
    const inRange = new Date(2024, 0, 2, 12, 0).getTime()
    const outRange = new Date(2024, 0, 5, 12, 0).getTime()
    const groups = groupByDay(
      [item('https://a', inRange), item('https://b', outRange)],
      new Date(2024, 0, 2, 0, 0, 0),
      new Date(2024, 0, 2, 23, 59, 59)
    )
    expect(groups.length).toBe(1)
    expect(groups[0].entries.length).toBe(1)
  })

  it('entryKey is unique per url and visit time', () => {
    expect(entryKey(item('https://a', 1))).not.toBe(entryKey(item('https://a', 2)))
  })

  it('falls back to url when title is empty', () => {
    const groups = groupByDay([item('https://a', new Date(2024, 0, 2, 12, 0).getTime(), '')], new Date(2024, 0, 2), new Date(2024, 0, 2, 23, 59, 59))
    expect(groups[0].entries[0].title).toBe('https://a')
  })
})

describe('useHistory', () => {
  it('remove filters the deleted url from all day groups', async () => {
    const t = new Date(2024, 0, 2, 12, 0).getTime()
    vi.spyOn(chrome.history, 'search').mockResolvedValue([item('https://a', t, 'A'), item('https://b', t, 'B')] as never)
    vi.spyOn(chrome.history, 'deleteUrl').mockResolvedValue()
    const h = useHistory()
    await h.getDay(new Date(2024, 0, 2))
    expect(h.days.value[0].entries.length).toBe(2)
    await h.remove(['https://a'])
    expect(h.days.value[0].entries.length).toBe(1)
    expect(h.days.value[0].entries[0].url).toBe('https://b')
  })

  it('drops the day group when its last entry is removed', async () => {
    const t = new Date(2024, 0, 2, 12, 0).getTime()
    vi.spyOn(chrome.history, 'search').mockResolvedValue([item('https://a', t, 'A')] as never)
    vi.spyOn(chrome.history, 'deleteUrl').mockResolvedValue()
    const h = useHistory()
    await h.getDay(new Date(2024, 0, 2))
    expect(h.days.value.length).toBe(1)
    await h.remove(['https://a'])
    expect(h.days.value.length).toBe(0)
  })

  it('search forwards the max argument as maxResults', async () => {
    const t = new Date(2024, 0, 2, 12, 0).getTime()
    const spy = vi.spyOn(chrome.history, 'search').mockResolvedValue([item('https://a', t, 'A')] as never)
    const h = useHistory()
    await h.search('foo', new Date(2024, 0, 2), 10)
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ text: 'foo', maxResults: 10 }))
    expect(h.searching.value).toBe(true)
  })

  it('search defaults maxResults to 0 (unlimited)', async () => {
    const spy = vi.spyOn(chrome.history, 'search').mockResolvedValue([] as never)
    const h = useHistory()
    await h.search('bar', new Date(2024, 0, 2))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ text: 'bar', maxResults: 0 }))
  })

  it('search with site: filters results to that domain and its subdomains', async () => {
    const t = new Date(2024, 0, 2, 12, 0).getTime()
    const spy = vi.spyOn(chrome.history, 'search').mockResolvedValue([item('https://www.github.com/a', t), item('https://gist.github.com/b', t + 1), item('https://example.com/github.com', t + 2)] as never)
    const h = useHistory()
    await h.search('vue site:GitHub.com', new Date(2024, 0, 2))
    expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'vue github.com' }))
    expect(h.days.value.flatMap((g) => g.entries.map((e) => e.url))).toEqual(['https://gist.github.com/b', 'https://www.github.com/a'])
  })

  it('parseQuery and matchesSite', () => {
    expect(parseQuery('foo')).toEqual({ text: 'foo', site: '' })
    expect(parseQuery('site:www.a.com')).toEqual({ text: 'a.com', site: 'a.com' })
    expect(matchesSite('https://a.com', 'a.com')).toBe(true)
    expect(matchesSite('https://nota.com', 'a.com')).toBe(false)
  })

  it('domainOf returns empty for non-http and malformed URLs', () => {
    expect(domainOf('https://www.a.com/x')).toBe('a.com')
    expect(domainOf('chrome://settings')).toBe('')
    expect(domainOf('file:///x')).toBe('')
    expect(domainOf('not a url')).toBe('')
  })

  it('groupRuns domain mode does not group chrome:// URLs', () => {
    const items = groupRuns([entry('chrome://settings', 'S', 2), entry('chrome://settings/a', 'F', 1)], 'domain')
    expect(items.map((i) => i.type)).toEqual(['single', 'single'])
  })
})

describe('review regressions', () => {
  it('getDay keeps a url revisited later, at its visit time inside the day', async () => {
    const monday = new Date(2024, 0, 1, 10, 0).getTime()
    const tuesday = new Date(2024, 0, 2, 9, 0).getTime()
    vi.spyOn(chrome.history, 'search').mockResolvedValue([item('https://a', tuesday, 'A')] as never)
    vi.spyOn(chrome.history, 'getVisits').mockResolvedValue([{ visitTime: monday - 1000 }, { visitTime: monday }, { visitTime: tuesday }] as never)
    const h = useHistory()
    await h.getDay(new Date(2024, 0, 1))
    expect(h.days.value[0].entries.map((e) => e.lastVisitTime)).toEqual([monday])
  })

  it('a slow search does not overwrite a newer getDay', async () => {
    const t = new Date(2024, 0, 2, 12, 0).getTime()
    let resolveSearch!: (v: unknown[]) => void
    vi.spyOn(chrome.history, 'search')
      .mockImplementationOnce((() => new Promise((r) => { resolveSearch = r })) as never)
      .mockResolvedValueOnce([item('https://day', t, 'Day')] as never)
    const h = useHistory()
    const slow = h.search('x', new Date(2024, 0, 2))
    await h.getDay(new Date(2024, 0, 2))
    resolveSearch([item('https://search', t, 'Search')])
    await slow
    expect(h.days.value[0].entries.map((e) => e.url)).toEqual(['https://day'])
  })

  it('remove survives a rejected deleteUrl and only drops the deleted urls', async () => {
    const t = new Date(2024, 0, 2, 12, 0).getTime()
    vi.spyOn(chrome.history, 'search').mockResolvedValue([item('https://a', t, 'A'), item('https://b', t, 'B')] as never)
    vi.spyOn(chrome.history, 'deleteUrl').mockImplementation((({ url }: { url: string }) => (url === 'https://b' ? Promise.reject(new Error('policy')) : Promise.resolve())) as never)
    const h = useHistory()
    await h.getDay(new Date(2024, 0, 2))
    expect(await h.remove(['https://a', 'https://b'])).toBe(1)
    expect(h.days.value[0].entries.map((e) => e.url)).toEqual(['https://b'])
  })
})

describe('review regressions (second batch)', () => {
  it('site: accepts a pasted url', () => {
    expect(parseQuery('site:https://www.GitHub.com/vuejs?x=1').site).toBe('github.com')
    expect(parseQuery('site:github.com/').site).toBe('github.com')
  })

  it('a run keeps its key when the order is reversed', () => {
    const run = [entry('https://a/3', 'T', 3), entry('https://a/2', 'T', 2), entry('https://a/1', 'T', 1)]
    const key = (list: typeof run) => { const it = groupRuns(list, 'title')[0]; return it.type === 'run' ? it.key : '' }
    expect(key(run)).toBe('https://a/1::1')
    expect(key([...run].reverse())).toBe(key(run))
  })

  it('searching only flips once the results are shown', async () => {
    let resolveSearch!: (v: unknown[]) => void
    vi.spyOn(chrome.history, 'search').mockImplementationOnce((() => new Promise((r) => { resolveSearch = r })) as never)
    const h = useHistory()
    const pending = h.search('x', new Date(2024, 0, 2))
    expect(h.searching.value).toBe(false)
    resolveSearch([])
    expect(await pending).toBe(true)
    expect(h.searching.value).toBe(true)
  })

  it('getRecent spans several days', async () => {
    const spy = vi.spyOn(chrome.history, 'search').mockResolvedValue([item('https://a', new Date(2024, 0, 2, 0, 5).getTime()), item('https://b', new Date(2024, 0, 1, 23, 50).getTime())] as never)
    const h = useHistory()
    await h.getRecent(10)
    expect(spy).toHaveBeenLastCalledWith({ text: '', startTime: 0, maxResults: 10 })
    expect(h.days.value.flatMap((g) => g.entries.map((e) => e.url))).toEqual(['https://a', 'https://b'])
  })

  it('a site: search applies the cap after filtering', async () => {
    const t = new Date(2024, 0, 2, 12, 0).getTime()
    const spy = vi.spyOn(chrome.history, 'search').mockResolvedValue([item('https://other.com/', t + 3), item('https://a.com/1', t + 2), item('https://a.com/2', t + 1), item('https://a.com/3', t)] as never)
    const h = useHistory()
    await h.search('site:a.com', new Date(2024, 0, 2), 2)
    expect(spy.mock.calls.at(-1)![0]).toMatchObject({ maxResults: 0 })
    expect(h.days.value[0].entries.map((e) => e.url)).toEqual(['https://a.com/1', 'https://a.com/2'])
  })
})

describe('takeEntries', () => {
  const day = (dayKey: number, n: number) => ({ dayKey, date: new Date(dayKey), entries: Array.from({ length: n }, (_, i) => entry(`https://a.com/${dayKey}/${i}`, 'T', i)) })

  it('cuts across groups and records the real size of a cut group', () => {
    const out = takeEntries([day(3, 2), day(2, 3), day(1, 4)], 4)
    expect(out.map((g) => g.entries.length)).toEqual([2, 2])
    expect(out.map((g) => g.total)).toEqual([undefined, 3])
  })

  it('returns the same groups when the limit covers everything', () => {
    const days = [day(2, 2), day(1, 1)]
    expect(takeEntries(days, Infinity)).toEqual(days)
  })

  it('groupByDay precomputes the domain', () => {
    expect(groupByDay([item('https://www.a.com/x', new Date(2024, 0, 2, 12, 0).getTime())])[0].entries[0].domain).toBe('a.com')
  })
})
