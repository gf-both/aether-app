import { useState, useRef } from 'react'
import { useAboveInsideStore } from '../../store/useAboveInsideStore'

const RELATIONSHIP_COLORS = {
  parent: '#d43070',
  sibling: '#40ccdd',
  partner: '#c9a84c',
  child: '#60b030',
  other: '#9050e0',
}

const RELATIONSHIP_LABELS = {
  parent: 'Parent',
  sibling: 'Sibling',
  partner: 'Partner',
  child: 'Child',
  other: 'Other',
}

const MOCK_PATTERNS = {
  familyThemes: [
    '2 members with undefined Sacral — energetic sensitivity and boundary challenges may be a family pattern',
    'Strong Generator energy in the parental line — conditioning toward "working hard" as worth',
    'Emotional authority appears in multiple generations — the wave may have been mistaken for instability',
  ],
  generationalDynamics: 'The maternal line shows a pattern of sacrifice and suppressed desire — worth exploring how this shows up in your own relationship to receiving. The paternal line carries strong manifestor energy; there may be an inherited tendency to act without informing others.',
  constellationFocus: [
    'The relationship with the parent carrying gate 21 — control dynamics and autonomy',
    'Sibling system as a mirror for early conditioning around worthiness',
    'Partner field and how the emotional wave is received / misunderstood',
  ],
}

function MemberNode({ member, isClient, onClick, boardWidth, boardHeight }) {
  const color = isClient ? '#c9a84c' : RELATIONSHIP_COLORS[member.relationship] || '#9050e0'
  const size = isClient ? 70 : 52

  const x = isClient
    ? (boardWidth / 2 - size / 2)
    : (member.position?.x ?? boardWidth / 2 - size / 2)
  const y = isClient
    ? (boardHeight / 2 - size / 2)
    : (member.position?.y ?? boardHeight / 2 - size / 2)

  return (
    <g
      transform={`translate(${x + size / 2}, ${y + size / 2})`}
      style={{ cursor: isClient ? 'default' : 'pointer' }}
      onClick={isClient ? undefined : () => onClick(member)}
    >
      {/* Connecting line to center */}
      {!isClient && (
        <line
          x1={0}
          y1={0}
          x2={boardWidth / 2 - (x + size / 2)}
          y2={boardHeight / 2 - (y + size / 2)}
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="5,4"
          opacity="0.5"
        />
      )}
      {/* Circle */}
      <circle
        r={size / 2}
        fill={`${color}22`}
        stroke={color}
        strokeWidth={isClient ? 2.5 : 1.5}
      />
      {/* Glow */}
      <circle
        r={size / 2 + 3}
        fill="none"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.3"
      />
      {/* Name label */}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        y={-6}
        style={{
          fontFamily: 'Cinzel, serif',
          fontSize: isClient ? '10px' : '8px',
          fill: color,
          fontWeight: '600',
          pointerEvents: 'none',
        }}
      >
        {(isClient ? member.name : member.name)?.slice(0, 10) || '?'}
      </text>
      {!isClient && (
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          y={6}
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '7px',
            fill: color,
            opacity: 0.8,
            pointerEvents: 'none',
          }}
        >
          {RELATIONSHIP_LABELS[member.relationship] || 'Other'}
        </text>
      )}
      {!isClient && member.hdType && (
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          y={16}
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '6px',
            fill: '#ffffff',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        >
          {member.hdType}
        </text>
      )}
    </g>
  )
}

const DEFAULT_POSITIONS = [
  { x: 0.5, y: 0.12 },
  { x: 0.82, y: 0.25 },
  { x: 0.85, y: 0.6 },
  { x: 0.65, y: 0.82 },
  { x: 0.35, y: 0.82 },
  { x: 0.15, y: 0.6 },
  { x: 0.18, y: 0.25 },
  { x: 0.5, y: 0.88 },
]

