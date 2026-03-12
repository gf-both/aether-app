import { useState } from 'react'
import { useAboveInsideStore } from '../store/useAboveInsideStore'

/* ── Mock Data ── */
const MOCK_CLIENTS = [
  { id: 1, name: 'Elena Vasquez', emoji: '\u2648', sign: 'Aries', lastSession: '2026-02-28', nextFollowUp: '2026-03-12', paymentStatus: 'paid', lastPayment: 150, totalPaid: 1800, notes: 'Working on shadow integration with Gene Keys' },
  { id: 2, name: 'Marco Chen', emoji: '\u264B', sign: 'Cancer', lastSession: '2026-03-01', nextFollowUp: '2026-03-08', paymentStatus: 'pending', lastPayment: 0, totalPaid: 900, notes: 'HD authority deep-dive, emotional wave patterns' },
  { id: 3, name: 'Sofia Andersen', emoji: '\u264D', sign: 'Virgo', lastSession: '2026-02-20', nextFollowUp: '2026-03-06', paymentStatus: 'paid', lastPayment: 200, totalPaid: 2400, notes: 'Kabbalah tree mapping, Tiphareth integration' },
  { id: 4, name: 'James Okafor', emoji: '\u2653', sign: 'Pisces', lastSession: '2026-03-03', nextFollowUp: '2026-03-17', paymentStatus: 'paid', lastPayment: 150, totalPaid: 600, notes: 'New client \u2014 natal chart + HD introductory reading' },
  { id: 5, name: 'Aria Nakamura', emoji: '\u264E', sign: 'Libra', lastSession: '2026-02-15', nextFollowUp: '2026-03-15', paymentStatus: 'pending', lastPayment: 0, totalPaid: 3200, notes: 'Long-term client, working on enneagram integration' },
  { id: 6, name: 'David Kim', emoji: '\u2651', sign: 'Capricorn', lastSession: '2026-03-04', nextFollowUp: '2026-03-11', paymentStatus: 'paid', lastPayment: 175, totalPaid: 1050, notes: 'Transits focus \u2014 Saturn return preparation' },
]

const MOCK_SESSIONS = [
  { id: 1, clientName: 'Sofia Andersen', date: '2026-02-20', summary: 'Deep dive into Kabbalah Tree of Life mapping. Explored Tiphareth as the central integration point. Sofia resonated strongly with the Beauty/Harmony archetype. Connected this to her Virgo Sun\u2019s drive for perfection through service.', actionItems: [
    { text: 'Review Netzach-Hod polarity homework', done: true },
    { text: 'Prepare Sephiroth meditation sequence', done: false },
    { text: 'Send reading summary via email', done: true },
  ]},
  { id: 2, clientName: 'David Kim', date: '2026-03-04', summary: 'Saturn Return preparation session. Reviewed natal Saturn placement (Capricorn, 4th house) and upcoming transit implications. Discussed restructuring themes around home, family foundations, and career-home balance.', actionItems: [
    { text: 'Create Saturn Return timeline document', done: false },
    { text: 'Recommend journaling prompts for 4th house themes', done: false },
    { text: 'Schedule follow-up before exact Saturn conjunction', done: false },
  ]},
  { id: 3, clientName: 'Elena Vasquez', date: '2026-02-28', summary: 'Gene Keys shadow integration work. Focused on Gate 41 (Contraction \u2192 Anticipation \u2192 Emanation). Elena identified patterns of financial contraction linked to the shadow frequency. Began re-framing through the gift of Anticipation.', actionItems: [
    { text: 'Send Gene Keys 41 contemplation guide', done: true },
    { text: 'Follow up on dream journal patterns', done: false },
    { text: 'Prepare synastry reading with partner', done: false },
  ]},
  { id: 4, clientName: 'James Okafor', date: '2026-03-03', summary: 'Introductory reading combining natal chart and Human Design. James is a 6/2 Generator with Sacral Authority. Explored his Pisces Sun\u2019s intuitive gifts and how his Generator strategy (respond, don\u2019t initiate) can help him avoid burnout in his creative work.', actionItems: [
    { text: 'Send HD bodygraph PDF', done: true },
    { text: 'Recommend books on Generator strategy', done: false },
    { text: 'Schedule Gene Keys session for next month', done: false },
  ]},
]

