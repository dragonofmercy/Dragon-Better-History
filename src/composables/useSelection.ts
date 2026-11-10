import { ref, computed } from 'vue'

export function useSelection() {
  // The set is mutated in place: Vue tracks `has(key)` per key, so a change only re-renders the rows it touches.
  const selected = ref<Set<string>>(new Set())
  let lastKey: string | null = null

  function toggle(key: string): void {
    if (!selected.value.delete(key)) selected.value.add(key)
    lastKey = key
  }

  function range(key: string, orderedKeys: string[]): void {
    if (lastKey === null) { toggle(key); return }
    const a = orderedKeys.indexOf(lastKey)
    const b = orderedKeys.indexOf(key)
    if (a === -1 || b === -1) { toggle(key); return }
    const [lo, hi] = a < b ? [a, b] : [b, a]
    for (let i = lo; i <= hi; i++) selected.value.add(orderedKeys[i])
    lastKey = key
  }

  function selectAll(orderedKeys: string[]): void {
    selected.value.clear()
    for (const k of orderedKeys) selected.value.add(k)
  }

  function clear(): void {
    selected.value.clear()
    lastKey = null
  }

  function isSelected(key: string): boolean {
    return selected.value.has(key)
  }

  const count = computed(() => selected.value.size)

  return { selected, count, toggle, range, selectAll, clear, isSelected }
}
