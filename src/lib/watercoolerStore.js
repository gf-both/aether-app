/**
 * watercoolerStore.js — localStorage persistence for watercooler threads
 */

const STORAGE_KEY = 'watercooler_threads'
const MAX_THREADS = 200

export function loadThreads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveThreads(threads) {
  const trimmed = threads.slice(0, MAX_THREADS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  return trimmed
}

export function addThreads(newThreads) {
  const existing = loadThreads()
  const merged = [...newThreads, ...existing]
  return saveThreads(merged)
}

export function clearThreads() {
  localStorage.removeItem(STORAGE_KEY)
  return []
}