const MOCK_FOLLOWUPS = [
  { id: 1, clientName: 'Sofia Andersen', lastSummary: 'Kabbalah tree mapping session', suggestedMessage: 'Hi Sofia, following up on our Kabbalah session. Have you been practicing the Tiphareth meditation? I\u2019d love to hear how the Netzach-Hod polarity work is landing for you. Ready for our next session when you are.', status: 'pending' },
  { id: 2, clientName: 'Marco Chen', lastSummary: 'HD emotional wave deep-dive', suggestedMessage: 'Hey Marco, checking in on your emotional wave tracking. Have you noticed the patterns we discussed? Remember \u2014 clarity comes at the bottom of the wave. Let\u2019s schedule our next session to review your observations.', status: 'pending' },
  { id: 3, clientName: 'Elena Vasquez', lastSummary: 'Gene Keys shadow integration', suggestedMessage: 'Hi Elena, how is the Gate 41 contemplation going? I\u2019d love to hear if you\u2019ve noticed the shift from Contraction to Anticipation in your daily experience. Also, shall we proceed with the synastry reading?', status: 'sent' },
  { id: 4, clientName: 'Aria Nakamura', lastSummary: 'Enneagram integration session', suggestedMessage: 'Hi Aria, it\u2019s been a few weeks since our last session. I\u2019ve been thinking about the enneagram integration points we discussed. Would you like to schedule a follow-up to explore the instinctual variants?', status: 'completed' },
]

const MOCK_REFERRAL_NETWORK = [
  { id: 1, name: 'Dr. Lin Wei', specialty: 'Acupuncturist', focus: 'Traditional Chinese Medicine, Meridian Therapy', contact: '+1 (555) 234-5678', emoji: '\uD83E\uDE7B' },
  { id: 2, name: 'Maria Santos', specialty: 'Massage Therapist', focus: 'Craniosacral, Myofascial Release', contact: '+1 (555) 345-6789', emoji: '\uD83D\uDC86' },
  { id: 3, name: 'Kai Brennan', specialty: 'Energy Healer', focus: 'Reiki Master, Pranic Healing', contact: '+1 (555) 456-7890', emoji: '\u2728' },
  { id: 4, name: 'Dr. Amara Obi', specialty: 'Nutritionist', focus: 'Ayurvedic Nutrition, Functional Medicine', contact: '+1 (555) 567-8901', emoji: '\uD83C\uDF3F' },
  { id: 5, name: 'Tara Sullivan', specialty: 'Somatic Therapist', focus: 'Breathwork, Trauma Release', contact: '+1 (555) 678-9012', emoji: '\uD83C\uDF2C\uFE0F' },
  { id: 6, name: 'Raj Patel', specialty: 'Yoga Therapist', focus: 'Kundalini, Therapeutic Yoga', contact: '+1 (555) 789-0123', emoji: '\uD83E\uDDD8' },
]

