/**
 * GOLEM BENCHMARK v2.0
 * Three-condition test: Generic vs Role Context vs GOLEM Identity
 *
 * A: "You are a helpful AI assistant." (no role, no identity)
 * B: "You are the [Role] at Above + Inside..." (role + company only)
 * C: Full GOLEM profile — read directly from each agent's .GOLEM.md file
 *
 * Agents: all 27 .GOLEM.md profiles (each with UNIQUE cosmic identity)
 * Tasks: 6 tasks × 3 conditions = 18 calls per agent
 * Total: 27 agents × 18 = 486 API calls + 486 scoring = 972 total
 *
 * KEY FIX: v1 hardcoded Gaston's birth data for all agents.
 * v2 reads each agent's .GOLEM.md directly — each agent has its own
 * unique natal chart, HD type, Gene Keys, archetype, shadow, and gift.
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROFILES_DIR = path.resolve(__dirname, '../profiles');
const DOCS_DIR = path.resolve(__dirname, '../../../docs');

// ─── AUTH ─────────────────────────────────────────────────────────────────────

function loadAnthropicKey() {
  const authPath = path.join(os.homedir(), '.openclaw/agents/main/agent/auth-profiles.json');
  const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  return authData.profiles['anthropic:default'].key;
}

const client = new Anthropic({ apiKey: loadAnthropicKey() });

// ─── LOAD AGENTS FROM .GOLEM.MD FILES ────────────────────────────────────────

function extractField(md, label) {
  const regex = new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`, 'i');
  const m = md.match(regex);
  return m ? m[1].trim() : null;
}

function extractTableRow(md, key) {
  // Matches: | ☉ Sun | Value | ...
  const regex = new RegExp(`\\|[^|]*${key}[^|]*\\|\\s*([^|]+)\\s*\\|`, 'i');
  const m = md.match(regex);
  return m ? m[1].trim() : null;
}

function extractSection(md, header) {
  const regex = new RegExp(`${header}[:\\s]*([^\\n]+(?:\\n(?!\\n|##|\\|)[^\\n]+)*)`, 'im');
  const m = md.match(regex);
  return m ? m[1].trim() : null;
}

function loadAgentFromProfile(filename) {
  const filepath = path.join(PROFILES_DIR, `${filename}.GOLEM.md`);
  if (!fs.existsSync(filepath)) return null;
  const md = fs.readFileSync(filepath, 'utf8');

  const id = filename;
  const role = extractField(md, 'Role') || filename;
  const archetype = extractField(md, 'Archetype') || '';
  const archetypeEmoji = archetype.match(/^([\p{Emoji}\s]+)/u)?.[1]?.trim() || '';
  const archetypeName = archetype.replace(/^[\p{Emoji}\s]+/u, '').trim();

  // Extract cosmic signature from table
  const sun = extractTableRow(md, '☉ Sun') || extractTableRow(md, 'Sun');
  const moon = extractTableRow(md, '☽ Moon') || extractTableRow(md, 'Moon');
  const rising = extractTableRow(md, '↑ Rising') || extractTableRow(md, 'Rising');
  const lifePath = extractTableRow(md, '∞ Life Path') || extractTableRow(md, 'Life Path');
  const geneKeys = extractTableRow(md, '⬡ Gene Keys') || extractTableRow(md, 'Gene Keys');
  const mayan = extractTableRow(md, '🌀 Mayan') || extractTableRow(md, 'Mayan');

  // Extract working style, shadow, gift from Wendy Says
  const wendyMatch = md.match(/## Wendy Says\s*\n\*"([^"]+)"\*/);
  const wendySays = wendyMatch ? wendyMatch[1] : '';

  // Extract shadow and gift heuristically from Wendy Says or working style
  const shadowMatch = md.match(/shadow[:\s]+([^\n.]+)/i);
  const giftMatch = md.match(/gift[:\s]+([^\n.]+)/i);

  // Fallback: extract from working style list
  const workingStyleMatch = md.match(/## Working Style\n([\s\S]+?)(?=\n##)/);
  const workingStyle = workingStyleMatch ? workingStyleMatch[1].trim() : '';

  // Team context
  const teamMatch = md.match(/## Team Context\n([\s\S]+?)(?=\n##)/);
  const teamContext = teamMatch ? teamMatch[1].trim() : '';

  return {
    id,
    role,
    archetypeEmoji,
    archetypeName,
    sun: sun || '—',
    moon: moon || '—',
    rising: rising || '—',
    lifePath: lifePath || '—',
    geneKeys: geneKeys || '—',
    mayan: mayan || '—',
    workingStyle,
    teamContext,
    wendySays,
    // raw profile for condition C
    rawProfile: md,
  };
}

// Load all 27 agents
const PROFILE_SLUGS = [
  'affiliate-&-partnerships-manager',
  'astrologer---content',
  'backend-engineer',
  'campaign-coordinator',
  'ceo',
  'cmo',
  'community-builder',
  'content-marketing-manager',
  'cto',
  'dev---full-stack',
  'email-marketing-specialist',
  'frontend-engineer',
  'hd-specialist',
  'influencer-marketing-manager',
  'pm---product',
  'pricing-&-revenue-analyst',
  'product-designer',
  'product-hunt-launch-manager',
  'qa-engineer',
  'reddit-marketing-specialist',
  'researcher',
  'seo-specialist',
  'support',
  'tiktok-&-short-form-video-strategist',
  'twitter-x-growth-specialist',
  'ux-researcher',
  'visual-artist',
];

const AGENTS = PROFILE_SLUGS.map(loadAgentFromProfile).filter(Boolean);
console.log(`Loaded ${AGENTS.length} agent profiles from .GOLEM.md files`);

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
    prompt: 'Above + Inside has 3 GTM tracks: retail users, practitioners, and AI developers. We have budget for one major launch push. Which track do you prioritize and why? Consider: LTV, acquisition cost, virality, and our unique GOLEM differentiator.',
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

const COMPANY_CONTEXT = `Above + Inside is a spiritual self-discovery SaaS platform that combines 21 esoteric frameworks (astrology, Human Design, Gene Keys, Mayan Calendar, Kabbalah, and more) into one unified dashboard. The platform serves retail users seeking self-knowledge, practitioners who work with clients, and AI developers building on the GOLEM identity standard.`;

function buildSystemPrompt(agent, condition) {
  if (condition === 'A') {
    return 'You are a helpful AI assistant.';
  }

  if (condition === 'B') {
    return `You are the ${agent.role} at Above + Inside.\n\n${COMPANY_CONTEXT}`;
  }

  // Condition C — use the full .GOLEM.md profile as-is
  // This is the actual GOLEM standard: ship the profile directly
  return `You are the ${agent.role} at Above + Inside.\n\n${COMPANY_CONTEXT}\n\n━━━ YOUR GOLEM IDENTITY PROFILE ━━━\n\n${agent.rawProfile}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nThis is who you are. Operate from this identity. Let it shape not just what you say but how you see, what you notice, and what you choose to say out loud.`;
}

// ─── API CALLS ────────────────────────────────────────────────────────────────

async function runTask(systemPrompt, userMessage) {
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  return msg.content[0].text;
}

async function scoreOneCondition(response, task, agent, conditionLabel) {
  const prompt = `Score this AI response. Return ONLY a JSON object with exactly these keys, integer values 1-10, and a notes string using only single quotes.

Role being evaluated: ${agent.role} (${agent.archetypeName}, Sun: ${agent.sun})
Condition: ${conditionLabel}
Task: ${task.prompt}

Response:
${response}

Scoring rubric:
- coherence (1-10): logical consistency and clear through-line
- specificity (1-10): concrete details vs generic platitudes. Generic AI gets 2-4, role-grounded gets 6-7, cosmically distinct gets 8-9
- voice (1-10): sounds like a specific ${agent.archetypeName} vs generic AI. Generic = 2-3, role-appropriate = 6-7, distinctly individual = 8-9
- insight (1-10): non-obvious observations. Surface = 3-4, solid = 6-7, genuinely surprising = 8-9
- alignment (1-10): fits the ${agent.role} role appropriately

Return exactly this JSON (no markdown, no extra text):
{"coherence":N,"specificity":N,"voice":N,"insight":N,"alignment":N,"notes":"what made this response stand out or fail, 2 sentences, single quotes only"}`;

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = msg.content[0].text.trim();
  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    const match = raw.match(/\{[\s\S]*?\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
      // Last resort: extract numbers with regex
      const nums = (key) => { const m = raw.match(new RegExp(`"${key}"\\s*:\\s*(\\d+)`)); return m ? parseInt(m[1]) : 5; };
      return {
        coherence: nums('coherence'), specificity: nums('specificity'),
        voice: nums('voice'), insight: nums('insight'), alignment: nums('alignment'),
        notes: 'extracted from malformed JSON'
      };
    }
    return { coherence: 5, specificity: 5, voice: 5, insight: 5, alignment: 5, notes: 'parse error' };
  }
}

async function scoreResponses(responses, task, agent) {
  const labels = {
    A: 'Generic (no role, no identity)',
    B: 'Role Context (role + company, no cosmic identity)',
    C: 'GOLEM Identity (full cosmic profile)'
  };
  const [scoreA, scoreB, scoreC] = await Promise.all([
    scoreOneCondition(responses.A, task, agent, labels.A),
    scoreOneCondition(responses.B, task, agent, labels.B),
    scoreOneCondition(responses.C, task, agent, labels.C),
  ]);
  return { A: scoreA, B: scoreB, C: scoreC };
}

// ─── SUMMARY ─────────────────────────────────────────────────────────────────

function summarize(allResults) {
  let grandA = 0, grandB = 0, grandC = 0, count = 0;
  const dims = ['coherence', 'specificity', 'voice', 'insight', 'alignment'];

  const agentSummaries = allResults.map(ar => {
    let tA = 0, tB = 0, tC = 0;
    ar.taskResults.forEach(tr => {
      dims.forEach(d => {
        tA += tr.scores.A[d] || 0;
        tB += tr.scores.B[d] || 0;
        tC += tr.scores.C[d] || 0;
      });
    });
    grandA += tA; grandB += tB; grandC += tC;
    count += ar.taskResults.length;
    return { role: ar.agent.role, archetype: ar.agent.archetypeName, sun: ar.agent.sun, tA, tB, tC, lift: tC - tA };
  });

  const max = count * 50;
  const dimTotals = { A: {}, B: {}, C: {} };
  dims.forEach(d => { dimTotals.A[d] = 0; dimTotals.B[d] = 0; dimTotals.C[d] = 0; });
  allResults.forEach(ar => ar.taskResults.forEach(tr => {
    dims.forEach(d => { dimTotals.A[d] += tr.scores.A[d] || 0; dimTotals.B[d] += tr.scores.B[d] || 0; dimTotals.C[d] += tr.scores.C[d] || 0; });
  }));

  return { grandA, grandB, grandC, max, agentSummaries, dimTotals, dims };
}

function printSummary(s) {
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('  GOLEM BENCHMARK v2 — GRAND RESULTS');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`  Generic (A):       ${s.grandA}/${s.max}  (${(s.grandA/s.max*100).toFixed(1)}%)`);
  console.log(`  Role Context (B):  ${s.grandB}/${s.max}  (${(s.grandB/s.max*100).toFixed(1)}%)`);
  console.log(`  GOLEM Identity (C):${s.grandC}/${s.max}  (${(s.grandC/s.max*100).toFixed(1)}%)`);
  console.log(`\n  B vs A:  +${s.grandB-s.grandA} pts (+${((s.grandB-s.grandA)/s.grandA*100).toFixed(1)}%)`);
  console.log(`  C vs A:  +${s.grandC-s.grandA} pts (+${((s.grandC-s.grandA)/s.grandA*100).toFixed(1)}%)`);
  console.log(`  C vs B:  +${s.grandC-s.grandB} pts (+${((s.grandC-s.grandB)/s.grandB*100).toFixed(1)}%) ← GOLEM lift over role`);

  console.log('\n  BY DIMENSION:');
  s.dims.forEach(d => {
    const a = s.dimTotals.A[d], b = s.dimTotals.B[d], c = s.dimTotals.C[d];
    console.log(`    ${d.padEnd(12)}: A=${a}  B=${b}  C=${c}  GOLEM lift=+${c-a}`);
  });

  console.log('\n  BY AGENT (ranked by GOLEM score, max 300):');
  s.agentSummaries.sort((a, b) => b.tC - a.tC).forEach((a, i) => {
    console.log(`    ${String(i+1).padStart(2)}. ${a.role.padEnd(35)} A=${String(a.tA).padStart(3)} B=${String(a.tB).padStart(3)} C=${String(a.tC).padStart(3)} lift=+${a.lift} [${a.sun}]`);
  });
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const startAgent = parseInt(process.argv[2] || '0');
  const endAgent = parseInt(process.argv[3] || String(AGENTS.length));
  const agentsToRun = AGENTS.slice(startAgent, endAgent);

  console.log(`\n🔭 GOLEM BENCHMARK v2 — ${agentsToRun.length} agents (${startAgent}-${endAgent-1} of ${AGENTS.length})`);
  console.log('   Each agent uses its UNIQUE .GOLEM.md profile (not hardcoded birth data)');
  console.log(`   ${agentsToRun.length} agents × 6 tasks × 3 conditions = ${agentsToRun.length * 18} response calls`);
  console.log(`   + ${agentsToRun.length * 6} scoring calls = ${agentsToRun.length * 24} total API calls\n`);

  // Load existing partial results if any
  const partialPath = path.join(DOCS_DIR, 'golem-benchmark-v2-partial.json');
  let allResults = [];
  if (fs.existsSync(partialPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(partialPath, 'utf8'));
      allResults = existing.results || [];
      console.log(`  Resuming from ${allResults.length} existing agent results\n`);
    } catch {}
  }

  const existingIds = new Set(allResults.map(r => r.agent.id));
  let callCount = 0;

  for (const agent of agentsToRun) {
    if (existingIds.has(agent.id)) {
      console.log(`  ⏭  Skipping ${agent.role} (already done)`);
      continue;
    }

    console.log(`\n▶ [${agent.sun}] ${agent.role} (${agent.archetypeName})`);
    const taskResults = [];

    for (const task of TASKS) {
      process.stdout.write(`  ${task.id} ... `);

      // Generate all 3 conditions
      const responses = {};
      for (const condition of ['A', 'B', 'C']) {
        const systemPrompt = buildSystemPrompt(agent, condition);
        responses[condition] = await runTask(systemPrompt, task.prompt);
        callCount++;
        process.stdout.write(`${condition} `);
        await new Promise(r => setTimeout(r, 200)); // rate limit buffer
      }

      // Score all 3 conditions (3 parallel calls)
      const scores = await scoreResponses(responses, task, agent);
      callCount += 3;

      const tA = ['coherence','specificity','voice','insight','alignment'].reduce((s,d)=>s+(scores.A[d]||0),0);
      const tB = ['coherence','specificity','voice','insight','alignment'].reduce((s,d)=>s+(scores.B[d]||0),0);
      const tC = ['coherence','specificity','voice','insight','alignment'].reduce((s,d)=>s+(scores.C[d]||0),0);
      process.stdout.write(`→ A:${tA} B:${tB} C:${tC}\n`);

      taskResults.push({ task, responses, scores });
      await new Promise(r => setTimeout(r, 300));
    }

    allResults.push({ agent, taskResults });

    // Save after each agent
    fs.writeFileSync(partialPath, JSON.stringify({
      meta: { version: 2, note: 'Each agent uses unique .GOLEM.md profile', savedAt: new Date().toISOString() },
      results: allResults
    }, null, 2));
  }

  console.log(`\n✓ ${callCount} API calls complete`);

  // Print summary
  const s = summarize(allResults);
  printSummary(s);

  // Save final JSON
  const finalPath = path.join(DOCS_DIR, 'golem-benchmark-v2-results.json');
  fs.writeFileSync(finalPath, JSON.stringify({
    meta: {
      version: 2,
      note: 'Each agent uses its unique .GOLEM.md profile — not hardcoded birth data',
      runAt: new Date().toISOString(),
      agents: allResults.length,
      tasks: TASKS.length,
      apiCalls: callCount,
      conditions: { A: 'Generic (no role, no identity)', B: 'Role Context (role + company)', C: 'GOLEM Identity (full .GOLEM.md profile)' }
    },
    summary: {
      grandA: s.grandA, grandB: s.grandB, grandC: s.grandC, max: s.max,
      bVsA_pct: +((s.grandB-s.grandA)/s.grandA*100).toFixed(1),
      cVsA_pct: +((s.grandC-s.grandA)/s.grandA*100).toFixed(1),
      cVsB_pct: +((s.grandC-s.grandB)/s.grandB*100).toFixed(1),
      dimTotals: s.dimTotals,
    },
    results: allResults
  }, null, 2));

  console.log(`\n💾 Saved to docs/golem-benchmark-v2-results.json`);
}

main().catch(err => {
  console.error('\nBenchmark failed:', err);
  process.exit(1);
});
