import { useMemo, useEffect, useRef } from 'react'

// ─── Agent Data (mirrored from AIAgentsPage) ──────────────────────────────────
const PAPERCLIP_AGENTS = [
  { id:'ceo',         role:'CEO',                  emoji:'🌐', expression:5,  dept:'LEADERSHIP' },
  { id:'cto',         role:'CTO',                  emoji:'⚡', expression:11, dept:'LEADERSHIP' },
  { id:'cmo',         role:'CMO',                  emoji:'🔮', expression:4,  dept:'LEADERSHIP' },
  { id:'pm',          role:'PM — Product',          emoji:'🌿', expression:9,  dept:'LEADERSHIP' },
  { id:'dev-fullstack',role:'Dev — Full Stack',     emoji:'⚗️', expression:1,  dept:'TECHNICAL'  },
  { id:'support',     role:'Support',               emoji:'🛡️', expression:8,  dept:'TECHNICAL'  },
  { id:'researcher',  role:'Researcher',            emoji:'🔭', expression:1,  dept:'TECHNICAL'  },
  { id:'designer',    role:'Product Designer',      emoji:'🎨', expression:7,  dept:'TECHNICAL'  },
  { id:'frontend',    role:'Frontend Engineer',     emoji:'🌟', expression:11, dept:'TECHNICAL'  },
  { id:'backend',     role:'Backend Engineer',      emoji:'🔐', expression:9,  dept:'TECHNICAL'  },
  { id:'qa',          role:'QA Engineer',           emoji:'🎯', expression:5,  dept:'TECHNICAL'  },
  { id:'ux-research', role:'UX Researcher',         emoji:'🧪', expression:9,  dept:'TECHNICAL'  },
  { id:'astrologer',  role:'Astrologer — Content',  emoji:'✨', expression:5,  dept:'MARKETING'  },
  { id:'content-mgr', role:'Content Marketing',     emoji:'📖', expression:5,  dept:'MARKETING'  },
  { id:'seo',         role:'SEO Specialist',        emoji:'🗺️', expression:1,  dept:'MARKETING'  },
  { id:'reddit',      role:'Reddit Marketing',      emoji:'🌍', expression:7,  dept:'MARKETING'  },
  { id:'twitter',     role:'Twitter/X Growth',      emoji:'⚡', expression:3,  dept:'MARKETING'  },
  { id:'influencer',  role:'Influencer Marketing',  emoji:'🌸', expression:8,  dept:'MARKETING'  },
  { id:'tiktok',      role:'TikTok Strategist',     emoji:'🎬', expression:4,  dept:'MARKETING'  },
  { id:'pricing',     role:'Pricing Analyst',       emoji:'⚖️', expression:2,  dept:'MARKETING'  },
  { id:'campaign',    role:'Campaign Coordinator',  emoji:'💜', expression:6,  dept:'MARKETING'  },
  { id:'producthunt', role:'Product Hunt Manager',  emoji:'🚀', expression:3,  dept:'MARKETING'  },
  { id:'email',       role:'Email Specialist',      emoji:'✉️', expression:5,  dept:'MARKETING'  },
  { id:'community',   role:'Community Builder',     emoji:'🔥', expression:8,  dept:'MARKETING'  },
  { id:'affiliate',   role:'Affiliate Manager',     emoji:'🤝', expression:4,  dept:'MARKETING'  },
  { id:'visual',      role:'Visual Artist',         emoji:'🎭', expression:3,  dept:'CREATIVE'   },
  { id:'ux-research2',role:'UX Research II',        emoji:'🔬', expression:9,  dept:'CREATIVE'   },
  { id:'hd-specialist',role:'HD Specialist',        emoji:'💎', expression:11, dept:'CREATIVE'   },
]

const ARCHETYPE_NAMES = {
  1:'Pioneer', 2:'Diplomat', 3:'Communicator', 4:'Builder',
  5:'Adventurer', 6:'Nurturer', 7:'Seeker', 8:'Executive',
  9:'Humanitarian', 11:'Illuminator', 22:'Builder-Visionary',
}