/* ── Styles ── */
const s = {
  container: {
    padding: '24px', overflow: 'auto', height: '100%',
    fontFamily: "'Cormorant Garamond',serif",
  },
  sectionTitle: {
    fontFamily: "'Cinzel',serif", fontSize: '13px', letterSpacing: '.2em',
    color: 'var(--gold)', marginBottom: '16px', textTransform: 'uppercase',
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  sectionDivider: {
    height: '1px', background: 'linear-gradient(90deg, rgba(201,168,76,.2), transparent)',
    margin: '28px 0',
  },
  card: {
    background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)',
    borderRadius: '12px', padding: '16px', transition: 'all .2s',
  },
  cardHover: {
    borderColor: 'rgba(201,168,76,.2)', background: 'rgba(201,168,76,.03)',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
  },
  clientAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', flexShrink: 0,
    background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.15)',
  },
  badge: (color) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
    fontSize: '9px', letterSpacing: '.08em', fontFamily: "'Cinzel',serif",
    background: color === 'green' ? 'rgba(96,176,48,.12)' : 'rgba(240,160,60,.12)',
    border: `1px solid ${color === 'green' ? 'rgba(96,176,48,.3)' : 'rgba(240,160,60,.3)'}`,
    color: color === 'green' ? '#7bc043' : '#f0a03c',
  }),
  actionBtn: {
    padding: '4px 10px', borderRadius: '8px', fontSize: '9px',
    fontFamily: "'Cinzel',serif", letterSpacing: '.08em',
    background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.15)',
    color: 'var(--gold2)', cursor: 'pointer', transition: 'all .2s',
  },
  actionBtnAqua: {
    background: 'rgba(64,204,221,.06)', border: '1px solid rgba(64,204,221,.2)',
    color: 'rgba(64,204,221,.8)',
  },
  actionBtnGreen: {
    background: 'rgba(96,176,48,.06)', border: '1px solid rgba(96,176,48,.2)',
    color: '#7bc043',
  },
  statBox: {
    padding: '20px', borderRadius: '12px', textAlign: 'center',
    background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)',
  },
  statVal: {
    fontFamily: "'Cinzel',serif", fontSize: '28px', color: 'var(--gold)',
    lineHeight: 1, marginBottom: '6px',
  },
  statLabel: {
    fontSize: '11px', color: 'var(--text2)', letterSpacing: '.06em',
  },
  textarea: {
    width: '100%', background: 'rgba(255,255,255,.03)',
    border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px',
    padding: '8px 12px', color: 'var(--text)', fontSize: '12px',
    fontFamily: "'Cormorant Garamond',serif", resize: 'vertical',
    outline: 'none', minHeight: '60px', lineHeight: '1.5',
  },
  checkbox: {
    width: '14px', height: '14px', accentColor: 'var(--gold)', cursor: 'pointer',
    flexShrink: 0,
  },
  statusChip: (status) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
    fontSize: '9px', letterSpacing: '.06em', fontFamily: "'Cinzel',serif",
    background: status === 'completed' ? 'rgba(96,176,48,.1)' : status === 'sent' ? 'rgba(64,204,221,.1)' : 'rgba(240,160,60,.1)',
    border: `1px solid ${status === 'completed' ? 'rgba(96,176,48,.25)' : status === 'sent' ? 'rgba(64,204,221,.25)' : 'rgba(240,160,60,.25)'}`,
    color: status === 'completed' ? '#7bc043' : status === 'sent' ? 'rgba(64,204,221,.8)' : '#f0a03c',
  }),
}

/* ── Sub-components ── */

