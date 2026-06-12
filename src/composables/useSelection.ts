import { ref, computed } from 'vue'

export function useSelection() {
  const selected = ref<Set<string>>(new Set())
  let lastKey: string | null = null

  function toggle(key: string): void {
    const next = new Set(selected.value)
    if (next.has(key)) next.delete(key); else next.add(key)
    selected.value = next
    lastKey = key
  }

  function range(key: string, orderedKeys: string[]): void {
    if (lastKey === null) { toggle(key); return }
    const a = orderedKeys.indexOf(lastKey)
    const b = orderedKeys.indexOf(key)
    if (a === -1 || b === -1) { toggle(key); return }
    const [lo, hi] = a < b ? [a, b] : [b, a]
    const next = new Set(selected.value)
    for (let i = lo; i <= hi; i++) next.add(orderedKeys[i])
    selected.value = next
    lastKey = key
  }

  function selectAll(orderedKeys: string[]): void {
    selected.value = new Set(orderedKeys)
  }

  function clear(): void {
    selected.value = new Set()
    lastKey = null
  }

  function isSelected(key: string): boolean {
    return selected.value.has(key)
  }

  const count = computed(() => selected.value.size)

  return { selected, count, toggle, range, selectAll, clear, isSelected }
}
