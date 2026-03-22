#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Bumble Profile Analyzer — assisted swiping via Claude Vision
// Screenshot → extract profile → score compatibility → log
// ─────────────────────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { createInterface } from "readline";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_PATH = resolve(__dirname, "..", "bumble-log.json");
const SCREENSHOT_PATH = "/tmp/bumble-shot.png";

// ── Load API key ────────────────────────────────────────────
function loadApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  const envPath = resolve(__dirname, "..", ".env");
  if (existsSync(envPath)) {
    const match = readFileSync(envPath, "utf-8").match(
      /^ANTHROPIC_API_KEY=(.+)$/m
    );
    if (match) return match[1].trim();
  }
  console.error("❌ ANTHROPIC_API_KEY not found in env or .env file");
  process.exit(1);
}

const client = new Anthropic({ apiKey: loadApiKey() });

// ── Gaston's profile (baseline) ─────────────────────────────
const GASTON = {
  sun: "Aquarius",
  moon: "Virgo",
  rising: "Virgo",
  hdType: "Manifesting Generator",
  hdProfile: "3/5",
  lifePath: 7,
  expression: 1,
  birthYear: 1981,
};

// ── Compatibility matrices ──────────────────────────────────

// Sun sign compatibility with Aquarius
const SUN_COMPAT = {
  Gemini: 0.9, Libra: 0.9, Aries: 0.9, Sagittarius: 0.9,
  Leo: 0.7, Aquarius: 0.7,
  Pisces: 0.5, Capricorn: 0.5,
  Taurus: 0.35, Scorpio: 0.35, Cancer: 0.35,
  Virgo: 0.45,
};

// Moon sign compatibility with Virgo moon
const MOON_COMPAT = {
  Taurus: 0.9, Capricorn: 0.9, Cancer: 0.9, Scorpio: 0.9,
  Virgo: 0.7, Pisces: 0.7,
  Gemini: 0.5, Sagittarius: 0.5,
  Aries: 0.35, Leo: 0.35, Aquarius: 0.35, Libra: 0.35,
};

// HD type compatibility with Manifesting Generator
const HD_COMPAT = {
  Projector: 0.9,
  Generator: 0.8,
  "Manifesting Generator": 0.7,
  Reflector: 0.75,
  Manifestor: 0.6,
};

// Life Path compatibility with LP 7
const LP_COMPAT = {
  1: 0.9, 5: 0.9, 7: 0.9,
  3: 0.75, 9: 0.75, 11: 0.75,
  2: 0.55, 6: 0.55, 8: 0.55,
  4: 0.35,
};

// Expression number compatibility with Expression 1
const EXPR_COMPAT = {
  3: 0.85, 5: 0.85, 7: 0.85,
  1: 0.75, 9: 0.75,
  2: 0.6, 6: 0.6,
  4: 0.5, 8: 0.5,
};

// ── ANSI helpers ────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  bgCyan: "\x1b[46m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgRed: "\x1b[41m",
};

// ── Screenshot capture ──────────────────────────────────────
function takeScreenshot() {
  try {
    execSync(
      `peekaboo image --app "Google Chrome" --mode frontmost --path ${SCREENSHOT_PATH}`,
      { stdio: "pipe" }
    );
    return true;
  } catch {
    // Fallback to full screen capture
    try {
      execSync(
        `peekaboo image --mode screen --screen-index 0 --path ${SCREENSHOT_PATH}`,
        { stdio: "pipe" }
      );
      return true;
    } catch (e) {
      console.error(`${C.red}Screenshot failed: ${e.message}${C.reset}`);
      return false;
    }
  }
}