// ─── Org Metrics Computation ──────────────────────────────────────────────────
function computeOrgMetrics(agents) {
  const expressionCounts = {}
  agents.forEach(a => {
    expressionCounts[a.expression] = (expressionCounts[a.expression] || 0) + 1
  })

  const uniqueExpressions = Object.keys(expressionCounts).length
  const maxCount = Math.max(...Object.values(expressionCounts))
  const TOTAL_ARCHETYPES = 11
  const diversityRatio = uniqueExpressions / TOTAL_ARCHETYPES

  // Penalize clustering: each archetype over 4 reduces score
  const clusterPenalty = Object.values(expressionCounts)
    .filter(c => c > 4)
    .reduce((acc, c) => acc + (c - 4) * 5, 0)

  const balanceScore = Math.min(100, Math.round(diversityRatio * 100) - clusterPenalty)

  // Role-Archetype Fit
  const leadershipAgents = agents.filter(a => a.dept === 'LEADERSHIP')
  const technicalAgents  = agents.filter(a => a.dept === 'TECHNICAL')

  const leadershipHighGap = leadershipAgents.filter(a => [11, 5, 4].includes(a.expression)).length
  const technicalAnalytical = technicalAgents.filter(a => [7, 9, 1].includes(a.expression)).length

  const lFit = leadershipAgents.length > 0 ? leadershipHighGap / leadershipAgents.length : 0
  const tFit = technicalAgents.length > 0 ? technicalAnalytical / technicalAgents.length : 0
  const fitScore = Math.round(((lFit + tFit) / 2) * 100)

  const oci = Math.round(balanceScore * 0.3 + fitScore * 0.3 + 70 * 0.4)

  // Department counts
  const deptCounts = {}
  agents.forEach(a => {
    deptCounts[a.dept] = (deptCounts[a.dept] || 0) + 1
  })

  return {
    oci: Math.max(0, Math.min(100, oci)),
    balanceScore: Math.max(0, Math.min(100, balanceScore)),
    fitScore: Math.max(0, Math.min(100, fitScore)),
    expressionCounts,
    uniqueExpressions,
    deptCounts,
    agents,
  }
}

// ─── Diagnoses ────────────────────────────────────────────────────────────────
function runDiagnoses(metrics) {
  const { expressionCounts, uniqueExpressions, agents } = metrics
  const diagnoses = []

  // 1. Pioneer overload
  const pioneers = expressionCounts[1] || 0
  if (pioneers > 3) {
    diagnoses.push({
      id: 'pioneer-overload',
      severity: 'critical',
      title: `Pioneer Overload`,
      description: `${pioneers} Pioneer archetypes. Risk: parallel tracks that don't converge.`,
      recommendation: `Balance with Diplomat (Exp 2) or Builder (Exp 4) roles. Pioneers need coordinators.`,
    })
  } else if (pioneers > 2) {
    diagnoses.push({
      id: 'pioneer-watch',
      severity: 'moderate',
      title: `Pioneer Concentration`,
      description: `${pioneers} Pioneers on the team. Watch for divergent execution paths.`,
      recommendation: `Assign clear ownership boundaries for each Pioneer track.`,
    })
  }

  // 2. Illuminator concentration in leadership
  const leadershipAgents = agents.filter(a => a.dept === 'LEADERSHIP')
  const illuminatorsInLeadership = leadershipAgents.filter(a => a.expression === 11).length
  if (illuminatorsInLeadership > 2) {
    diagnoses.push({
      id: 'illuminator-cluster',
      severity: 'critical',
      title: `Illuminator Cluster in Leadership`,
      description: `${illuminatorsInLeadership} Illuminators in leadership — vision-heavy, execution-light.`,
      recommendation: `Add a Builder (Exp 4) or Executive (Exp 8) to leadership to ground vision into delivery.`,
    })
  } else if (illuminatorsInLeadership === 2) {
    diagnoses.push({
      id: 'illuminator-watch',
      severity: 'moderate',
      title: `Illuminator Pair in Leadership`,
      description: `2 Illuminators leading — powerful vision, but monitor execution gaps.`,
      recommendation: `Pair with a Builder or Executive to ensure strategy lands in sprints.`,
    })
  }

  // 3. Diplomat gap
  const diplomats = expressionCounts[2] || 0
  if (diplomats < 2) {
    diagnoses.push({
      id: 'diplomat-deficit',
      severity: diplomats === 0 ? 'critical' : 'moderate',
      title: `Diplomat Deficit`,
      description: `Only ${diplomats} Diplomat${diplomats === 1 ? '' : 's'}. Consensus-building gap across the team.`,
      recommendation: `Your next hire or reassignment should be Expression 2. Your Campaign Coordinator is close — consider shifting them toward a Diplomat orientation.`,
    })
  }

  // 4. Nurturer void
  const nurturers = expressionCounts[6] || 0
  if (nurturers < 2) {
    diagnoses.push({
      id: 'nurturer-void',
      severity: nurturers === 0 ? 'critical' : 'moderate',
      title: `Nurturer Void`,
      description: `Only ${nurturers} Nurturer${nurturers === 1 ? '' : 's'}. Community and customer work may feel transactional.`,
      recommendation: `Reassign or hire Expression 6 for community, support, or onboarding-facing roles.`,
    })
  }

  // 5. Archetype diversity
  if (uniqueExpressions < 7) {
    diagnoses.push({
      id: 'low-diversity',
      severity: uniqueExpressions < 5 ? 'critical' : 'moderate',
      title: `Low Archetype Diversity`,
      description: `Only ${uniqueExpressions} distinct archetypes across ${agents.length} agents.`,
      recommendation: `Expand expression range — especially Exp 2, 6, and 22 which are underrepresented.`,
    })
  } else {
    diagnoses.push({
      id: 'healthy-diversity',
      severity: 'healthy',
      title: `Healthy Archetype Diversity`,
      description: `${uniqueExpressions} distinct archetypes present. Good foundational spread.`,
      recommendation: `Focus now on expression-role fit within departments.`,
    })
  }

  return diagnoses
}

