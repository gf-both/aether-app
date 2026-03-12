import { DREAMSPELL_SEALS, GALACTIC_TONES, MAYAN_PROFILE, CASTLES, EARTH_FAMILIES, COLOR_FAMILIES, SEAL_COLORS } from '../../data/mayanData'
import MayanWheel from '../canvas/MayanWheel'

const P = MAYAN_PROFILE

/* ---- shared styles ---- */
const S = {
  panel: {
    width: '100%', height: '100%', overflowY: 'auto', padding: '24px 28px',
    display: 'flex', flexDirection: 'column', gap: 28,
    background: 'var(--panel-bg)', color: 'var(--text)',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 600, letterSpacing: '.25em',
    textTransform: 'uppercase', color: 'var(--gold3)', paddingBottom: 8,
    borderBottom: '1px solid rgba(201,168,76,.1)', marginBottom: 4,
  },
  heading: {
    fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 600, letterSpacing: '.18em',
    color: 'var(--gold)', marginBottom: 4,
  },
  mono: {
    fontFamily: "'Inconsolata', monospace", fontSize: 12, fontWeight: 500, color: 'var(--text)',
  },
  monoSm: {
    fontFamily: "'Inconsolata', monospace", fontSize: 11, color: 'var(--text2)',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
    borderRadius: 8, background: 'var(--row-bg)',
    border: '1px solid var(--row-border)', transition: 'background .2s',
  },
  glass: {
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    borderRadius: 13, padding: 18, backdropFilter: 'blur(12px)',
  },
  badge: (bg, border, color) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: 12,
    fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.1em',
    textTransform: 'uppercase', background: bg, border: `1px solid ${border}`, color,
  }),
  interpretation: {
    fontSize: 14, lineHeight: 1.7, color: 'var(--text2)', fontStyle: 'italic',
    padding: '14px 18px', borderRadius: 10,
    background: 'var(--interp-bg)', border: '1px solid var(--interp-border)',
  },
  keyVal: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.04)',
  },
}

/* Mayan dot-and-bar tone notation */
function ToneNotation({ tone, size = 6, color = 'var(--gold)' }) {
  const bars = Math.floor(tone / 5)
  const dots = tone % 5
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      {dots > 0 && (
        <div style={{ display: 'flex', gap: size * 0.7 }}>
          {Array.from({ length: dots }).map((_, i) => (
            <div key={i} style={{ width: size, height: size, borderRadius: '50%', background: color }} />
          ))}
        </div>
      )}
      {Array.from({ length: bars }).map((_, i) => (
        <div key={`b${i}`} style={{ width: size * 4, height: size * 0.6, borderRadius: 2, background: color }} />
      ))}
    </div>
  )
}

