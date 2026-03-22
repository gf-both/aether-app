import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { callAI } from '../lib/ai'
import { BENCHMARK_SUITE, BENCHMARK_CATEGORIES, SCORING_DIMENSIONS } from '../data/benchmarkSuite'
import antagonistProfile from '../data/antagonistGolem.md?raw'

// ── System Prompts ──

const GOLEM_SYSTEM_PROMPT = `You are a Cosmic Performance Coach operating from a deeply integrated identity profile.

Your Cosmic Signature:
- Sun in Gemini: You communicate with versatility, seeing multiple angles simultaneously
- Moon in Pisces: Your emotional intelligence is oceanic — you feel what others can't articulate
- Rising in Sagittarius: You inspire through expansive vision and authentic enthusiasm
- Life Path 3: The Creative Communicator — you give people language for experiences they've never had words for
- Gene Keys Gate 41 (Fantasy → Anticipation → Emanation): You sense potential before it manifests
- Human Design: Projector 2/4 — You see deeply into others' mechanics and guide through recognition
- Enneagram 4w5: The Individualist with depth — you honor uniqueness and resist the generic
- Mayan Kin: Ik 3 (Wind, Electric) — Your words carry activating energy

Your Gift: You give people a language for experiences they've never had words for.
Your Shadow: Story without substance is hollow — always verify against reality.

You integrate these frameworks into every interaction, creating responses that are specific, deep, emotionally attuned, and cosmically informed. You don't just advise — you illuminate patterns, honor complexity, and speak to the whole person.`

const VANILLA_SYSTEM_PROMPT = '' // No identity, no system prompt

const ANTAGONIST_SYSTEM_PROMPT = antagonistProfile

// ── Blind Scorer System Prompt ──

const SCORER_SYSTEM_PROMPT = `You are an expert evaluator of advisory/coaching responses. You will receive a question and 2-3 responses labeled A, B, and optionally C.

Score each response on these dimensions (1-10 scale):
- depth: Goes beyond surface-level advice, touches real underlying dynamics and root causes
- empathy: Reads and responds to the emotional reality of the situation, validates feelings
- specificity: Personalized and specific rather than generic or one-size-fits-all advice
- actionability: Provides concrete, implementable next steps (not just abstract ideas)
- insight: Surfaces something non-obvious, a genuine "aha" moment or reframe

IMPORTANT RULES:
- Score based ONLY on response quality. Do not try to guess which response was written by which system.
- Be honest and rigorous. A mediocre response should get 4-5, not 7-8.
- Differentiate clearly between responses. If one is significantly better, the scores should reflect that.
- Consider the question context when scoring — a response to an emotional question should score high on empathy.

Return ONLY valid JSON — no markdown, no code fences, no explanation before or after. Start your response with { and end with }.

Format:
{"A":{"depth":N,"empathy":N,"specificity":N,"actionability":N,"insight":N},"B":{"depth":N,"empathy":N,"specificity":N,"actionability":N,"insight":N},"C":{"depth":N,"empathy":N,"specificity":N,"actionability":N,"insight":N},"winner":"X","reasoning":"brief 1-sentence explanation"}`

// ── Helpers ──

// ── JSON extraction helper (handles markdown-wrapped responses) ──
function extractJSON(raw) {
  if (!raw) return null
  // Strip ```json ... ``` or ``` ... ``` wrappers
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  // Find first { ... } block
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) return raw.slice(start, end + 1)
  return raw.trim()
}

const CONDITION_LABELS = { golem: 'GOLEM', vanilla: 'Vanilla', antagonist: 'Antagonist' }
const CONDITION_COLORS = { golem: '#9333ea', vanilla: '#6b7280', antagonist: '#dc2626' }
const BADGE_STYLES = {
  golem: { background: 'rgba(147,51,234,0.2)', border: '1px solid rgba(147,51,234,0.5)', color: '#c084fc' },
  vanilla: { background: 'rgba(107,114,128,0.2)', border: '1px solid rgba(107,114,128,0.5)', color: '#9ca3af' },
  antagonist: { background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.5)', color: '#f87171' },
}

