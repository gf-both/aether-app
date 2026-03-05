import { useState, useRef, useCallback } from 'react'
import { useAetherStore } from '../store/useAetherStore'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import StatusBar from '../components/layout/StatusBar'
import NatalWheel from '../components/canvas/NatalWheel'
import HumanDesign from '../components/canvas/HumanDesign'
import KabbalahTree from '../components/canvas/KabbalahTree'
import GeneKeysWheel from '../components/canvas/GeneKeysWheel'
import NumerologyBars from '../components/canvas/NumerologyBars'
import NatalDetail from '../components/details/NatalDetail'
import HDDetail from '../components/details/HDDetail'
import KabbalahDetail from '../components/details/KabbalahDetail'
import NumerologyDetail from '../components/details/NumerologyDetail'
import GeneKeysDetail from '../components/details/GeneKeysDetail'
import TransitsDetail from '../components/details/TransitsDetail'
import { DESIGN_PLANETS, PERSONALITY_PLANETS, HD_TAGS } from '../data/hdData'
import { GK_LIST } from '../data/geneKeysData'

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
  { val: 5, label: 'Life Path', hl: true },
  { val: 7, label: 'Expression' },
  { val: 3, label: 'Soul Urge' },
  { val: 11, label: 'Master', master: true },
  { val: 5, label: 'Birthday' },
  { val: 4, label: 'Maturity' },
  { val: 22, label: 'M.Builder', master: true },
  { val: 9, label: 'Personality' },
  { val: 6, label: 'Pinnacle I' },
  { val: 2, label: 'Pinnacle II' },
]

// Grid positions for each widget slot (2 wide, spanning columns for big widgets in top row, single for bottom row)
const GRID_POSITIONS = {
  // Row 2-3 (top row, tall widgets)
  0: { gridColumn: '2/4', gridRow: '2/4' },
  1: { gridColumn: '4/6', gridRow: '2/4' },
  2: { gridColumn: '6/8', gridRow: '2/4' },
  // Row 4 (bottom row)
  3: { gridColumn: '2/4', gridRow: '4' },
  4: { gridColumn: '4/6', gridRow: '4' },
  5: { gridColumn: '6/8', gridRow: '4' },
}

const WIDGET_CLASSES = ['c-wheel', 'c-hd', 'c-kab', 'c-num', 'c-gk', 'c-tr']
const DELAYS = ['.04s', '.08s', '.12s', '.16s', '.2s', '.24s']

const DETAIL_COMPONENTS = {
  natal: NatalDetail,
  hd: HDDetail,
  kab: KabbalahDetail,
  num: NumerologyDetail,
  gk: GeneKeysDetail,
  tr: TransitsDetail,
}

const DETAIL_TITLES = {
  natal: 'Natal Astrology — Full Profile',
  hd: 'Human Design — Full Profile',
  kab: 'Kabbalah — Full Profile',
  num: 'Numerology — Full Profile',
  gk: 'Gene Keys — Full Profile',
  tr: 'Transits — Full Report',
}