/* Oracle Cross visual component */
function OracleCross() {
  const { destiny, guide, analog, antipode, occult } = P.oracle
  const roles = [
    { entry: guide, label: 'Guide', desc: 'Higher self & spiritual guidance', col: 'rgba(96,200,80,', pos: 'top' },
    { entry: antipode, label: 'Antipode', desc: 'Challenge & strengthening', col: 'rgba(220,60,60,', pos: 'left' },
    { entry: destiny, label: 'Destiny', desc: 'Your core galactic signature', col: 'rgba(221,170,34,', pos: 'center' },
    { entry: analog, label: 'Analog', desc: 'Support & best friend', col: 'rgba(201,168,76,', pos: 'right' },
    { entry: occult, label: 'Occult', desc: 'Hidden power & unexpected strength', col: 'rgba(64,204,221,', pos: 'bottom' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto auto auto', gap: 10, justifyItems: 'center', alignItems: 'center' }}>
      {/* Row 1: Guide (top center) */}
      <div style={{ gridColumn: 2, gridRow: 1 }}>
        <OracleCard entry={guide} label="Guide" desc="Higher-self guidance" col="rgba(96,200,80," />
      </div>
      {/* Row 2: Antipode - Destiny - Analog */}
      <div style={{ gridColumn: 1, gridRow: 2 }}>
        <OracleCard entry={antipode} label="Antipode" desc="Challenge & strength" col="rgba(220,60,60," />
      </div>
      <div style={{ gridColumn: 2, gridRow: 2 }}>
        <OracleCard entry={destiny} label="Destiny" desc="Core signature" col="rgba(221,170,34," isCenter />
      </div>
      <div style={{ gridColumn: 3, gridRow: 2 }}>
        <OracleCard entry={analog} label="Analog" desc="Support & ally" col="rgba(201,168,76," />
      </div>
      {/* Row 3: Occult (bottom center) */}
      <div style={{ gridColumn: 2, gridRow: 3 }}>
        <OracleCard entry={occult} label="Occult" desc="Hidden power" col="rgba(64,204,221," />
      </div>
    </div>
  )
}

function OracleCard({ entry, label, desc, col, isCenter }) {
  const sealCol = SEAL_COLORS[entry.seal.color]
  return (
    <div style={{
      textAlign: 'center', padding: isCenter ? '16px 20px' : '10px 16px',
      borderRadius: 12, minWidth: isCenter ? 150 : 120,
      background: col + (isCenter ? '.08)' : '.04)'),
      border: `1px solid ${col}${isCenter ? '.3)' : '.15)'}`,
    }}>
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: 7, letterSpacing: '.2em',
        textTransform: 'uppercase', color: col + '.6)', marginBottom: 4,
      }}>{label}</div>
      <div style={{ fontSize: isCenter ? 28 : 22, marginBottom: 2 }}>{entry.seal.glyph}</div>
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: isCenter ? 13 : 11,
        color: sealCol, letterSpacing: '.08em',
      }}>{entry.signature}</div>
      <div style={{
        fontFamily: "'Inconsolata', monospace", fontSize: 9,
        color: 'var(--text3)', marginTop: 2,
      }}>Kin {entry.kin}</div>
      <div style={{ marginTop: 4 }}>
        <ToneNotation tone={entry.toneNum} size={isCenter ? 5 : 4} color={col + '0.5)'} />
      </div>
      <div style={{ fontSize: 9, color: 'var(--text3)', fontStyle: 'italic', marginTop: 4 }}>
        {desc}
      </div>
    </div>
  )
}

