import { vi } from 'vitest'

const store: Record<string, unknown> = {}

;(globalThis as unknown as { chrome: unknown }).chrome = {
  runtime: { lastError: undefined, id: 'test', getURL: (p: string) => `chrome-extension://test${p}` },
  i18n: { getMessage: (key: string) => (key === 'language' ? 'en' : key) },
  storage: {
    sync: {
      get: () => Promise.resolve({ ...store }),
      set: (items: Record<string, unknown>) => { Object.assign(store, items); return Promise.resolve() }
    }
  },
  history: {
    search: () => Promise.resolve([]),
    getVisits: () => Promise.resolve([]),
    onVisitRemoved: { addListener: () => {} },
    deleteUrl: () => Promise.resolve()
  },
  sessions: {
    MAX_SESSION_RESULTS: 25,
    getRecentlyClosed: () => Promise.resolve([]),
    restore: () => Promise.resolve()
  },
  tabs: { create: vi.fn(() => Promise.resolve({})), getCurrent: vi.fn(() => Promise.resolve(undefined)) }
}

// jsdom has no IntersectionObserver; the history list only needs it to exist.
globalThis.IntersectionObserver = class { observe(): void {} unobserve(): void {} disconnect(): void {} } as unknown as typeof IntersectionObserver

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn()
  }))
}
