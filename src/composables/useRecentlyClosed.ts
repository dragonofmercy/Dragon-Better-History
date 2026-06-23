import { ref } from 'vue'
import { sessionsGetRecentlyClosed, sessionsRestore } from '@/lib/chrome'

export type ClosedSession =
  | { type: 'tab'; sessionId: string; title: string; url: string; lastModified: number }
  | { type: 'window'; sessionId: string; tabCount: number; lastModified: number }

export function normalizeSessions(raw: chrome.sessions.Session[]): ClosedSession[] {
  const out: ClosedSession[] = []
  for (const s of raw) {
    const lastModified = (s.lastModified ?? 0) * 1000
    if (s.tab && s.tab.sessionId) {
      const url = s.tab.url ?? ''
      out.push({ type: 'tab', sessionId: s.tab.sessionId, url, title: s.tab.title || url, lastModified })
    } else if (s.window && s.window.sessionId) {
      out.push({ type: 'window', sessionId: s.window.sessionId, tabCount: s.window.tabs?.length ?? 0, lastModified })
    }
  }
  return out.sort((a, b) => b.lastModified - a.lastModified)
}

export function useRecentlyClosed() {
  const sessions = ref<ClosedSession[]>([])
  const loading = ref(false)
  const error = ref(false)

  async function load(maxResults?: number): Promise<void> {
    loading.value = true
    error.value = false
    try {
      const raw = await sessionsGetRecentlyClosed(maxResults ? { maxResults } : undefined)
      sessions.value = normalizeSessions(raw)
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  async function restore(sessionId: string): Promise<void> {
    try {
      await sessionsRestore(sessionId)
      sessions.value = sessions.value.filter((s) => s.sessionId !== sessionId)
    } catch {
      await load()
    }
  }

  return { sessions, loading, error, load, restore }
}