// ── Vision extraction via Claude ────────────────────────────
async function extractProfile() {
  const imageData = readFileSync(SCREENSHOT_PATH).toString("base64");

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: imageData,
            },
          },
          {
            type: "text",
            text: `Analyze this Bumble dating profile screenshot. Extract the following as JSON (no markdown, just raw JSON):

{
  "name": "first name",
  "age": number or null,
  "bio": "their full bio text verbatim, or empty string",
  "sign": "zodiac sign name (e.g. Scorpio, Pisces, Aries) or null if truly absent",
  "sign_confidence": "certain if explicitly shown, likely if birthday mentioned, inferred if guessed from bio/personality, null if no info",
  "esoteric_info": {
    "moon_sign": "if mentioned or null",
    "rising_sign": "if mentioned or null",
    "hd_type": "Human Design type if mentioned or null",
    "life_path": number or null,
    "other": "any other esoteric/spiritual system mentioned"
  },
  "photo_count": number of photos visible,
  "vibe": "3-5 word vibe description",
  "interests": ["up to 5 specific interests from bio or visible badges"]
}

CRITICAL — HOW TO FIND THE ZODIAC SIGN ON BUMBLE:
Bumble displays the zodiac sign as a TEXT LABEL, not just an emoji. Look for:
1. A pill/badge/chip element showing one of these exact words: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces
2. It often appears near the name/age line or in a row of attribute badges (height, education, etc.)
3. It may also appear alongside other lifestyle badges like "Spiritual", "Graduate degree", etc.
4. Check the ENTIRE screenshot carefully — it can appear in badge rows, profile sections, or inline with other info
5. Also check bio text and any visible text overlays on photos
6. Zodiac emojis (♈♉♊♋♌♍♎♏♐♑♒♓) may appear next to the text label

Do NOT skip this — the sign label is almost always present on Bumble profiles. Scan every text element.

If this doesn't look like a Bumble profile, return: {"error": "not_a_profile"}
Return ONLY valid JSON, no explanation.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].text.trim();
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting JSON from response if wrapped in backticks
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`Failed to parse profile JSON: ${text.slice(0, 200)}`);
  }
}

// ── Compatibility scoring ───────────────────────────────────
function computeCompatibility(profile) {
  const breakdown = {};
  const unknownSign = 0.5;
  const unknownEso = 0.6;

  // Sun sign (15%)
  const sunScore = profile.sign ? (SUN_COMPAT[profile.sign] ?? unknownSign) : unknownSign;
  breakdown.sun = {
    score: Math.round(sunScore * 100),
    label: `${GASTON.sun}/${profile.sign || "?"}`,
    weight: 0.15,
  };

  // Moon sign (15%)
  const moonRaw = profile.esoteric_info?.moon_sign;
  const moonScore = moonRaw ? (MOON_COMPAT[moonRaw] ?? unknownSign) : unknownSign;
  breakdown.moon = {
    score: Math.round(moonScore * 100),
    label: `${GASTON.moon}/${moonRaw || "?"}`,
    weight: 0.15,
  };

  // HD type (25%)
  const hdRaw = profile.esoteric_info?.hd_type;
  const hdScore = hdRaw ? (HD_COMPAT[hdRaw] ?? unknownEso) : unknownEso;
  breakdown.hd = {
    score: Math.round(hdScore * 100),
    label: `MG/${hdRaw || "?"}`,
    weight: 0.25,
  };

  // Life Path (20%)
  const lpRaw = profile.esoteric_info?.life_path;
  const lpScore = lpRaw != null ? (LP_COMPAT[lpRaw] ?? unknownEso) : unknownEso;
  breakdown.lp = {
    score: Math.round(lpScore * 100),
    label: `${GASTON.lifePath}/${lpRaw ?? "?"}`,
    weight: 0.2,
  };

  // Expression (15%)
  const exprRaw = profile.esoteric_info?.expression;
  const exprScore = exprRaw != null ? (EXPR_COMPAT[exprRaw] ?? unknownEso) : unknownEso;
  breakdown.expr = {
    score: Math.round(exprScore * 100),
    label: `${GASTON.expression}/${exprRaw ?? "?"}`,
    weight: 0.15,
  };

  // Age sync (10%)
  let ageScore = 0.5;
  if (profile.age != null) {
    if (profile.age >= 28 && profile.age <= 42) ageScore = 0.9;
    else if ((profile.age >= 25 && profile.age <= 27) || (profile.age >= 43 && profile.age <= 48))
      ageScore = 0.7;
  }
  breakdown.age = {
    score: Math.round(ageScore * 100),
    label: `age ${profile.age ?? "?"}`,
    weight: 0.1,
  };

  // Weighted total
  const total = Math.round(
    sunScore * 15 + moonScore * 15 + hdScore * 25 + lpScore * 20 + exprScore * 15 + ageScore * 10
  );

  return { total, breakdown };
}

// ── Verdict label ───────────────────────────────────────────
function getVerdict(score) {
  if (score >= 75) return { label: "SWIPE RIGHT", icon: "✅", color: C.green };
  if (score >= 60) return { label: "LIKELY", icon: "⚡", color: C.yellow };
  if (score >= 45) return { label: "MAYBE", icon: "🤔", color: C.dim };
  return { label: "PASS", icon: "❌", color: C.red };
}

// ── Opener generation ───────────────────────────────────────
async function generateOpener(profile, compatBreakdown) {
  if (!profile.bio && !profile.vibe && !profile.sign) return null;

  // Build cosmic context for the opener
  const theirSign = profile.sign || null;
  const signContext = theirSign
    ? `Her sign is ${theirSign}. Gaston is Aquarius Sun, Virgo Moon — think about what that dynamic means between them.`
    : "";

  // Find the highest-scoring dimension to weave in naturally
  const topDimension = compatBreakdown?.details
    ? Object.entries(compatBreakdown.details)
        .filter(([k]) => ["sun", "moon"].includes(k) && compatBreakdown.details[k].score >= 70)
        .sort((a, b) => b[1].score - a[1].score)[0]
    : null;

  const cosmicHint = topDimension
    ? `Their ${topDimension[0] === "sun" ? "Sun signs" : "Moon signs"} have strong resonance — you can reference this subtly if it fits naturally.`
    : "";

  const prompt = `You are writing a Bumble opening message on behalf of Gaston (Aquarius, analytical but warm, into esoteric frameworks, builder mindset).

Her profile:
- Name: ${profile.name || "her"}
- Sign: ${theirSign || "unknown"}
- Bio: "${profile.bio || "(no bio)"}"
- Vibe: ${profile.vibe || "unknown"}
- Esoteric info she mentioned: ${profile.esoteric_info || "none"}

${signContext}
${cosmicHint}

Write ONE opening message. Rules:
- Max 1-2 sentences
- Casual and genuine, not a pickup line
- If she mentioned astrology/HD/spirituality in her bio, you can lightly reference it — Gaston knows this world well
- If she didn't, don't bring up astrology unsolicited — just respond to something real in her bio
- Reference something specific from her bio, not generic compliments
- Sound like a curious, smart guy who actually read her profile
- DO NOT be cheesy, DO NOT start with "Hey" alone
- Return ONLY the message text, no quotes`;

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });
    return response.content[0].text.trim();
  } catch {
    return null;
  }
}

// ── Display card ────────────────────────────────────────────
function displayCard(profile, compat, opener) {
  const verdict = getVerdict(compat.total);
  const W = 42; // inner width
  const pad = (s, w = W) => {
    // Strip ANSI for length calc
    const visible = s.replace(/\x1b\[[0-9;]*m/g, "");
    const need = w - visible.length;
    return need > 0 ? s + " ".repeat(need) : s;
  };
  const line = (s) => `║  ${pad(s, W - 4)}  ║`;
  const sep = `╠${"═".repeat(W)}╣`;

  const signConf = profile.sign_confidence
    ? ` (${profile.sign_confidence})`
    : "";
  const signLabel = profile.sign ? `♈ ${profile.sign}${signConf}` : "sign unknown";
  const header = `${C.bold}${profile.name || "???"}${C.reset}, ${profile.age ?? "?"} · ${signLabel}`;

  console.log(`\n╔${"═".repeat(W)}╗`);
  console.log(line(header));
  console.log(sep);

  // Bio
  if (profile.bio) {
    const bioLines = wrapText(`"${profile.bio}"`, W - 6);
    bioLines.forEach((l) => console.log(line(l)));
  }
  if (profile.vibe) {
    console.log(line(`${C.dim}Vibe: ${profile.vibe}${C.reset}`));
  }
  console.log(sep);

  // Score
  const scoreColor = verdict.color;
  console.log(
    line(
      `${C.bold}COMPATIBILITY: ${scoreColor}${compat.total}/100  ${verdict.icon} ${verdict.label}${C.reset}`
    )
  );

  // Bar
  const barLen = W - 6;
  const filled = Math.round((compat.total / 100) * barLen);
  const bar = `${scoreColor}${"█".repeat(filled)}${C.dim}${"░".repeat(barLen - filled)}${C.reset}`;
  console.log(line(bar));

  // Breakdown
  const DIM_LABELS = {
    sun: "Sun",
    moon: "Moon",
    hdType: "HD Type",
    lifePath: "Life Path",
    expression: "Expression",
    age: "Age"
  };
  const entries = Object.entries(compat.breakdown);
  for (const [key, val] of entries) {
    const icon = val.score >= 65 ? `${C.green}✓${C.reset}` : val.score >= 45 ? `${C.yellow}~${C.reset}` : `${C.red}✗${C.reset}`;
    const dimName = (DIM_LABELS[key] || key).padEnd(10);
    const scoreBar = `${val.score}`.padStart(3);
    console.log(line(`${icon} ${dimName} ${val.label.slice(0,18).padEnd(18)} ${scoreBar}`));
  }

  // Sign dynamic line if both signs known
  if (profile.sign) {
    const dynamicMap = {
      Aquarius: { Gemini: "Air trinity ✨", Libra: "Air trinity ✨", Aries: "Spark + vision 🔥", Sagittarius: "Freedom duo 🏹", Leo: "Opposites attract ⚡", Virgo: "Quirk meets precision 🌀", Scorpio: "Depth tension 🌊", Taurus: "Friction → growth 🌱" }
    };
    const dynamic = dynamicMap["Aquarius"]?.[profile.sign];
    if (dynamic) console.log(line(`${C.dim}♒ × ${profile.sign}: ${dynamic}${C.reset}`));
  }
  console.log(sep);

  // Opener
  if (opener) {
    const openerLines = wrapText(`💬 "${opener}"`, W - 6);
    openerLines.forEach((l) => console.log(line(l)));
    console.log(sep);
  }

  // Controls
  console.log(
    line(
      `${C.green}[Y]${C.reset} Right  ${C.red}[N]${C.reset} Left  ${C.cyan}[S]${C.reset} Skip  ${C.dim}[Q] Quit${C.reset}`
    )
  );
  console.log(`╚${"═".repeat(W)}╝\n`);
}

// ── Text wrapping helper ────────────────────────────────────
function wrapText(text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

// ── Single keypress reader ──────────────────────────────────
function waitForKey() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.once("data", (data) => {
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
      resolve(data.toString().toLowerCase());
    });
  });
}

// ── Logging ─────────────────────────────────────────────────
function logDecision(profile, compat, decision) {
  let log = [];
  if (existsSync(LOG_PATH)) {
    try {
      log = JSON.parse(readFileSync(LOG_PATH, "utf-8"));
    } catch {
      log = [];
    }
  }

  log.push({
    timestamp: new Date().toISOString(),
    name: profile.name || null,
    age: profile.age || null,
    sign: profile.sign || null,
    score: compat.total,
    breakdown: Object.fromEntries(
      Object.entries(compat.breakdown).map(([k, v]) => [k, v.score])
    ),
    decision,
    bio_snippet: profile.bio ? profile.bio.slice(0, 100) : null,
  });

  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
}

// ── Main loop ───────────────────────────────────────────────
async function main() {
  console.clear();
  console.log(
    `${C.bold}${C.magenta}╔══════════════════════════════════╗${C.reset}`
  );
  console.log(
    `${C.bold}${C.magenta}║   Bumble Assistant — Ready 💜    ║${C.reset}`
  );
  console.log(
    `${C.bold}${C.magenta}╚══════════════════════════════════╝${C.reset}`
  );
  console.log(`${C.dim}Press any key to capture & analyze...${C.reset}\n`);

  while (true) {
    // Wait for trigger keypress
    const trigger = await waitForKey();
    if (trigger === "q") {
      console.log(`\n${C.dim}👋 Bye!${C.reset}`);
      process.exit(0);
    }

    console.clear();
    console.log(`${C.cyan}📸 Capturing screenshot...${C.reset}`);

    // Step 1: Screenshot
    if (!takeScreenshot()) {
      console.log(
        `${C.red}Screenshot failed. Press any key to retry, Q to quit.${C.reset}`
      );
      continue;
    }

    // Step 2: Extract profile via vision
    console.log(`${C.cyan}🔍 Analyzing profile...${C.reset}`);
    let profile;
    try {
      profile = await extractProfile();
    } catch (e) {
      console.log(
        `${C.red}Analysis failed: ${e.message}${C.reset}`
      );
      console.log(`${C.dim}Press any key to retry...${C.reset}`);
      continue;
    }

    if (profile.error) {
      console.log(
        `${C.yellow}⚠ Not a Bumble profile detected. Press any key to retry...${C.reset}`
      );
      continue;
    }

    // Step 3: Compute compatibility
    const compat = computeCompatibility(profile);

    // Step 4: Generate opener if score >= 60
    let opener = null;
    if (compat.total >= 60) {
      console.log(`${C.cyan}💬 Generating opener...${C.reset}`);
      opener = await generateOpener(profile, compat);
    }

    // Step 5: Display card
    console.clear();
    displayCard(profile, compat, opener);

    // Step 6: Wait for decision
    let decision = null;
    while (!decision) {
      const key = await waitForKey();
      if (key === "y") decision = "right";
      else if (key === "n") decision = "left";
      else if (key === "s") decision = "skip";
      else if (key === "q") {
        console.log(`\n${C.dim}👋 Bye!${C.reset}`);
        process.exit(0);
      }
    }

    // Step 7: Log and continue
    logDecision(profile, compat, decision);
    const decisionLabel =
      decision === "right"
        ? `${C.green}→ RIGHT${C.reset}`
        : decision === "left"
          ? `${C.red}← LEFT${C.reset}`
          : `${C.dim}⊘ SKIP${C.reset}`;
    console.log(`\n${decisionLabel} — logged. Press any key for next...`);
  }
}

main().catch((e) => {
  console.error(`${C.red}Fatal: ${e.message}${C.reset}`);
  process.exit(1);
});
