import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_PRIMARY_PROFILE, DEFAULT_PEOPLE } from '../data/primaryProfile'

const DEFAULT_WIDGET_ORDER = ['integral', 'natal', 'tr', 'hd', 'kab', 'num', 'gk', 'mayan', 'enn', 'chi', 'gem', 'pat', 'mbti', 'egyptian', 'vedic', 'tibetan', 'stars', 'dosha', 'archetype', 'lovelang']

export const useAboveInsideStore = create(
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
      activeDetail: null,
      setActiveDetail: (d) => set({ activeDetail: d }),

      synSelA: null,
      synSelB: null,
      setSynSel: (slot, id) => set(slot === 'A' ? { synSelA: id } : { synSelB: id }),

      // Widget order for drag and drop
      widgetOrder: [...DEFAULT_WIDGET_ORDER],
      setWidgetOrder: (order) => set({ widgetOrder: order }),

      // Hidden widgets (widget manager)
      hiddenWidgets: [],
      toggleWidgetVisibility: (id) =>
        set((s) => ({
          hiddenWidgets: s.hiddenWidgets.includes(id)
            ? s.hiddenWidgets.filter((w) => w !== id)
            : [...s.hiddenWidgets, id],
        })),

      // Layout mode: 'grid' | 'bento' | 'focus' | 'magazine'
      layoutMode: 'grid',
      setLayoutMode: (mode) => set({ layoutMode: mode }),

      // Theme: full key like 'cosmic-night' | 'cosmic-day' | 'parchment-night' | 'parchment-day' | 'crystal-night' | 'crystal-day' | 'dark' | 'light'
      theme: 'cosmic-night',
      themeStyle: 'cosmic',   // 'cosmic' | 'parchment' | 'crystal'
      themeMode: 'night',     // 'night' | 'day'
      setTheme: (style, mode) => {
        if (mode === undefined) {
          // Legacy single-arg call (e.g. 'dark' / 'light')
          set({ theme: style, themeStyle: style === 'light' ? 'cosmic' : 'cosmic', themeMode: style === 'light' ? 'day' : 'night' })
        } else {
          set({ theme: `${style}-${mode}`, themeStyle: style, themeMode: mode })
        }
      },

      // Active nav highlight
      activeNav: 'dashboard',
      setActiveNav: (id) => set({ activeNav: id }),

      // MBTI type (null = not determined, string = type code e.g. 'INFJ')
      mbtiType: null,
      setMbtiType: (type) => set({ mbtiType: type }),

      // Enneagram type (null = use default from data, number 1-9 = override)
      enneagramType: null,
      // Accepts (type) or (type, wing) — wing is optional
      setEnneagramType: (type, wing) =>
        wing !== undefined
          ? set({ enneagramType: type, enneagramWing: wing })
          : set({ enneagramType: type }),

      // Enneagram wing (null = auto from type data, number = explicit wing)
      enneagramWing: null,
      setEnneagramWing: (wing) => set({ enneagramWing: wing }),

      // Enneagram instinctual variant (null = default, 'sp'|'sx'|'so')
      enneagramInstinct: null,
      setEnneagramInstinct: (inst) => set({ enneagramInstinct: inst }),

      // Widget manager visibility
      showWidgetManager: false,
      setShowWidgetManager: (v) => set({ showWidgetManager: v }),

      // Dosha type (Ayurvedic constitution, e.g. 'Vata-Pitta')
      doshaType: null,
      setDoshaType: (type) => set({ doshaType: type }),

      // Archetype type (Jungian, e.g. 'The Magician')
      archetypeType: null,
      setArchetypeType: (type) => set({ archetypeType: type }),

      // Love Language (e.g. 'Quality Time')
      loveLanguage: null,
      setLoveLanguage: (lang) => set({ loveLanguage: lang }),

      // Subscription
      subscription: 'free', // 'free' | 'explorer' | 'practitioner'
      setSubscription: (plan) => set({ subscription: plan }),

      // User plan (mirrors subscription for component convenience)
      // 'free' | 'explorer' | 'practitioner'
      userPlan: 'explorer',
      setUserPlan: (plan) => set({ userPlan: plan }),

      // User role: 'user' | 'practitioner'
      userRole: 'user',
      setUserRole: (role) => set({ userRole: role }),
    }),
    { name: 'above-inside-store' }
  )
)
