import { useMemo } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { getNatalChart } from '../../engines/natalEngine'
import { computeHDChart } from '../../engines/hdEngine'
import { getNumerologyProfileFromDob } from '../../engines/numerologyEngine'
import { getMayanProfile } from '../../engines/mayanEngine'
import { getGeneKeysProfile } from '../../engines/geneKeysEngine'
import { getCelticTree } from '../../engines/celticTreeEngine'
import { getCareerAlignment } from '../../engines/careerAlignmentEngine'
import CareerWheel from '../canvas/CareerWheel'

function parseDOB(dob) {
  if (!dob) return null
  const [y, m, d] = dob.split('-').map(Number)
  return { year: y, month: m, day: d }
}
function parseTOB(tob) {
  if (!tob) return { hour: 0, minute: 0 }
  const [h, m] = tob.split(':').map(Number)
  return { hour: h || 0, minute: m || 0 }
}

const ROLE_ICONS = {
  'CEO / Founder': '👑',
  'CTO / Principal Engineer': '🏗️',
  'Frontend Engineer / UX Engineer': '🎨',
  'Content Marketing / Storyteller': '✍️',
  'Community Manager / Growth': '🌱',
  'Research Analyst / Data Scientist': '🔮',
  'Product Manager': '🎯',
  'QA Engineer / Quality Assurance': '⚡',
}

const CATEGORY_COLORS = {
  Leadership:  '#c9a84c',
  Technical:   '#4dccd8',
  Creative:    '#d43070',
  Growth:      '#60c850',
  Analytical:  '#9050e0',
  Strategy:    '#e08840',
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 28,
    background: 'var(--card)', color: 'var(--foreground)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    boxSizing: 'border-box',
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: 'var(--muted-foreground)', paddingBottom: 8,
    borderBottom: '1px solid var(--accent)', marginBottom: 12,
  },
  glass: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 13, padding: 20, backdropFilter: 'blur(12px)',
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 600, letterSpacing: '.15em',
    color: 'var(--foreground)', marginBottom: 6,
  },
  quote: {
    fontSize: 15, lineHeight: 1.7, color: 'var(--muted-foreground)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--accent)', border: '1px solid var(--border)',
    marginTop: 10,
  },
}

function ScoreBar({ score, color }) {
  return (
    <div style={{
      width: '100%', height: 8, borderRadius: 4,
      background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
    }}>
      <div style={{
        width: `${score}%`, height: '100%', borderRadius: 4,
        background: `linear-gradient(90deg, ${color}99, ${color})`,
        transition: 'width 0.6s ease',
      }} />
    </div>
  )
}