function ClientCard({ client }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{ ...s.card, ...(hovered ? s.cardHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={s.clientAvatar}>{client.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: '12px', color: 'var(--text)', letterSpacing: '.06em' }}>
            {client.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{client.sign} Sun</div>
        </div>
        <span style={s.badge(client.paymentStatus === 'paid' ? 'green' : 'orange')}>
          {client.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px', fontSize: '11px' }}>
        <div><span style={{ color: 'var(--text3)' }}>Last session:</span> <span style={{ color: 'var(--text2)' }}>{client.lastSession}</span></div>
        <div><span style={{ color: 'var(--text3)' }}>Next follow-up:</span> <span style={{ color: 'var(--text2)' }}>{client.nextFollowUp}</span></div>
        <div><span style={{ color: 'var(--text3)' }}>Last payment:</span> <span style={{ color: 'var(--gold2)' }}>${client.lastPayment}</span></div>
        <div><span style={{ color: 'var(--text3)' }}>Total paid:</span> <span style={{ color: 'var(--gold)' }}>${client.totalPaid.toLocaleString()}</span></div>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text2)', fontStyle: 'italic', marginBottom: '12px', lineHeight: 1.5 }}>
        {client.notes}
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <div style={s.actionBtn}>View Profile</div>
        <div style={{ ...s.actionBtn, ...s.actionBtnAqua }}>Schedule</div>
        <div style={{ ...s.actionBtn, ...s.actionBtnGreen }}>Message</div>
      </div>
    </div>
  )
}

function SessionCard({ session }) {
  const [items, setItems] = useState(session.actionItems)
  const [summary, setSummary] = useState(session.summary)

  function toggleItem(idx) {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, done: !item.done } : item))
  }

  return (
    <div style={s.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: '11px', color: 'var(--text)', letterSpacing: '.06em' }}>
            {session.clientName}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text3)', marginLeft: '10px' }}>{session.date}</span>
        </div>
        <div style={{ ...s.actionBtn, fontSize: '8px' }}>{'\uD83C\uDF99\uFE0F'} Record Meeting</div>
      </div>

      <textarea
        style={s.textarea}
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />

      <div style={{ marginTop: '10px' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '9px', letterSpacing: '.1em', color: 'var(--gold2)', marginBottom: '6px' }}>
          ACTION ITEMS
        </div>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggleItem(i)}
              style={s.checkbox}
            />
            <span style={{
              fontSize: '11px', color: item.done ? 'var(--text3)' : 'var(--text2)',
              textDecoration: item.done ? 'line-through' : 'none',
              transition: 'all .2s',
            }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FollowUpCard({ followUp, onUpdateStatus }) {
  return (
    <div style={s.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: '11px', color: 'var(--text)', letterSpacing: '.06em' }}>
          {followUp.clientName}
        </span>
        <span style={s.statusChip(followUp.status)}>
          {followUp.status}
        </span>
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '8px' }}>
        Last: {followUp.lastSummary}
      </div>
      <div style={{
        fontSize: '11px', color: 'var(--text2)', lineHeight: 1.6,
        padding: '10px 12px', borderRadius: '8px',
        background: 'rgba(201,168,76,.03)', border: '1px solid rgba(201,168,76,.06)',
        marginBottom: '10px', fontStyle: 'italic',
      }}>
        {followUp.suggestedMessage}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <div style={{ ...s.actionBtn, ...s.actionBtnGreen }}>{'\uD83D\uDCF1'} Send via WhatsApp</div>
        <div
          style={{ ...s.actionBtn }}
          onClick={() => onUpdateStatus(followUp.id, 'completed')}
        >
          {'\u2713'} Mark Complete
        </div>
      </div>
    </div>
  )
}

function ReferralCard({ referral }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{ ...s.card, ...(hovered ? s.cardHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ fontSize: '24px' }}>{referral.emoji}</div>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: '11px', color: 'var(--text)', letterSpacing: '.06em' }}>
            {referral.name}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--gold2)' }}>{referral.specialty}</div>
        </div>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '6px' }}>{referral.focus}</div>
      <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '10px', fontFamily: "'Inconsolata',monospace" }}>
        {referral.contact}
      </div>
      <div style={{ ...s.actionBtn, ...s.actionBtnGreen, display: 'inline-block' }}>
        {'\uD83D\uDCF1'} Introduce via WhatsApp
      </div>
    </div>
  )
}