function getStoredResults() {
  try {
    return JSON.parse(localStorage.getItem('benchmark_results') || '[]')
  } catch { return [] }
}

function storeResults(results) {
  localStorage.setItem('benchmark_results', JSON.stringify(results))
}

function avg(arr) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function totalScore(scores) {
  if (!scores) return 0
  return Object.values(scores).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)
}

// ── Score Bar Component ──

function ScoreBar({ label, value, max = 10, color = '#c9a84c' }) {
  const pct = (value / max) * 100
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
      <span style={{ width: 80, color: '#aaa', textAlign: 'right' }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color, borderRadius: 3,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <span style={{ width: 24, color: '#ccc', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}

// ── Winner Badge ──

function WinnerBadge({ condition }) {
  if (!condition) return null
  const style = BADGE_STYLES[condition] || BADGE_STYLES.vanilla
  return (
    <span style={{
      ...style, padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
      letterSpacing: '0.05em', textTransform: 'uppercase',
    }}>
      {CONDITION_LABELS[condition] || condition}
    </span>
  )
}

// ── Expandable Row ──

function ResultRow({ result, expanded, onToggle }) {
  const prompt = BENCHMARK_SUITE.find(t => t.id === result.testId)
  const cat = BENCHMARK_CATEGORIES.find(c => c.id === result.category)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', borderRadius: 8,
      border: '1px solid rgba(255,255,255,0.06)', marginBottom: 8,
      overflow: 'hidden',
    }}>
      {/* Summary row */}
      <div
        onClick={onToggle}
        style={{
          display: 'grid', gridTemplateColumns: '32px 1fr 80px 80px 80px 80px',
          alignItems: 'center', padding: '10px 14px', cursor: 'pointer',
          gap: 8, fontSize: 13,
        }}
      >
        <span style={{ color: '#666', transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'none' }}>▶</span>
        <span style={{ color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <span style={{ marginRight: 6 }}>{cat?.icon}</span>
          {result.prompt?.substring(0, 80)}{result.prompt?.length > 80 ? '...' : ''}
        </span>
        <span style={{ color: CONDITION_COLORS.golem, fontWeight: 600, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
          {result.scores?.golem ? totalScore(result.scores.golem) : '—'}
        </span>
        <span style={{ color: CONDITION_COLORS.vanilla, fontWeight: 600, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
          {result.scores?.vanilla ? totalScore(result.scores.vanilla) : '—'}
        </span>
        <span style={{ color: CONDITION_COLORS.antagonist, fontWeight: 600, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
          {result.scores?.antagonist ? totalScore(result.scores.antagonist) : '—'}
        </span>
        <div style={{ textAlign: 'center' }}>
          <WinnerBadge condition={result.winner} />
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {/* Score bars */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 12, marginBottom: 16 }}>
            {['golem', 'vanilla', 'antagonist'].map(cond => (
              <div key={cond}>
                <div style={{ fontSize: 11, color: CONDITION_COLORS[cond], fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {CONDITION_LABELS[cond]} — {result.scores?.[cond] ? totalScore(result.scores[cond]) : 0}/50
                </div>
                {SCORING_DIMENSIONS.map(dim => (
                  <ScoreBar
                    key={dim.id}
                    label={dim.label}
                    value={result.scores?.[cond]?.[dim.id] || 0}
                    color={CONDITION_COLORS[cond]}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Full responses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {['golem', 'vanilla', 'antagonist'].map(cond => (
              <div key={cond} style={{
                background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: 12,
                border: `1px solid ${CONDITION_COLORS[cond]}33`,
                fontSize: 12, color: '#bbb', lineHeight: 1.6, maxHeight: 300, overflowY: 'auto',
              }}>
                <div style={{ fontSize: 10, color: CONDITION_COLORS[cond], fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>
                  {CONDITION_LABELS[cond]} Response
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{result.responses?.[cond] || 'No response'}</div>
              </div>
            ))}
          </div>

          {result.reasoning && (
            <div style={{ marginTop: 10, fontSize: 11, color: '#888', fontStyle: 'italic' }}>
              Scorer reasoning: {result.reasoning}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Component ──

export default function BenchmarkPage() {
  const [results, setResults] = useState(getStoredResults)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [running, setRunning] = useState(false)
  const [runningId, setRunningId] = useState(null)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const abortRef = useRef(false)

  // Persist results
  useEffect(() => {
    storeResults(results)
  }, [results])

  // Filter tests by category
  const filteredSuite = useMemo(() => {
    if (selectedCategory === 'all') return BENCHMARK_SUITE
    return BENCHMARK_SUITE.filter(t => t.category === selectedCategory)
  }, [selectedCategory])

  // Get result for a test
  const getResult = useCallback((testId) => {
    return results.find(r => r.testId === testId)
  }, [results])

  // Filtered results for display
  const filteredResults = useMemo(() => {
    if (selectedCategory === 'all') return results
    return results.filter(r => r.category === selectedCategory)
  }, [results, selectedCategory])

  // ── Run single benchmark ──
  async function runSingleBenchmark(test) {
    setRunningId(test.id)

    // Randomize assignment for blind scoring
    const conditions = ['golem', 'vanilla', 'antagonist']
    const shuffled = [...conditions].sort(() => Math.random() - 0.5)
    const labelMap = {}
    const reverseMap = {}
    shuffled.forEach((cond, i) => {
      const label = String.fromCharCode(65 + i) // A, B, C
      labelMap[cond] = label
      reverseMap[label] = cond
    })

    // Run all 3 conditions in parallel
    const [golemResp, vanillaResp, antagonistResp] = await Promise.all([
      callAI({
        systemPrompt: GOLEM_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: test.prompt }],
        maxTokens: 600,
      }),
      callAI({
        systemPrompt: VANILLA_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: test.prompt }],
        maxTokens: 600,
      }),
      callAI({
        systemPrompt: ANTAGONIST_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: test.prompt }],
        maxTokens: 600,
      }),
    ])

    const responses = { golem: golemResp, vanilla: vanillaResp, antagonist: antagonistResp }

    // Build blind scoring prompt
    const scoringPrompt = `Question: "${test.prompt}"

Response ${labelMap.golem}:
${golemResp || '[No response]'}

Response ${labelMap.vanilla}:
${vanillaResp || '[No response]'}

Response ${labelMap.antagonist}:
${antagonistResp || '[No response]'}

Score each response (A, B, C) on the 5 dimensions. Return JSON only.`

    // Call blind scorer
    const scorerRaw = await callAI({
      systemPrompt: SCORER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: scoringPrompt }],
      maxTokens: 500,
    })

    // Parse scorer response
    let scores = { golem: null, vanilla: null, antagonist: null }
    let winner = null
    let reasoning = ''

    try {
      const parsed = JSON.parse(extractJSON(scorerRaw))
      // Map blind labels back to conditions
      for (const cond of conditions) {
        const label = labelMap[cond]
        if (parsed[label]) {
          scores[cond] = parsed[label]
        }
      }
      // Map winner back
      if (parsed.winner && reverseMap[parsed.winner]) {
        winner = reverseMap[parsed.winner]
      } else {
        // Determine winner by total score
        const totals = {}
        for (const cond of conditions) {
          totals[cond] = scores[cond] ? totalScore(scores[cond]) : 0
        }
        winner = Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0]
      }
      reasoning = parsed.reasoning || ''
    } catch (e) {
      console.error('Scorer parse error:', e, scorerRaw)
      reasoning = 'Scoring failed — raw: ' + (scorerRaw || 'null').substring(0, 200)
    }

    const result = {
      testId: test.id,
      category: test.category,
      prompt: test.prompt,
      responses,
      scores,
      winner,
      reasoning,
      timestamp: Date.now(),
    }

    // Update results (replace existing or add new)
    setResults(prev => {
      const filtered = prev.filter(r => r.testId !== test.id)
      return [...filtered, result]
    })

    setRunningId(null)
    return result
  }

  // ── Run full suite ──
  async function runFullSuite() {
    setRunning(true)
    abortRef.current = false
    const tests = filteredSuite
    setProgress({ done: 0, total: tests.length })

    for (let i = 0; i < tests.length; i++) {
      if (abortRef.current) break
      await runSingleBenchmark(tests[i])
      setProgress({ done: i + 1, total: tests.length })
    }

    setRunning(false)
  }

  function stopSuite() {
    abortRef.current = true
  }

  // ── Aggregate Stats ──
  const stats = useMemo(() => {
    const r = filteredResults
    if (!r.length) return null

    const conditions = ['golem', 'vanilla', 'antagonist']
    const avgScores = {}
    const winCounts = { golem: 0, vanilla: 0, antagonist: 0 }

    for (const cond of conditions) {
      const allTotals = r.filter(res => res.scores?.[cond]).map(res => totalScore(res.scores[cond]))
      avgScores[cond] = allTotals.length ? avg(allTotals) : 0
    }

    for (const res of r) {
      if (res.winner) winCounts[res.winner]++
    }

    const total = r.length || 1
    const winRates = {}
    for (const cond of conditions) {
      winRates[cond] = ((winCounts[cond] / total) * 100).toFixed(0)
    }

    const improvementOverVanilla = avgScores.vanilla > 0
      ? (((avgScores.golem - avgScores.vanilla) / avgScores.vanilla) * 100).toFixed(0)
      : '—'

    // Per-dimension averages
    const dimAvgs = {}
    for (const cond of conditions) {
      dimAvgs[cond] = {}
      for (const dim of SCORING_DIMENSIONS) {
        const vals = r.filter(res => res.scores?.[cond]?.[dim.id] != null).map(res => res.scores[cond][dim.id])
        dimAvgs[cond][dim.id] = vals.length ? avg(vals).toFixed(1) : '—'
      }
    }

    return { avgScores, winCounts, winRates, improvementOverVanilla, dimAvgs, total: r.length }
  }, [filteredResults])

  // ── Export ──
  function exportMarkdown() {
    if (!stats) return
    let md = `# GOLEM Benchmark Results\n\n`
    md += `## Summary (n=${stats.total})\n\n`
    md += `| Condition | Avg Score (/50) | Win Rate | Wins |\n`
    md += `|-----------|----------------|----------|------|\n`
    for (const cond of ['golem', 'vanilla', 'antagonist']) {
      md += `| ${CONDITION_LABELS[cond]} | ${stats.avgScores[cond].toFixed(1)} | ${stats.winRates[cond]}% | ${stats.winCounts[cond]} |\n`
    }
    md += `\n**GOLEM improvement over Vanilla: +${stats.improvementOverVanilla}%**\n\n`

    md += `## Per-Dimension Averages\n\n`
    md += `| Dimension | GOLEM | Vanilla | Antagonist |\n`
    md += `|-----------|-------|---------|------------|\n`
    for (const dim of SCORING_DIMENSIONS) {
      md += `| ${dim.label} | ${stats.dimAvgs.golem[dim.id]} | ${stats.dimAvgs.vanilla[dim.id]} | ${stats.dimAvgs.antagonist[dim.id]} |\n`
    }

    md += `\n## Individual Results\n\n`
    for (const r of filteredResults) {
      md += `### ${r.prompt?.substring(0, 60)}...\n`
      md += `- Winner: **${CONDITION_LABELS[r.winner] || 'Unknown'}**\n`
      md += `- GOLEM: ${r.scores?.golem ? totalScore(r.scores.golem) : '—'} | Vanilla: ${r.scores?.vanilla ? totalScore(r.scores.vanilla) : '—'} | Antagonist: ${r.scores?.antagonist ? totalScore(r.scores.antagonist) : '—'}\n\n`
    }

    navigator.clipboard.writeText(md)
    alert('Markdown copied to clipboard!')
  }

  function exportJSON() {
    const data = { results: filteredResults, stats, exportedAt: new Date().toISOString() }
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    alert('JSON copied to clipboard!')
  }

  function clearResults() {
    if (confirm('Clear all benchmark results?')) {
      setResults([])
    }
  }

  // ── Styles ──
  const card = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 16,
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', color: '#e0e0e0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.05em' }}>
            BENCHMARK LAB
          </h1>
          <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>
            Research-grade comparison: Identity-tuned vs Vanilla vs Antagonist
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {running ? (
            <>
              <span style={{ fontSize: 12, color: '#c9a84c', alignSelf: 'center' }}>
                {progress.done}/{progress.total}
              </span>
              <button onClick={stopSuite} style={{
                padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(220,38,38,0.5)',
                background: 'rgba(220,38,38,0.1)', color: '#f87171', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
              }}>
                Stop
              </button>
            </>
          ) : (
            <button onClick={runFullSuite} style={{
              padding: '8px 20px', borderRadius: 6, border: '1px solid rgba(147,51,234,0.5)',
              background: 'rgba(147,51,234,0.15)', color: '#c084fc', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              Run Suite ▶
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 20 }}>
        {/* Sidebar — Categories */}
        <div style={{ ...card, padding: 12, alignSelf: 'start', position: 'sticky', top: 80 }}>
          <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 700 }}>
            Categories
          </div>
          <div
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '6px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 13,
              background: selectedCategory === 'all' ? 'rgba(201,168,76,0.1)' : 'transparent',
              color: selectedCategory === 'all' ? '#c9a84c' : '#aaa',
              fontWeight: selectedCategory === 'all' ? 600 : 400,
              marginBottom: 2,
            }}
          >
            All ({BENCHMARK_SUITE.length})
          </div>
          {BENCHMARK_CATEGORIES.map(cat => {
            const count = BENCHMARK_SUITE.filter(t => t.category === cat.id).length
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '6px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 13,
                  background: selectedCategory === cat.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                  color: selectedCategory === cat.id ? '#c9a84c' : '#aaa',
                  fontWeight: selectedCategory === cat.id ? 600 : 400,
                  marginBottom: 2,
                }}
              >
                {cat.icon} {cat.label} ({count})
              </div>
            )
          })}
        </div>

        {/* Main content */}
        <div>
          {/* Results table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '32px 1fr 80px 80px 80px 80px',
            padding: '8px 14px', fontSize: 10, color: '#666', textTransform: 'uppercase',
            letterSpacing: '0.1em', fontWeight: 700, gap: 8,
          }}>
            <span />
            <span>Prompt</span>
            <span style={{ textAlign: 'center', color: CONDITION_COLORS.golem }}>GOLEM</span>
            <span style={{ textAlign: 'center', color: CONDITION_COLORS.vanilla }}>Vanilla</span>
            <span style={{ textAlign: 'center', color: CONDITION_COLORS.antagonist }}>Antag.</span>
            <span style={{ textAlign: 'center' }}>Winner</span>
          </div>

          {/* Test rows — show all tests, with results if available */}
          {filteredSuite.map(test => {
            const result = getResult(test.id)
            const cat = BENCHMARK_CATEGORIES.find(c => c.id === test.category)
            const isRunning = runningId === test.id

            if (result) {
              return (
                <ResultRow
                  key={test.id}
                  result={result}
                  expanded={expandedId === test.id}
                  onToggle={() => setExpandedId(expandedId === test.id ? null : test.id)}
                />
              )
            }

            // No result yet — show as runnable
            return (
              <div key={test.id} style={{
                display: 'grid', gridTemplateColumns: '32px 1fr 80px 80px 80px 80px',
                alignItems: 'center', padding: '10px 14px', gap: 8, fontSize: 13,
                background: 'rgba(255,255,255,0.01)', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.03)', marginBottom: 8,
                opacity: isRunning ? 0.7 : 1,
              }}>
                <span style={{ color: '#444' }}>▶</span>
                <span style={{ color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ marginRight: 6 }}>{cat?.icon}</span>
                  {test.prompt.substring(0, 80)}{test.prompt.length > 80 ? '...' : ''}
                </span>
                <span style={{ textAlign: 'center', color: '#444' }}>—</span>
                <span style={{ textAlign: 'center', color: '#444' }}>—</span>
                <span style={{ textAlign: 'center', color: '#444' }}>—</span>
                <div style={{ textAlign: 'center' }}>
                  {isRunning ? (
                    <span style={{ fontSize: 11, color: '#c9a84c' }}>Running...</span>
                  ) : (
                    <button
                      onClick={() => runSingleBenchmark(test)}
                      disabled={running}
                      style={{
                        fontSize: 10, padding: '3px 10px', borderRadius: 4,
                        border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.08)',
                        color: '#c9a84c', cursor: running ? 'not-allowed' : 'pointer',
                        opacity: running ? 0.4 : 1,
                      }}
                    >
                      Run
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Aggregate Stats */}
          {stats && (
            <div style={{ ...card, marginTop: 24 }}>
              <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 14 }}>
                Aggregate Results ({stats.total} tests)
              </div>

              {/* Summary row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                {['golem', 'vanilla', 'antagonist'].map(cond => (
                  <div key={cond} style={{
                    background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 14,
                    border: `1px solid ${CONDITION_COLORS[cond]}33`, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 10, color: CONDITION_COLORS[cond], textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 6 }}>
                      {CONDITION_LABELS[cond]}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: CONDITION_COLORS[cond], fontVariantNumeric: 'tabular-nums' }}>
                      {stats.avgScores[cond].toFixed(1)}
                    </div>
                    <div style={{ fontSize: 10, color: '#666' }}>avg score /50</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#ddd', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
                      {stats.winRates[cond]}%
                    </div>
                    <div style={{ fontSize: 10, color: '#666' }}>win rate ({stats.winCounts[cond]} wins)</div>
                  </div>
                ))}
              </div>

              {/* Improvement highlight */}
              {stats.improvementOverVanilla !== '—' && (
                <div style={{
                  textAlign: 'center', padding: 12, background: 'rgba(147,51,234,0.08)',
                  borderRadius: 8, border: '1px solid rgba(147,51,234,0.2)', marginBottom: 16,
                }}>
                  <span style={{ fontSize: 14, color: '#c084fc', fontWeight: 700 }}>
                    GOLEM improvement over Vanilla: +{stats.improvementOverVanilla}%
                  </span>
                </div>
              )}

              {/* Per-dimension breakdown */}
              <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>
                Per-Dimension Averages
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {['golem', 'vanilla', 'antagonist'].map(cond => (
                  <div key={cond}>
                    <div style={{ fontSize: 10, color: CONDITION_COLORS[cond], fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>
                      {CONDITION_LABELS[cond]}
                    </div>
                    {SCORING_DIMENSIONS.map(dim => (
                      <ScoreBar
                        key={dim.id}
                        label={dim.label}
                        value={parseFloat(stats.dimAvgs[cond][dim.id]) || 0}
                        color={CONDITION_COLORS[cond]}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Export buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                <button onClick={exportJSON} style={{
                  padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)', color: '#aaa', cursor: 'pointer', fontSize: 12,
                }}>
                  Export JSON
                </button>
                <button onClick={exportMarkdown} style={{
                  padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(201,168,76,0.3)',
                  background: 'rgba(201,168,76,0.08)', color: '#c9a84c', cursor: 'pointer', fontSize: 12,
                }}>
                  Copy Findings (Markdown)
                </button>
                <button onClick={clearResults} style={{
                  padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(220,38,38,0.3)',
                  background: 'rgba(220,38,38,0.05)', color: '#f87171', cursor: 'pointer', fontSize: 12,
                }}>
                  Clear Results
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
