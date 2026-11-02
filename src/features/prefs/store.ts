import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type Preferences = {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'taskflow-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
