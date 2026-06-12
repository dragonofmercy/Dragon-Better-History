import { vi } from 'vitest'

const store: Record<string, unknown> = {}

;(globalThis as unknown as { chrome: unknown }).chrome = {
  runtime: { lastError: undefined, id: 'test', getURL: (p: string) => `chrome-extension://test${p}` },
  i18n: { getMessage: (key: string) => key },
  storage: {
    sync: {
      get: (_keys: unknown, cb: (items: Record<string, unknown>) => void) => cb({ ...store }),
      set: (items: Record<string, unknown>, cb: () => void) => { Object.assign(store, items); cb() }
    }
  },
  history: {
    search: (_q: unknown, cb: (results: unknown[]) => void) => cb([]),
    deleteUrl: (_d: unknown, cb: () => void) => cb()
  },
  tabs: { create: vi.fn() }
}

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn()
  }))
}
