import { useState, useRef, useEffect, useMemo, lazy, Suspense } from 'react'
import { useAboveInsideStore } from '../store/useAboveInsideStore'
import { useActiveProfile } from '../hooks/useActiveProfile'
import { DEFAULT_PRIMARY_PROFILE } from '../data/primaryProfile'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import StatusBar from '../components/layout/StatusBar'
import Starfield from '../components/Starfield'
import NatalWheel from '../components/canvas/NatalWheel'
import HumanDesign from '../components/canvas/HumanDesign'
import KabbalahTree from '../components/canvas/KabbalahTree'
import GeneKeysWheel from '../components/canvas/GeneKeysWheel'
import NumerologyBars from '../components/canvas/NumerologyBars'
import MayanWheel from '../components/canvas/MayanWheel'
import EnneagramSymbol from '../components/canvas/EnneagramSymbol'
import ChineseZodiac from '../components/canvas/ChineseZodiac'
import GematriaChart from '../components/canvas/GematriaChart'
import PatternsWeb from '../components/canvas/PatternsWeb'
import MBTIChart from '../components/canvas/MBTIChart'
import EgyptianChart from '../components/canvas/EgyptianChart'
import VedicChart from '../components/canvas/VedicChart'
import DoshaSymbol from '../components/canvas/DoshaSymbol'
import LoveLangSymbol from '../components/canvas/LoveLangSymbol'
import ArchetypeSymbol from '../components/canvas/ArchetypeSymbol'
import TibetanWheel from '../components/canvas/TibetanWheel'
import IntegralFigure from '../components/canvas/IntegralFigure'
import NatalDetail from '../components/details/NatalDetail'
import HDDetail from '../components/details/HDDetail'
import KabbalahDetail from '../components/details/KabbalahDetail'
import NumerologyDetail from '../components/details/NumerologyDetail'
import GeneKeysDetail from '../components/details/GeneKeysDetail'
import TransitsDetail from '../components/details/TransitsDetail'
import MayanDetail from '../components/details/MayanDetail'
import EnneagramDetail from '../components/details/EnneagramDetail'
import ChineseDetail from '../components/details/ChineseDetail'
import GematriaDetail from '../components/details/GematriaDetail'
import PatternsDetail from '../components/details/PatternsDetail'
import MBTIDetail from '../components/details/MBTIDetail'
import EgyptianDetail from '../components/details/EgyptianDetail'
import VedicDetail from '../components/details/VedicDetail'
import IntegralDetail from '../components/details/IntegralDetail'
import SynastryDetail from '../components/details/SynastryDetail'
import ProfileDetail from '../components/details/ProfileDetail'
import TibetanDetail from '../components/details/TibetanDetail'
import DoshaDetail from '../components/details/DoshaDetail'
import ArchetypeDetail from '../components/details/ArchetypeDetail'
import LoveLangDetail from '../components/details/LoveLangDetail'
import TimelineDetail from '../components/details/TimelineDetail'
import CareerAlignmentDetail from '../components/details/CareerAlignmentDetail'
import CareerWheel from '../components/canvas/CareerWheel'
import TimelineWidget from '../components/canvas/TimelineWidget'
const PricingPage = lazy(() => import('./PricingPage'))
const PractitionerPortal = lazy(() => import('./PractitionerPortal'))
const ClientPortal = lazy(() => import('./ClientPortal'))
const AIAgentsPage = lazy(() => import('./AIAgentsPage'))
const IdentityAgent = lazy(() => import('./IdentityAgent'))
const RelationshipAgent = lazy(() => import('./RelationshipAgent'))
const LifeDirectionAgent = lazy(() => import('./LifeDirectionAgent'))
import CompanyPage from './CompanyPage'
const GolemPage = lazy(() => import('./GolemPage'))
const WendyPage = lazy(() => import('./WendyPage'))
const DatingPage = lazy(() => import('./DatingPage'))
const GolemSimulation = lazy(() => import('./GolemSimulation'))
import SettingsPage from './SettingsPage'
const AdminPanel = lazy(() => import('./AdminPanel'))
import { PLANET_SYMBOLS, PLANET_ORDER } from '../data/hdData'
import { computeHDChart, buildHDTags } from '../engines/hdEngine'
import { GK_LIST } from '../data/geneKeysData'
import { MAYAN_PROFILE, computeFullProfile as computeMayanProfile } from '../data/mayanData'
import { getChineseProfileFromDob } from '../engines/chineseEngine'
import { ENNEAGRAM_PROFILE, ENNEAGRAM_TYPES } from '../data/enneagramData'
import { CHINESE_PROFILE } from '../data/chineseData'
import { GEMATRIA_PROFILE } from '../data/gematriaData'
import { CROSS_FRAMEWORK_ALIGNMENTS } from '../data/patternsData'
import { EGYPTIAN_PROFILE } from '../data/egyptianData'
import { getEgyptianSign } from '../engines/egyptianEngine'
import { getNumerologyProfileFromDob } from '../engines/numerologyEngine'

