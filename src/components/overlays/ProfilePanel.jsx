import { useState, useRef } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'
import { REL_CONFIG } from '../../data/primaryProfile'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDOB(dob) {
  if (!dob) return '?'
  try {
    const d = new Date(dob + 'T12:00:00')
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  } catch { return dob }
}

export default function ProfilePanel({ open, onClose, embedded }) {
  const profile = useAboveInsideStore((s) => s.primaryProfile)
  const setPrimaryProfile = useAboveInsideStore((s) => s.setPrimaryProfile)
  const people = useAboveInsideStore((s) => s.people)
  const addPerson = useAboveInsideStore((s) => s.addPerson)
  const removePerson = useAboveInsideStore((s) => s.removePerson)
  const setActivePanel = useAboveInsideStore((s) => s.setActivePanel)
  const setActiveDetail = useAboveInsideStore((s) => s.setActiveDetail)
  const setActiveNav = useAboveInsideStore((s) => s.setActiveNav)

  const user = useAboveInsideStore((s) => s.user)
  const loadProfilesFromDB = useAboveInsideStore((s) => s.loadProfilesFromDB)
  const updatePerson = useAboveInsideStore((s) => s.updatePerson)
  const enneagramInstinct = useAboveInsideStore((s) => s.enneagramInstinct)
  const setEnneagramInstinct = useAboveInsideStore((s) => s.setEnneagramInstinct)
  // Read enneagram/mbti from primaryProfile (per-profile storage)
  const mbtiType = profile?.mbtiType || null
  const enneagramType = profile?.enneagramType || null
  const enneagramWing = profile?.enneagramWing || null

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saveFlash, setSaveFlash] = useState(false)

  // Form refs for primary profile
  const nameRef = useRef(null)
  const dobRef = useRef(null)
  const tobRef = useRef(null)
  const pobRef = useRef(null)
  const genderRef = useRef(null)
  const mbtiRef = useRef(null)
  const enneagramRef = useRef(null)
  const enneagramWingRef = useRef(null)
  const enneagramInstinctRef = useRef(null)
  const doshaRef = useRef(null)
  const archetypeRef = useRef(null)
  const loveLanguageRef = useRef(null)

  // Add person form refs
  const npNameRef = useRef(null)
  const npRelRef = useRef(null)
  const npDobRef = useRef(null)
  const npTobRef = useRef(null)
  const npPobRef = useRef(null)
  const npNotesRef = useRef(null)
  const npGenderRef = useRef(null)

  function handleResetProfile() {
    // Clear all localStorage and reload with defaults
    localStorage.removeItem('above-inside-store')
    window.location.reload()
  }

  async function handleSavePrimary() {
    const updates = {
      name: nameRef.current?.value || profile.name,
      dob: dobRef.current?.value || profile.dob,
      tob: tobRef.current?.value || profile.tob,
      pob: pobRef.current?.value || profile.pob,
      gender: genderRef.current?.value || '',
    }
    setPrimaryProfile(updates)

    if (user) {
      const { upsertBirthProfile } = await import('../../lib/db')
      await upsertBirthProfile(user.id, updates, true)
      await loadProfilesFromDB(user.id)
    }

    // Save MBTI and Enneagram types to profile
    const mbtiVal = mbtiRef.current?.value || ''
    const ennVal = enneagramRef.current?.value || ''
    const ennWingVal = enneagramWingRef.current?.value || ''
    const ennInstVal = enneagramInstinctRef.current?.value || ''
    setPrimaryProfile({
      mbtiType: mbtiVal || null,
      enneagramType: ennVal ? parseInt(ennVal, 10) : null,
      enneagramWing: ennWingVal ? parseInt(ennWingVal, 10) : null,
      doshaType: doshaRef.current?.value || null,
      archetypeType: archetypeRef.current?.value || null,
      loveLanguage: loveLanguageRef.current?.value || null,
    })
    setEnneagramInstinct(ennInstVal || null)
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 1800)
  }

  function handleAddPerson() {
    const name = npNameRef.current?.value?.trim()
    if (!name) return
    const rel = npRelRef.current?.value || 'other'
    const cfg = REL_CONFIG[rel] || REL_CONFIG.other

    if (editingId) {
      updatePerson(editingId, {
        name,
        rel,
        dob: npDobRef.current?.value || '',
        tob: npTobRef.current?.value || '',
        pob: npPobRef.current?.value || '',
        notes: npNotesRef.current?.value || '',
        gender: npGenderRef.current?.value || '',
        emoji: cfg.emoji,
      })
      setEditingId(null)
    } else {
      addPerson({
        name,
        rel,
        dob: npDobRef.current?.value || '',
        tob: npTobRef.current?.value || '',
        pob: npPobRef.current?.value || '',
        notes: npNotesRef.current?.value || '',
        gender: npGenderRef.current?.value || '',
        emoji: cfg.emoji,
        sign: '?',
      })
    }
    // Clear form
    if (npNameRef.current) npNameRef.current.value = ''
    if (npDobRef.current) npDobRef.current.value = ''
    if (npTobRef.current) npTobRef.current.value = ''
    if (npPobRef.current) npPobRef.current.value = ''
    if (npNotesRef.current) npNotesRef.current.value = ''
    if (npGenderRef.current) npGenderRef.current.value = ''
    setShowAddForm(false)
  }

  function handleEditPerson(p) {
    setEditingId(p.id)
    setShowAddForm(true)
    setTimeout(() => {
      if (npNameRef.current) npNameRef.current.value = p.name || ''
      if (npRelRef.current) npRelRef.current.value = p.rel || 'other'
      if (npDobRef.current) npDobRef.current.value = p.dob || ''
      if (npTobRef.current) npTobRef.current.value = p.tob || ''
      if (npPobRef.current) npPobRef.current.value = p.pob || ''
      if (npNotesRef.current) npNotesRef.current.value = p.notes || ''
      if (npGenderRef.current) npGenderRef.current.value = p.gender || ''
      npNameRef.current?.focus()
    }, 50)
  }

  const inner = (
    <div className="profile-panel" style={embedded ? { width: '100%', maxWidth: '100%', maxHeight: 'none', height: 'auto', borderRadius: 0, border: 'none', boxShadow: 'none', background: 'transparent' } : {}}>
      {!embedded && (
        <div className="pp-header">
          <span className="pp-title">{'\u2726'} Profiles &amp; Constellation</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="btn btn-aqua" onClick={() => { onClose(); setActiveDetail('synastry'); setActiveNav('synastry') }}>{'\u2295'} Open Synastry</div>
            <div className="pp-close" onClick={onClose}>{'\u2715'}</div>
          </div>
        </div>
      )}
      <div className="pp-body">
        {/* PRIMARY PROFILE */}
        <div className="pp-section">
          <div className="pp-sec-title">Primary Profile {'\u2014'} Self</div>
          {!profile.dob && user && (
            <div style={{ padding: '12px 0', fontSize: 11, color: 'var(--foreground)', fontFamily: 'inherit', textAlign: 'center' }}>
              ✦ Welcome! Fill in your birth data below to get started.
            </div>
          )}
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
            <div className="pp-field">
              <div className="pp-label">Gender</div>
              <select ref={genderRef} className="pp-input" defaultValue={profile.gender || ''}>
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="pp-field">
              <div className="pp-label">MBTI Type</div>
              <select ref={mbtiRef} className="pp-input" defaultValue={mbtiType || ''}>
                <option value="">{'\u2014'} Take Quiz {'\u2014'}</option>
                <option value="INTJ">INTJ {'\u2014'} Architect</option>
                <option value="INTP">INTP {'\u2014'} Logician</option>
                <option value="ENTJ">ENTJ {'\u2014'} Commander</option>
                <option value="ENTP">ENTP {'\u2014'} Debater</option>
                <option value="INFJ">INFJ {'\u2014'} Advocate</option>
                <option value="INFP">INFP {'\u2014'} Mediator</option>
                <option value="ENFJ">ENFJ {'\u2014'} Protagonist</option>
                <option value="ENFP">ENFP {'\u2014'} Campaigner</option>
                <option value="ISTJ">ISTJ {'\u2014'} Logistician</option>
                <option value="ISFJ">ISFJ {'\u2014'} Defender</option>
                <option value="ESTJ">ESTJ {'\u2014'} Executive</option>
                <option value="ESFJ">ESFJ {'\u2014'} Consul</option>
                <option value="ISTP">ISTP {'\u2014'} Virtuoso</option>
                <option value="ISFP">ISFP {'\u2014'} Adventurer</option>
                <option value="ESTP">ESTP {'\u2014'} Entrepreneur</option>
                <option value="ESFP">ESFP {'\u2014'} Entertainer</option>
              </select>
            </div>
            <div className="pp-field">
              <div className="pp-label">Enneagram Type</div>
              <select ref={enneagramRef} className="pp-input" defaultValue={enneagramType ? String(enneagramType) : ''}>
                <option value="">{'\u2014'} Take Quiz {'\u2014'}</option>
                <option value="1">Type 1 {'\u2014'} The Reformer</option>
                <option value="2">Type 2 {'\u2014'} The Helper</option>
                <option value="3">Type 3 {'\u2014'} The Achiever</option>
                <option value="4">Type 4 {'\u2014'} The Individualist</option>
                <option value="5">Type 5 {'\u2014'} The Investigator</option>
                <option value="6">Type 6 {'\u2014'} The Loyalist</option>
                <option value="7">Type 7 {'\u2014'} The Enthusiast</option>
                <option value="8">Type 8 {'\u2014'} The Challenger</option>
                <option value="9">Type 9 {'\u2014'} The Peacemaker</option>
              </select>
            </div>
            <div className="pp-field">
              <div className="pp-label">Enneagram Wing</div>
              <select ref={enneagramWingRef} className="pp-input" defaultValue={enneagramWing ? String(enneagramWing) : ''}>
                <option value="">{'\u2014'} Auto from Type {'\u2014'}</option>
                <option value="1">Wing 1</option>
                <option value="2">Wing 2</option>
                <option value="3">Wing 3</option>
                <option value="4">Wing 4</option>
                <option value="5">Wing 5</option>
                <option value="6">Wing 6</option>
                <option value="7">Wing 7</option>
                <option value="8">Wing 8</option>
                <option value="9">Wing 9</option>
              </select>
            </div>
            <div className="pp-field">
              <div className="pp-label">Instinctual Variant</div>
              <select ref={enneagramInstinctRef} className="pp-input" defaultValue={enneagramInstinct || ''}>
                <option value="">{'\u2014'} Not Set {'\u2014'}</option>
                <option value="sp">Self-Preservation (SP)</option>
                <option value="sx">Sexual / One-to-One (SX)</option>
                <option value="so">Social (SO)</option>
              </select>
            </div>
            <div className="pp-field">
              <div className="pp-label">Dosha Type</div>
              <select ref={doshaRef} className="pp-input" defaultValue={profile?.doshaType || ''}>
                <option value="">{'\u2014'} Take Quiz {'\u2014'}</option>
                <option value="vata">Vata (Air &amp; Ether)</option>
                <option value="pitta">Pitta (Fire &amp; Water)</option>
                <option value="kapha">Kapha (Earth &amp; Water)</option>
                <option value="vata-pitta">Vata-Pitta</option>
                <option value="pitta-kapha">Pitta-Kapha</option>
                <option value="vata-kapha">Vata-Kapha</option>
                <option value="tridoshic">Tridoshic (Balanced)</option>
              </select>
            </div>
            <div className="pp-field">
              <div className="pp-label">Jungian Archetype</div>
              <select ref={archetypeRef} className="pp-input" defaultValue={profile?.archetypeType || ''}>
                <option value="">{'\u2014'} Take Quiz {'\u2014'}</option>
                <option value="hero">The Hero</option>
                <option value="sage">The Sage</option>
                <option value="explorer">The Explorer</option>
                <option value="creator">The Creator</option>
                <option value="ruler">The Ruler</option>
                <option value="magician">The Magician</option>
                <option value="lover">The Lover</option>
                <option value="caregiver">The Caregiver</option>
                <option value="innocent">The Innocent</option>
                <option value="jester">The Jester</option>
                <option value="outlaw">The Outlaw</option>
                <option value="everyman">The Everyman</option>
              </select>
            </div>
            <div className="pp-field">
              <div className="pp-label">Love Language</div>
              <select ref={loveLanguageRef} className="pp-input" defaultValue={profile?.loveLanguage || ''}>
                <option value="">{'\u2014'} Take Quiz {'\u2014'}</option>
                <option value="words">Words of Affirmation</option>
                <option value="acts">Acts of Service</option>
                <option value="gifts">Receiving Gifts</option>
                <option value="time">Quality Time</option>
                <option value="touch">Physical Touch</option>
              </select>
            </div>
          </div>
          {!user && (
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontStyle: 'italic', marginBottom: 8, textAlign: 'center' }}>
              ✦ Guest mode — data saved locally. Sign in to sync across devices.
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <div
              className="btn btn-primary"
              onClick={() => handleSavePrimary()}
              style={saveFlash ? { background: 'rgba(96,176,48,.2)', borderColor: 'rgba(96,176,48,.5)', color: 'var(--lime2)' } : {}}
            >
              {saveFlash ? '\u2713 Saved' : 'Save Primary Profile'}
            </div>
            <div
              className="btn"
              onClick={() => { localStorage.removeItem('above-inside-store'); window.location.reload(); }}
              style={{
                marginTop: 8, width: '100%', padding: '8px 0', textAlign: 'center',
                background: 'transparent', border: '1px solid rgba(220,60,60,0.3)',
                borderRadius: 8, color: 'rgba(220,80,80,0.7)',
                fontFamily: 'inherit', fontSize: 10, letterSpacing: '.1em',
                cursor: 'pointer',
              }}
              title="Clear cached data and reload defaults"
            >
              ↺ Reset Cache & Restore Defaults
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
                  <div className="pc-edit" onClick={() => handleEditPerson(p)}>{'\u270E'}</div>
                  <div className="pc-del" onClick={() => removePerson(p.id)}>{'\u2715'}</div>
                  <div className="pc-avatar" style={{ background: cfg.col + '0.12)', borderColor: cfg.col + '0.3)' }}>{cfg.emoji}</div>
                  <div className="pc-name">{p.name}</div>
                  <div className="pc-rel">{cfg.label}</div>
                  <div className="pc-dob">{formatDOB(p.dob)}{p.tob ? ' \u00B7 ' + p.tob : ''}</div>
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
            <div className="btn btn-ghost" onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) setEditingId(null) }}>
              {showAddForm ? '\u2212 Cancel' : '+ Add Person'}
            </div>
          </div>

          <div className={`add-person-form${showAddForm ? ' open' : ''}`}>
            <div className="pp-sec-title" style={{ marginTop: 0 }}>{editingId ? 'Edit Person' : 'New Person'}</div>
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
                <div className="pp-label">Gender</div>
                <select ref={npGenderRef} className="pp-input">
                  <option value="">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="pp-row">
              <div className="pp-field">
                <div className="pp-label">Notes</div>
                <input ref={npNotesRef} className="pp-input" placeholder="Optional notes" />
              </div>
            </div>
            <div className="pp-actions">
              <div className="btn btn-ghost" onClick={() => { setShowAddForm(false); setEditingId(null) }}>Cancel</div>
              <div className="btn btn-primary" onClick={handleAddPerson}>{editingId ? 'Save Changes' : 'Add to Constellation'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (embedded) return inner

  return (
    <div className={`overlay${open ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      {inner}
    </div>
  )
}
