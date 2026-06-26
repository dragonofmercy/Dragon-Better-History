import { reactive } from 'vue'
import { storageGet, storageSet } from '@/lib/chrome'

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

  async function load(): Promise<void> {
    const items = await storageGet()
    options.use24HoursFormat = (items.use24HoursFormat as boolean | undefined) ?? DEFAULT_OPTIONS.use24HoursFormat
    options.timeBeforeTitle = (items.timeBeforeTitle as boolean | undefined) ?? DEFAULT_OPTIONS.timeBeforeTitle
    options.groupConsecutive = (items.groupConsecutive as boolean | undefined) ?? DEFAULT_OPTIONS.groupConsecutive
    options.popupNbItems = Number(items.popupNbItems ?? DEFAULT_OPTIONS.popupNbItems)
    options.theme = (items.theme as Theme | undefined) ?? DEFAULT_OPTIONS.theme
  }

  async function save(next: Partial<Options>): Promise<void> {
    Object.assign(options, next)
    await storageSet({ ...options })
  }

  return { options, load, save }
}
