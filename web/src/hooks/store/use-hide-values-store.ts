import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface HideValuesStore {
  hideValues: boolean
  toggleHideValues: () => void
}

export const useHideValuesStore = create<HideValuesStore>()(
  persist(
    set => ({
      hideValues: false,
      toggleHideValues: () => set(state => ({ hideValues: !state.hideValues })),
    }),
    { name: 'hide-values' },
  ),
)
