import { reactive } from 'vue'

export type Theme = 'system' | 'light' | 'dark'
export type GroupMode = 'none' | 'title' | 'domain'

export interface Options {
  use24HoursFormat: boolean
  timeBeforeTitle: boolean
  dense: boolean
  groupMode: GroupMode
  sortOldestFirst: boolean
  popupNbItems: number
  theme: Theme
}

export const DEFAULT_OPTIONS: Options = {
  use24HoursFormat: true,
  timeBeforeTitle: false,
  dense: false,
  groupMode: 'none',
  sortOldestFirst: false,
  popupNbItems: 10,
  theme: 'system'
}

export function useOptions() {
  const options = reactive<Options>({ ...DEFAULT_OPTIONS })

  // storage.sync.get(defaults) applies the defaults and returns only the known keys.
  // groupMode defaults to null so a stored value can be told apart from the legacy groupConsecutive boolean it replaces.
  async function load(): Promise<void> {
    const { groupConsecutive, groupMode, ...stored } = await chrome.storage.sync.get({ ...DEFAULT_OPTIONS, groupMode: null, groupConsecutive: false })
    Object.assign(options, stored)
    options.groupMode = (groupMode as GroupMode | null | undefined) ?? (groupConsecutive ? 'title' : 'none')
    options.popupNbItems = Number(options.popupNbItems)
  }

  async function save(next: Partial<Options>): Promise<void> {
    Object.assign(options, next)
    // Write only the delta: a full snapshot would revert changes made from another tab or device.
    await chrome.storage.sync.set(next)
  }

  return { options, load, save }
}
