import { useAetherStore } from '../../store/useAetherStore'
import { REL_CONFIG } from '../../data/primaryProfile'
import { isRomantic, romanticFramework, familyFramework } from '../../data/synastryFrameworks'
import SynastryWheel from '../canvas/SynastryWheel'
import ScoreRow from '../ui/ScoreRow'

function getProfile(id, primaryProfile, people) {
  if (id === null) return primaryProfile
  return people.find((p) => p.id === id) || primaryProfile
}

function SelectorChips({ slot, currentId, primaryProfile, people, onSelect }) {
  return (
    <div className="pp-select-row">
      <div
        className={`psel-chip${currentId === null ? ' sel' : ''}`}
        onClick={() => onSelect(slot, null)}
      >
        {primaryProfile.name.split(' ')[0]}
      </div>
      {people.map((p) => (
        <div
          key={p.id}
          className={`psel-chip${currentId === p.id ? ' sel' : ''}`}
          onClick={() => onSelect(slot, p.id)}
        >
          {p.name.split(' ')[0]}
        </div>
      ))}
    </div>
  )
}

function ScoreSection({ headerLabel, headerColor, scores, insight, aName, bName }) {
  return (
    <div className="score-section">
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: '8px', letterSpacing: '.15em', color: headerColor, marginBottom: '4px' }}>
        {headerLabel}
      </div>
      {scores.map((s, i) => (
        <ScoreRow key={i} label={s.label} val={s.pct ? `${s.pct}%` : s.val} gradient={s.gradient} />
      ))}
      {insight && (
        <div className="score-insight" dangerouslySetInnerHTML={{
          __html: insight(aName, bName).replace(/([^>])(Venus|Mars|Moon|North Node|Pluto|Saturn|Chiron|Soul Contract|shadow integration|Sacred Partnership|Life Path [^\s.]+|Sephirah [^\s.]+|wisdom transmission|frequency of Anticipation|ego to beauty|mirror each other's gifts|Sibling Circuit of Perseverance)/g,
            (m, pre, term) => `${pre}<span>${term}</span>`)
        }} />
      )}
    </div>
  )
}

function CompositeGrid({ items }) {
  return (
    <div className="composite-grid">
      {items.map((item, i) => (
        <div key={i} className="comp-item">
          <div className="comp-icon">{item.icon}</div>
          <div className="comp-title">{item.title}</div>
          <div className="comp-val">{item.val}</div>
          <div className="comp-sub">{item.sub}</div>
        </div>
      ))}
    </div>
  )
}

function RomanticContent({ a, b, aName, bName }) {
  const fw = romanticFramework
  return (
    <>
      {/* Composite Wheel - spans 2 rows */}
      <div className="syn-card" style={{ gridColumn: 1, gridRow: '1/3' }}>
        <div className="syn-ch"><span className="syn-ct">Composite Chart · Midpoint Wheel</span><span>💕</span></div>
        <div className="syn-cb"><SynastryWheel mode="romantic" nameA={aName} nameB={bName} /></div>
      </div>

      {/* Venus-Mars */}
      <div className="syn-card" style={{ gridColumn: 2, gridRow: 1 }}>
        <div className="syn-ch"><span className="syn-ct">♀ Venus–Mars Attraction Analysis</span><span>♀</span></div>
        <div className="syn-cb">
          <ScoreSection
            headerLabel={fw.sections[0].headerLabel}
            headerColor={fw.sections[0].headerColor}
            scores={fw.sections[0].scores}
            insight={fw.sections[0].insight}
            aName={aName} bName={bName}
          />
        </div>
      </div>

      {/* Soul Depth */}
      <div className="syn-card" style={{ gridColumn: 2, gridRow: 2 }}>
        <div className="syn-ch"><span className="syn-ct">☽ Emotional &amp; Soul Depth</span><span>☽</span></div>
        <div className="syn-cb">
          <ScoreSection
            headerLabel={fw.sections[1].headerLabel}
            headerColor={fw.sections[1].headerColor}
            scores={fw.sections[1].scores}
            insight={fw.sections[1].insight}
            aName={aName} bName={bName}
          />
        </div>
      </div>

      {/* HD Compatibility */}
      <div className="syn-card" style={{ gridColumn: 3, gridRow: 1 }}>
        <div className="syn-ch"><span className="syn-ct">◈ Human Design Compatibility</span><span>◈</span></div>
        <div className="syn-cb">
          <CompositeGrid items={fw.hdSection.items(a, b, aName, bName)} />
        </div>
      </div>

      {/* Multi-System */}
      <div className="syn-card" style={{ gridColumn: 3, gridRow: 2 }}>
        <div className="syn-ch"><span className="syn-ct">⬡ Gene Keys Resonance · ∞ Numerology</span><span>⬡</span></div>
        <div className="syn-cb">
          <ScoreSection
            headerLabel={fw.multiSystemSection.headerLabel}
            headerColor={fw.multiSystemSection.headerColor}
            scores={fw.multiSystemSection.scores}
            insight={fw.multiSystemSection.insight}
            aName={aName} bName={bName}
          />
        </div>
      </div>
    </>
  )
}

