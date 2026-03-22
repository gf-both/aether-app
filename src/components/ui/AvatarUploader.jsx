import { useState, useRef } from 'react'
import { generatePhotoAvatar } from '../../lib/avatarEngine'

export default function AvatarUploader({ profile, onComplete }) {
  const [photos, setPhotos] = useState([])
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const inputRef = useRef(null)

  function handleFiles(files) {
    const arr = Array.from(files).slice(0, 3 - photos.length)
    arr.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        setPhotos(prev => prev.length < 3 ? [...prev, e.target.result] : prev)
      }
      reader.readAsDataURL(file)
    })
  }

  function handleDrop(e) {
    e.preventDefault()
    if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files)
  }

  function removePhoto(idx) {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
    setResult(null)
  }

  async function handleGenerate() {
    if (!photos.length || generating) return
    setGenerating(true)
    const res = await generatePhotoAvatar(photos, profile)
    setResult(res)
    setGenerating(false)
    if (res?.url) onComplete?.(res)
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>
        Photo Avatar
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        style={{
          padding: 20, borderRadius: 10, textAlign: 'center', cursor: 'pointer',
          border: '2px dashed rgba(201,168,76,.25)', background: 'rgba(201,168,76,.03)',
          marginBottom: 12,
        }}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple hidden
          onChange={e => handleFiles(e.target.files)} />
        <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>
          {photos.length < 3 ? `Drop photos here or click (${photos.length}/3)` : 'Max 3 photos reached'}
        </div>
      </div>

      {/* Preview grid */}
      {photos.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {photos.map((src, i) => (
            <div key={i} style={{ position: 'relative', width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div onClick={() => removePhoto(i)} style={{
                position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%',
                background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</div>
            </div>
          ))}
        </div>
      )}

      {/* Generate button */}
      {photos.length > 0 && !result && (
        <button onClick={handleGenerate} disabled={generating} style={{
          width: '100%', padding: '8px 16px', borderRadius: 8, cursor: generating ? 'wait' : 'pointer',
          background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.3)',
          color: 'var(--gold)', fontSize: 11, fontFamily: "'Cinzel',serif", letterSpacing: '.08em',
          opacity: generating ? 0.6 : 1,
        }}>
          {generating ? 'Processing...' : 'Create Photo Avatar'}
        </button>
      )}

      {/* Result */}
      {result?.url && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <img src={result.url} alt="avatar" style={{ width: 96, height: 96, borderRadius: '50%', border: '2px solid rgba(201,168,76,.3)' }} />
          <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 6 }}>Photo avatar saved</div>
        </div>
      )}
    </div>
  )
}