function RoleCard({ role, score, matches, gaps, description, category, index }) {
  const color = CATEGORY_COLORS[category] || '#c9a84c'
  const icon = ROLE_ICONS[role] || '◈'

  return (
    <div style={{
      ...S.glass,
      borderLeft: `3px solid ${color}`,
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 600,
              color: '#e8e0d0', letterSpacing: '.04em',
            }}>{role}</span>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.1em',
              padding: '2px 8px', borderRadius: 10,
              background: color + '18', border: `1px solid ${color}44`, color,
              textTransform: 'uppercase', flexShrink: 0,
            }}>{category}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <ScoreBar score={score} color={color} />
            </div>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color,
              flexShrink: 0, minWidth: 36, textAlign: 'right',
            }}>{score}%</span>
          </div>

          {matches.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'rgba(201,168,76,0.6)', letterSpacing: '.05em' }}>
                MATCHING:&nbsp;
              </span>
              <span style={{ fontSize: 12, color: 'rgba(200,220,200,0.85)', lineHeight: 1.5 }}>
                {matches.slice(0, 4).join(' · ')}
              </span>
            </div>
          )}

          {gaps.length > 0 && (
            <div>
              <span style={{ fontSize: 11, color: 'rgba(255,120,120,0.6)', letterSpacing: '.05em' }}>
                TENSION:&nbsp;
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,160,160,0.7)', lineHeight: 1.5 }}>
                {gaps.join(' · ')}
              </span>
            </div>
          )}

          {description && (
            <div style={{ fontSize: 12, color: 'rgba(180,175,165,0.7)', marginTop: 6, fontStyle: 'italic', lineHeight: 1.5 }}>
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function WorkStyleInsight({ label, text }) {
  return (
    <div style={{ display: 'flex', gap: 12, paddingBottom: 12, borderBottom: '1px solid rgba(201,168,76,0.06)' }}>
      <div style={{ flexShrink: 0, paddingTop: 3 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'rgba(201,168,76,0.6)', marginTop: 2,
        }} />
      </div>
      <div>
        <span style={{
          fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600,
          color: 'var(--muted-foreground)', letterSpacing: '.12em', textTransform: 'uppercase',
        }}>{label}: </span>
        <span style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{text}</span>
      </div>
    </div>
  )
}

export default function CareerAlignmentDetail() {
  const primaryProfile = useAboveInsideStore(s => s.primaryProfile)
  const activeViewProfile = useAboveInsideStore(s => s.activeViewProfile)
  const profile = activeViewProfile || primaryProfile

  const alignment = useMemo(() => {
    try {
      const dob = parseDOB(profile.dob)
      const tob = parseTOB(profile.tob)
      if (!dob) return null

      const natal = getNatalChart({
        day: dob.day, month: dob.month, year: dob.year,
        hour: tob.hour, minute: tob.minute,
        lat: profile.birthLat ?? -34.6037,
        lon: profile.birthLon ?? -58.3816,
        timezone: profile.birthTimezone ?? -3,
      })

      const hd = computeHDChart({
        dateOfBirth: profile.dob,
        timeOfBirth: profile.tob || '00:00',
        utcOffset: profile.birthTimezone ?? -3,
      })

      const numerology = getNumerologyProfileFromDob(
        profile.dob,
        profile.name?.toUpperCase() || 'GASTON FRYDLEWSKI',
        { currentYear: new Date().getFullYear(), currentMonth: new Date().getMonth() + 1, currentDay: new Date().getDate() }
      )

      const mayanRaw = getMayanProfile(dob.day, dob.month, dob.year)
      const mayan = mayanRaw ? {
        tzolkin: {
          daySign: mayanRaw.tzolkin?.daySign,
          tone: mayanRaw.tzolkin?.tone?.number ?? mayanRaw.tzolkin?.tone,
        }
      } : null

      const gkRaw = getGeneKeysProfile({
        day: dob.day, month: dob.month, year: dob.year,
        hour: tob.hour, minute: tob.minute,
        timezone: profile.birthTimezone ?? -3,
      })
      const geneKeys = gkRaw ? { spheres: gkRaw.spheres } : null

      const celticRaw = getCelticTree({ day: dob.day, month: dob.month })
      const celtic = celticRaw ? { birthTree: celticRaw } : null

      return getCareerAlignment({ natal, hd, numerology, mayan, geneKeys, celtic })
    } catch (e) {
      console.error('CareerAlignmentDetail error:', e)
      return null
    }
  }, [profile.dob, profile.tob, profile.name, profile.birthLat, profile.birthLon, profile.birthTimezone])

  if (!profile.dob) {
    return (
      <div style={{ ...S.panel, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted-foreground)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: 'var(--muted-foreground)' }}>
            Enter your birth date to reveal your cosmic career blueprint
          </div>
        </div>
      </div>
    )
  }

  if (!alignment) {
    return (
      <div style={{ ...S.panel, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--muted-foreground)', fontStyle: 'italic' }}>Computing alignment…</div>
      </div>
    )
  }

  const { topRoles, summary, workStyleInsights, complementaryProfile, categoryScores } = alignment

  return (
    <div style={S.panel}>

      {/* Header */}
      <div>
        <div style={S.heading}>◈ YOUR COSMIC CAREER BLUEPRINT</div>
        {summary && (
          <div style={S.quote}>{summary}</div>
        )}
      </div>

      {/* Radar Chart */}
      <div style={{ ...S.glass, height: 280, position: 'relative' }}>
        <div style={S.sectionTitle}>ALIGNMENT RADAR</div>
        <div style={{ height: 230 }}>
          <CareerWheel />
        </div>
      </div>

      {/* Top Aligned Roles */}
      <div>
        <div style={S.sectionTitle}>TOP ALIGNED ROLES</div>
        {topRoles.map((role, i) => (
          <RoleCard key={role.role} {...role} index={i} />
        ))}
      </div>

      {/* Work Style */}
      {workStyleInsights?.length > 0 && (
        <div style={S.glass}>
          <div style={S.sectionTitle}>YOUR COSMIC WORK STYLE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {workStyleInsights.map((insight, i) => (
              <WorkStyleInsight key={i} label={insight.label} text={insight.text} />
            ))}
          </div>
        </div>
      )}

      {/* Category Scores */}
      {categoryScores && (
        <div style={S.glass}>
          <div style={S.sectionTitle}>ALIGNMENT BY CATEGORY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(categoryScores)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, score]) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{
                      fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.1em',
                      textTransform: 'uppercase', color: CATEGORY_COLORS[cat] || 'var(--muted-foreground)',
                    }}>{cat}</span>
                    <span style={{
                      fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600,
                      color: CATEGORY_COLORS[cat] || 'var(--foreground)',
                    }}>{score}%</span>
                  </div>
                  <ScoreBar score={score} color={CATEGORY_COLORS[cat] || '#c9a84c'} />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Complementary Roles */}
      {complementaryProfile && (
        <div style={S.glass}>
          <div style={S.sectionTitle}>COMPLEMENTARY ROLES FOR YOUR TEAM</div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: 'rgba(255,180,80,0.8)', fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                Your blind spots:&nbsp;
              </span>
              <span>{complementaryProfile.blindSpots.join(', ')}</span>
            </div>
            {complementaryProfile.suggestions.length > 0 && (
              <div>
                <span style={{ color: 'rgba(100,220,150,0.8)', fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  Hire / work with:&nbsp;
                </span>
                <span>{complementaryProfile.suggestions.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
