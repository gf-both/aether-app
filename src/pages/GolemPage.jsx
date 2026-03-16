export default function GolemPage() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', gap: 24, padding: 40, textAlign: 'center',
    }}>
      <div style={{ fontSize: 64, lineHeight: 1 }}>🪬</div>
      <div style={{
        fontFamily: "'Cinzel',serif", fontSize: 18, letterSpacing: '.2em',
        textTransform: 'uppercase', color: 'var(--gold)',
      }}>Golem</div>
      <div style={{
        fontSize: 13, color: 'rgba(255,255,255,.5)', maxWidth: 420, lineHeight: 1.7,
      }}>
        In Kabbalistic tradition, a Golem is an animated being brought to life through sacred inscription.
        <br /><br />
        Yours is built from your cosmic profile — your birth chart, Human Design, Gene Keys, and more.
        It thinks like you. It has your blind spots. It speaks from your values.
        <br /><br />
        <span style={{ color: 'rgba(201,168,76,.6)', fontStyle: 'italic' }}>Coming soon — your clone will be ready to speak.</span>
      </div>
      <div style={{
        padding: '10px 28px', borderRadius: 10,
        background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.2)',
        fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '.15em',
        color: 'rgba(201,168,76,.4)', textTransform: 'uppercase',
      }}>In Development</div>
    </div>
  )
}
