import { useState, useEffect } from 'react'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatTime() {
  const n = new Date()
  const p = (v) => String(v).padStart(2, '0')
  return `${MONTHS[n.getMonth()]} ${n.getDate()} ${n.getFullYear()} · ${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`
}

export function useClock() {
  const [time, setTime] = useState(formatTime)

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 1000)
    return () => clearInterval(id)
  }, [])

  return time
}
