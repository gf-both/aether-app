import { create } from 'zustand'
import { getAllBirthProfiles } from '../lib/db'
import { persist } from 'zustand/middleware'
import { DEFAULT_PRIMARY_PROFILE, DEFAULT_PEOPLE } from '../data/primaryProfile'

// Migrate localStorage key from old name
if (typeof window !== 'undefined') {
  const old = localStorage.getItem('above-inside-store')
  if (old && !localStorage.getItem('golem-store')) {
    localStorage.setItem('golem-store', old)
    localStorage.removeItem('above-inside-store')
  }
}

const DEFAULT_WIDGET_ORDER = ['natal', 'tr', 'hd', 'kab', 'gk', 'pat', 'mayan', 'chi', 'egyptian', 'num', 'gem', 'enn', 'mbti', 'dosha', 'archetype', 'lovelang', 'cycle', 'ritual', 'dream', 'sync', 'vedic', 'tibetan', 'timeline', 'career']

export const useGolemStore = create(
  persist(
    (set, get) => ({
      // ── Auth state ─────────────────────────────────────────
      user: null,
      userProfile: null,
      isAuthLoading: true,
      showAuthModal: false,
      setUser: (user) => set({ user }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      setAuthLoading: (loading) => set({ isAuthLoading: loading }),
      setShowAuthModal: (show) => set({ showAuthModal: show }),

      primaryProfile: { ...DEFAULT_PRIMARY_PROFILE },
      setPrimaryProfile: (updates) =>
        set((s) => ({ primaryProfile: { ...s.primaryProfile, ...updates } })),

      // View another person's chart without overwriting primary
      activeViewProfile: null,
      setActiveViewProfile: (profile) => set({ activeViewProfile: profile }),
      // Derived: the profile currently being viewed (activeViewProfile ?? primaryProfile)
      getActiveProfile: () => get().activeViewProfile || get().primaryProfile,

      people: [...DEFAULT_PEOPLE],
      addPerson: (person) =>
        set((s) => ({ people: [...s.people, {
          ...person,
          id: Date.now(),
          enneagramType: person.enneagramType || null,
          enneagramWing: person.enneagramWing || null,
          mbtiType: person.mbtiType || null,
          doshaType: person.doshaType || null,
          archetypeType: person.archetypeType || null,
          loveLanguage: person.loveLanguage || null,
        }] })),
      removePerson: (id) =>
        set((s) => ({ people: s.people.filter((p) => p.id !== id) })),
      updatePerson: (id, updates) =>
        set((s) => ({ people: s.people.map((p) => p.id === id ? { ...p, ...updates } : p) })),
      setPeople: (people) => set({ people }),

      // Load profiles from DB and populate store
      loadProfilesFromDB: async (userId) => {
        const { data, error } = await getAllBirthProfiles(userId)
        if (error || !data) return

        const primary = data.find(p => p.is_primary)
        const others = data.filter(p => !p.is_primary)

        const updates = {}
        if (primary) {
          updates.primaryProfile = {
            id: primary.id,
            name: primary.full_name || '',
            dob: primary.birth_date || '',
            tob: primary.birth_time || '',
            pob: primary.birth_city || '',
            birthLat: primary.birth_lat || 0,
            birthLon: primary.birth_lon || 0,
            birthTimezone: primary.birth_timezone != null ? Number(primary.birth_timezone) : 0,
            emoji: '✦',
            sign: '?', asc: '?', moon: '?',
            hdType: '?', hdProfile: '?', hdAuth: '?', hdDef: '?',
            lifePath: '?', crossGK: '?',
            enneagramType: primary.enneagram_type || null,
            enneagramWing: primary.enneagram_wing || null,
            mbtiType: primary.mbti_type || null,
            doshaType: primary.dosha_type || null,
            archetypeType: primary.archetype_type || null,
            loveLanguage: primary.love_language || null,
          }
          // Also sync top-level quiz store keys from primary profile
          if (primary.dosha_type) updates.doshaType = primary.dosha_type
          if (primary.love_language) updates.loveLanguage = primary.love_language
          if (primary.enneagram_type) updates.enneagramType = primary.enneagram_type
          if (primary.enneagram_wing) updates.enneagramWing = primary.enneagram_wing
          if (primary.mbti_type) updates.mbtiType = primary.mbti_type
          if (primary.archetype_type) updates.archetypeType = primary.archetype_type
        }
        if (others.length > 0) {
          updates.people = others.map(p => ({
            id: p.id,
            name: p.full_name || '',
            dob: p.birth_date || '',
            tob: p.birth_time || '',
            pob: p.birth_city || '',
            birthLat: p.birth_lat || 0,
            birthLon: p.birth_lon || 0,
            birthTimezone: p.birth_timezone != null ? Number(p.birth_timezone) : 0,
            rel: p.label || 'other',
            emoji: '✦',
            sign: '?',
            enneagramType: p.enneagram_type || null,
            enneagramWing: p.enneagram_wing || null,
            mbtiType: p.mbti_type || null,
            doshaType: p.dosha_type || null,
            archetypeType: p.archetype_type || null,
            loveLanguage: p.love_language || null,
          }))
        }
        set(updates)
      },

      activePanel: null,
      setActivePanel: (p) => set({ activePanel: p }),

      // Expanded detail view for a framework section
      activeDetail: null,
      setActiveDetail: (d) => set({ activeDetail: d }),

      // Oracle context — pages can inject extra context for the Oracle panel
      oracleContext: null,  // { label, profileName, profileData } | null
      setOracleContext: (ctx) => set({ oracleContext: ctx }),

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
      setHiddenWidgets: (list) => set({ hiddenWidgets: list }),

      // Layout mode: 'grid' | 'bento' | 'focus' | 'magazine'
      layoutMode: 'grid',
      setLayoutMode: (mode) => set({ layoutMode: mode }),

      // Theme: full key like 'cosmic-night' | 'cosmic-day' | 'parchment-night' | 'parchment-day' | 'crystal-night' | 'crystal-day' | 'dark' | 'light'
      theme: 'cosmic-night',
      themeStyle: 'cosmic',   // 'cosmic' | 'parchment' | 'crystal' | 'nebula' | 'manuscript'
      themeMode: 'night',     // 'night' | 'day'
      setTheme: (style, mode) => {
        if (mode === undefined) {
          // Legacy single-arg call (e.g. 'dark' / 'light')
          set({ theme: style, themeStyle: style === 'light' ? 'cosmic' : 'cosmic', themeMode: style === 'light' ? 'day' : 'night' })
        } else {
          set({ theme: `${style}-${mode}`, themeStyle: style, themeMode: mode })
        }
      },

      // Oracle AI panel state
      oracleOpen: false,
      setOracleOpen: (v) => set({ oracleOpen: v }),

      // Active quiz overlay
      activeQuiz: null, // 'enneagram' | 'mbti' | 'dosha' | 'archetype' | 'lovelang' | null
      setActiveQuiz: (quiz) => set({ activeQuiz: quiz }),

      // Sidebar collapse state
      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

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

      // Dosha type — writes to the active profile, not a global field
      doshaType: null, // legacy field kept for migration compatibility
      setDoshaType: (type) => set((s) => {
        if (s.activeViewProfile) {
          const updated = { ...s.activeViewProfile, doshaType: type }
          const people = s.people.map(p => p.id === updated.id ? updated : p)
          return { activeViewProfile: updated, people }
        }
        return { primaryProfile: { ...s.primaryProfile, doshaType: type } }
      }),

      // Archetype type — writes to the active profile
      archetypeType: null, // legacy field kept for migration compatibility
      setArchetypeType: (type) => set((s) => {
        if (s.activeViewProfile) {
          const updated = { ...s.activeViewProfile, archetypeType: type }
          const people = s.people.map(p => p.id === updated.id ? updated : p)
          return { activeViewProfile: updated, people }
        }
        return { primaryProfile: { ...s.primaryProfile, archetypeType: type } }
      }),

      // Love Language — writes to the active profile
      loveLanguage: null, // legacy field kept for migration compatibility
      setLoveLanguage: (lang) => set((s) => {
        if (s.activeViewProfile) {
          const updated = { ...s.activeViewProfile, loveLanguage: lang }
          const people = s.people.map(p => p.id === updated.id ? updated : p)
          return { activeViewProfile: updated, people }
        }
        return { primaryProfile: { ...s.primaryProfile, loveLanguage: lang } }
      }),

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

      // ─── Practitioner State ───────────────────────────────────────────────

      // Whether the current user is operating in practitioner mode
      isPractitioner: false,
      setIsPractitioner: (v) => set({ isPractitioner: v }),

      // Active session: { clientId, startTime, notes, actionItems, frameworks, checkedItems, starredQuestions }
      activeSession: null,

      startSession: (clientId) => set({
        activeSession: {
          clientId,
          startTime: Date.now(),
          notes: '',
          actionItems: [],
          frameworks: [],
          checkedItems: {},
          starredQuestions: {},
          analysis: null,
        },
      }),

      updateSessionNotes: (notes) =>
        set((s) => ({
          activeSession: s.activeSession
            ? { ...s.activeSession, notes }
            : s.activeSession,
        })),

      updateSessionAnalysis: (analysis) =>
        set((s) => ({
          activeSession: s.activeSession
            ? { ...s.activeSession, analysis }
            : s.activeSession,
        })),

      updateSessionActionItems: (actionItems) =>
        set((s) => ({
          activeSession: s.activeSession
            ? { ...s.activeSession, actionItems }
            : s.activeSession,
        })),

      updateSessionCheckedItems: (checkedItems) =>
        set((s) => ({
          activeSession: s.activeSession
            ? { ...s.activeSession, checkedItems }
            : s.activeSession,
        })),

      updateSessionFrameworks: (frameworks) =>
        set((s) => ({
          activeSession: s.activeSession
            ? { ...s.activeSession, frameworks }
            : s.activeSession,
        })),

      endSession: () =>
        set((s) => {
          if (!s.activeSession) return {}
          const session = { ...s.activeSession, endTime: Date.now() }
          const clientId = session.clientId
          const existing = s.sessionHistory[clientId] || []
          return {
            sessionHistory: {
              ...s.sessionHistory,
              [clientId]: [...existing, session],
            },
            activeSession: null,
          }
        }),

      // Session history: { [clientId]: [session, ...] }
      sessionHistory: {},

      // Family constellations: { [clientId]: [member, ...] }
      familyConstellations: {},

      addFamilyMember: (clientId, member) =>
        set((s) => ({
          familyConstellations: {
            ...s.familyConstellations,
            [clientId]: [
              ...(s.familyConstellations[clientId] || []),
              { ...member, id: member.id || Date.now().toString() },
            ],
          },
        })),

      updateFamilyMember: (clientId, memberId, updates) =>
        set((s) => ({
          familyConstellations: {
            ...s.familyConstellations,
            [clientId]: (s.familyConstellations[clientId] || []).map((m) =>
              m.id === memberId ? { ...m, ...updates } : m
            ),
          },
        })),

      removeFamilyMember: (clientId, memberId) =>
        set((s) => ({
          familyConstellations: {
            ...s.familyConstellations,
            [clientId]: (s.familyConstellations[clientId] || []).filter(
              (m) => m.id !== memberId
            ),
          },
        })),

      // Practitioner clients list (for future multi-client support)
      practitionerClients: [],
      addPractitionerClient: (client) =>
        set((s) => ({
          practitionerClients: [
            ...s.practitionerClients,
            { ...client, id: client.id || Date.now().toString() },
          ],
        })),

      // ─── Dream Journal ────────────────────────────────────────────────────
      dreams: [],
      addDream: (dream) =>
        set((s) => ({ dreams: [dream, ...s.dreams] })),
      updateDream: (id, updates) =>
        set((s) => ({ dreams: s.dreams.map(d => d.id === id ? { ...d, ...updates } : d) })),
      deleteDream: (id) =>
        set((s) => ({ dreams: s.dreams.filter(d => d.id !== id) })),

      // ─── Synchronicity Log ────────────────────────────────────────────────
      syncs: [],
      addSync: (sync) =>
        set((s) => ({ syncs: [sync, ...s.syncs] })),
      updateSync: (id, updates) =>
        set((s) => ({ syncs: s.syncs.map(e => e.id === id ? { ...e, ...updates } : e) })),
      deleteSync: (id) =>
        set((s) => ({ syncs: s.syncs.filter(e => e.id !== id) })),
    }),
    {
      name: 'golem-store',
      version: 9,
      migrate: (persistedState, version) => {
        if (version < 2) {
          return { ...persistedState, primaryProfile: undefined }
        }
        if (version < 5) {
          persistedState = {
            ...persistedState,
            hiddenWidgets: [],
            widgetOrder: ['natal', 'tr', 'hd', 'kab', 'num', 'gk', 'mayan', 'enn', 'chi', 'gem', 'pat', 'mbti', 'egyptian', 'vedic', 'tibetan', 'dosha', 'archetype', 'lovelang', 'timeline']
          }
        }
        if (version < 6) {
          const order = persistedState.widgetOrder || []
          if (!order.includes('cycle')) {
            const llIdx = order.indexOf('lovelang')
            if (llIdx >= 0) order.splice(llIdx + 1, 0, 'cycle')
            else order.push('cycle')
            persistedState = { ...persistedState, widgetOrder: [...order] }
          }
        }
        if (version < 7) {
          // Add 'dream' after 'cycle' if not already present
          const order = persistedState.widgetOrder || []
          if (!order.includes('dream')) {
            const cycleIdx = order.indexOf('cycle')
            if (cycleIdx >= 0) order.splice(cycleIdx + 1, 0, 'dream')
            else order.push('dream')
            persistedState = { ...persistedState, widgetOrder: [...order], dreams: persistedState.dreams || [] }
          }
        }
        if (version < 8) {
          const order = persistedState.widgetOrder || []
          if (!order.includes('ritual')) {
            const dreamIdx = order.indexOf('dream')
            if (dreamIdx >= 0) order.splice(dreamIdx, 0, 'ritual')
            else order.push('ritual')
            persistedState = { ...persistedState, widgetOrder: [...order] }
          }
        }
        if (version < 9) {
          // Add 'sync' after 'dream' if not already present
          const order = persistedState.widgetOrder || []
          if (!order.includes('sync')) {
            const dreamIdx = order.indexOf('dream')
            if (dreamIdx >= 0) order.splice(dreamIdx + 1, 0, 'sync')
            else order.push('sync')
            persistedState = { ...persistedState, widgetOrder: [...order], syncs: persistedState.syncs || [] }
          }
        }
        return persistedState
      }
    }
  )
)
