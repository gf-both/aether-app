import ProfilePanel from '../overlays/ProfilePanel'

export default function ProfileDetail() {
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <ProfilePanel open={true} onClose={() => {}} embedded />
    </div>
  )
}
