/**
 * ai.js — Backend-proxied AI calls
 * Never call AI providers directly from the browser in production.
 */
import { supabase } from './supabase'

export async function callAI({ systemPrompt, messages, maxTokens = 400 }) {
  try {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { systemPrompt, messages, maxTokens }
    })
    if (error) throw error
    return data?.content || null
  } catch (e) {
    console.error('AI call failed:', e)
    return null
  }
}
