import { reactive } from 'vue'

export type Theme = 'system' | 'light' | 'dark'

export interface Options {
  use24HoursFormat: boolean
  timeBeforeTitle: boolean
  groupConsecutive: boolean
  popupNbItems: number
  theme: Theme
}

export const DEFAULT_OPTIONS: Options = {
  use24HoursFormat: true,
  timeBeforeTitle: false,
  groupConsecutive: false,
  popupNbItems: 10,
  theme: 'system'
}

export function useOptions() {
  const options = reactive<Options>({ ...DEFAULT_OPTIONS })

  // storage.sync.get(defaults) applies the defaults and returns only the known keys.
  async function load(): Promise<void> {
    Object.assign(options, await chrome.storage.sync.get(DEFAULT_OPTIONS))
    options.popupNbItems = Number(options.popupNbItems)
  }

  async function save(next: Partial<Options>): Promise<void> {
    Object.assign(options, next)
    await chrome.storage.sync.set({ ...options })
  }

  return { options, load, save }
}
