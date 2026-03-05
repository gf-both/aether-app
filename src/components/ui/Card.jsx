export default function Card({ className = '', children, style, ...props }) {
  return (
    <div className={`card ${className}`} style={style} {...props}>
      {children}
    </div>
  )
}
