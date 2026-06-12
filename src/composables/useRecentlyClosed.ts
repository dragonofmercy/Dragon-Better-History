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

  async function load(): Promise<void> {
    sessions.value = normalizeSessions(await sessionsGetRecentlyClosed())
  }

  async function restore(sessionId: string): Promise<void> {
    await sessionsRestore(sessionId)
    await load()
  }

  return { sessions, load, restore }
}