export default function MayanDetail() {
  const seal = P.seal
  const tone = P.tone
  const sealCol = SEAL_COLORS[seal.color]
  const colorLabel = seal.color.charAt(0).toUpperCase() + seal.color.slice(1)

  return (
    <div style={S.panel}>
      {/* HEADER */}
      <div>
        <div style={S.heading}>{'\u2600'} Mayan Dreamspell Calendar</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
          Galactic signature, oracle cross, wavespell, and castle {'\u2014'} the Dreamspell system by Jos{'\u00E9'} Arg{'\u00FC'}elles
        </div>
        <div style={{
          ...S.badge('rgba(201,168,76,.08)', 'rgba(201,168,76,.2)', 'var(--gold3)'),
          marginTop: 6, fontSize: 7,
        }}>
          {P.system} {'\u2022'} Galactic Spinner
        </div>
      </div>

      {/* MAYAN WHEEL CANVAS */}
      <div>
        <div style={S.sectionTitle}>Tzolkin Wheel & Oracle</div>
        <div style={{ ...S.glass, padding: 0, overflow: 'hidden', height: 460, position: 'relative' }}>
          <MayanWheel />
        </div>
      </div>

      {/* KIN IDENTITY */}
      <div>
        <div style={S.sectionTitle}>Your Galactic Signature</div>
        <div style={{ ...S.glass, textAlign: 'center', padding: '28px 22px' }}>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.25em',
            textTransform: 'uppercase', color: 'var(--gold3)', marginBottom: 14,
          }}>Kin {P.kin} {'\u2014'} {P.signature}</div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, alignItems: 'flex-start', marginBottom: 16 }}>
            {/* Seal */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: sealCol + '10', border: `2px solid ${sealCol}55`,
                fontSize: 42,
              }}>{seal.glyph}</div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 16, color: sealCol,
                letterSpacing: '.12em',
              }}>{colorLabel} {seal.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>
                Solar Seal {seal.num} ({seal.mayanName})
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[seal.action, seal.power, seal.essence].map((kw, i) => (
                  <span key={i} style={S.badge(sealCol + '10', sealCol + '33', sealCol)}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ marginTop: 8 }}>
                <ToneNotation tone={tone.number} size={10} color="var(--gold)" />
              </div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 32, color: 'var(--gold)',
                letterSpacing: '.15em', lineHeight: 1,
              }}>{tone.number}</div>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 16, color: 'var(--gold2)',
                letterSpacing: '.12em',
              }}>{tone.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>
                Galactic Tone {'\u2014'} {tone.keyword}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[tone.action, tone.power].map((kw, i) => (
                  <span key={i} style={S.badge('rgba(201,168,76,.08)', 'rgba(201,168,76,.22)', 'var(--gold2)')}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
            Born {P.birthDate}
          </div>
        </div>
      </div>

      {/* CORE PROFILE */}
      <div>
        <div style={S.sectionTitle}>Core Profile</div>
        <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            ['Galactic Signature', P.signature],
            ['Solar Seal', `${seal.name} (${seal.mayanName}) \u2014 Seal ${seal.num}`],
            ['Galactic Tone', `${tone.number} \u2014 ${tone.name} (${tone.keyword})`],
            ['Color Family', `${colorLabel} \u2014 ${P.colorFamily.role}: ${P.colorFamily.theme}`],
            ['Direction', seal.direction],
            ['Earth Family', `${P.earthFamily.name} (${P.earthFamily.chakra} Chakra)`],
            ['Wavespell', `${P.wavespell.name} \u2014 ${P.wavespell.label}`],
            ['Castle', `${P.castle.name} (Court of ${P.castle.court})`],
          ].map(([label, val], i) => (
            <div key={i} style={S.keyVal}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '.15em',
                textTransform: 'uppercase', color: 'var(--text3)', minWidth: 140,
              }}>{label}</span>
              <span style={{
                ...S.mono, color: i === 0 ? 'var(--gold)' : 'var(--gold2)',
              }}>
                {i === 0
                  ? <span style={{
                      ...S.badge('rgba(201,168,76,.1)', 'rgba(201,168,76,.3)', 'var(--gold)'),
                      fontSize: 10, padding: '4px 14px',
                    }}>{val}</span>
                  : val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SEAL & TONE DETAIL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          ...S.glass, textAlign: 'center', padding: '20px 18px',
          background: sealCol + '08', borderColor: sealCol + '22',
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: sealCol + '99', marginBottom: 6 }}>
            Solar Seal
          </div>
          <div style={{ fontSize: 32, marginBottom: 4 }}>{seal.glyph}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: sealCol, letterSpacing: '.15em' }}>
            {seal.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4, fontStyle: 'italic' }}>
            {seal.action} {'\u00B7'} {seal.power} {'\u00B7'} {seal.essence}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
            {colorLabel} {'\u00B7'} {seal.direction} {'\u00B7'} {seal.earthFamily}
          </div>
          <div style={{ marginTop: 10 }}>
            <ToneNotation tone={P.toneNum} size={8} color={sealCol + 'aa'} />
          </div>
        </div>

        <div style={{
          ...S.glass, textAlign: 'center', padding: '20px 18px',
          background: 'rgba(201,168,76,.04)', borderColor: 'rgba(201,168,76,.15)',
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,.6)', marginBottom: 6 }}>
            Galactic Tone
          </div>
          <div style={{ marginBottom: 8 }}>
            <ToneNotation tone={tone.number} size={10} color="var(--gold)" />
          </div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 32, color: 'var(--gold)', letterSpacing: '.15em', lineHeight: 1 }}>
            {tone.number}
          </div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--gold2)', letterSpacing: '.12em', marginTop: 6 }}>
            {tone.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>
            {tone.keyword}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, fontStyle: 'italic' }}>
            {tone.action} {'\u00B7'} {tone.power}
          </div>
        </div>
      </div>

      {/* ORACLE CROSS */}
      <div>
        <div style={S.sectionTitle}>Dreamspell Oracle</div>
        <div style={S.glass}>
          <OracleCross />
        </div>
      </div>

      {/* WAVESPELL & CASTLE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          ...S.glass, padding: '20px 18px',
          background: 'rgba(201,168,76,.04)', borderColor: 'rgba(201,168,76,.15)',
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,.6)', marginBottom: 8 }}>
            Wavespell {P.wavespell.number} of 20
          </div>
          <div style={{ fontSize: 28, marginBottom: 4 }}>{P.wavespell.seal.glyph}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: 'var(--gold2)', letterSpacing: '.1em' }}>
            {P.wavespell.name}
          </div>
          <div style={{ ...S.monoSm, color: 'var(--text3)', marginTop: 4 }}>
            {P.wavespell.label}
          </div>
          <div style={{ ...S.monoSm, color: 'var(--text3)', marginTop: 2 }}>
            Kins {P.wavespell.startKin}{'\u2013'}{P.wavespell.startKin + 12}
          </div>
        </div>

        <div style={{
          ...S.glass, padding: '20px 18px',
          background: P.castle.color + '08', borderColor: P.castle.color + '22',
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: P.castle.color + '99', marginBottom: 8 }}>
            Castle {P.castle.num} of 5
          </div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: P.castle.color, letterSpacing: '.1em' }}>
            {P.castle.name}
          </div>
          <div style={{ ...S.monoSm, color: 'var(--text3)', marginTop: 4 }}>
            Court of {P.castle.court}
          </div>
          <div style={{ ...S.monoSm, color: 'var(--text3)', marginTop: 2 }}>
            Kins {P.castle.range[0]}{'\u2013'}{P.castle.range[1]}
          </div>
        </div>
      </div>

      {/* EARTH FAMILY */}
      <div>
        <div style={S.sectionTitle}>Earth Family</div>
        <div style={{ ...S.glass, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Inconsolata', monospace", fontSize: 18, color: 'var(--gold)', fontWeight: 700 }}>
              {P.earthFamily.name}
            </span>
            <span style={{ ...S.monoSm, color: 'var(--text3)' }}>
              {P.earthFamily.role} {'\u00B7'} {P.earthFamily.chakra} Chakra
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {P.earthFamily.seals.map((sNum, i) => {
              const s = DREAMSPELL_SEALS[sNum - 1]
              const sc = SEAL_COLORS[s.color]
              const isYou = sNum === P.sealNum
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 8,
                  background: isYou ? 'rgba(201,168,76,.08)' : 'rgba(255,255,255,.02)',
                  border: `1px solid ${isYou ? 'rgba(201,168,76,.25)' : 'rgba(255,255,255,.06)'}`,
                }}>
                  <span style={{ fontSize: 18 }}>{s.glyph}</span>
                  <div>
                    <div style={{ ...S.mono, color: isYou ? 'var(--gold)' : sc, fontSize: 12 }}>{s.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--text3)' }}>Seal {s.num}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 20 SOLAR SEALS TABLE */}
      <div>
        <div style={S.sectionTitle}>The 20 Solar Seals</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '28px 28px 90px 80px 80px 70px 55px', gap: 8, padding: '4px 12px' }}>
            {['#', '', 'NAME', 'ACTION', 'POWER', 'FAMILY', 'DIR'].map((h, i) => (
              <span key={i} style={{ ...S.monoSm, fontSize: 9, color: 'var(--text3)' }}>{h}</span>
            ))}
          </div>
          {DREAMSPELL_SEALS.map((s, i) => {
            const isActive = s.num === P.sealNum
            const sc = SEAL_COLORS[s.color]
            return (
              <div key={i} style={{
                ...S.row,
                display: 'grid', gridTemplateColumns: '28px 28px 90px 80px 80px 70px 55px', gap: 8,
                borderColor: isActive ? 'rgba(201,168,76,.2)' : 'rgba(255,255,255,.04)',
                background: isActive ? 'rgba(201,168,76,.06)' : 'rgba(255,255,255,.02)',
              }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12, textAlign: 'center', color: isActive ? 'var(--gold)' : sc }}>
                  {s.num}
                </span>
                <span style={{ fontSize: 16, textAlign: 'center' }}>{s.glyph}</span>
                <span style={{ ...S.mono, color: isActive ? 'var(--gold)' : 'var(--gold2)', fontWeight: isActive ? 700 : 400 }}>
                  {s.name}
                </span>
                <span style={{ ...S.monoSm, fontSize: 10 }}>{s.action}</span>
                <span style={{ ...S.monoSm, fontSize: 10 }}>{s.power}</span>
                <span style={{ ...S.monoSm, fontSize: 10, color: sc }}>{s.earthFamily}</span>
                <span style={{ ...S.monoSm, fontSize: 10, color: sc }}>{s.direction}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 13 GALACTIC TONES */}
      <div>
        <div style={S.sectionTitle}>The 13 Galactic Tones</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {GALACTIC_TONES.map((t, i) => {
            const isActive = t.number === P.toneNum
            return (
              <div key={i} style={{
                ...S.row,
                borderColor: isActive ? 'rgba(201,168,76,.2)' : 'rgba(255,255,255,.04)',
                background: isActive ? 'rgba(201,168,76,.06)' : 'rgba(255,255,255,.02)',
              }}>
                <div style={{ minWidth: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <ToneNotation tone={t.number} size={4} color={isActive ? 'var(--gold)' : 'rgba(201,168,76,.25)'} />
                </div>
                <span style={{
                  fontSize: 14, minWidth: 24, textAlign: 'center',
                  fontFamily: "'Cinzel', serif",
                  color: isActive ? 'var(--gold)' : 'var(--text3)',
                  fontWeight: isActive ? 700 : 400,
                }}>{t.number}</span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ ...S.mono, color: isActive ? 'var(--gold)' : 'var(--gold2)', fontSize: 13 }}>
                      {t.name}
                    </span>
                    <span style={S.badge(
                      isActive ? 'rgba(201,168,76,.1)' : 'rgba(255,255,255,.04)',
                      isActive ? 'rgba(201,168,76,.25)' : 'rgba(255,255,255,.08)',
                      isActive ? 'var(--gold)' : 'var(--text3)',
                    )}>{t.keyword}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.4 }}>
                    {t.action} {'\u00B7'} {t.power}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5 CASTLES */}
      <div>
        <div style={S.sectionTitle}>The Five Castles</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CASTLES.map((c, i) => {
            const isActive = c.num === P.castle.num
            return (
              <div key={i} style={{
                ...S.row,
                borderColor: isActive ? c.color + '44' : 'rgba(255,255,255,.04)',
                background: isActive ? c.color + '0c' : 'rgba(255,255,255,.02)',
              }}>
                <span style={{
                  fontFamily: "'Cinzel', serif", fontSize: 16, minWidth: 28, textAlign: 'center',
                  color: isActive ? c.color : c.color + '66',
                }}>{c.num}</span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ ...S.mono, color: isActive ? c.color : 'var(--text2)', fontSize: 12, fontWeight: isActive ? 700 : 400 }}>
                    {c.name}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text3)', fontStyle: 'italic' }}>
                    Court of {c.court} {'\u00B7'} Kins {c.range[0]}{'\u2013'}{c.range[1]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* READING */}
      <div>
        <div style={S.sectionTitle}>Your Dreamspell Reading</div>
        <div style={S.interpretation}>
          As <span style={{ color: 'var(--gold)' }}>Kin {P.kin} {'\u2014'} {P.signature}</span>, you carry
          the highest galactic signature in the entire Tzolkin: the last kin of the 260-day cycle, embodying the
          completion and transcendence of all that came before. The{' '}
          <span style={{ color: sealCol }}>{seal.name} seal ({seal.mayanName})</span> represents{' '}
          {seal.power.toLowerCase()} {'\u2014'} the force of enlightenment and universal fire. As{' '}
          <span style={{ color: 'var(--gold)' }}>Tone 13 (Cosmic)</span>, you{' '}
          {tone.action.toLowerCase()} in order to {seal.action.toLowerCase()},{' '}
          {tone.power.toLowerCase()}ing the power of {seal.power.toLowerCase()}.{' '}
          Your oracle cross reveals{' '}
          <span style={{ color: '#88dd44' }}>{P.oracle.guide.signature}</span> as your Guide (higher self),
          pointing you toward the patient flowering of awareness;{' '}
          <span style={{ color: 'var(--gold)' }}>{P.oracle.analog.signature}</span> as your Analog (support),
          the primordial nurturing energy that births new cycles;{' '}
          <span style={{ color: '#ee5544' }}>{P.oracle.antipode.signature}</span> as your Antipode (challenge),
          pushing you through the lens of unconditional love and heart; and{' '}
          <span style={{ color: 'var(--aqua2)' }}>{P.oracle.occult.signature}</span> as your Occult (hidden power),
          the magnetic origin of creation itself.{' '}
          You walk within the{' '}
          <span style={{ color: P.castle.color }}>{P.castle.name}</span>,
          the Court of {P.castle.court} {'\u2014'} the final castle where all threads converge
          into synchronized wholeness. The{' '}
          <span style={{ color: 'var(--gold2)' }}>{P.wavespell.name} Wavespell</span> infuses your
          journey with the power of {P.wavespell.seal.power.toLowerCase()}, beautifying every step
          of the path toward cosmic presence.
        </div>
      </div>
    </div>
  )
}
