export default function ScoreRow({ label, val, gradient }) {
  const pct = typeof val === 'string' && val.endsWith('%') ? val : null
  const numPct = pct ? parseInt(pct) : 60
  return (
    <div className="score-row">
      <div className="score-label">
        <span className="score-name">{label}</span>
        <span className="score-val">{val}</span>
      </div>
      <div className="score-track">
        <div className="score-fill" style={{ width: `${numPct}%`, background: gradient }} />
      </div>
    </div>
  )
}
