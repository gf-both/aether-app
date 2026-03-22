/**
 * ai.js — Backend-proxied AI calls
 *
 * Priority:
 *  1. Supabase edge function (production)
 *  2. Direct Anthropic call (dev, when VITE_ANTHROPIC_API_KEY is set)
 *
 * Never ship a real key to users — the direct path is dev-only.
 */
import { supabase } from './supabase'

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

async function callViaEdgeFunction({ systemPrompt, messages, maxTokens }) {
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: { systemPrompt, messages, maxTokens },
  })
  if (error) throw error
  return data?.content || null
}

async function callDirectAnthropic({ systemPrompt, messages, maxTokens }) {
  const body = {
    model: 'claude-haiku-4-5',
    max_tokens: maxTokens,
    messages,
    ...(systemPrompt ? { system: systemPrompt } : {}),
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Anthropic ${res.status}`)
  }
  const data = await res.json()
  return data.content?.[0]?.text || null
}

export async function callAI({ systemPrompt, messages, maxTokens = 400 }) {
  try {
    if (HAS_SUPABASE) {
      return await callViaEdgeFunction({ systemPrompt, messages, maxTokens })
    } else if (ANTHROPIC_KEY) {
      return await callDirectAnthropic({ systemPrompt, messages, maxTokens })
    } else {
      console.error('[ai] No AI backend configured. Set VITE_SUPABASE_URL+VITE_SUPABASE_ANON_KEY or VITE_ANTHROPIC_API_KEY in .env.local')
      return null
    }
  } catch (e) {
    console.error('[ai] callAI failed:', e)
    return null
  }
}