function WidgetContent({ widgetId }) {
  switch (widgetId) {
    case 'natal':
      return (
        <>
          <div className="ch"><span className="ct">Natal Astrology &middot; Zodiac Wheel &middot; Aspects</span><span className="ci">{'\u2609'}</span></div>
          <div className="cb"><NatalWheel /></div>
        </>
      )
    case 'hd':
      return (
        <>
          <div className="ch"><span className="ct">Human Design &middot; Rave Chart &middot; Body Graph &middot; 3/5</span><span className="ci">{'\u25C8'}</span></div>
          <div className="cb">
            <div className="hd-outer">
              <div className="hd-columns">
                <div className="hd-design">
                  <div className="hd-cl">Design</div>
                  {DESIGN_PLANETS.map((p, i) => (
                    <div key={i} className="hd-pr d"><span className="hd-ps">{p.sym}</span><span className="hd-pv">{p.val}</span></div>
                  ))}
                </div>
                <div className="hd-graph"><HumanDesign /></div>
                <div className="hd-pers" style={{ alignItems: 'flex-end' }}>
                  <div className="hd-cl" style={{ textAlign: 'right' }}>Personality</div>
                  {PERSONALITY_PLANETS.map((p, i) => (
                    <div key={i} className="hd-pr p" style={{ flexDirection: 'row-reverse' }}>
                      <span className="hd-ps">{p.sym}</span>
                      <span className="hd-pv" style={{ textAlign: 'right' }}>{p.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hd-meta">
                {HD_TAGS.map((tag, i) => (
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
    case 'num':
      return (
        <>
          <div className="ch"><span className="ct">Numerology &middot; Core Numbers</span><span className="ci">{'\u221E'}</span></div>
          <div className="cb">
            <div className="num-outer">
              <div className="num-grid">
                {NUM_CELLS.map((cell, i) => (
                  <div key={i} className={`nc${cell.hl ? ' hl' : ''}${cell.master ? ' master' : ''}`}>
                    <div className="nv">{cell.val}</div>
                    <div className="nl">{cell.label}</div>
                  </div>
                ))}
              </div>
              <NumerologyBars />
              <div style={{
                fontSize: '9px', color: 'var(--text2)', fontStyle: 'italic', lineHeight: 1.5,
                padding: '5px 7px', background: 'rgba(201,168,76,.03)', borderRadius: '6px',
                border: '1px solid rgba(201,168,76,.05)'
              }}>
                <span style={{ color: 'var(--gold)' }}>Life Path 5</span> — The Adventurer. Freedom &amp; radical change.{' '}
                <span style={{ color: 'var(--violet2)' }}>Master 11/22</span> anchors intuition into form.
              </div>
            </div>
          </div>
        </>
      )
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
                      <div className="fbar" style={{ height: item.bars[2], background: 'rgba(201,168,76,.5)' }} />
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
          <div className="ch"><span className="ct">Transits &middot; Mar 4 2026 &middot; Natal Aspects</span><span className="ci">{'\u263F'}</span></div>
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
    default:
      return null
  }
}

export default function Dashboard() {
  const widgetOrder = useAetherStore((s) => s.widgetOrder)
  const setWidgetOrder = useAetherStore((s) => s.setWidgetOrder)
  const activeDetail = useAetherStore((s) => s.activeDetail)
  const setActiveDetail = useAetherStore((s) => s.setActiveDetail)

  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)
  const dragStartPos = useRef(null)

  const handleDragStart = useCallback((e, idx) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', idx.toString())
    setDragIdx(idx)
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    // Slight delay to let browser snapshot the element
    requestAnimationFrame(() => {
      e.target.style.opacity = '.4'
    })
  }, [])

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = ''
    setDragIdx(null)
    setOverIdx(null)
  }, [])

  const handleDragOver = useCallback((e, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverIdx(idx)
  }, [])

  const handleDrop = useCallback((e, dropIdx) => {
    e.preventDefault()
    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (fromIdx === dropIdx || isNaN(fromIdx)) return
    const newOrder = [...widgetOrder]
    const [moved] = newOrder.splice(fromIdx, 1)
    newOrder.splice(dropIdx, 0, moved)
    setWidgetOrder(newOrder)
    setDragIdx(null)
    setOverIdx(null)
  }, [widgetOrder, setWidgetOrder])

  // Detail view mode
  if (activeDetail) {
    const DetailComponent = DETAIL_COMPONENTS[activeDetail]
    const title = DETAIL_TITLES[activeDetail]
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '52px 1fr',
        gridTemplateRows: '46px 1fr 42px',
        gap: '7px',
        padding: '7px 7px 7px 0',
        width: '100vw',
        height: '100vh',
        position: 'relative',
        zIndex: 1,
      }}>
        <Sidebar />
        <TopBar />

        <div style={{
          gridColumn: 2, gridRow: 2,
          background: 'rgba(5,5,22,.83)',
          border: '1px solid rgba(201,168,76,.15)',
          borderRadius: 'var(--r)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(12px)',
          animation: 'fadeUp .35s ease backwards',
        }}>
          <div style={{
            padding: '10px 18px 8px',
            borderBottom: '1px solid rgba(201,168,76,.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "'Cinzel',serif",
              fontSize: '10px',
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
            }}>{title}</span>
            <div
              onClick={() => setActiveDetail(null)}
              style={{
                padding: '4px 14px',
                borderRadius: '8px',
                background: 'rgba(201,168,76,.08)',
                border: '1px solid rgba(201,168,76,.2)',
                fontFamily: "'Cinzel',serif",
                fontSize: '8px',
                letterSpacing: '.12em',
                color: 'var(--gold2)',
                cursor: 'pointer',
                transition: 'all .2s',
              }}
            >
              Back to Dashboard
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {DetailComponent && <DetailComponent />}
          </div>
        </div>

        <StatusBar />
      </div>
    )
  }

  // Normal dashboard grid mode
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '52px 1fr 1fr 1fr 1fr 1fr 1fr',
      gridTemplateRows: '46px 1fr 1fr 1fr 42px',
      gap: '7px',
      padding: '7px 7px 7px 0',
      width: '100vw',
      height: '100vh',
      position: 'relative',
      zIndex: 1,
    }}>
      <Sidebar />
      <TopBar />

      {widgetOrder.map((widgetId, idx) => {
        const pos = GRID_POSITIONS[idx]
        const isOver = overIdx === idx && dragIdx !== idx
        return (
          <div
            key={widgetId}
            data-widget={widgetId}
            className="card"
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            onDoubleClick={() => setActiveDetail(widgetId)}
            style={{
              ...pos,
              animationDelay: DELAYS[idx],
              outline: isOver ? '2px solid rgba(201,168,76,.5)' : 'none',
              outlineOffset: '-2px',
              transition: 'outline .2s, border-color .3s',
            }}
          >
            <WidgetContent widgetId={widgetId} />
          </div>
        )
      })}

      <StatusBar />
    </div>
  )
}