/* ── Main Component ── */
export default function PractitionerPortal() {
  const profile = useAboveInsideStore((s) => s.primaryProfile)
  const [followUps, setFollowUps] = useState(MOCK_FOLLOWUPS)
  const [activeTab, setActiveTab] = useState('clients')

  function updateFollowUpStatus(id, newStatus) {
    setFollowUps((prev) =>
      prev.map((fu) => (fu.id === id ? { ...fu, status: newStatus } : fu))
    )
  }

  // Revenue calculations
  const totalClients = MOCK_CLIENTS.length
  const activeSubscriptions = MOCK_CLIENTS.filter((c) => c.paymentStatus === 'paid').length
  const revenueMonth = MOCK_CLIENTS.reduce((sum, c) => sum + c.lastPayment, 0)
  const revenueTotal = MOCK_CLIENTS.reduce((sum, c) => sum + c.totalPaid, 0)

  const tabs = [
    { id: 'clients', label: 'Clients', icon: '\uD83D\uDC65' },
    { id: 'sessions', label: 'Sessions', icon: '\uD83D\uDCDD' },
    { id: 'followups', label: 'Follow-ups', icon: '\uD83D\uDD14' },
    { id: 'revenue', label: 'Revenue', icon: '\uD83D\uDCB0' },
    { id: 'referrals', label: 'Referrals', icon: '\uD83E\uDD1D' },
  ]

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '18px', letterSpacing: '.15em', color: 'var(--gold)', marginBottom: '4px' }}>
          {'\uD83C\uDFE5'} Practitioner Portal
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
          Welcome back, {profile.name.split(' ')[0]}. Manage your practice, clients, and sessions.
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '7px 16px', borderRadius: '20px', fontSize: '11px',
              fontFamily: "'Cinzel',serif", letterSpacing: '.06em', cursor: 'pointer',
              transition: 'all .2s',
              background: activeTab === tab.id ? 'rgba(201,168,76,.12)' : 'rgba(255,255,255,.03)',
              border: `1px solid ${activeTab === tab.id ? 'rgba(201,168,76,.3)' : 'rgba(255,255,255,.06)'}`,
              color: activeTab === tab.id ? 'var(--gold)' : 'var(--text2)',
            }}
          >
            {tab.icon} {tab.label}
          </div>
        ))}
      </div>

      {/* ── CLIENT LIST ── */}
      {activeTab === 'clients' && (
        <>
          <div style={s.sectionTitle}>
            <span>{'\uD83D\uDC65'}</span> Client List
          </div>
          <div style={s.grid}>
            {MOCK_CLIENTS.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        </>
      )}

      {/* ── SESSION NOTES ── */}
      {activeTab === 'sessions' && (
        <>
          <div style={s.sectionTitle}>
            <span>{'\uD83D\uDCDD'}</span> Session Notes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {MOCK_SESSIONS.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </>
      )}

      {/* ── FOLLOW-UPS ── */}
      {activeTab === 'followups' && (
        <>
          <div style={s.sectionTitle}>
            <span>{'\uD83D\uDD14'}</span> Follow-up Queue
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {followUps.map((fu) => (
              <FollowUpCard key={fu.id} followUp={fu} onUpdateStatus={updateFollowUpStatus} />
            ))}
          </div>
        </>
      )}

      {/* ── REVENUE DASHBOARD ── */}
      {activeTab === 'revenue' && (
        <>
          <div style={s.sectionTitle}>
            <span>{'\uD83D\uDCB0'}</span> Revenue Dashboard
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <div style={s.statBox}>
              <div style={s.statVal}>{totalClients}</div>
              <div style={s.statLabel}>Total Clients</div>
            </div>
            <div style={s.statBox}>
              <div style={s.statVal}>{activeSubscriptions}</div>
              <div style={s.statLabel}>Active (Paid)</div>
            </div>
            <div style={s.statBox}>
              <div style={{ ...s.statVal, color: '#7bc043' }}>${revenueMonth.toLocaleString()}</div>
              <div style={s.statLabel}>Revenue This Month</div>
            </div>
            <div style={s.statBox}>
              <div style={{ ...s.statVal, color: 'var(--gold)' }}>${revenueTotal.toLocaleString()}</div>
              <div style={s.statLabel}>Revenue Total</div>
            </div>
          </div>

          {/* Revenue breakdown */}
          <div style={s.card}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '10px', letterSpacing: '.1em', color: 'var(--gold2)', marginBottom: '12px' }}>
              CLIENT REVENUE BREAKDOWN
            </div>
            {MOCK_CLIENTS.sort((a, b) => b.totalPaid - a.totalPaid).map((client) => (
              <div key={client.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)',
              }}>
                <span style={{ fontSize: '14px' }}>{client.emoji}</span>
                <span style={{ flex: 1, fontSize: '12px', color: 'var(--text)' }}>{client.name}</span>
                <span style={s.badge(client.paymentStatus === 'paid' ? 'green' : 'orange')}>
                  {client.paymentStatus}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--gold)', fontFamily: "'Inconsolata',monospace", minWidth: '70px', textAlign: 'right' }}>
                  ${client.totalPaid.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── REFERRAL NETWORK ── */}
      {activeTab === 'referrals' && (
        <>
          <div style={s.sectionTitle}>
            <span>{'\uD83E\uDD1D'}</span> Referral Network
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '16px', lineHeight: 1.5 }}>
            Your trusted network of complementary practitioners. Introduce clients for holistic care.
          </div>
          <div style={s.grid}>
            {MOCK_REFERRAL_NETWORK.map((referral) => (
              <ReferralCard key={referral.id} referral={referral} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
