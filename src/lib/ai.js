/**
 * ai.js — AI call router
 *
 * Priority order:
 *  1. Ollama (local, free) — default when running locally
 *  2. Supabase edge function (production)
 *  3. Direct Anthropic (dev fallback)
 *
 * Use `provider: 'anthropic'` to force Claude for high-stakes calls.
 * Use `provider: 'ollama'` to force local.
 */
import { supabase } from './supabase'

const OLLAMA_URL = 'http://localhost:11434'
const OLLAMA_MODEL = 'qwen2.5:14b'

const HAS_SUPABASE =
  import.meta.env.VITE_SUPABASE_URL &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project')

const ANTHROPIC_KEY =
  import.meta.env.VITE_ANTHROPIC_API_KEY &&
  !import.meta.env.VITE_ANTHROPIC_API_KEY.includes('REPLACE') &&
  !import.meta.env.VITE_ANTHROPIC_API_KEY.includes('placeholder')
    ? import.meta.env.VITE_ANTHROPIC_API_KEY
    : null

// ── Ollama ──
async function callOllama({ systemPrompt, messages, maxTokens }) {
  const ollamaMessages = []
  if (systemPrompt) ollamaMessages.push({ role: 'system', content: systemPrompt })
  ollamaMessages.push(...messages)

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: ollamaMessages,
      stream: false,
      options: { num_predict: maxTokens },
    }),
  })
  if (!res.ok) throw new Error(`Ollama ${res.status}`)
  const data = await res.json()
  return data.message?.content || null
}

async function ollamaAvailable() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(1500) })
    return res.ok
  } catch { return false }
}

// ── Supabase edge function ──
async function callViaEdgeFunction({ systemPrompt, messages, maxTokens }) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Edge function timeout')), 10000)
  )
  const invoke = supabase.functions.invoke('ai-chat', {
    body: { systemPrompt, messages, maxTokens },
  })
  const { data, error } = await Promise.race([invoke, timeout])
  if (error) throw error
  return data?.content || null
}

// ── Direct Anthropic ──
async function callDirectAnthropic({ systemPrompt, messages, maxTokens }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal: AbortSignal.timeout(12000),
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: maxTokens,
      messages,
      ...(systemPrompt ? { system: systemPrompt } : {}),
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Anthropic ${res.status}`)
  }
  const data = await res.json()
  return data.content?.[0]?.text || null
}

/**
 * callAI({ systemPrompt, messages, maxTokens, provider })
 *
 * provider: 'auto' (default) | 'ollama' | 'anthropic'
 *   'auto'      → Ollama first (local), then Supabase, then direct Anthropic
 *   'ollama'    → Force local Ollama
 *   'anthropic' → Force Claude (Supabase in prod, direct key in dev)
 */
export async function callAI({ systemPrompt, messages, maxTokens = 400, provider = 'auto' }) {
  try {
    if (provider === 'ollama') {
      return await callOllama({ systemPrompt, messages, maxTokens })
    }

    if (provider === 'anthropic') {
      if (HAS_SUPABASE) return await callViaEdgeFunction({ systemPrompt, messages, maxTokens })
      if (ANTHROPIC_KEY) return await callDirectAnthropic({ systemPrompt, messages, maxTokens })
      throw new Error('No Anthropic backend configured')
    }

    // auto: Ollama → Supabase → direct Anthropic
    if (await ollamaAvailable()) {
      const result = await callOllama({ systemPrompt, messages, maxTokens })
      if (result) return result
      console.warn('[ai] Ollama returned empty, falling back')
    }

    if (HAS_SUPABASE) return await callViaEdgeFunction({ systemPrompt, messages, maxTokens })
    if (ANTHROPIC_KEY) return await callDirectAnthropic({ systemPrompt, messages, maxTokens })

    console.error('[ai] No AI backend available')
    return null
  } catch (e) {
    console.error('[ai] callAI failed:', e)
    // If Ollama failed, try Anthropic as fallback
    if (provider === 'auto' && e.message?.includes('Ollama')) {
      try {
        if (HAS_SUPABASE) return await callViaEdgeFunction({ systemPrompt, messages, maxTokens })
        if (ANTHROPIC_KEY) return await callDirectAnthropic({ systemPrompt, messages, maxTokens })
      } catch {}
    }
    return null
  }
}
