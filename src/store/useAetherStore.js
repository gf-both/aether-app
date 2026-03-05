import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_PRIMARY_PROFILE, DEFAULT_PEOPLE } from '../data/primaryProfile'

const DEFAULT_WIDGET_ORDER = ['natal', 'hd', 'kab', 'num', 'gk', 'tr']

export const useAetherStore = create(
  persist(
    (set, get) => ({
      primaryProfile: { ...DEFAULT_PRIMARY_PROFILE },
      setPrimaryProfile: (updates) =>
        set((s) => ({ primaryProfile: { ...s.primaryProfile, ...updates } })),

      people: [...DEFAULT_PEOPLE],
      addPerson: (person) =>
        set((s) => ({ people: [...s.people, { ...person, id: Date.now() }] })),
      removePerson: (id) =>
        set((s) => ({ people: s.people.filter((p) => p.id !== id) })),
      updatePerson: (id, updates) =>
        set((s) => ({ people: s.people.map((p) => p.id === id ? { ...p, ...updates } : p) })),

      activePanel: null,
      setActivePanel: (p) => set({ activePanel: p }),

      // Expanded detail view for a framework section
      activeDetail: null, // 'natal' | 'hd' | 'kab' | 'num' | 'gk' | 'transits' | null
      setActiveDetail: (d) => set({ activeDetail: d }),

      synSelA: null,
      synSelB: null,
      setSynSel: (slot, id) => set(slot === 'A' ? { synSelA: id } : { synSelB: id }),

      // Widget order for drag and drop
      widgetOrder: [...DEFAULT_WIDGET_ORDER],
      setWidgetOrder: (order) => set({ widgetOrder: order }),

      // Active nav highlight
      activeNav: 'dashboard',
      setActiveNav: (id) => set({ activeNav: id }),
    }),
    { name: 'aether-store' }
  )
)