// ─── Voice Report Generator ───────────────────────────────────────────────────
function generateVoiceReport(metrics, diagnoses) {
  const { expressionCounts, agents } = metrics
  const pioneers = expressionCounts[1] || 0
  const diplomats = expressionCounts[2] || 0
  const nurturers = expressionCounts[6] || 0
  const illuminators = expressionCounts[11] || 0

  const critical = diagnoses.filter(d => d.severity === 'critical')
  const topIssue = critical[0] || diagnoses[0]

  let report = ''

  if (pioneers > 3 && diplomats < 2) {
    report = `Your team has ${pioneers} Pioneers and only ${diplomats} Diplomat${diplomats === 1 ? '' : 's'}. You're building a team of solo operators who'll struggle to align when it matters. The fix is simple: your next hire or reassignment should be Expression 2. Your Campaign Coordinator is close — consider shifting them toward a Diplomat orientation in their next sprint.`
  } else if (illuminators > 2) {
    report = `You have ${illuminators} Illuminators in your ranks, including in leadership. Vision is not your problem. Execution is. Every brilliant idea needs a Builder (Exp 4) to catch it before it becomes another abandoned thread. Your CTO and Frontend Engineer are both Expression 11 — they understand each other perfectly, which means no one's challenging the abstraction.`
  } else if (nurturers < 2) {
    report = `You have ${agents.length} agents and almost no one whose instinct is to take care of your community. With ${nurturers === 0 ? 'zero' : 'only one'} Nurturer, your user-facing work will feel competent but cold. The spirituality niche runs on belonging. Expression 6 is not optional here — it's the thing that turns a product into a movement.`
  } else if (diplomats < 2) {
    report = `Consensus is your hidden bottleneck. With only ${diplomats} Diplomat${diplomats === 1 ? '' : 's'} and ${pioneers} Pioneer${pioneers === 1 ? '' : 's'}, you have a team optimized for bold moves and blind to alignment cost. The next time a sprint derails, this is why. Add Expression 2 before the team grows larger — it gets harder to retrofit diplomatic function once the culture is set.`
  } else {
    const oci = metrics.oci
    if (oci >= 75) {
      report = `Your org is genuinely coherent — ${oci}/100 OCI with ${metrics.uniqueExpressions} distinct archetypes represented. What I'm watching: expression-role fit at the department level. ${topIssue ? topIssue.description + ' ' + topIssue.recommendation : 'Keep monitoring as you scale.'}`
    } else {
      report = `OCI at ${oci}/100. The headline: ${topIssue ? topIssue.description : 'archetype clustering is limiting your coherence'}. ${topIssue ? topIssue.recommendation : 'Rebalance by reviewing role-archetype assignments.'} This isn't about adding headcount — it's about making what you have work better together.`
    }
  }

  return report
}