export default function FamilyConstellation({ clientId, clientProfile = {} }) {
  const { familyConstellations, addFamilyMember } = useAboveInsideStore()
  const members = familyConstellations?.[clientId] || []

  const [selectedMember, setSelectedMember] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPatterns, setShowPatterns] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '', relationship: 'parent', hdType: '', birthDate: '', notes: '',
  })

  const boardWidth = 460
  const boardHeight = 340

  const membersWithPositions = members.map((m, i) => ({
    ...m,
    position: m.position || {
      x: (DEFAULT_POSITIONS[i % DEFAULT_POSITIONS.length].x * boardWidth) - 26,
      y: (DEFAULT_POSITIONS[i % DEFAULT_POSITIONS.length].y * boardHeight) - 26,
    },
  }))

  const handleAddMember = () => {
    if (!newMember.name) return
    const posIdx = members.length % DEFAULT_POSITIONS.length
    addFamilyMember(clientId, {
      ...newMember,
      id: Date.now().toString(),
      position: {
        x: (DEFAULT_POSITIONS[posIdx].x * boardWidth) - 26,
        y: (DEFAULT_POSITIONS[posIdx].y * boardHeight) - 26,
      },
    })
    setNewMember({ name: '', relationship: 'parent', hdType: '', birthDate: '', notes: '' })
    setShowAddForm(false)
  }

  return (
    <div style={{
      background: 'var(--panel-bg, rgba(15,12,30,0.9))',
      border: '1px solid var(--glass-border, rgba(201,168,76,0.2))',
      borderRadius: 16,
      padding: 24,
      backdropFilter: 'blur(20px)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1.1rem',
            letterSpacing: '0.1em',
            color: 'var(--gold, #c9a84c)',
            margin: 0,
          }}>
            🌳 Family Constellation
          </h2>
          <p style={{ margin: '4px 0 0', fontFamily: 'Cormorant Garamond, serif', fontSize: '0.85rem', opacity: 0.6 }}>
            {members.length} family member{members.length !== 1 ? 's' : ''} mapped
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowPatterns(p => !p)}
            style={{
              background: showPatterns ? 'rgba(144,80,224,0.2)' : 'rgba(144,80,224,0.08)',
              border: '1px solid rgba(144,80,224,0.4)',
              borderRadius: 8,
              padding: '6px 12px',
              color: '#9050e0',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            🔮 Pattern Analysis
          </button>
          <button
            onClick={() => setShowAddForm(f => !f)}
            style={{
              background: 'linear-gradient(135deg, var(--gold, #c9a84c), #e8c97a)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 12px',
              color: '#0f0c1e',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            + Add Person
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div style={{
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid var(--glass-border, rgba(201,168,76,0.2))',
          borderRadius: 10,
          padding: 16,
          marginBottom: 18,
        }}>
          <p style={{ margin: '0 0 12px', fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: 'var(--gold, #c9a84c)' }}>
            New Family Member
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Name *', key: 'name', type: 'text', placeholder: 'Full name' },
              { label: 'HD Type', key: 'hdType', type: 'text', placeholder: 'e.g. Generator 2/4' },
              { label: 'Birth Date', key: 'birthDate', type: 'date', placeholder: '' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: 'var(--gold, #c9a84c)', marginBottom: 4 }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={newMember[field.key]}
                  onChange={e => setNewMember(m => ({ ...m, [field.key]: e.target.value }))}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border, rgba(201,168,76,0.2))',
                    borderRadius: 6,
                    padding: '7px 10px',
                    color: 'var(--text, #e8e0d5)',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: 'var(--gold, #c9a84c)', marginBottom: 4 }}>
                Relationship
              </label>
              <select
                value={newMember.relationship}
                onChange={e => setNewMember(m => ({ ...m, relationship: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'rgba(15,12,30,0.9)',
                  border: '1px solid var(--glass-border, rgba(201,168,76,0.2))',
                  borderRadius: 6,
                  padding: '7px 10px',
                  color: RELATIONSHIP_COLORS[newMember.relationship] || 'var(--text, #e8e0d5)',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {Object.entries(RELATIONSHIP_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: 'var(--gold, #c9a84c)', marginBottom: 4 }}>
              Notes
            </label>
            <textarea
              placeholder="Dynamics, patterns, observations..."
              value={newMember.notes}
              onChange={e => setNewMember(m => ({ ...m, notes: e.target.value }))}
              rows={2}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border, rgba(201,168,76,0.2))',
                borderRadius: 6,
                padding: '7px 10px',
                color: 'var(--text, #e8e0d5)',
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '0.9rem',
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={handleAddMember}
              disabled={!newMember.name}
              style={{
                flex: 1,
                background: newMember.name ? 'linear-gradient(135deg, var(--gold, #c9a84c), #e8c97a)' : 'rgba(201,168,76,0.2)',
                border: 'none',
                borderRadius: 6,
                padding: '8px',
                color: newMember.name ? '#0f0c1e' : 'rgba(201,168,76,0.5)',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.8rem',
                cursor: newMember.name ? 'pointer' : 'not-allowed',
              }}
            >
              Add to Constellation
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border, rgba(201,168,76,0.2))',
                borderRadius: 6,
                padding: '8px 14px',
                color: 'var(--text, #e8e0d5)',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SVG Board */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--glass-border, rgba(201,168,76,0.15))',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: selectedMember ? 16 : 0,
      }}>
        <svg
          width="100%"
          viewBox={`0 0 ${boardWidth} ${boardHeight}`}
          style={{ display: 'block' }}
        >
          {/* Starfield background dots */}
          {[...Array(40)].map((_, i) => (
            <circle
              key={i}
              cx={(((i * 137 + 11) % boardWidth))}
              cy={(((i * 97 + 17) % boardHeight))}
              r="0.8"
              fill="white"
              opacity={0.1 + (i % 5) * 0.05}
            />
          ))}
          {/* Subtle rings from center */}
          {[60, 110, 160].map(r => (
            <circle
              key={r}
              cx={boardWidth / 2}
              cy={boardHeight / 2}
              r={r}
              fill="none"
              stroke="rgba(201,168,76,0.06)"
              strokeWidth="1"
            />
          ))}
          {/* Family members */}
          {membersWithPositions.map(member => (
            <MemberNode
              key={member.id}
              member={member}
              isClient={false}
              onClick={setSelectedMember}
              boardWidth={boardWidth}
              boardHeight={boardHeight}
            />
          ))}
          {/* Client at center */}
          <MemberNode
            member={{ name: clientProfile.name || 'Client', hdType: clientProfile.hdType }}
            isClient={true}
            onClick={() => {}}
            boardWidth={boardWidth}
            boardHeight={boardHeight}
          />
          {members.length === 0 && (
            <text
              x={boardWidth / 2}
              y={boardHeight - 20}
              textAnchor="middle"
              style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '11px', fill: 'rgba(255,255,255,0.3)' }}
            >
              Add family members to begin the constellation
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10, marginBottom: selectedMember ? 16 : 0 }}>
        {Object.entries(RELATIONSHIP_COLORS).map(([rel, color]) => (
          <div key={rel} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, opacity: 0.8 }} />
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.8rem', opacity: 0.7 }}>
              {RELATIONSHIP_LABELS[rel]}
            </span>
          </div>
        ))}
      </div>

      {/* Selected member detail */}
      {selectedMember && (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${RELATIONSHIP_COLORS[selectedMember.relationship] || '#9050e0'}44`,
          borderRadius: 10,
          padding: 14,
          marginTop: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <h4 style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.9rem',
                color: RELATIONSHIP_COLORS[selectedMember.relationship] || '#9050e0',
                margin: 0,
              }}>
                {selectedMember.name}
              </h4>
              <p style={{ margin: '2px 0 0', fontFamily: 'Cormorant Garamond, serif', fontSize: '0.85rem', opacity: 0.7 }}>
                {RELATIONSHIP_LABELS[selectedMember.relationship]}
                {selectedMember.hdType && ` · ${selectedMember.hdType}`}
                {selectedMember.birthDate && ` · Born ${selectedMember.birthDate}`}
              </p>
            </div>
            <button
              onClick={() => setSelectedMember(null)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              ×
            </button>
          </div>
          {selectedMember.notes && (
            <p style={{
              margin: 0,
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              fontStyle: 'italic',
              opacity: 0.85,
            }}>
              {selectedMember.notes}
            </p>
          )}
        </div>
      )}

      {/* Pattern Analysis */}
      {showPatterns && (
        <div style={{
          marginTop: 20,
          background: 'rgba(144,80,224,0.06)',
          border: '1px solid rgba(144,80,224,0.3)',
          borderRadius: 12,
          padding: 18,
        }}>
          <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.9rem', color: '#9050e0', margin: '0 0 14px', letterSpacing: '0.08em' }}>
            🔮 Family System Patterns
          </h3>
          <div style={{ marginBottom: 14 }}>
            <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: 'rgba(144,80,224,0.9)', margin: '0 0 8px' }}>
              Family Themes
            </h4>
            <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
              {MOCK_PATTERNS.familyThemes.map((t, i) => (
                <li key={i} style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  marginBottom: 6,
                  color: 'var(--text, #e8e0d5)',
                }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginBottom: 14 }}>
            <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: 'rgba(144,80,224,0.9)', margin: '0 0 8px' }}>
              Generational Dynamics
            </h4>
            <p style={{ margin: 0, fontFamily: 'Cormorant Garamond, serif', fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.9 }}>
              {MOCK_PATTERNS.generationalDynamics}
            </p>
          </div>
          <div>
            <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: 'rgba(144,80,224,0.9)', margin: '0 0 8px' }}>
              Key Relationships to Explore
            </h4>
            <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
              {MOCK_PATTERNS.constellationFocus.map((f, i) => (
                <li key={i} style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  marginBottom: 6,
                  fontStyle: 'italic',
                }}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
