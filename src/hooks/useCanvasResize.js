import { useEffect } from 'react'

export function useCanvasResize(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width === 0 || height === 0) return
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      const ctx = canvas.getContext('2d')
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [canvasRef])
}