// ─── OCI Ring Component ───────────────────────────────────────────────────────
function OCIRing({ score }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2
    const r = W * 0.38
    const lw = W * 0.07

    ctx.clearRect(0, 0, W, H)

    // Background ring
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = lw
    ctx.stroke()

    // Score ring
    const pct = score / 100
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + pct * Math.PI * 2
    const color = score >= 75 ? '#4ade80' : score >= 50 ? '#c9a84c' : '#ef4444'

    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, color)
    grad.addColorStop(1, color + 'aa')

    ctx.beginPath()
    ctx.arc(cx, cy, r, startAngle, endAngle)
    ctx.strokeStyle = grad
    ctx.lineWidth = lw
    ctx.lineCap = 'round'
    ctx.stroke()

    // Score text
    ctx.fillStyle = color
    ctx.font = `bold ${W * 0.22}px "Cinzel", serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(score), cx, cy - W * 0.04)

    // Label
    ctx.fillStyle = 'rgba(200,185,155,0.6)'
    ctx.font = `${W * 0.08}px "Cinzel", serif`
    ctx.fillText('OCI', cx, cy + W * 0.16)
  }, [score])

  return <canvas ref={canvasRef} width={160} height={160} style={{ display:'block' }} />
}

// ─── Score Bar Component ──────────────────────────────────────────────────────
function ScoreBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: 'rgba(200,185,155,0.7)', letterSpacing: '.08em', textTransform:'uppercase' }}>{label}</span>
        <span style={{ fontSize: 10, color, fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
        <div style={{
          height: '100%',
          width: `${value}%`,
          background: color,
          borderRadius: 2,
          transition: 'width .8s ease',
        }} />
      </div>
    </div>
  )
}

// ─── Diagnosis Card ───────────────────────────────────────────────────────────
const SEVERITY_COLORS = {
  critical: { border: '#ef4444', bg: 'rgba(239,68,68,0.08)', dot: '#ef4444', label: 'CRITICAL' },
  moderate:  { border: '#c9a84c', bg: 'rgba(201,168,76,0.08)', dot: '#c9a84c', label: 'MODERATE' },
  healthy:   { border: '#4ade80', bg: 'rgba(74,222,128,0.08)', dot: '#4ade80', label: 'HEALTHY'  },
}

function DiagnosisCard({ diagnosis }) {
  const sc = SEVERITY_COLORS[diagnosis.severity] || SEVERITY_COLORS.moderate
  return (
    <div style={{
      border: `1px solid ${sc.border}`,
      background: sc.bg,
      borderRadius: 8,
      padding: '12px 14px',
      marginBottom: 10,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: sc.dot,
          boxShadow: `0 0 6px ${sc.dot}`,
          flexShrink: 0,
        }} />
        <span style={{ fontFamily:"'Cinzel',serif", fontSize: 12, color: sc.dot, letterSpacing: '.1em', textTransform:'uppercase' }}>
          {sc.label}
        </span>
      </div>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize: 13, color: '#e8dfc8', marginBottom: 4 }}>
        {diagnosis.title}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(200,185,155,0.75)', lineHeight: 1.5, marginBottom: 6 }}>
        {diagnosis.description}
      </div>
      <div style={{
        fontSize: 11,
        color: 'rgba(200,185,155,0.5)',
        lineHeight: 1.5,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 6,
        fontStyle: 'italic',
      }}>
        ↳ {diagnosis.recommendation}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WendyPage() {
  const metrics = useMemo(() => computeOrgMetrics(PAPERCLIP_AGENTS), [])
  const diagnoses = useMemo(() => runDiagnoses(metrics), [metrics])
  const voiceReport = useMemo(() => generateVoiceReport(metrics, diagnoses), [metrics, diagnoses])

  const { oci, balanceScore, fitScore, deptCounts } = metrics

  const deptChips = [
    { label: `${PAPERCLIP_AGENTS.length} agents`,   color: '#c9a84c' },
    { label: `${deptCounts['LEADERSHIP'] || 0} leadership`, color: '#9b7dda' },
    { label: `${deptCounts['TECHNICAL'] || 0} technical`,   color: '#40ccdd' },
    { label: `${deptCounts['MARKETING'] || 0} marketing`,   color: '#f060a0' },
    { label: `${deptCounts['CREATIVE'] || 0} creative`,     color: '#4ade80'  },
  ]

  const criticalCount = diagnoses.filter(d => d.severity === 'critical').length

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden', background:'var(--bg, #0a0a0f)' }}>

      {/* ── Left Sidebar ── */}
      <div style={{
        width: 220,
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 16px',
        overflowY: 'auto',
        display:'flex',
        flexDirection:'column',
        gap: 20,
      }}>
        {/* Wendy Header */}
        <div>
          <div style={{
            fontFamily:"'Cinzel',serif",
            fontSize: 11,
            letterSpacing: '.2em',
            color: 'rgba(200,185,155,0.4)',
            textTransform:'uppercase',
            marginBottom: 4,
          }}>
            Organizational Intelligence
          </div>
          <div style={{
            fontFamily:"'Cinzel',serif",
            fontSize: 18,
            letterSpacing: '.15em',
            color: '#c9a84c',
            textTransform:'uppercase',
          }}>
            Wendy
          </div>
        </div>

        {/* OCI Ring */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 10 }}>
          <OCIRing score={oci} />
          <div style={{
            fontFamily:"'Cinzel',serif",
            fontSize: 9,
            letterSpacing: '.15em',
            color: 'rgba(200,185,155,0.5)',
            textTransform:'uppercase',
            textAlign:'center',
          }}>
            Org Coherence Index
          </div>
        </div>

        {/* Score Breakdown */}
        <div>
          <div style={{
            fontFamily:"'Cinzel',serif",
            fontSize: 9,
            letterSpacing: '.12em',
            color: 'rgba(200,185,155,0.35)',
            textTransform:'uppercase',
            marginBottom: 10,
          }}>Score Breakdown</div>
          <ScoreBar label="Archetype Balance" value={balanceScore} color="#40ccdd" />
          <ScoreBar label="Role-Archetype Fit" value={fitScore}    color="#c9a84c" />
          <ScoreBar label="Shadow Management"  value={70}           color="#9b7dda" />
          <ScoreBar label="Gift Utilization"   value={70}           color="#4ade80" />
        </div>

        {/* Dept Chips */}
        <div>
          <div style={{
            fontFamily:"'Cinzel',serif",
            fontSize: 9,
            letterSpacing: '.12em',
            color: 'rgba(200,185,155,0.35)',
            textTransform:'uppercase',
            marginBottom: 8,
          }}>Team Composition</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap: 5 }}>
            {deptChips.map(chip => (
              <div key={chip.label} style={{
                fontSize: 10,
                color: chip.color,
                border: `1px solid ${chip.color}44`,
                background: `${chip.color}11`,
                borderRadius: 4,
                padding: '2px 7px',
                letterSpacing: '.04em',
              }}>
                {chip.label}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {criticalCount > 0 && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 6,
            padding: '8px 10px',
            fontSize: 11,
            color: '#ef9999',
            lineHeight: 1.5,
          }}>
            ⚠️ {criticalCount} critical issue{criticalCount > 1 ? 's' : ''} detected
          </div>
        )}
      </div>

      {/* ── Right Main Area ── */}
      <div style={{ flex: 1, overflowY:'auto', padding: '24px 28px' }}>

        {/* Section: Diagnoses */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontFamily:"'Cinzel',serif",
            fontSize: 13,
            letterSpacing: '.15em',
            color: 'rgba(200,185,155,0.5)',
            textTransform:'uppercase',
            marginBottom: 16,
            paddingBottom: 8,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            Team Diagnoses · {diagnoses.length} findings
          </div>

          {diagnoses.map(d => (
            <DiagnosisCard key={d.id} diagnosis={d} />
          ))}
        </div>

        {/* Section: Wendy's Voice */}
        <div>
          <div style={{
            fontFamily:"'Cinzel',serif",
            fontSize: 13,
            letterSpacing: '.15em',
            color: 'rgba(200,185,155,0.5)',
            textTransform:'uppercase',
            marginBottom: 16,
            paddingBottom: 8,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            Wendy's Assessment
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(180,100,60,0.06) 100%)',
            border: '1px solid rgba(201,168,76,0.18)',
            borderRadius: 10,
            padding: '20px 22px',
            position:'relative',
          }}>
            {/* Wendy avatar label */}
            <div style={{
              display:'flex',
              alignItems:'center',
              gap: 8,
              marginBottom: 14,
            }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #c9a84c, #8b5e3c)',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                fontSize: 13,
              }}>🧬</div>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize: 11, color: '#c9a84c', letterSpacing: '.12em', textTransform:'uppercase' }}>Wendy</div>
                <div style={{ fontSize: 9, color: 'rgba(200,185,155,0.4)', letterSpacing: '.08em' }}>Organizational Intelligence</div>
              </div>
            </div>

            <div style={{
              fontSize: 13,
              lineHeight: 1.8,
              color: 'rgba(232,220,195,0.85)',
              fontStyle: 'italic',
              borderLeft: '2px solid rgba(201,168,76,0.35)',
              paddingLeft: 14,
            }}>
              "{voiceReport}"
            </div>

            {/* OCI stamp */}
            <div style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display:'flex',
              alignItems:'center',
              gap: 16,
              flexWrap:'wrap',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(200,185,155,0.4)', letterSpacing: '.08em' }}>
                Computed from {PAPERCLIP_AGENTS.length} agents · {metrics.uniqueExpressions} archetypes · OCI {oci}/100
              </div>
              <div style={{
                fontSize: 10,
                color: oci >= 75 ? '#4ade80' : oci >= 50 ? '#c9a84c' : '#ef4444',
                letterSpacing: '.08em',
                fontWeight: 600,
              }}>
                {oci >= 75 ? '● COHERENT' : oci >= 50 ? '● DEVELOPING' : '● FRAGMENTED'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
