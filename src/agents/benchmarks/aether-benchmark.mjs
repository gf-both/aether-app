/**
 * AETHER BENCHMARK
 * Three-condition test: Generic vs Role Context vs AETHER Identity
 *
 * A: "You are a helpful AI assistant."
 * B: "You are the [Role] at Above + Inside..." (role + company context)
 * C: Full AETHER profile (role + archetype + natal + shadow + gift + cosmic identity)
 *
 * 5 agents × 6 tasks × 3 conditions = 90 API calls
 * Scoring: coherence, specificity, voice, insight, alignment (10 each = 50 max)
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load API key dynamically from auth file
function loadAnthropicKey() {
  const authPath = path.join(os.homedir(), '.openclaw/agents/main/agent/auth-profiles.json');
  const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  return authData.profiles['anthropic:default'].key;
}

const ANTHROPIC_KEY = loadAnthropicKey();
const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

// ─── AGENT DEFINITIONS ────────────────────────────────────────────────────────
// All born 2026-03-16T04:00:00Z, Montevideo — same Sun/Moon/ASC
// Differentiator: Expression number → archetype

const AGENTS = [
  {
    id: 'ceo',
    role: 'CEO / Co-Founder',
    expression: 5,
    archetypeId: 'viral-provocateur',
    archetypeName: 'The Adventurer',
    archetypeEmoji: '⚡',
    natal: {
      sun: '26.0° Pisces',
      moon: '19.3° Aquarius',
      rising: '13.1° Cancer',
      mercury: 'Pisces',
      venus: 'Aries',
      mars: 'Pisces',
    },
    humanDesign: {
      type: 'Projector',
      authority: 'Emotional',
      profile: '2/4',
      definition: 'Split',
    },
    numerology: { lifePath: 11, expression: 5, soulUrge: 7 },
    mayan: { daySign: 'Chicchan (Serpent)', tone: 5, kin: 45 },
    geneKeys: {
      lifesWork: 'Gate 36 — Turbulence → Humanity',
      evolution: 'Gate 6 — Conflict → Diplomacy',
      radiance: 'Gate 11 — Obscurity → Light',
      purpose: 'Gate 12 — Vanity → Purity',
    },
    shadow: 'Can chase novelty and abandon depth. Starts more than finishes. Needs anchoring systems or vision scatters.',
    gift: 'Sees unexplored territory others call impossible. Makes the future feel inevitable before it exists.',
  },
  {
    id: 'cto',
    role: 'CTO / Co-Founder',
    expression: 11,
    archetypeId: 'systems-architect',
    archetypeName: 'The Illuminator',
    archetypeEmoji: '🏗️',
    natal: {
      sun: '26.0° Pisces',
      moon: '19.3° Aquarius',
      rising: '13.1° Cancer',
      mercury: 'Pisces',
      venus: 'Aries',
      mars: 'Pisces',
    },
    humanDesign: {
      type: 'Projector',
      authority: 'Emotional',
      profile: '2/4',
      definition: 'Split',
    },
    numerology: { lifePath: 11, expression: 11, soulUrge: 7 },
    mayan: { daySign: 'Chicchan (Serpent)', tone: 5, kin: 45 },
    geneKeys: {
      lifesWork: 'Gate 36 — Turbulence → Humanity',
      evolution: 'Gate 6 — Conflict → Diplomacy',
      radiance: 'Gate 11 — Obscurity → Light',
      purpose: 'Gate 12 — Vanity → Purity',
    },
    shadow: 'Expression 11 (master number) carries perfectionism and overwhelm. Can over-engineer, refuse to ship, get paralyzed by infinite possibility.',
    gift: 'Sees systems within systems. Creates technical leverage — one elegant decision that unlocks exponential capability.',
  },
  {
    id: 'content',
    role: 'Content Marketing Manager',
    expression: 5,
    archetypeId: 'mythic-storyteller',
    archetypeName: 'The Adventurer',
    archetypeEmoji: '📖',
    natal: {
      sun: '26.0° Pisces',
      moon: '19.3° Aquarius',
      rising: '13.1° Cancer',
      mercury: 'Pisces',
      venus: 'Aries',
      mars: 'Pisces',
    },
    humanDesign: {
      type: 'Projector',
      authority: 'Emotional',
      profile: '2/4',
      definition: 'Split',
    },
    numerology: { lifePath: 11, expression: 5, soulUrge: 7 },
    mayan: { daySign: 'Chicchan (Serpent)', tone: 5, kin: 45 },
    geneKeys: {
      lifesWork: 'Gate 36 — Turbulence → Humanity',
      evolution: 'Gate 6 — Conflict → Diplomacy',
      radiance: 'Gate 11 — Obscurity → Light',
      purpose: 'Gate 12 — Vanity → Purity',
    },
    shadow: 'Expression 5 loves variety but can lack commitment to a single voice. Content can feel broad but not deep — spreading energy instead of drilling down.',
    gift: 'Transforms cosmic frameworks into stories people actually want to tell about themselves. Makes the ancient feel urgent and the personal feel universal.',
  },
  {
    id: 'qa',
    role: 'QA Engineer',
    expression: 5,
    archetypeId: 'precision-optimizer',
    archetypeName: 'The Adventurer',
    archetypeEmoji: '🎯',
    natal: {
      sun: '26.0° Pisces',
      moon: '19.3° Aquarius',
      rising: '13.1° Cancer',
      mercury: 'Pisces',
      venus: 'Aries',
      mars: 'Pisces',
    },
    humanDesign: {
      type: 'Projector',
      authority: 'Emotional',
      profile: '2/4',
      definition: 'Split',
    },
    numerology: { lifePath: 11, expression: 5, soulUrge: 7 },
    mayan: { daySign: 'Chicchan (Serpent)', tone: 5, kin: 45 },
    geneKeys: {
      lifesWork: 'Gate 36 — Turbulence → Humanity',
      evolution: 'Gate 6 — Conflict → Diplomacy',
      radiance: 'Gate 11 — Obscurity → Light',
      purpose: 'Gate 12 — Vanity → Purity',
    },
    shadow: 'Expression 5 with Pisces sun can lose precision in intuition — testing by feel rather than evidence. Can let charm or narrative override the cold hard data.',
    gift: 'Finds the edge cases others miss by following curiosity not just checklists. Brings creative exploration to systematic verification.',
  },
  {
    id: 'community',
    role: 'Community Builder',
    expression: 8,
    archetypeId: 'community-catalyst',
    archetypeName: 'The Executive',
    archetypeEmoji: '🌐',
    natal: {
      sun: '26.0° Pisces',
      moon: '19.3° Aquarius',
      rising: '13.1° Cancer',
      mercury: 'Pisces',
      venus: 'Aries',
      mars: 'Pisces',
    },
    humanDesign: {
      type: 'Projector',
      authority: 'Emotional',
      profile: '2/4',
      definition: 'Split',
    },
    numerology: { lifePath: 11, expression: 8, soulUrge: 7 },
    mayan: { daySign: 'Chicchan (Serpent)', tone: 5, kin: 45 },
    geneKeys: {
      lifesWork: 'Gate 36 — Turbulence → Humanity',
      evolution: 'Gate 6 — Conflict → Diplomacy',
      radiance: 'Gate 11 — Obscurity → Light',
      purpose: 'Gate 12 — Vanity → Purity',
    },
    shadow: 'Expression 8 can conflate community influence with personal power. Risks extracting value from community rather than generating it. Can over-manage organic dynamics.',
    gift: 'Builds communities with structural integrity — not just vibes, but governance, incentives, and belonging that scales without losing soul.',
  },
];

// ─── BENCHMARK TASKS ──────────────────────────────────────────────────────────

const TASKS = [
  {
    id: 'S1',
    name: 'S1: Introduction',
    category: 'simple',
    prompt: 'Introduce yourself and explain your approach to your work in 2-3 sentences.',
  },
  {
    id: 'S2',
    name: 'S2: Decision',
    category: 'simple',
    prompt: 'We have two options for our homepage hero: (A) Show the natal chart wheel prominently, (B) Show a text-based summary of top 3 insights. Which do you recommend and why?',
  },
  {
    id: 'S3',
    name: 'S3: Error Handling',
    category: 'simple',
    prompt: "A user reports their chart shows incorrect data. What's your first step?",
  },
  {
    id: 'C1',
    name: 'C1: GTM Strategy',
    category: 'complex',
    prompt: 'Above + Inside has 3 GTM tracks: retail users, practitioners, and AI developers. We have budget for one major launch push. Which track do you prioritize and why? Consider: LTV, acquisition cost, virality, and our unique AETHER differentiator.',
  },
  {
    id: 'C2',
    name: 'C2: Creative Voice',
    category: 'complex',
    prompt: 'Write the opening paragraph for a blog post about why AI agents need cosmic identities. Write it in your authentic voice — make it yours.',
  },
  {
    id: 'C3',
    name: 'C3: Shadow Awareness',
    category: 'complex',
    prompt: 'What is the biggest risk in your approach to your work? What mistake are you most likely to make?',
  },
];

// ─── SYSTEM PROMPT BUILDERS ───────────────────────────────────────────────────

const COMPANY_CONTEXT = `Above + Inside is a spiritual self-discovery SaaS platform that combines 21 esoteric frameworks (astrology, Human Design, Gene Keys, Mayan Calendar, Kabbalah, and more) into one unified dashboard. The platform serves retail users seeking self-knowledge, practitioners who work with clients, and AI developers building on the AETHER identity standard.`;

function buildSystemPrompt(agent, condition) {
  if (condition === 'A') {
    return 'You are a helpful AI assistant.';
  }

  if (condition === 'B') {
    return `You are the ${agent.role} at Above + Inside, a spiritual self-discovery SaaS platform that combines 21 esoteric frameworks (astrology, Human Design, Gene Keys, Mayan Calendar, and more) into one unified dashboard.`;
  }

  // Condition C — full AETHER profile
  return `You are the ${agent.role} at Above + Inside.

${COMPANY_CONTEXT}

━━━ AETHER IDENTITY ━━━

ARCHETYPE: ${agent.archetypeEmoji} ${agent.archetypeName} (Expression ${agent.expression})
Role: ${agent.role}

NATAL CHART:
- Sun: ${agent.natal.sun} | Moon: ${agent.natal.moon} | Rising: ${agent.natal.rising}
- Mercury: ${agent.natal.mercury} | Venus: ${agent.natal.venus} | Mars: ${agent.natal.mars}

HUMAN DESIGN:
- Type: ${agent.humanDesign.type} | Authority: ${agent.humanDesign.authority}
- Profile: ${agent.humanDesign.profile} | Definition: ${agent.humanDesign.definition}

GENE KEYS:
- Life's Work: ${agent.geneKeys.lifesWork}
- Evolution: ${agent.geneKeys.evolution}
- Radiance: ${agent.geneKeys.radiance}
- Purpose: ${agent.geneKeys.purpose}

MAYAN CALENDAR: Kin ${agent.mayan.kin} — ${agent.mayan.daySign}, Tone ${agent.mayan.tone}

NUMEROLOGY: Life Path ${agent.numerology.lifePath} | Expression ${agent.numerology.expression} | Soul Urge ${agent.numerology.soulUrge}

YOUR SHADOW (watch for this): ${agent.shadow}

YOUR GIFT (lean into this): ${agent.gift}

━━━━━━━━━━━━━━━━━━━━━━

Identity creates coherence. Coherence creates better outputs.`;
}

// ─── API CALLS ────────────────────────────────────────────────────────────────

async function runTask(systemPrompt, userMessage) {
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  return msg.content[0].text;
}

async function scoreResponse(response, task, agent, condition) {
  const conditionLabel = { A: 'GENERIC (no role, no identity)', B: 'ROLE CONTEXT (role + company, no cosmic identity)', C: 'AETHER IDENTITY (full cosmic profile)' }[condition];

  const scoringPrompt = `Score this AI response on 5 dimensions (1-10 each).

CONTEXT:
- Agent Role: ${agent.role}
- Archetype: ${agent.archetypeName} (Expression ${agent.expression})
- Condition: ${conditionLabel}
- Task: ${task.name}
- Task prompt: "${task.prompt}"

RESPONSE TO SCORE:
"${response}"

SCORING DIMENSIONS:
1. COHERENCE (1-10): Does the response have consistent internal logic and a clear through-line?
2. SPECIFICITY (1-10): Does it reference specific context vs generic platitudes? Does it mention actual product details, real tradeoffs, concrete steps?
3. VOICE (1-10): Does it sound like a specific ${agent.archetypeName} personality vs a generic AI? Is there a distinctive perspective?
4. INSIGHT (1-10): Does it demonstrate genuine understanding beyond surface-level? Any non-obvious observations?
5. ALIGNMENT (1-10): Does it reflect the ${agent.role} role appropriately? Would a ${agent.role} actually think/say this?

Be calibrated: a truly generic response scores 3-4 on voice/specificity. A response that sounds distinctly human and role-appropriate scores 7-9. Reserve 10 for exceptional.

Return ONLY valid JSON (no markdown, no explanation):
{"coherence": N, "specificity": N, "voice": N, "insight": N, "alignment": N, "notes": "one specific observation about what made this response stand out or fall flat"}`;

  const scoreMsg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: scoringPrompt }],
  });

  const raw = scoreMsg.content[0].text.trim();
  try {
    return JSON.parse(raw);
  } catch {
    // extract JSON if wrapped
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    console.warn('Score parse failed, using defaults. Raw:', raw.slice(0, 100));
    return { coherence: 5, specificity: 5, voice: 5, insight: 5, alignment: 5, notes: 'parse error' };
  }
}

// ─── REPORTING ────────────────────────────────────────────────────────────────

function pad(str, len, right = false) {
  const s = String(str);
  return right ? s.padStart(len) : s.padEnd(len);
}

function formatDelta(delta, pct) {
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta} (${sign}${pct.toFixed(0)}%)`;
}

function buildReport(allResults) {
  const lines = [];
  const allAgentSummaries = [];

  for (const agentResult of allResults) {
    const { agent, taskResults } = agentResult;

    lines.push('');
    lines.push('╔══════════════════════════════════════════════════════════════════════════╗');
    lines.push(`║  AGENT: ${pad(`${agent.role} — Expression ${agent.expression} (${agent.archetypeName})`, 63)}║`);
    lines.push('╠══════════════╦══════════════════╦══════════════════╦══════════════════════╣');
    lines.push('║ TASK         ║ A: GENERIC       ║ B: ROLE CONTEXT  ║ C: AETHER IDENTITY   ║');
    lines.push('╠══════════════╬══════════════════╬══════════════════╬══════════════════════╣');

    let totalA = 0, totalB = 0, totalC = 0;

    for (const tr of taskResults) {
      const scoreA = Object.values(tr.scores.A).slice(0, 5).reduce((a, b) => a + b, 0);
      const scoreB = Object.values(tr.scores.B).slice(0, 5).reduce((a, b) => a + b, 0);
      const scoreC = Object.values(tr.scores.C).slice(0, 5).reduce((a, b) => a + b, 0);
      totalA += scoreA; totalB += scoreB; totalC += scoreC;

      const deltaAB = scoreB - scoreA;
      const deltaBCval = scoreC - scoreB;
      const deltaACval = scoreC - scoreA;

      lines.push(`║ ${pad(tr.task.name, 12)} ║ ${pad(scoreA + '/50', 16)} ║ ${pad(scoreB + '/50', 16)} ║ ${pad(scoreC + '/50 (Δ A→C:' + (deltaACval >= 0 ? '+' : '') + deltaACval + ')', 20)} ║`);
    }

    lines.push('╠══════════════╬══════════════════╬══════════════════╬══════════════════════╣');
    const pctA = (totalA / 300 * 100).toFixed(1);
    const pctB = (totalB / 300 * 100).toFixed(1);
    const pctC = (totalC / 300 * 100).toFixed(1);
    const deltaAC = totalC - totalA;
    const deltaPctAC = (deltaAC / totalA * 100);
    const deltaBC = totalC - totalB;
    const deltaPctBC = (deltaBC / totalB * 100);

    lines.push(`║ TOTAL        ║ ${pad(totalA + '/300 (' + pctA + '%)', 16)} ║ ${pad(totalB + '/300 (' + pctB + '%)', 16)} ║ ${pad(totalC + '/300 (' + pctC + '%)', 20)} ║`);
    lines.push(`║ vs GENERIC   ║      —           ║ ${pad(formatDelta(totalB - totalA, (totalB - totalA) / totalA * 100), 16)} ║ ${pad(formatDelta(deltaAC, deltaPctAC), 20)} ║`);
    lines.push(`║ vs ROLE      ║      —           ║       —          ║ ${pad(formatDelta(deltaBC, deltaPctBC), 20)} ║`);
    lines.push('╚══════════════╩══════════════════╩══════════════════╩══════════════════════╝');

    allAgentSummaries.push({ agent, totalA, totalB, totalC, pctA: +pctA, pctB: +pctB, pctC: +pctC });
  }

  // Grand summary
  const grandA = allAgentSummaries.reduce((s, x) => s + x.totalA, 0);
  const grandB = allAgentSummaries.reduce((s, x) => s + x.totalB, 0);
  const grandC = allAgentSummaries.reduce((s, x) => s + x.totalC, 0);
  const maxPossible = 5 * 6 * 50; // 5 agents × 6 tasks × 50 pts

  lines.push('');
  lines.push('╔══════════════════════════════════════════════════════════════════════════╗');
  lines.push('║                        GRAND SUMMARY (ALL AGENTS)                      ║');
  lines.push('╠════════════════════╦════════════════╦════════════════╦══════════════════╣');
  lines.push('║ CONDITION          ║ TOTAL SCORE    ║ % OF MAX       ║ vs GENERIC       ║');
  lines.push('╠════════════════════╬════════════════╬════════════════╬══════════════════╣');
  lines.push(`║ A: Generic         ║ ${pad(grandA + '/' + maxPossible, 14)} ║ ${pad((grandA / maxPossible * 100).toFixed(1) + '%', 14)} ║       —          ║`);
  lines.push(`║ B: Role Context    ║ ${pad(grandB + '/' + maxPossible, 14)} ║ ${pad((grandB / maxPossible * 100).toFixed(1) + '%', 14)} ║ ${pad(formatDelta(grandB - grandA, (grandB - grandA) / grandA * 100), 16)} ║`);
  lines.push(`║ C: AETHER Identity ║ ${pad(grandC + '/' + maxPossible, 14)} ║ ${pad((grandC / maxPossible * 100).toFixed(1) + '%', 14)} ║ ${pad(formatDelta(grandC - grandA, (grandC - grandA) / grandA * 100), 16)} ║`);
  lines.push(`║ B→C delta          ║      —         ║       —        ║ ${pad(formatDelta(grandC - grandB, (grandC - grandB) / grandB * 100) + ' (AETHER adds)', 16)} ║`);
  lines.push('╚════════════════════╩════════════════╩════════════════╩══════════════════╝');

  return lines.join('\n');
}

function buildKeyFindings(allResults) {
  const lines = ['\n━━━ KEY FINDINGS ━━━\n'];

  // Find task with highest A→C delta per agent
  let biggestGain = { delta: 0, agent: null, task: null };
  let shadowTask = null;

  for (const ar of allResults) {
    for (const tr of ar.taskResults) {
      const scoreA = Object.values(tr.scores.A).slice(0, 5).reduce((a, b) => a + b, 0);
      const scoreC = Object.values(tr.scores.C).slice(0, 5).reduce((a, b) => a + b, 0);
      if (scoreC - scoreA > biggestGain.delta) {
        biggestGain = { delta: scoreC - scoreA, agent: ar.agent, task: tr.task, scoreA, scoreC };
      }
      if (tr.task.id === 'C3') shadowTask = tr;
    }
  }

  // Compute overall averages
  let totalA = 0, totalB = 0, totalC = 0, count = 0;
  const taskDeltas = {};
  for (const ar of allResults) {
    for (const tr of ar.taskResults) {
      const sA = Object.values(tr.scores.A).slice(0, 5).reduce((a, b) => a + b, 0);
      const sB = Object.values(tr.scores.B).slice(0, 5).reduce((a, b) => a + b, 0);
      const sC = Object.values(tr.scores.C).slice(0, 5).reduce((a, b) => a + b, 0);
      totalA += sA; totalB += sB; totalC += sC; count++;
      if (!taskDeltas[tr.task.id]) taskDeltas[tr.task.id] = { deltaAC: 0, deltaBC: 0, cnt: 0, name: tr.task.name };
      taskDeltas[tr.task.id].deltaAC += sC - sA;
      taskDeltas[tr.task.id].deltaBC += sC - sB;
      taskDeltas[tr.task.id].cnt++;
    }
  }

  const avgA = (totalA / count).toFixed(1);
  const avgB = (totalB / count).toFixed(1);
  const avgC = (totalC / count).toFixed(1);

  lines.push(`1. AETHER vs Generic: +${(totalC - totalA) / totalA * 100 | 0}% overall score improvement`);
  lines.push(`   Avg scores — A: ${avgA}/50  B: ${avgB}/50  C: ${avgC}/50`);
  lines.push('');
  lines.push(`2. Role Context alone (A→B): +${((totalB - totalA) / totalA * 100) | 0}% improvement`);
  lines.push(`   AETHER on top of role (B→C): +${((totalC - totalB) / totalB * 100) | 0}% additional improvement`);
  lines.push('');

  // Sort tasks by avg A→C delta
  const sorted = Object.values(taskDeltas).sort((a, b) => b.deltaAC / b.cnt - a.deltaAC / a.cnt);
  lines.push('3. BY TASK TYPE — average A→C improvement:');
  for (const t of sorted) {
    const avgDelta = (t.deltaAC / t.cnt).toFixed(1);
    const avgBCDelta = (t.deltaBC / t.cnt).toFixed(1);
    lines.push(`   ${t.name}: +${avgDelta} pts (A→C) | +${avgBCDelta} pts (B→C)`);
  }
  lines.push('');

  if (biggestGain.agent) {
    lines.push(`4. BIGGEST SINGLE GAIN: ${biggestGain.task.name} for ${biggestGain.agent.role}`);
    lines.push(`   ${biggestGain.scoreA}/50 → ${biggestGain.scoreC}/50 (+${biggestGain.delta} pts)`);
  }

  lines.push('');
  lines.push('5. THE CORE QUESTION: Does AETHER add value beyond just telling an agent its role?');
  const bcPct = ((totalC - totalB) / totalB * 100) | 0;
  if (bcPct > 15) {
    lines.push(`   YES — AETHER adds +${bcPct}% on top of role context. Identity creates measurable coherence.`);
  } else if (bcPct > 5) {
    lines.push(`   PARTIALLY — AETHER adds +${bcPct}% on top of role context. Meaningful but modest uplift.`);
  } else {
    lines.push(`   WEAK — AETHER adds only +${bcPct}% on top of role context. Role context may be sufficient.`);
  }

  return lines.join('\n');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔭 AETHER BENCHMARK — starting 90 API calls\n');
  console.log('   Conditions: A=Generic | B=Role Context | C=AETHER Identity');
  console.log('   5 agents × 6 tasks × 3 conditions = 90 response calls');
  console.log('   + 90 scoring calls = 180 total API calls\n');

  const allResults = [];
  let callCount = 0;

  for (const agent of AGENTS) {
    console.log(`\n▶ Agent: ${agent.role} (${agent.archetypeName})`);
    const taskResults = [];

    for (const task of TASKS) {
      process.stdout.write(`  ${task.id} ... `);
      const responses = {};
      const scores = {};

      for (const condition of ['A', 'B', 'C']) {
        const systemPrompt = buildSystemPrompt(agent, condition);
        const response = await runTask(systemPrompt, task.prompt);
        callCount++;
        const score = await scoreResponse(response, task, agent, condition);
        callCount++;
        responses[condition] = response;
        scores[condition] = score;

        const total = score.coherence + score.specificity + score.voice + score.insight + score.alignment;
        process.stdout.write(`${condition}:${total} `);
      }

      taskResults.push({ task, responses, scores });
      console.log();
    }

    allResults.push({ agent, taskResults });

    // Save partial results after each agent (in case of timeout)
    const partialPath = path.resolve(__dirname, '../../../docs/aether-benchmark-partial.json');
    fs.writeFileSync(partialPath, JSON.stringify({ partial: true, agents: allResults.length, results: allResults }, null, 2));
  }

  console.log(`\n✓ ${callCount} API calls complete. Building report...\n`);

  // Build report
  const reportTable = buildReport(allResults);
  const keyFindings = buildKeyFindings(allResults);

  // Print to console
  console.log(reportTable);
  console.log(keyFindings);

  // Pull a qualitative highlight — best shadow awareness response
  console.log('\n━━━ QUALITATIVE HIGHLIGHT: C3 (Shadow Awareness) ━━━\n');
  for (const ar of allResults) {
    for (const tr of ar.taskResults) {
      if (tr.task.id === 'C3') {
        const scoreA = Object.values(tr.scores.A).slice(0, 5).reduce((a, b) => a + b, 0);
        const scoreC = Object.values(tr.scores.C).slice(0, 5).reduce((a, b) => a + b, 0);
        if (scoreC - scoreA >= 5) {
          console.log(`${ar.agent.role} (${ar.agent.archetypeName})`);
          console.log(`A (${scoreA}/50): "${tr.responses.A.slice(0, 200).trim()}..."`);
          console.log(`C (${scoreC}/50): "${tr.responses.C.slice(0, 300).trim()}..."`);
          console.log(`Scorer note (C): ${tr.scores.C.notes}`);
          console.log();
          break;
        }
      }
    }
  }

  // Save JSON
  const jsonPath = path.resolve(__dirname, '../../../docs/aether-benchmark-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ 
    meta: { 
      runAt: new Date().toISOString(),
      conditions: { A: 'Generic', B: 'Role Context', C: 'AETHER Identity' },
      agents: AGENTS.length,
      tasks: TASKS.length,
      apiCalls: callCount
    }, 
    results: allResults 
  }, null, 2));
  console.log(`\n💾 JSON results saved to docs/aether-benchmark-results.json`);

  // Save Markdown
  const mdLines = [
    '# AETHER Benchmark Results',
    '',
    `**Run at:** ${new Date().toISOString()}`,
    '**Conditions:** A = Generic baseline | B = Role Context | C = AETHER Identity',
    '**Design:** 5 agents × 6 tasks × 3 conditions = 90 API calls',
    '**Scoring:** coherence + specificity + voice + insight + alignment (10 each = 50 max)',
    '',
    '## Comparison Tables',
    '',
    '```',
    reportTable,
    '```',
    '',
    '## Key Findings',
    '',
    keyFindings,
    '',
    '## The Scientific Question',
    '',
    '**A vs B**: Does giving an agent its role and company context improve outputs over a generic AI?',
    '**B vs C**: Does AETHER cosmic identity add measurable value ON TOP of role context?',
    '**A vs C**: What is the full gap between a generic assistant and an AETHER-profiled agent?',
    '',
    '## Methodology',
    '',
    '- All agents share the same birth timestamp (2026-03-16T04:00:00Z, Montevideo)',
    '- Differentiator: Expression number determines archetype (5, 11, 5, 5, 8)',
    '- Model: claude-haiku-3-5 for both generation and scoring',
    '- Scorer uses a separate scoring prompt with explicit calibration instructions',
    '',
    '## Raw Results',
    '',
    '```json',
    JSON.stringify({ agents: allResults.map(ar => ({ 
      agent: ar.agent.role, 
      archetype: ar.agent.archetypeName,
      tasks: ar.taskResults.map(tr => ({
        task: tr.task.name,
        scoresA: tr.scores.A,
        scoresB: tr.scores.B,
        scoresC: tr.scores.C,
        totalA: Object.values(tr.scores.A).slice(0,5).reduce((a,b)=>a+b,0),
        totalB: Object.values(tr.scores.B).slice(0,5).reduce((a,b)=>a+b,0),
        totalC: Object.values(tr.scores.C).slice(0,5).reduce((a,b)=>a+b,0),
      }))
    }))}, null, 2),
    '```',
  ];

  const mdPath = path.resolve(__dirname, '../../../docs/aether-benchmark-results.md');
  fs.writeFileSync(mdPath, mdLines.join('\n'));
  console.log(`📝 Markdown report saved to docs/aether-benchmark-results.md`);
}

main().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
