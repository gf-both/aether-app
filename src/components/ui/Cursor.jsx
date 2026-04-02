import { useEffect, useRef } from 'react'

export default function Cursor() {
  const c1Ref = useRef(null)
  const c2Ref = useRef(null)

  // Disable on touch devices
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
  if (isTouch) return null

  useEffect(() => {
    const c1 = c1Ref.current
    const c2 = c2Ref.current
    if (!c1 || !c2) return
    const handler = (e) => {
      c1.style.left = e.clientX + 'px'
      c1.style.top = e.clientY + 'px'
      setTimeout(() => {
        c2.style.left = e.clientX + 'px'
        c2.style.top = e.clientY + 'px'
      }, 65)
    }
    document.addEventListener('mousemove', handler)
    return () => document.removeEventListener('mousemove', handler)
  }, [])

  return (
    <>
      <div ref={c1Ref} style={{
        position: 'fixed', width: 5, height: 5, background: 'var(--foreground)', borderRadius: '50%',
        pointerEvents: 'none', zIndex: 9999, transform: 'translate(-50%,-50%)', mixBlendMode: 'screen'
      }} />
      <div ref={c2Ref} style={{
        position: 'fixed', width: 22, height: 22, border: '1px solid var(--ring)', borderRadius: '50%',
        pointerEvents: 'none', zIndex: 9998, transform: 'translate(-50%,-50%)', transition: 'all .1s ease'
      }} />
    </>
  )
}