// ── Drag-to-reorder hook (pointer events, works on mouse + touch) ──
function useDragReorder(widgetOrder, setWidgetOrder, hiddenWidgets) {
  const [dragId, setDragId] = useState(null)
  const [overIdx, setOverIdx] = useState(null)
  const ghostRef = useRef(null)
  const dropTargetRef = useRef(null) // track drop target separately

  function startDrag(e, widgetId) {
    e.preventDefault()
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    setDragId(widgetId)
    dropTargetRef.current = null

    // Create a simple ghost div (not cloneNode — avoids canvas crashes)
    const ghost = document.createElement('div')
    ghost.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999; opacity:0;
      width:${rect.width}px; height:${rect.height}px;
      left:0; top:0;
      transform: translate(${rect.left}px, ${rect.top}px) scale(1.03);
      will-change: transform;
      background: rgba(201,168,76,.08);
      border: 2px solid rgba(201,168,76,.5);
      border-radius: 8px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,.3);
      transition: opacity .1s;
    `
    document.body.appendChild(ghost)
    ghostRef.current = ghost
    // Fade in
    requestAnimationFrame(() => { if (ghost) ghost.style.opacity = '1' })

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const offsetX = clientX - rect.left
    const offsetY = clientY - rect.top

    function onMove(ev) {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY
      if (ghostRef.current) {
        ghostRef.current.style.transform = `translate(${cx - offsetX}px, ${cy - offsetY}px) scale(1.03)`
      }
      // Ghost is pointer-events:none so elementFromPoint works without tricks
      const target = document.elementFromPoint(cx, cy)
      const card = target?.closest('[data-widget]')
      if (card) {
        const targetId = card.dataset.widget
        dropTargetRef.current = targetId
        const visibleWidgets = (Array.isArray(widgetOrder) ? widgetOrder : []).filter(w => !(Array.isArray(hiddenWidgets) ? hiddenWidgets : []).includes(w))
        const idx = visibleWidgets.indexOf(targetId)
        setOverIdx(idx >= 0 ? idx : null)
      } else {
        dropTargetRef.current = null
        setOverIdx(null)
      }
    }

    function onEnd() {
      // Clean up ghost first
      if (ghostRef.current) {
        ghostRef.current.style.opacity = '0'
        const g = ghostRef.current
        ghostRef.current = null
        setTimeout(() => g.remove(), 150)
      }

      // Apply reorder using tracked drop target (avoids elementFromPoint after ghost removal)
      const dropId = dropTargetRef.current
      dropTargetRef.current = null
      if (dropId && dropId !== widgetId) {
        setWidgetOrder(prev => {
            if (!Array.isArray(prev)) return prev
          const arr = [...prev]
          const fromIdx = arr.indexOf(widgetId)
          const toIdx = arr.indexOf(dropId)
          if (fromIdx !== -1 && toIdx !== -1) {
            arr.splice(fromIdx, 1)
            arr.splice(toIdx, 0, widgetId)
          }
          return arr
        })
      }

      setDragId(null)
      setOverIdx(null)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('mouseup', onEnd)
      document.removeEventListener('touchend', onEnd)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('mouseup', onEnd)
    document.addEventListener('touchend', onEnd)
  }

  return { dragId, overIdx, startDrag }
}

// TODO: compute from profile using transitsEngine — currently static demo data
const TRANSITS = [
  { sym: '\u2609', color: '#f0c040', sign: "Pisces 13\u00B047\u2032", aspect: '\u25B3 Natal Moon \u00B7 Trine', aspLabel: 'Trine \u25B3', aspColor: 'rgba(255,200,60,.7)', pct: 78, gradient: 'linear-gradient(90deg,#f0c040,#e8c07a)' },
  { sym: '\u263D', color: '#ccd5f0', sign: "Virgo 28\u00B012\u2032", aspect: '\u260D Natal Sun \u00B7 Opposition', aspLabel: 'Oppos \u260D', aspColor: 'rgba(200,80,80,.8)', pct: 92, gradient: 'linear-gradient(90deg,#8899cc,#aabbee)' },
  { sym: '\u263F', color: '#99ccee', sign: "Aquarius 7\u00B003\u2032", aspect: 'Direct \u00B7 Applying ASC', aspLabel: 'Direct \u2726', aspColor: 'rgba(153,204,238,.7)', pct: 45, gradient: 'linear-gradient(90deg,#99bbdd,#77aacc)' },
  { sym: '\u2640', color: '#ddaa88', sign: "Aries 2\u00B055\u2032", aspect: '\u25A1 Natal Mars \u00B7 Square', aspLabel: 'Square \u25A1', aspColor: 'rgba(220,80,80,.7)', pct: 60, gradient: 'linear-gradient(90deg,#cc9977,#e0aa88)' },
  { sym: '\u2642', color: '#ee6644', sign: "Cancer 21\u00B018\u2032", aspect: '\u260C IC \u00B7 Conjunction', aspLabel: 'Conjunct \u260C', aspColor: 'rgba(238,102,68,.8)', pct: 82, gradient: 'linear-gradient(90deg,#dd6644,#ee8866)' },
  { sym: '\u2643', color: '#e8c040', sign: "Gemini 14\u00B044\u2032", aspect: '\u25B3 Natal Jupiter \u00B7 Trine', aspLabel: 'Trine \u25B3', aspColor: 'rgba(232,192,64,.7)', pct: 55, gradient: 'linear-gradient(90deg,#e8c040,#f0d060)' },
  { sym: '\u2644', color: '#aabb88', sign: "Pisces 29\u00B058\u2032", aspect: '\u22BC Natal Jupiter', aspLabel: 'Quincx \u22BC', aspColor: 'rgba(170,187,136,.6)', pct: 38, gradient: 'linear-gradient(90deg,#aaaa88,#ccccaa)' },
  { sym: '\u2645', color: '#88ddcc', sign: "Taurus 24\u00B011\u2032", aspect: 'Stationary Direct', aspLabel: 'Station', aspColor: 'rgba(136,221,204,.6)', pct: 30, gradient: 'linear-gradient(90deg,#88ddcc,#aaeedd)' },
  { sym: '\u2646', color: '#6699ee', sign: "Aries 3\u00B022\u2032", aspect: '\u25A1 Natal Neptune', aspLabel: 'Square \u25A1', aspColor: 'rgba(102,136,238,.7)', pct: 70, gradient: 'linear-gradient(90deg,#6688dd,#8899ee)' },
]

const NUM_CELLS = [
  { val: 7, label: 'Life Path', hl: true },
  { val: 1, label: 'Expression' },
  { val: 3, label: 'Soul Urge' },
  { val: 11, label: 'Master', master: true },
  { val: 23, label: 'Birthday' },
  { val: 8, label: 'Maturity' },
  { val: 22, label: 'M.Builder', master: true },
  { val: 7, label: 'Personality' },
  { val: 6, label: 'Pinnacle I' },
  { val: 6, label: 'Pinnacle II' },
]

const DELAYS = ['.04s', '.08s', '.12s', '.16s', '.2s', '.24s', '.28s', '.32s', '.36s', '.4s', '.44s', '.48s', '.52s']

/* ── Constellation Grid: Row definitions ── */
const ROWS = [
  {
    label: 'CORE STRUCTURAL SYSTEMS',
    sub: 'Foundational Maps \u00B7 Birth Charts \u00B7 Energy Systems',
    color: 'var(--foreground)',
    border: 'rgba(201,168,76,.3)',
    widgets: ['natal', 'tr', 'hd', 'kab'],
    cols: '1.5fr 1fr 1.5fr 1fr',
  },
  {
    label: 'ARCHETYPAL SYSTEMS',
    sub: 'Calendars \u00B7 Animals \u00B7 Ancient Wisdom \u00B7 Egyptian',
    color: 'var(--violet2)',
    border: 'rgba(144,80,224,.3)',
    widgets: ['mayan', 'chi', 'egyptian'],
    cols: '1fr 1fr 1fr',
  },
  {
    label: 'META SYSTEMS',
    sub: 'Consciousness Maps \u00B7 Gene Keys \u00B7 Cross-Framework Intelligence',
    color: 'var(--aqua2)',
    border: 'rgba(64,204,221,.3)',
    widgets: ['gk', 'integral', 'pat'],
    cols: '1fr 1.3fr 1fr',
  },
  {
    label: 'SACRED MATHEMATICS',
    sub: 'Numerology \u00B7 Gematria \u00B7 Number Systems \u00B7 Vibrational Codes',
    color: 'rgba(240,160,60,1)',
    border: 'rgba(240,160,60,.3)',
    widgets: ['num', 'gem'],
    cols: '1fr 1fr',
  },
  {
    label: 'SELF KNOWLEDGE',
    sub: 'Personality \u00B7 Types \u00B7 Quizzes \u00B7 Dosha \u00B7 Archetypes',
    color: '#a878e8',
    border: 'rgba(168,120,232,.3)',
    widgets: ['enn', 'mbti', 'dosha', 'archetype', 'lovelang'],
    cols: 'repeat(5, 1fr)',
  },
  {
    label: 'EASTERN WISDOM',
    sub: 'Jyotish \u00B7 Sidereal \u00B7 Nakshatras \u00B7 Dasha',
    color: 'rgba(160,100,255,1)',
    border: 'rgba(160,100,255,.3)',
    widgets: ['vedic'],
    cols: '1fr',
  },
  {
    label: 'TIBETAN ASTROLOGY',
    sub: 'Losar Calendar \u00B7 Mewa \u00B7 Ancient Wisdom',
    color: '#e8a040',
    border: 'rgba(232,160,64,.3)',
    widgets: ['tibetan'],
    cols: '1fr',
  },
  {
    label: 'LIFE TIMELINE',
    sub: 'Your Life Arc · Saturn Returns · Jupiter Cycles · Numerology Peaks',
    color: '#c9a84c',
    border: 'rgba(201,168,76,.3)',
    widgets: ['timeline'],
    cols: '1fr',
  },
]

const CARD_HEIGHT = 520

const CONSTELLATION_LINKS = [
  ['gk', 'hd'], ['natal', 'tr'], ['num', 'gem'], ['enn', 'mbti'],
  ['kab', 'integral'], ['natal', 'hd'], ['mayan', 'chi'],
]

const DETAIL_COMPONENTS = {
  'identity-agent': IdentityAgent,
  'relationship-agent': RelationshipAgent,
  'life-direction': LifeDirectionAgent,
  integral: IntegralDetail,
  natal: NatalDetail,
  hd: HDDetail,
  kab: KabbalahDetail,
  num: NumerologyDetail,
  gk: GeneKeysDetail,
  tr: TransitsDetail,
  mayan: MayanDetail,
  enn: EnneagramDetail,
  chi: ChineseDetail,
  gem: GematriaDetail,
  pat: PatternsDetail,
  mbti: MBTIDetail,
  egyptian: EgyptianDetail,
  vedic: VedicDetail,
  tibetan: TibetanDetail,
  dosha: DoshaDetail,
  archetype: ArchetypeDetail,
  lovelang: LoveLangDetail,
  timeline: TimelineDetail,
  career: CareerAlignmentDetail,
  synastry: SynastryDetail,
  profile: ProfileDetail,
  pricing: PricingPage,
  practitioner: PractitionerPortal,
  client: ClientPortal,
  aiagents: AIAgentsPage,
  company: CompanyPage,
  golem: GolemPage,
  wendy: WendyPage,
  dating: DatingPage,
  'golem-sim': GolemSimulation,
  settings: SettingsPage,
  admin: AdminPanel,
}

const DETAIL_TITLES = {
  'identity-agent': 'Identity Synthesis \u2014 Who Am I Really?',
  'relationship-agent': 'Relationship Patterns \u2014 Why Do I Repeat This?',
  'life-direction': 'Life Direction \u2014 Where Should My Life Go?',
  integral: 'Integral Consciousness \u2014 Full Map',
  natal: 'Natal Astrology \u2014 Full Profile',
  hd: 'Human Design \u2014 Full Profile',
  kab: 'Kabbalah \u2014 Full Profile',
  num: 'Numerology \u2014 Full Profile',
  gk: 'Gene Keys \u2014 Full Profile',
  tr: 'Transits \u2014 Full Report',
  mayan: 'Mayan Calendar \u2014 Full Profile',
  enn: 'Enneagram \u2014 Full Profile',
  chi: 'Chinese Zodiac \u2014 Full Profile',
  gem: 'Gematria \u2014 Name Numerology Analysis',
  pat: 'Patterns \u2014 Cross-Framework Alignments',
  mbti: 'Myers-Briggs \u2014 Personality Type',
  egyptian: 'Egyptian Astrology \u2014 Full Profile',
  vedic:     'Vedic Astrology \u2014 Jyotish Profile',
  synastry:  'Synastry \u2014 Composite Analysis',
  tibetan: 'Tibetan Astrology \u2014 Losar Calendar & Mewa',
  dosha: 'Ayurvedic Dosha \u2014 Mind-Body Constitution',
  archetype: 'Archetype Assessment \u2014 Jungian Pattern',
  lovelang: 'Love Languages \u2014 How You Give & Receive Love',
  timeline: 'Life Timeline \u2014 Life Arc of Your Journey',
  career: 'Career Alignment \u2014 Your Cosmic Professional Blueprint',
  profile: 'Profiles \u2014 Constellation',
  pricing: 'Choose Your Path \u2014 Pricing',
  practitioner: 'Practitioner Portal \u2014 Practice Management',
  client: 'Client Portal \u2014 Your Journey',
  aiagents: 'AI Agents \u2014 GOLEM Team',
  company: 'GOLEM \u2014 Company Dashboard',
  golem: 'Golem \u2014 Talk to Your Clone',
  wendy: 'Wendy \u2014 Org Intelligence',
  dating: 'Dating \u2014 Golem Matching',
  'golem-sim': 'Golem Simulation \u2014 See How You Interact',
  settings: 'Settings',
  admin: 'Admin Panel \u2014 Product Architecture',
}

function NatalWidget() {
  const [showAspects, setShowAspects] = useState(true)
  const [showHouses, setShowHouses] = useState(true)
  const _nwProfile = useActiveProfile()
  return (
    <>
      <div className="ch">
        <span className="ct">Natal{_nwProfile?.sign ? ` \u00B7 ${_nwProfile.sign} Sun` : ''}{_nwProfile?.asc ? ` \u00B7 ${_nwProfile.asc} ASC` : ''}</span>
        <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowAspects(a => !a) }}
            style={{
              background: showAspects ? 'rgba(201,168,76,.18)' : 'var(--secondary)',
              border: `1px solid ${showAspects ? 'rgba(201,168,76,.4)' : 'rgba(255,255,255,.08)'}`,
              borderRadius: 4, padding: '2px 6px', fontSize: 8, letterSpacing: '.06em',
              color: showAspects ? 'var(--foreground)' : 'var(--muted-foreground)', cursor: 'pointer',
              fontFamily: "'Cinzel',serif", transition: 'all .2s',
            }}
          >ASP</button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowHouses(h => !h) }}
            style={{
              background: showHouses ? 'rgba(201,168,76,.18)' : 'var(--secondary)',
              border: `1px solid ${showHouses ? 'rgba(201,168,76,.4)' : 'rgba(255,255,255,.08)'}`,
              borderRadius: 4, padding: '2px 6px', fontSize: 8, letterSpacing: '.06em',
              color: showHouses ? 'var(--foreground)' : 'var(--muted-foreground)', cursor: 'pointer',
              fontFamily: "'Cinzel',serif", transition: 'all .2s',
            }}
          >HSE</button>
          <span className="ci">{'\u2609'}</span>
        </span>
      </div>
      <div className="cb"><NatalWheel showAspects={showAspects} showHouses={showHouses} /></div>
    </>
  )
}

function WidgetContent({ widgetId }) {
  const profile = useActiveProfile()
  // quiz-based types: prefer per-profile values, fall back to global store
  const globalDoshaType = useAboveInsideStore((s) => s.doshaType)
  const globalArchetypeType = useAboveInsideStore((s) => s.archetypeType)
  const globalLoveLanguage = useAboveInsideStore((s) => s.loveLanguage)
  const doshaType = profile?.doshaType ?? globalDoshaType
  const archetypeType = profile?.archetypeType ?? globalArchetypeType
  const loveLanguage = profile?.loveLanguage ?? globalLoveLanguage
  const mbtiType = profile?.mbtiType || null
  const enneagramType = profile?.enneagramType || null
  const enneagramWing = profile?.enneagramWing || null
  const hdChartLocal = useMemo(() => {
    try {
      const { dob, tob } = profile || {}
      if (!dob) return null
      return computeHDChart({ dateOfBirth: dob, timeOfBirth: tob || '00:00', utcOffset: profile.birthTimezone ?? -3 })
    } catch { return null }
  }, [profile?.dob, profile?.tob, profile?.birthTimezone])
  const hdDesignPlanets = hdChartLocal
    ? PLANET_ORDER.map(k => ({ sym: PLANET_SYMBOLS[k], val: hdChartLocal.design[k] ? `${hdChartLocal.design[k].gate}.${hdChartLocal.design[k].line}` : '' }))
    : []
  const hdPersonalityPlanets = hdChartLocal
    ? PLANET_ORDER.map(k => ({ sym: PLANET_SYMBOLS[k], val: hdChartLocal.personality[k] ? `${hdChartLocal.personality[k].gate}.${hdChartLocal.personality[k].line}` : '' }))
    : []
  const hdTags = hdChartLocal ? buildHDTags(hdChartLocal) : []
  const mayanLocal = useMemo(() => {
    try {
      const dob = profile?.dob
      if (!dob) return null
      const [y, m, d] = dob.split('-').map(Number)
      if (!y || !m || !d) return null
      return computeMayanProfile(y, m, d)
    } catch { return null }
  }, [profile?.dob])
  const chineseLocal = useMemo(() => {
    try {
      const dob = profile?.dob
      if (!dob) return null
      return getChineseProfileFromDob(dob) || null
    } catch { return null }
  }, [profile?.dob, profile?.tob])
  const egyptianLocal = useMemo(() => {
    try {
      const dob = profile?.dob
      if (!dob) return null
      const [, m, d] = dob.split('-').map(Number)
      if (!m || !d) return null
      return getEgyptianSign(d, m) || null
    } catch { return null }
  }, [profile?.dob])
  switch (widgetId) {
    case 'integral':
      return (
        <>
          <div className="ch"><span className="ct">Integral Consciousness &middot; Body Map</span><span className="ci">{'\u25CE'}</span></div>
          <div className="cb"><IntegralFigure /></div>
        </>
      )
    case 'natal':
      return <NatalWidget />
    case 'hd':
      return (
        <>
          <div className="ch"><span className="ct">Human Design &middot; {hdChartLocal ? `${hdChartLocal.profile} ${hdChartLocal.type}` : 'Body Graph'}</span><span className="ci">{'\u25C8'}</span></div>
          <div className="cb">
            <div className="hd-outer">
              <div className="hd-columns">
                <div className="hd-design">
                  <div className="hd-cl">Design</div>
                  {(hdDesignPlanets ?? []).map((p, i) => (
                    <div key={i} className="hd-pr d"><span className="hd-ps">{p.sym}</span><span className="hd-pv">{p.val}</span></div>
                  ))}
                </div>
                <div className="hd-graph"><HumanDesign /></div>
                <div className="hd-pers" style={{ alignItems: 'flex-end' }}>
                  <div className="hd-cl" style={{ textAlign: 'right' }}>Personality</div>
                  {(hdPersonalityPlanets ?? []).map((p, i) => (
                    <div key={i} className="hd-pr p" style={{ flexDirection: 'row-reverse' }}>
                      <span className="hd-ps">{p.sym}</span>
                      <span className="hd-pv" style={{ textAlign: 'right' }}>{p.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hd-meta">
                {(hdTags ?? []).map((tag, i) => (
                  <span key={i} className="hd-tag" style={{ background: tag.bg, borderColor: tag.border, color: tag.color }}>{tag.label}</span>
                ))}
              </div>
            </div>
          </div>
        </>
      )
    case 'kab':
      return (
        <>
          <div className="ch"><span className="ct">Kabbalah &middot; Tree of Life &middot; Sephiroth &middot; Paths</span><span className="ci">{'\u2721'}</span></div>
          <div className="cb"><KabbalahTree /></div>
        </>
      )
    case 'num': {
      const np = profile?.dob && profile?.name
        ? getNumerologyProfileFromDob(profile.dob, profile.name.toUpperCase(), {})
        : null
      const dynamicCells = np ? [
        { val: np.lifePath?.val || '?', label: 'Life Path', hl: true },
        { val: np.expression?.val || '?', label: 'Expression' },
        { val: np.soulUrge?.val || '?', label: 'Soul Urge' },
        { val: np.birthday?.val || '?', label: 'Birthday' },
        { val: np.personality?.val || '?', label: 'Personality' },
        { val: np.maturity?.val || '?', label: 'Maturity' },
      ] : null
      if (!dynamicCells) return (
        <>
          <div className="ch"><span className="ct">Numerology &middot; Core Numbers</span><span className="ci">{'\u221E'}</span></div>
          <div className="cb" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', opacity:.4 }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--gold)', textAlign:'center' }}>Add name &amp; birth date</div>
          </div>
        </>
      )
      const lpVal = np?.lifePath?.val ?? '?'
      const lpLabel = np?.lifePath?.title || ''
      const masterNums = (dynamicCells ?? []).filter(c => [11,22,33].includes(Number(c.val))).map(c => c.val)
      return (
        <>
          <div className="ch"><span className="ct">Numerology &middot; Core Numbers</span><span className="ci">{'\u221E'}</span></div>
          <div className="cb">
            <div className="num-outer">
              <div className="num-grid">
                {dynamicCells.map((cell, i) => (
                  <div key={i} className={`nc${cell.hl ? ' hl' : ''}${[11,22,33].includes(Number(cell.val)) ? ' master' : ''}`}>
                    <div className="nv">{cell.val}</div>
                    <div className="nl">{cell.label}</div>
                  </div>
                ))}
              </div>
              <NumerologyBars />
              <div style={{
                fontSize: '10px', color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.5,
                padding: '5px 7px', background: 'var(--secondary)', borderRadius: '6px',
                border: '1px solid var(--secondary)'
              }}>
                <span style={{ color: 'var(--foreground)' }}>Life Path {lpVal}</span> — {lpLabel}.{' '}
                {masterNums.length > 0 && (
                  <><span style={{ color: 'var(--violet2)' }}>Master {masterNums.join('/')}</span> present in profile.</>
                )}
              </div>
            </div>
          </div>
        </>
      )
    }
    case 'gk':
      return (
        <>
          <div className="ch"><span className="ct">Gene Keys &middot; Hologenetic Profile</span><span className="ci">{'\u2B21'}</span></div>
          <div className="cb">
            <div className="gk-outer">
              <div className="gk-main"><GeneKeysWheel /></div>
              <div className="gk-list">
                {GK_LIST.map((item, i) => (
                  <div key={i} className="gk-item">
                    <div className="gk-num">{item.num}</div>
                    <div className="gk-info">
                      <div className="gk-role">{item.role}</div>
                      <div className="gk-gift">{item.gift}</div>
                      <div className="gk-shadow">{item.shadow}</div>
                    </div>
                    <div className="fbars">
                      <div className="fbar" style={{ height: item.bars[0], background: 'rgba(220,60,60,.6)' }} />
                      <div className="fbar" style={{ height: item.bars[1], background: 'rgba(64,204,221,.7)' }} />
                      <div className="fbar" style={{ height: item.bars[2], background: 'var(--ring)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )
    case 'tr':
      return (
        <>
          <div className="ch"><span className="ct">Transits &middot; {new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} &middot; Natal Aspects</span><span className="ci">{'\u263F'}</span></div>
          <div className="cb">
            <div className="tr-outer">
              {TRANSITS.map((t, i) => (
                <div key={i} className="tr-item">
                  <div className="tr-pl" style={{ color: t.color }}>{t.sym}</div>
                  <div className="tr-inf">
                    <div className="tr-sign">{t.sign}</div>
                    <div className="tr-deg">{t.aspect}</div>
                  </div>
                  <span className="tr-asp" style={{ color: t.aspColor }}>{t.aspLabel}</span>
                  <div className="tr-bar">
                    <div className="tr-fill" style={{ width: `${t.pct}%`, background: t.gradient }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )
    case 'mayan':
      return (
        <>
          <div className="ch"><span className="ct">Mayan Dreamspell{mayanLocal ? ` \u00B7 Kin ${mayanLocal.kin} \u00B7 ${mayanLocal.signature}` : ''}</span><span className="ci">{'\u{1F4AE}'}</span></div>
          <div className="cb"><MayanWheel /></div>
        </>
      )
    case 'enn':
      return (
        <>
          <div className="ch"><span className="ct">Enneagram{enneagramType ? ` \u00B7 Type ${enneagramType}w${enneagramWing || ENNEAGRAM_TYPES[enneagramType - 1]?.wings[0]}` : ' \u00B7 Take Quiz'}</span><span className="ci">{'\u262F'}</span></div>
          <div className="cb"><EnneagramSymbol typeOverride={enneagramType} wingOverride={enneagramWing} /></div>
        </>
      )
    case 'chi':
      return (
        <>
          <div className="ch"><span className="ct">Chinese Zodiac{chineseLocal?.element ? ` \u00B7 ${chineseLocal.element} ${chineseLocal.animal}` : ''}</span><span className="ci">{'\u{1F409}'}</span></div>
          <div className="cb"><ChineseZodiac /></div>
        </>
      )
    case 'gem':
      return (
        <>
          <div className="ch"><span className="ct">Gematria{profile?.name ? ` \u00B7 ${profile.name}` : ''}</span><span className="ci">{'\u{1F520}'}</span></div>
          <div className="cb"><GematriaChart /></div>
        </>
      )
    case 'pat':
      return (
        <>
          <div className="ch"><span className="ct">Patterns &middot; {CROSS_FRAMEWORK_ALIGNMENTS.length} Alignments</span><span className="ci">{'\u{1F578}'}</span></div>
          <div className="cb"><PatternsWeb /></div>
        </>
      )
    case 'mbti':
      return (
        <>
          <div className="ch"><span className="ct">Myers-Briggs &middot; {mbtiType || 'Take Quiz'}</span><span className="ci">{'\u{1F9E0}'}</span></div>
          <div className="cb"><MBTIChart type={mbtiType} /></div>
        </>
      )
    case 'egyptian':
      return (
        <>
          <div className="ch"><span className="ct">Egyptian{egyptianLocal?.sign ? ` \u00B7 ${egyptianLocal.sign} \u00B7 ${egyptianLocal.symbol || ''}` : ''}</span><span className="ci">{'\u{1F3DB}'}</span></div>
          <div className="cb"><EgyptianChart /></div>
        </>
      )
    case 'vedic':
      return (
        <>
          <div className="ch"><span className="ct">Vedic Astrology &middot; Jyotish &middot; Sidereal</span><span className="ci">{'🕉️'}</span></div>
          <div className="cb"><VedicChart /></div>
        </>
      )
    case 'tibetan':
      return (
        <>
          <div className="ch"><span className="ct">Tibetan Astrology &middot; Losar &middot; Mewa</span><span className="ci">{'☸'}</span></div>
          <div className="cb"><TibetanWheel /></div>
        </>
      )
    case 'dosha':
      return (
        <>
          <div className="ch"><span className="ct">Ayurvedic Dosha &middot; {doshaType || 'Take Quiz'}</span><span className="ci">{'☯'}</span></div>
          <div className="cb"><DoshaSymbol /></div>
        </>
      )
    case 'archetype':
      return (
        <>
          <div className="ch"><span className="ct">Archetype &middot; {archetypeType || 'Take Quiz'}</span><span className="ci">{'⬡'}</span></div>
          <div className="cb"><ArchetypeSymbol /></div>
        </>
      )
    case 'lovelang':
      return (
        <>
          <div className="ch"><span className="ct">Love Language &middot; {loveLanguage || 'Take Quiz'}</span><span className="ci">{'🤗'}</span></div>
          <div className="cb"><LoveLangSymbol /></div>
        </>
      )
    case 'timeline': return <TimelineWidget />
    case 'career': return (
      <>
        <div className="ch"><span className="ct">Career Alignment</span><span className="ci">{'◈'}</span></div>
        <div className="cb" style={{ height: 'calc(100% - 32px)' }}>
          <CareerWheel />
        </div>
      </>
    )
    default:
      return null
  }
}

/* ── Shared shell for all layouts ── */
const CARD_BASE = {
  background: 'var(--card)', border: '1px solid var(--border)',
  borderRadius: 'var(--r)', overflow: 'hidden', backdropFilter: 'blur(12px)',
}

const WIDGET_META = {
  integral: { icon: '\u25CE', label: 'Integral Map', sub: 'Consciousness \u00B7 Body Scan' },
  natal: { icon: '\u2609', label: 'Natal Astrology', sub: 'Zodiac Wheel \u00B7 Aspects' },
  hd: { icon: '\u25C8', label: 'Human Design', sub: 'Rave Chart \u00B7 Body Graph' },
  kab: { icon: '\u2721', label: 'Kabbalah', sub: 'Tree of Life \u00B7 Sephiroth' },
  num: { icon: '\u221E', label: 'Numerology', sub: 'Core Numbers \u00B7 Cycles' },
  gk: { icon: '\u2B21', label: 'Gene Keys', sub: 'Hologenetic Profile' },
  tr: { icon: '\u263F', label: 'Transits', sub: 'Current Positions \u00B7 Forecast' },
  mayan: { icon: '\u{1F4AE}', label: 'Mayan Calendar', sub: 'Tzolkin \u00B7 Dreamspell \u00B7 Kin' },
  enn: { icon: '\u262F', label: 'Enneagram', sub: 'Type \u00B7 Wings \u00B7 Tritype' },
  chi: { icon: '\u{1F409}', label: 'Chinese Zodiac', sub: 'Four Pillars \u00B7 Elements' },
  gem: { icon: '\u{1F520}', label: 'Gematria', sub: 'Name Numerology \u00B7 Hebrew Values' },
  pat: { icon: '\u{1F578}', label: 'Patterns', sub: 'Cross-Framework \u00B7 Alignments' },
  mbti: { icon: '\u{1F9E0}', label: 'Myers-Briggs', sub: 'Personality Type \u00B7 Cognitive Functions' },
  egyptian: { icon: '\u{1F3DB}', label: 'Egyptian Astrology', sub: 'Ancient Egypt \u00B7 Zodiac' },
  vedic:      { icon: '🕉️', label: 'Vedic Astrology', sub: 'Jyotish \u00B7 Sidereal \u00B7 Nakshatras' },
  tibetan: { icon: '☸', label: 'Tibetan Astrology', sub: 'Losar \u00B7 Mewa \u00B7 Elements' },
  dosha: { icon: '☯', label: 'Ayurvedic Dosha', sub: 'Vata \u00B7 Pitta \u00B7 Kapha' },
  archetype: { icon: '⬡', label: 'Archetype', sub: 'Jungian Pattern \u00B7 12 Archetypes' },
  lovelang: { icon: '🤗', label: 'Love Languages', sub: 'Give & Receive \u00B7 5 Languages' },
  timeline: { icon: '⟳', label: 'Life Timeline', sub: 'Life Arc \u00B7 Key Life Events' },
  career: { icon: '◈', label: 'Career Alignment', sub: 'profile \u00B7 Role Matching' },
  practitioner: { icon: '\uD83C\uDFE5', label: 'Practitioner Portal', sub: 'Clients \u00B7 Sessions \u00B7 Revenue' },
  client: { icon: '\uD83D\uDCCB', label: 'Client Portal', sub: 'Sessions \u00B7 Progress \u00B7 Messages' },
}

/* ── Category Badges ── */
const WIDGET_CATEGORIES = {
  integral: { label: 'META', color: 'rgba(201,168,76,.8)', bg: 'var(--accent)', border: 'rgba(201,168,76,.2)' },
  natal:    { label: 'WESTERN', color: 'rgba(201,168,76,.8)', bg: 'var(--accent)', border: 'rgba(201,168,76,.2)' },
  tr:       { label: 'WESTERN', color: 'rgba(201,168,76,.8)', bg: 'var(--accent)', border: 'rgba(201,168,76,.2)' },
  vedic:    { label: 'EASTERN', color: 'rgba(160,100,255,.8)', bg: 'rgba(160,100,255,.08)', border: 'rgba(160,100,255,.2)' },
  hd:       { label: 'ENERGY', color: 'rgba(144,80,224,.8)', bg: 'rgba(144,80,224,.08)', border: 'rgba(144,80,224,.2)' },
  kab:      { label: 'ENERGY', color: 'rgba(144,80,224,.8)', bg: 'rgba(144,80,224,.08)', border: 'rgba(144,80,224,.2)' },
  gk:       { label: 'ENERGY', color: 'rgba(144,80,224,.8)', bg: 'rgba(144,80,224,.08)', border: 'rgba(144,80,224,.2)' },
  num:      { label: 'NUMBERS', color: 'rgba(64,204,221,.8)', bg: 'rgba(64,204,221,.08)', border: 'rgba(64,204,221,.2)' },
  mayan:    { label: 'NUMBERS', color: 'rgba(64,204,221,.8)', bg: 'rgba(64,204,221,.08)', border: 'rgba(64,204,221,.2)' },
  egyptian: { label: 'NUMBERS', color: 'rgba(64,204,221,.8)', bg: 'rgba(64,204,221,.08)', border: 'rgba(64,204,221,.2)' },
  gem:      { label: 'NUMBERS', color: 'rgba(64,204,221,.8)', bg: 'rgba(64,204,221,.08)', border: 'rgba(64,204,221,.2)' },
  enn:      { label: 'PERSONALITY', color: 'rgba(212,48,112,.8)', bg: 'rgba(212,48,112,.08)', border: 'rgba(212,48,112,.2)' },
  chi:      { label: 'PERSONALITY', color: 'rgba(212,48,112,.8)', bg: 'rgba(212,48,112,.08)', border: 'rgba(212,48,112,.2)' },
  mbti:     { label: 'PERSONALITY', color: 'rgba(212,48,112,.8)', bg: 'rgba(212,48,112,.08)', border: 'rgba(212,48,112,.2)' },
  pat:        { label: 'PERSONALITY', color: 'rgba(212,48,112,.8)', bg: 'rgba(212,48,112,.08)', border: 'rgba(212,48,112,.2)' },
  tibetan:  { label: 'TIBETAN', color: 'rgba(232,160,64,.8)', bg: 'rgba(232,160,64,.08)', border: 'rgba(232,160,64,.2)' },
  dosha:    { label: 'AYURVEDA', color: 'rgba(68,204,136,.8)', bg: 'rgba(68,204,136,.08)', border: 'rgba(68,204,136,.2)' },
  archetype:{ label: 'JUNGIAN', color: 'rgba(168,120,232,.8)', bg: 'rgba(168,120,232,.08)', border: 'rgba(168,120,232,.2)' },
  lovelang: { label: 'RELATIONAL', color: 'rgba(238,136,102,.8)', bg: 'rgba(238,136,102,.08)', border: 'rgba(238,136,102,.2)' },
  timeline: { label: 'TIMELINE', color: 'rgba(201,168,76,.8)', bg: 'var(--accent)', border: 'rgba(201,168,76,.2)' },
  career:   { label: 'CAREER',   color: 'rgba(96,180,255,.8)', bg: 'rgba(96,180,255,.08)',  border: 'rgba(96,180,255,.2)'  },
}

function CategoryBadge({ widgetId }) {
  const cat = WIDGET_CATEGORIES[widgetId]
  if (!cat) return null
  return (
    <span style={{
      fontSize: '7px', fontFamily: "'Cinzel',serif", letterSpacing: '.12em',
      padding: '1px 6px', borderRadius: '8px',
      color: cat.color, background: cat.bg, border: `1px solid ${cat.border}`,
      flexShrink: 0, lineHeight: '1.6',
    }}>{cat.label}</span>
  )
}

/* ── Demo Mode Banner ── */
function DemoBanner() {
  const profile = useActiveProfile()
  const setActiveDetail = useAboveInsideStore((s) => s.setActiveDetail)
  const setActiveNav = useAboveInsideStore((s) => s.setActiveNav)
  const [dismissed, setDismissed] = useState(false)

  const isDemo = profile.name === DEFAULT_PRIMARY_PROFILE.name &&
                 profile.dob === DEFAULT_PRIMARY_PROFILE.dob

  if (!isDemo || dismissed) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '7px 16px',
      background: 'linear-gradient(90deg, var(--accent), var(--secondary))',
      borderBottom: '1px solid rgba(201,168,76,.18)',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: "'Cormorant Garamond',serif" }}>
        <span style={{ color: 'var(--foreground)', fontFamily: "'Cinzel',serif", fontSize: '9px', letterSpacing: '.1em', marginRight: '8px' }}>
          ✦ DEMO MODE
        </span>
        You're viewing a sample profile. Add your birth data to see your profile.
      </span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
        <span
          onClick={() => { setActiveDetail('profile'); setActiveNav('profile') }}
          style={{
            fontSize: '10px', fontFamily: "'Cinzel',serif", letterSpacing: '.08em',
            color: 'var(--foreground)', cursor: 'pointer', padding: '3px 12px',
            background: 'var(--accent)', border: '1px solid rgba(201,168,76,.3)',
            borderRadius: '12px', transition: 'all .2s',
          }}
        >Add My Birth Data →</span>
        <span
          onClick={() => setDismissed(true)}
          style={{ fontSize: '12px', color: 'var(--muted-foreground)', cursor: 'pointer', lineHeight: 1, padding: '2px 4px' }}
        >×</span>
      </div>
    </div>
  )
}

/* ── Widget Manager Bar ── */
const ALL_WIDGET_IDS = ['integral', 'natal', 'tr', 'hd', 'kab', 'num', 'gk', 'mayan', 'enn', 'chi', 'gem', 'pat', 'mbti', 'egyptian', 'vedic', 'tibetan', 'dosha', 'archetype', 'lovelang', 'timeline', 'career']

function WidgetManagerBar() {
  const widgetOrder = useAboveInsideStore((s) => s.widgetOrder)
  const hiddenWidgets = useAboveInsideStore((s) => s.hiddenWidgets)
  const toggleWidgetVisibility = useAboveInsideStore((s) => s.toggleWidgetVisibility)
  const setHiddenWidgets = useAboveInsideStore((s) => s.setHiddenWidgets)
  const setWidgetOrder = useAboveInsideStore((s) => s.setWidgetOrder)
  const showWidgetManager = useAboveInsideStore((s) => s.showWidgetManager)

  if (!showWidgetManager) return null

  const hiddenCount = hiddenWidgets.length
  // Ensure all widget IDs are in the order list
  const fullOrder = [...new Set([...widgetOrder, ...ALL_WIDGET_IDS])]

  return (
    <div style={{
      padding: '14px 20px 12px',
      borderBottom: '1px solid var(--accent)',
      background: 'rgba(0,0,0,.3)',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.15em', color: 'var(--foreground)', textTransform: 'uppercase' }}>
            ⚙ Widget Manager
          </span>
          <span style={{ fontSize: 10, color: 'var(--muted-foreground)', marginLeft: 10 }}>
            {hiddenCount > 0 ? `${hiddenCount} hidden · click to toggle` : 'All widgets visible · click to hide'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {hiddenCount > 0 && (
            <button
              onClick={() => setHiddenWidgets([])}
              style={{
                padding: '5px 14px', borderRadius: 7, cursor: 'pointer', border: '1px solid rgba(201,168,76,.4)',
                fontSize: 11, fontFamily: "'Cinzel',serif", letterSpacing: '.06em',
                color: 'var(--foreground)', background: 'var(--accent)', transition: 'all .15s',
              }}
            >Show All</button>
          )}
          <button
            onClick={() => { setWidgetOrder([...ALL_WIDGET_IDS]); setHiddenWidgets([]) }}
            style={{
              padding: '5px 14px', borderRadius: 7, cursor: 'pointer', border: '1px solid rgba(255,255,255,.12)',
              fontSize: 11, fontFamily: "'Cinzel',serif", letterSpacing: '.06em',
              color: 'var(--muted-foreground)', background: 'var(--secondary)', transition: 'all .15s',
            }}
          >Reset All</button>
        </div>
      </div>

      {/* Widget toggle grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {fullOrder.map((id) => {
          const meta = WIDGET_META[id]
          const isHidden = hiddenWidgets.includes(id)
          if (!meta) return null
          return (
            <div
              key={id}
              onClick={() => toggleWidgetVisibility(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
                transition: 'all .15s', userSelect: 'none',
                background: isHidden ? 'var(--secondary)' : 'var(--accent)',
                border: `1px solid ${isHidden ? 'rgba(255,255,255,.08)' : 'var(--ring)'}`,
                color: isHidden ? 'rgba(255,255,255,.3)' : 'var(--foreground)',
              }}
            >
              <span style={{ fontSize: 16 }}>{meta.icon || '✦'}</span>
              <div>
                <div style={{ fontSize: 11, fontFamily: "'Cinzel',serif", letterSpacing: '.04em' }}>{meta.label}</div>
                <div style={{ fontSize: 9, color: isHidden ? 'rgba(255,255,255,.2)' : 'var(--muted-foreground)', marginTop: 1 }}>
                  {isHidden ? 'hidden · click to show' : 'visible · click to hide'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Stream Layout ── */
function StreamLayout({ visibleWidgets, setActiveDetail }) {
  return (
    <div style={{ gridColumn: 2, gridRow: 2, overflow: 'auto', padding: '8px 24px 40px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 900, margin: '0 auto' }}>
        {visibleWidgets.map(id => (
          <div key={id} className="card" style={{ height: 480, cursor: 'pointer' }}
            onDoubleClick={() => setActiveDetail(id)}>
            <WidgetContent widgetId={id} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Focus Layout ── */
function FocusLayout({ visibleWidgets, setActiveDetail }) {
  const [focusIdx, setFocusIdx] = useState(0)
  const focusId = visibleWidgets[focusIdx] || visibleWidgets[0]
  return (
    <div style={{ gridColumn: 2, gridRow: 2, display: 'flex', overflow: 'hidden', gap: 0 }}>
      <div style={{ width: 56, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 4px', background: 'rgba(5,5,22,.5)', borderRadius: 'var(--r) 0 0 var(--r)', borderRight: '1px solid var(--accent)' }}>
        {visibleWidgets.map((id, idx) => {
          const meta = WIDGET_META[id]
          const active = idx === focusIdx
          return (
            <div key={id} onClick={() => setFocusIdx(idx)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '8px 0', borderRadius: 8, cursor: 'pointer',
              background: active ? 'var(--accent)' : 'transparent',
              border: active ? '1px solid rgba(201,168,76,.3)' : '1px solid transparent',
              transition: 'all .2s', position: 'relative',
            }}>
              {active && <div style={{ position: 'absolute', left: -4, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, background: 'var(--foreground)', borderRadius: '0 2px 2px 0' }} />}
              <span style={{ fontSize: 16 }}>{meta?.icon || '\u2726'}</span>
              <span style={{ fontSize: 7, letterSpacing: '.05em', color: active ? 'var(--foreground)' : 'var(--muted-foreground)', marginTop: 2 }}>
                {id.toUpperCase()}
              </span>
            </div>
          )
        })}
      </div>
      <div className="card" style={{ flex: 1, borderRadius: '0 var(--r) var(--r) 0', display: 'flex', flexDirection: 'column' }}>
        <WidgetContent widgetId={focusId} />
        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--accent)', display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={() => setActiveDetail(focusId)} style={{
            padding: '4px 14px', borderRadius: 8, background: 'var(--accent)', border: '1px solid rgba(201,168,76,.2)',
            fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.1em', color: 'var(--foreground)', cursor: 'pointer', transition: 'all .2s',
          }}>View Full Profile</div>
        </div>
      </div>
    </div>
  )
}

/* ── Constellation Lines: SVG connections between related systems ── */
function ConstellationLines({ wrapperRef }) {
  const [state, setState] = useState({ paths: [], w: 0, h: 0 })

  useEffect(() => {
    function update() {
      const el = wrapperRef.current
      if (!el) return

      const wr = el.getBoundingClientRect()
      const paths = []

      for (const [a, b] of CONSTELLATION_LINKS) {
        const ea = el.querySelector(`[data-widget="${a}"]`)
        const eb = el.querySelector(`[data-widget="${b}"]`)
        if (!ea || !eb) continue

        const ra = ea.getBoundingClientRect()
        const rb = eb.getBoundingClientRect()

        const x1 = ra.left + ra.width / 2 - wr.left
        const y1 = ra.top + ra.height / 2 - wr.top
        const x2 = rb.left + rb.width / 2 - wr.left
        const y2 = rb.top + rb.height / 2 - wr.top

        const dx = x2 - x1, dy = y2 - y1
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const off = Math.min(len * 0.06, 25)
        const mx = (x1 + x2) / 2 + (-dy / len) * off
        const my = (y1 + y2) / 2 + (dx / len) * off

        paths.push({
          d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`,
          key: `${a}-${b}`,
          i: paths.length,
        })
      }

      setState({ paths, w: el.offsetWidth, h: el.offsetHeight })
    }

    const t = setTimeout(update, 600)
    const ro = new ResizeObserver(() => requestAnimationFrame(update))
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    window.addEventListener('resize', update)
    return () => { clearTimeout(t); ro.disconnect(); window.removeEventListener('resize', update) }
  }, [wrapperRef])

  if (!state.paths.length) return null

  return (
    <svg viewBox={`0 0 ${state.w} ${state.h}`} preserveAspectRatio="none" style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0, overflow: 'visible',
    }}>
      <defs>
        <filter id="cGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {state.paths.map(p => (
        <path key={p.key} d={p.d}
          stroke="rgba(255,215,120,0.18)" strokeWidth="1.2" fill="none"
          strokeDasharray="8 5" filter="url(#cGlow)"
          style={{ animation: `linePulse 4s ease-in-out ${p.i * 0.5}s infinite` }} />
      ))}
    </svg>
  )
}