function FamilyContent({ a, b, aName, bName }) {
  const fw = familyFramework
  const rel = b.rel || 'other'
  const isParentRel = rel === 'father' || rel === 'mother'
  const karma = fw.getKarmaSection(isParentRel, aName, bName, b.sign)
  const gen = fw.getGenerationalSection(isParentRel, aName, bName, b.sign)
  const hdItems = fw.hdSection.items(isParentRel, aName, bName)
  const msScores = fw.multiSystemSection.getScores(isParentRel)
  const msInsight = fw.multiSystemSection.getInsight(isParentRel, aName, bName)

  return (
    <>
      <div className="syn-card" style={{ gridColumn: 1, gridRow: '1/3' }}>
        <div className="syn-ch"><span className="syn-ct">Family Composite Chart · Karmic Axis</span><span>🧬</span></div>
        <div className="syn-cb"><SynastryWheel mode="family" nameA={aName} nameB={bName} /></div>
      </div>

      <div className="syn-card" style={{ gridColumn: 2, gridRow: 1 }}>
        <div className="syn-ch"><span className="syn-ct">🧬 {karma.title}</span></div>
        <div className="syn-cb">
          <div className="score-section">
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '8px', letterSpacing: '.15em', color: karma.headerColor, marginBottom: '4px' }}>
              {karma.headerLabel}
            </div>
            {karma.scores.map((s, i) => (
              <ScoreRow key={i} label={s.label} val={`${s.pct}%`} gradient={s.gradient} />
            ))}
            <div className="score-insight">
              <span>{karma.insight}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="syn-card" style={{ gridColumn: 2, gridRow: 2 }}>
        <div className="syn-ch"><span className="syn-ct">🌳 {gen.title}</span></div>
        <div className="syn-cb">
          <div className="score-section">
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '8px', letterSpacing: '.15em', color: gen.headerColor, marginBottom: '4px' }}>
              {gen.headerLabel}
            </div>
            {gen.scores.map((s, i) => (
              <ScoreRow key={i} label={s.label} val={`${s.pct}%`} gradient={s.gradient} />
            ))}
            <div className="score-insight">
              <span>{gen.insight}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="syn-card" style={{ gridColumn: 3, gridRow: 1 }}>
        <div className="syn-ch"><span className="syn-ct">◈ HD Family Mechanics</span><span>◈</span></div>
        <div className="syn-cb">
          <CompositeGrid items={hdItems} />
        </div>
      </div>

      <div className="syn-card" style={{ gridColumn: 3, gridRow: 2 }}>
        <div className="syn-ch"><span className="syn-ct">✡ Kabbalah · ∞ Numerology · ⬡ Gene Keys</span></div>
        <div className="syn-cb">
          <div className="score-section">
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '8px', letterSpacing: '.15em', color: fw.multiSystemSection.headerColor, marginBottom: '4px' }}>
              {fw.multiSystemSection.headerLabel}
            </div>
            {msScores.map((s, i) => (
              <ScoreRow key={i} label={s.label} val={s.pct ? `${s.pct}%` : s.val} gradient={s.gradient} />
            ))}
            <div className="score-insight">
              <span>{msInsight}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function SynastryPanel({ open, onClose }) {
  const primaryProfile = useAetherStore((s) => s.primaryProfile)
  const people = useAetherStore((s) => s.people)
  const synSelA = useAetherStore((s) => s.synSelA)
  const synSelB = useAetherStore((s) => s.synSelB)
  const setSynSel = useAetherStore((s) => s.setSynSel)

  const a = getProfile(synSelA, primaryProfile, people)
  const b = synSelB !== null ? getProfile(synSelB, primaryProfile, people) : null
  const aName = a.name.split(' ')[0]
  const bName = b ? b.name.split(' ')[0] : 'Select Person'

  const cfgA = a === primaryProfile ? null : (REL_CONFIG[a.rel] || REL_CONFIG.other)
  const cfgB = b ? (REL_CONFIG[b.rel] || REL_CONFIG.other) : null

  const hasSelection = b && synSelA !== synSelB
  const romantic = hasSelection && (isRomantic(b.rel) || isRomantic(a.rel || ''))

  return (
    <div className={`overlay${open ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="synastry-panel">
        <div className="syn-header">
          <span className="syn-title">⊕ Synastry · Composite Analysis</span>

          {/* Person A */}
          <div className="syn-select">
            <div className="syn-avatar" style={{ borderColor: 'var(--gold)', background: 'rgba(201,168,76,.1)' }}>
              {a.emoji || cfgA?.emoji || '✦'}
            </div>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: '10px', color: 'var(--gold2)' }}>{aName}</div>
              <SelectorChips slot="A" currentId={synSelA} primaryProfile={primaryProfile} people={people} onSelect={setSynSel} />
            </div>
          </div>

          <div className="syn-vs">vs</div>

          {/* Person B */}
          <div className="syn-select">
            <div className="syn-avatar" style={{ borderColor: 'var(--rose2)', background: 'rgba(212,48,112,.1)' }}>
              {b ? (b.emoji || cfgB?.emoji || '?') : '?'}
            </div>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: '10px', color: 'var(--rose2)' }}>{bName}</div>
              <SelectorChips slot="B" currentId={synSelB} primaryProfile={primaryProfile} people={people} onSelect={setSynSel} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 10 }}>
            <div
              className={`rel-badge ${hasSelection ? (romantic ? 'rel-romantic' : 'rel-family') : ''}`}
              style={!hasSelection ? { opacity: .4 } : {}}
            >
              {hasSelection ? (romantic ? '♀ Romantic Synastry' : '◈ Family Synastry') : 'No Selection'}
            </div>
            <div style={{ fontFamily: "'Inconsolata',monospace", fontSize: '7.5px', color: 'var(--text3)' }}>
              {hasSelection
                ? (romantic ? 'Venus/Mars · Soul Contracts · Composite Chart' : 'Karmic Bonds · Family Karma · Generational Patterns')
                : 'Choose people to compare'}
            </div>
          </div>

          <div style={{ flex: 1 }} />
          <div className="pp-close" onClick={onClose}>✕</div>
        </div>

        <div className="syn-body">
          {hasSelection ? (
            romantic
              ? <RomanticContent a={a} b={b} aName={aName} bName={bName} />
              : <FamilyContent a={a} b={b} aName={aName} bName={bName} />
          ) : (
            <div style={{ gridColumn: '1/4', gridRow: '1/3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, opacity: .35 }}>
              <div style={{ fontSize: 48 }}>⊕</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: '13px', letterSpacing: '.25em', color: 'var(--gold)' }}>Select Two People to Begin</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', fontStyle: 'italic' }}>Choose profiles from the selectors above</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
