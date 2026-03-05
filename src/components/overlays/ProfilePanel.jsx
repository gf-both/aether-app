import { useState, useRef } from 'react'
import { useAetherStore } from '../../store/useAetherStore'
import { REL_CONFIG } from '../../data/primaryProfile'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDOB(dob) {
  if (!dob) return '?'
  try {
    const d = new Date(dob + 'T12:00:00')
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  } catch { return dob }
}

export default function ProfilePanel({ open, onClose }) {
  const profile = useAetherStore((s) => s.primaryProfile)
  const setPrimaryProfile = useAetherStore((s) => s.setPrimaryProfile)
  const people = useAetherStore((s) => s.people)
  const addPerson = useAetherStore((s) => s.addPerson)
  const removePerson = useAetherStore((s) => s.removePerson)
  const setActivePanel = useAetherStore((s) => s.setActivePanel)

  const [showAddForm, setShowAddForm] = useState(false)
  const [saveFlash, setSaveFlash] = useState(false)

  // Form refs for primary profile
  const nameRef = useRef(null)
  const dobRef = useRef(null)
  const tobRef = useRef(null)
  const pobRef = useRef(null)

  // Add person form refs
  const npNameRef = useRef(null)
  const npRelRef = useRef(null)
  const npDobRef = useRef(null)
  const npTobRef = useRef(null)
  const npPobRef = useRef(null)
  const npNotesRef = useRef(null)

  function handleSavePrimary() {
    setPrimaryProfile({
      name: nameRef.current?.value || profile.name,
      dob: dobRef.current?.value || profile.dob,
      tob: tobRef.current?.value || profile.tob,
      pob: pobRef.current?.value || profile.pob,
    })
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 1800)
  }

  function handleAddPerson() {
    const name = npNameRef.current?.value?.trim()
    if (!name) return
    const rel = npRelRef.current?.value || 'other'
    const cfg = REL_CONFIG[rel] || REL_CONFIG.other
    addPerson({
      name,
      rel,
      dob: npDobRef.current?.value || '',
      tob: npTobRef.current?.value || '',
      pob: npPobRef.current?.value || '',
      notes: npNotesRef.current?.value || '',
      emoji: cfg.emoji,
      sign: '?',
    })
    // Clear form
    if (npNameRef.current) npNameRef.current.value = ''
    if (npDobRef.current) npDobRef.current.value = ''
    if (npTobRef.current) npTobRef.current.value = ''
    if (npPobRef.current) npPobRef.current.value = ''
    if (npNotesRef.current) npNotesRef.current.value = ''
    setShowAddForm(false)
  }

  return (
    <div className={`overlay${open ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="profile-panel">
        <div className="pp-header">
          <span className="pp-title">✦ Profiles &amp; Constellation</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="btn btn-aqua" onClick={() => { onClose(); setActivePanel('synastry') }}>⊕ Open Synastry</div>
            <div className="pp-close" onClick={onClose}>✕</div>
          </div>
        </div>
        <div className="pp-body">
          {/* PRIMARY PROFILE */}
          <div className="pp-section">
            <div className="pp-sec-title">Primary Profile — Self</div>
            <div className="pp-grid">
              <div className="pp-field">
                <div className="pp-label">Full Name</div>
                <input ref={nameRef} className="pp-input" placeholder="Your full name" defaultValue={profile.name} />
              </div>
              <div className="pp-field">
                <div className="pp-label">Date of Birth</div>
                <input ref={dobRef} className="pp-input" type="date" defaultValue={profile.dob} />
              </div>
              <div className="pp-field">
                <div className="pp-label">Time of Birth</div>
                <input ref={tobRef} className="pp-input" type="time" defaultValue={profile.tob} />
              </div>
              <div className="pp-field">
                <div className="pp-label">Place of Birth</div>
                <input ref={pobRef} className="pp-input" placeholder="City, Country" defaultValue={profile.pob} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <div
                className="btn btn-primary"
                onClick={handleSavePrimary}
                style={saveFlash ? { background: 'rgba(96,176,48,.2)', borderColor: 'rgba(96,176,48,.5)', color: 'var(--lime2)' } : {}}
              >
                {saveFlash ? '✓ Saved' : 'Save Primary Profile'}
              </div>
            </div>
          </div>

          {/* CONSTELLATION */}
          <div className="pp-section">
            <div className="pp-sec-title">Family &amp; Relationship Constellation</div>
            <div className="person-cards">
              {people.map((p) => {
                const cfg = REL_CONFIG[p.rel] || REL_CONFIG.other
                return (
                  <div key={p.id} className="person-card">
                    <div className="pc-del" onClick={() => removePerson(p.id)}>✕</div>
                    <div className="pc-avatar" style={{ background: cfg.col + '0.12)', borderColor: cfg.col + '0.3)' }}>{cfg.emoji}</div>
                    <div className="pc-name">{p.name}</div>
                    <div className="pc-rel">{cfg.label}</div>
                    <div className="pc-dob">{formatDOB(p.dob)}{p.tob ? ' · ' + p.tob : ''}</div>
                    <div className="pc-loc">{p.pob || 'Location unknown'}</div>
                  </div>
                )
              })}
              <div className="person-card empty" onClick={() => {
                setShowAddForm(true)
                setTimeout(() => npNameRef.current?.focus(), 100)
              }}>
                <div className="add-plus">+</div>
                <div className="add-label">Add Person</div>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <div className="btn btn-ghost" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? '− Cancel' : '+ Add Person'}
              </div>
            </div>

            <div className={`add-person-form${showAddForm ? ' open' : ''}`}>
              <div className="pp-sec-title" style={{ marginTop: 0 }}>New Person</div>
              <div className="pp-row">
                <div className="pp-field">
                  <div className="pp-label">Full Name</div>
                  <input ref={npNameRef} className="pp-input" placeholder="Full name" />
                </div>
                <div className="pp-field">
                  <div className="pp-label">Relationship</div>
                  <select ref={npRelRef} className="pp-input">
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="partner">Romantic Partner</option>
                    <option value="spouse">Spouse</option>
                    <option value="sibling">Sibling</option>
                    <option value="child">Child</option>
                    <option value="friend">Close Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="pp-field">
                  <div className="pp-label">Date of Birth</div>
                  <input ref={npDobRef} className="pp-input" type="date" />
                </div>
              </div>
              <div className="pp-row">
                <div className="pp-field">
                  <div className="pp-label">Time of Birth</div>
                  <input ref={npTobRef} className="pp-input" type="time" placeholder="Optional" />
                </div>
                <div className="pp-field">
                  <div className="pp-label">Place of Birth</div>
                  <input ref={npPobRef} className="pp-input" placeholder="City, Country" />
                </div>
                <div className="pp-field">
                  <div className="pp-label">Notes</div>
                  <input ref={npNotesRef} className="pp-input" placeholder="Optional notes" />
                </div>
              </div>
              <div className="pp-actions">
                <div className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Cancel</div>
                <div className="btn btn-primary" onClick={handleAddPerson}>Add to Constellation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