/* ── Mobile Bottom Navigation ── */
function MobileBottomNav({ activeNav, setActiveNav, setActiveDetail, setOracleOpen, setActivePanel }) {
  return (
    <div className="mobile-bottom-nav">
      <button
        className={activeNav === 'dashboard' ? 'active' : ''}
        onClick={() => { setActiveDetail(null); setActiveNav('dashboard') }}
      >🏠<span>Home</span></button>
      <button
        className={activeNav === 'profile' ? 'active' : ''}
        onClick={() => { setActiveDetail('profile'); setActiveNav('profile') }}
      >👤<span>Profile</span></button>
      <button
        onClick={() => setOracleOpen(true)}
      >◈<span>Oracle</span></button>
      <button
        className={activeNav === 'practitioner' ? 'active' : ''}
        onClick={() => { setActiveDetail('practitioner'); setActiveNav('practitioner') }}
      >👥<span>Practice</span></button>
    </div>
  )
}

export default function Dashboard() {
  const widgetOrder = useAboveInsideStore((s) => s.widgetOrder)
  const setWidgetOrder = useAboveInsideStore((s) => s.setWidgetOrder)
  const hiddenWidgets = useAboveInsideStore((s) => s.hiddenWidgets)
  const toggleWidgetVisibility = useAboveInsideStore((s) => s.toggleWidgetVisibility)
  const activeDetail = useAboveInsideStore((s) => s.activeDetail)
  const setActiveDetail = useAboveInsideStore((s) => s.setActiveDetail)
  const setActiveNav = useAboveInsideStore((s) => s.setActiveNav)
  const activeNav = useAboveInsideStore((s) => s.activeNav)
  const setOracleOpen = useAboveInsideStore((s) => s.setOracleOpen)
  const setActivePanel = useAboveInsideStore((s) => s.setActivePanel)
  const layoutMode = useAboveInsideStore((s) => s.layoutMode)
  const sidebarCollapsed = useAboveInsideStore((s) => s.sidebarCollapsed)
  const profile = useActiveProfile()
  const sbWidth = sidebarCollapsed ? '48px' : '200px'

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const wrapperRef = useRef(null)
  const { dragId, overIdx: dragOverIdx, startDrag } = useDragReorder(widgetOrder, setWidgetOrder, hiddenWidgets)

  // Compute HD chart from stored profile
  const hdChart = useMemo(() => {
    try {
      const { dob, tob } = profile
      if (!dob) return null
      return computeHDChart({ dateOfBirth: dob, timeOfBirth: tob || '00:00', utcOffset: -3 })
    } catch {
      console.error('HD chart error in Dashboard:', e)
      return null
    }
  }, [profile?.dob, profile?.tob])

  const hdDesignPlanets = hdChart
    ? PLANET_ORDER.map(k => ({ sym: PLANET_SYMBOLS[k], val: hdChart.design[k] ? `${hdChart.design[k].gate}.${hdChart.design[k].line}` : '' }))
    : []
  const hdPersonalityPlanets = hdChart
    ? PLANET_ORDER.map(k => ({ sym: PLANET_SYMBOLS[k], val: hdChart.personality[k] ? `${hdChart.personality[k].gate}.${hdChart.personality[k].line}` : '' }))
    : []
  const hdTags = hdChart ? buildHDTags(hdChart) : []

  // Filter out hidden widgets
  const visibleWidgets = (Array.isArray(widgetOrder) ? widgetOrder : []).filter((id) => !(Array.isArray(hiddenWidgets) ? hiddenWidgets : []).includes(id))

  // Detail view mode (shared across all layouts)
  if (activeDetail) {
    const DetailComponent = DETAIL_COMPONENTS[activeDetail]
    const title = DETAIL_TITLES[activeDetail]
    return (
      <div className="dash-root" style={{
        display: 'grid', gridTemplateColumns: `${sbWidth} 1fr`, gridTemplateRows: '46px 1fr 42px',
        gap: '7px', padding: '7px 7px 7px 0', width: '100%', height: '100vh', position: 'relative', zIndex: 1,
      }}>
        <Starfield />
        <Sidebar />
        <TopBar />
        <div className="dash-content" style={{
          gridColumn: 2, gridRow: 2, ...CARD_BASE,
          display: 'flex', flexDirection: 'column', animation: 'fadeUp .35s ease backwards',
        }}>
          <div style={{
            padding: '10px 18px 8px', borderBottom: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--foreground)' }}>{title}</span>
            <div onClick={() => setActiveDetail(null)} style={{
              padding: '4px 14px', borderRadius: 8, background: 'var(--accent)', border: '1px solid rgba(201,168,76,.2)',
              fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: '.1em', color: 'var(--foreground)', cursor: 'pointer', transition: 'all .2s',
            }}>Back to Dashboard</div>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <Suspense fallback={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', opacity:.3, fontFamily:"'Cinzel',serif", fontSize:11, textTransform:'uppercase', letterSpacing:'.1em' }}>Loading...</div>}>
              {DetailComponent && <DetailComponent />}
            </Suspense>
          </div>
        </div>
        <StatusBar />
        {isMobile && <MobileBottomNav activeNav={activeNav} setActiveNav={setActiveNav} setActiveDetail={setActiveDetail} setOracleOpen={setOracleOpen} setActivePanel={setActivePanel} />}
      </div>
    )
  }

  // Constellation Grid layout
  const isGrid = layoutMode === 'grid'
  if (isGrid) {
    return (
      <div className="dash-root" style={{
        display: 'grid', gridTemplateColumns: `${sbWidth} 1fr`,
        gridTemplateRows: '46px 1fr 42px', gap: '7px', padding: '7px 7px 7px 0',
        width: '100%', height: '100vh', position: 'relative', zIndex: 1,
      }}>
        <Starfield />
        <Sidebar />
        <TopBar />
        <div className="dash-content" style={{
          gridColumn: 2, gridRow: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <DemoBanner />
          <WidgetManagerBar />
          <div style={{
            flex: 1, overflowY: 'auto', overflowX: 'hidden',
          }}>
            <div ref={wrapperRef} style={{ position: 'relative', padding: '4px 20px 40px' }}>
              <ConstellationLines wrapperRef={wrapperRef} />

              {ROWS.map((row, ri) => {
                const rowWidgets = row.widgets.filter(w => visibleWidgets.includes(w))
                if (!rowWidgets.length) return null
                return (
                  <div key={ri} style={{ marginBottom: ri < ROWS.length - 1 ? 48 : 0, position: 'relative', zIndex: 1 }}>
                    {/* Decorative row header with constellation lines */}
                    <div className="col-header" style={{ padding: '16px 0 14px' }}>
                      <div className="col-line" style={{ '--line-c': row.border }} />
                      <div className="col-header-text">
                        <div className="col-header-title" style={{ color: row.color }}>{row.label}</div>
                        <div className="col-header-sub">{row.sub}</div>
                      </div>
                      <div className="col-line" style={{ '--line-c': row.border }} />
                    </div>

                    {/* Widget row — constellation nodes */}
                    <div className="constellation-row" style={{
                      display: 'grid',
                      gridTemplateColumns: row.cols,
                      gap: 24,
                    }}>
                      {rowWidgets.map((widgetId) => {
                        const globalIdx = visibleWidgets.indexOf(widgetId)
                        const h = CARD_HEIGHT
                        return (
                          <div key={widgetId} data-widget={widgetId} className="card"
                            onDoubleClick={() => setActiveDetail(widgetId)}
                            onMouseDown={(e) => startDrag(e, widgetId)}
                            onTouchStart={(e) => startDrag(e, widgetId)}
                            style={{
                              height: h,
                              animationDelay: `${globalIdx * 0.04}s`,
                              cursor: 'grab',
                              opacity: dragId === widgetId ? 0.3 : 1,
                              outline: dragOverIdx === globalIdx && dragId !== widgetId ? '2px solid rgba(201,168,76,.6)' : 'none',
                            }}
                          >
                            <div
                              className="widget-close"
                              onClick={(e) => { e.stopPropagation(); toggleWidgetVisibility(widgetId) }}
                              title="Hide widget (re-enable in ⚙ Widget Manager)"
                            >{'−'}</div>
                            <div style={{ position: 'absolute', top: '8px', right: '28px', zIndex: 5, pointerEvents: 'none' }}>
                              <CategoryBadge widgetId={widgetId} />
                            </div>
                            <WidgetContent widgetId={widgetId} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <StatusBar />
        {isMobile && <MobileBottomNav activeNav={activeNav} setActiveNav={setActiveNav} setActiveDetail={setActiveDetail} setOracleOpen={setOracleOpen} setActivePanel={setActivePanel} />}
      </div>
    )
  }

  // Focus, Stream
  return (
    <div className="dash-root" style={{
      display: 'grid', gridTemplateColumns: `${sbWidth} 1fr`, gridTemplateRows: '46px 1fr 42px',
      gap: '7px', padding: '7px 7px 7px 0', width: '100%', height: '100vh', position: 'relative', zIndex: 1,
    }}>
      <Starfield />
      <Sidebar />
      <TopBar />
      {layoutMode === 'focus' && <FocusLayout visibleWidgets={visibleWidgets} setActiveDetail={setActiveDetail} />}
      {layoutMode === 'stream' && <StreamLayout visibleWidgets={visibleWidgets} setActiveDetail={setActiveDetail} />}
      <StatusBar />
      {isMobile && <MobileBottomNav activeNav={activeNav} setActiveNav={setActiveNav} setActiveDetail={setActiveDetail} setOracleOpen={setOracleOpen} setActivePanel={setActivePanel} />}
    </div>
  )
}

