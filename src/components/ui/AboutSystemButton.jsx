import { useState } from 'react'

/* ─── System descriptions: name, summary, origin ──────────────────────────── */
const SYSTEM_INFO = {
  'Natal Astrology': {
    icon: '☉',
    summary: 'The study of celestial body positions at the moment of birth to map personality, life patterns, and timing. Your natal chart is a snapshot of the sky — Sun, Moon, planets, and rising sign — frozen at the exact time and place you were born.',
    origin: 'Originated in ancient Mesopotamia (c. 2000 BCE), refined by Hellenistic Greeks, and transmitted through Islamic scholars to medieval Europe. The Western tropical zodiac system traces to Ptolemy\'s Tetrabiblos (2nd century CE).',
  },
  'Human Design': {
    icon: '△',
    summary: 'A synthesis of astrology, the I Ching, Kabbalah, Hindu-Brahmin chakra system, and quantum physics. It maps your energetic type, decision-making authority, and life strategy through a bodygraph of 9 centers, 36 channels, and 64 gates.',
    origin: 'Received by Ra Uru Hu (Robert Allan Krakower) in Ibiza in January 1987 during an 8-day mystical experience. He called the source "The Voice." Published as "The Human Design System" in 1992.',
  },
  'Kabbalah': {
    icon: '✡',
    summary: 'The Tree of Life maps 10 divine attributes (Sephirot) connected by 22 paths, representing the architecture of creation and consciousness. Each person\'s birth data activates specific paths, revealing their spiritual blueprint.',
    origin: 'Rooted in Jewish mystical tradition dating to the 1st century CE Merkabah literature. The Sefer Yetzirah (3rd–6th century) and the Zohar (13th century, Moses de León) are foundational texts. The Tree of Life diagram emerged from medieval Kabbalistic schools.',
  },
  'Gene Keys': {
    icon: '⬢',
    summary: 'A contemplative system based on the 64 hexagrams of the I Ching, mapping a spectrum from Shadow (unconscious patterns) through Gift (awakened potential) to Siddhi (highest expression) for each of 64 archetypes. Your Hologenetic Profile reveals three sequences: Activation, Venus, and Pearl.',
    origin: 'Created by Richard Rudd, first published in 2009. Emerged from a synthesis of Human Design gates, the I Ching, and decades of contemplative practice. Rudd describes it as a "transmission" that arrived during a period of deep meditation.',
  },
  'Enneagram': {
    icon: '⊘',
    summary: 'A personality typology of 9 interconnected types, each with a core motivation, fear, and growth path. Includes wings (adjacent types), instinctual variants (self-preservation, sexual, social), and lines of integration/disintegration.',
    origin: 'Ancient roots in Pythagorean mathematics and Sufi mysticism (9-pointed figure). Modern psychological typology developed by Oscar Ichazo (1960s, Arica Institute) and Claudio Naranjo (1970s, integrating Gestalt psychology). Popularized by Don Riso and Russ Hudson.',
  },
  'Myers-Briggs': {
    icon: '⧫',
    summary: 'A cognitive function model based on Carl Jung\'s theory of psychological types. Maps preferences across four axes — Extraversion/Introversion, Sensing/Intuition, Thinking/Feeling, Judging/Perceiving — producing 16 personality types with distinct cognitive stacks.',
    origin: 'Developed by Katharine Cook Briggs and her daughter Isabel Briggs Myers during World War II (1940s), based on Carl Jung\'s 1921 work "Psychological Types." The MBTI instrument was first published in 1962.',
  },
  'Numerology': {
    icon: '∞',
    summary: 'The study of numbers as carriers of vibrational meaning. Your Life Path (from birth date), Expression (from full name), and Soul Urge (from vowels) numbers reveal core patterns, challenges, and life purpose through mathematical reduction.',
    origin: 'Traces to Pythagoras (6th century BCE, Greece), who taught that numbers are the foundation of reality. Modern Western numerology was systematized by L. Dow Balliett (early 1900s) and popularized by Juno Jordan and Ruth Drayer.',
  },
  'Chinese Astrology': {
    icon: '☰',
    summary: 'A system of 12 animal signs and 5 elements cycling through 60-year periods. Your birth year determines your animal sign and element, revealing character traits, compatibility, and life rhythms. Includes Yin/Yang polarity and seasonal associations.',
    origin: 'Originated in the Han Dynasty (206 BCE – 220 CE), integrated with the Five Element theory (Wuxing) and the Chinese calendar. The 12-animal zodiac legend dates to the Jade Emperor myth. Deeply embedded in Chinese culture for over 2,000 years.',
  },
  'Egyptian Astrology': {
    icon: '𓂀',
    summary: 'Based on the ancient Egyptian calendar and mythology, this system assigns one of 12 deity archetypes based on birth date. Each deity carries specific qualities, strengths, weaknesses, and sacred associations that shape personality and destiny.',
    origin: 'Rooted in ancient Egyptian cosmology and the Dendera zodiac (c. 50 BCE). The 12 deity signs derive from the Egyptian calendar\'s decans. Modern reconstruction draws from Egyptological research and surviving temple inscriptions.',
  },
  'Mayan Calendar': {
    icon: '⊿',
    summary: 'The Tzolkin is a 260-day sacred calendar combining 20 day signs (solar seals) with 13 galactic tones to produce 260 unique kin signatures. Your Galactic Signature reveals your cosmic purpose, creative power, and energetic role.',
    origin: 'Developed by the ancient Maya civilization (c. 2000 BCE – 1500 CE) in Mesoamerica. The Tzolkin calendar was used for divination, agriculture, and ceremonial timing. Modern interpretation popularized by José Argüelles (1987, "The Mayan Factor").',
  },
  'Vedic Astrology': {
    icon: 'ॐ',
    summary: 'Jyotish (the "science of light") uses the sidereal zodiac to map planetary positions with high precision. Includes dashas (planetary periods), nakshatras (lunar mansions), and yogas (planetary combinations) for detailed life prediction and spiritual guidance.',
    origin: 'One of the six Vedāṅgas (limbs of the Vedas), dating to at least 1500 BCE in ancient India. The Brihat Parashara Hora Shastra and Surya Siddhanta are foundational texts. Jyotish remains a living tradition with unbroken lineage.',
  },
  'Tibetan Astrology': {
    icon: '☸',
    summary: 'Combines elements from Chinese and Indian astrology with indigenous Bön tradition. Maps a 12-animal, 5-element cycle with unique Tibetan additions: Mewa (magic squares), Parkha (trigrams), and La (soul force) calculations.',
    origin: 'Developed in Tibet from the 7th century CE onward, blending Indian Kalachakra astrology, Chinese 5-element theory, and pre-Buddhist Bön divination practices. Codified in the Vaidurya Karpo (17th century) by Desi Sangye Gyatso.',
  },
  'Dosha': {
    icon: '❦',
    summary: 'Ayurveda\'s constitutional typology of three doshas — Vata (air/space), Pitta (fire/water), Kapha (earth/water) — that govern physical, mental, and emotional tendencies. Your prakriti (birth constitution) reveals your natural balance and health patterns.',
    origin: 'Part of Ayurveda, the ancient Indian medical system dating to the Charaka Samhita and Sushruta Samhita (c. 600 BCE – 200 CE). Rooted in the Sankhya philosophy of the five elements. Practiced continuously for over 3,000 years.',
  },
  'Archetype': {
    icon: '⊞',
    summary: 'Based on Carl Jung\'s theory of archetypes — universal patterns in the collective unconscious. The 12 primary archetypes (Ruler, Creator, Sage, Explorer, etc.) represent fundamental human motivations and behaviors that shape how you engage with the world.',
    origin: 'Theorized by Carl Gustav Jung (1919, "Instinct and the Unconscious") and developed across his major works. The 12-archetype system was popularized by Carol S. Pearson ("The Hero Within," 1986) and Margaret Mark ("The Hero and the Outlaw," 2001).',
  },
  'Love Language': {
    icon: '♡',
    summary: 'A framework identifying five primary ways people express and receive love: Words of Affirmation, Quality Time, Receiving Gifts, Acts of Service, and Physical Touch. Understanding your primary language reveals how you connect most deeply.',
    origin: 'Developed by Dr. Gary Chapman, first published in "The Five Love Languages" (1992). Based on his experience as a marriage counselor and pastor. Has sold over 20 million copies and been translated into 50 languages.',
  },
  'Gematria': {
    icon: 'א',
    summary: 'An alphanumeric coding system that assigns numerical values to letters, words, and phrases. Used to reveal hidden connections between concepts that share the same numerical value. Applied to names, birth data, and sacred texts.',
    origin: 'Originated in ancient Assyro-Babylonian culture, adopted into Hebrew mysticism by the 2nd century CE. Extensively used in Kabbalistic interpretation of Torah. The term derives from Greek "geometria." Also practiced in Greek (isopsephy) and Arabic (abjad) traditions.',
  },
  'Transits': {
    icon: '☽',
    summary: 'The study of current planetary movements in relation to your natal chart. Transits reveal active themes, challenges, and opportunities as planets form aspects (angles) to your birth positions. Used for timing decisions and understanding life phases.',
    origin: 'An integral part of Western astrology since the Hellenistic period (c. 200 BCE). Transit interpretation evolved through Ptolemy, medieval Arabic astrologers, and modern psychological astrology (Dane Rudhyar, 1930s). Every astrologer uses transits.',
  },
  'Patterns': {
    icon: '⊛',
    summary: 'GOLEM\'s cross-framework pattern recognition engine. Detects alignments, tensions, and synchronicities across all your esoteric systems simultaneously. Reveals where independent frameworks converge on the same truth about you.',
    origin: 'Original to GOLEM. Built on the principle that when multiple unrelated symbolic systems point to the same pattern, the signal is stronger than any single framework alone. Computation-driven meta-synthesis.',
  },
  'Cycle': {
    icon: '◑',
    summary: 'Tracks menstrual cycle phases in relation to lunar cycles and astrological transits. Maps physical, emotional, and creative energy levels across the cycle, connecting biological rhythm to cosmic timing.',
    origin: 'Integrates modern cycle-tracking science with ancient lunar wisdom traditions. The connection between menstrual and lunar cycles has been observed across cultures for millennia, from Greek temple medicine to Traditional Chinese Medicine.',
  },
  'Dreams': {
    icon: '◌',
    summary: 'A dream journal and pattern tracker that maps recurring symbols, themes, and emotional textures across your dream life. Connects dream content to active transits, life events, and archetypal patterns.',
    origin: 'Dream interpretation spans all human cultures. Key frameworks include Artemidorus\' Oneirocritica (2nd century CE), Freud\'s "Interpretation of Dreams" (1900), Jung\'s active imagination method, and modern neuroscientific approaches.',
  },
  'Synchronicities': {
    icon: '⟡',
    summary: 'A tracker for meaningful coincidences — events that feel connected not by cause and effect but by meaning. Maps synchronicities to active transits, numerological patterns, and life themes to reveal the acausal ordering principle.',
    origin: 'Coined by Carl Jung in 1930, fully developed in his 1952 essay "Synchronicity: An Acausal Connecting Principle," co-published with physicist Wolfgang Pauli. Jung saw synchronicity as evidence of the unus mundus — the underlying unity of mind and matter.',
  },
  'Frequency': {
    icon: '♫',
    summary: 'Sound therapy and frequency healing using precise tonal frequencies. Each frequency corresponds to specific chakras, planetary bodies, and states of consciousness. Binaural beats and solfeggio frequencies entrain brainwave states.',
    origin: 'Rooted in Pythagorean music theory (6th century BCE), Nada Yoga (Indian sound meditation), and Tibetan singing bowl traditions. Modern frequency healing draws on Cymatics (Hans Jenny, 1967) and binaural beat research (Gerald Oster, 1973).',
  },
  'Palm Reading': {
    icon: '⊜',
    summary: 'Chiromancy — the study of hand shape, lines, mounts, and fingers to reveal character, life patterns, and potential. The major lines (heart, head, life, fate) and planetary mounts map different dimensions of personality and destiny.',
    origin: 'One of the oldest divination arts, practiced in ancient India (Samudrik Shastra, c. 3000 BCE), China, Persia, and Greece. Aristotle wrote about palmistry. Standardized in Western tradition by Cheiro (Count Louis Hamon) in the late 19th century.',
  },
  'Yantra': {
    icon: '⬙',
    summary: 'Sacred geometric diagrams used as meditation tools and visual mantras. Each yantra encodes specific cosmic energies through precise geometric relationships — triangles, circles, lotus petals, and bindu (central point).',
    origin: 'Part of the Tantric traditions of Hinduism and Buddhism, dating to at least the 5th century CE. The Sri Yantra (most complex form) represents the creative cosmos. Yantras are described in the Saundaryalahari and various Agama texts.',
  },
  'Ritual': {
    icon: '◬',
    summary: 'Personalized ritual recommendations based on your active transits, current cycle phase, and framework synthesis. Suggests ceremonies, meditations, and practices timed to your unique cosmic architecture.',
    origin: 'Ritual practice is universal to human culture. GOLEM\'s ritual engine synthesizes timing from multiple traditions — Vedic muhurta, astrological electional timing, lunar phase work, and seasonal ceremony — into personalized recommendations.',
  },
  'Career': {
    icon: '⎈',
    summary: 'Career alignment analysis drawing from your Human Design type and authority, natal chart midheaven, numerology expression number, and Gene Keys vocation sphere. Maps your ideal professional role, work style, and contribution.',
    origin: 'A GOLEM-original synthesis. Combines vocational astrology (midheaven interpretation), Human Design career strategy, and numerological expression analysis into a unified career alignment profile.',
  },
  'Golem': {
    icon: '⏣',
    summary: 'Your AI double — a digital entity shaped from your complete cosmic profile. The Golem speaks as you would if you had perfect self-awareness. Also includes your Complement (what completes you) and Antagonist (what challenges you).',
    origin: 'Named after the Golem of Jewish mysticism — a creature formed from clay and animated by sacred letters. In the Talmud and Kabbalistic tradition, creating a Golem represented the highest achievement of mystical knowledge.',
  },
  'Integral': {
    icon: '◎',
    summary: 'A unified body map that overlays all your frameworks onto a single figure. Each energy zone — crown, third eye, throat, heart, solar plexus, sacral, root — shows how multiple systems converge on the same area of your being.',
    origin: 'Inspired by Ken Wilber\'s Integral Theory (1995) and the chakra-body mapping traditions of yoga and Tantra. GOLEM\'s implementation synthesizes Western typology (Enneagram, MBTI) with Eastern energy anatomy into one visual.',
  },
  'Timeline': {
    icon: '⟿',
    summary: 'A multi-layered timeline mapping planetary transits, numerological cycles, Saturn returns, Jupiter returns, and Vedic dashas across your entire life. Reveals when major themes activate, peak, and resolve.',
    origin: 'Draws from predictive astrology (transit analysis since Ptolemy), Vedic dasha systems (Vimshottari, 120-year cycle), and numerological personal year cycles. GOLEM computes all layers simultaneously for cross-framework timing.',
  },
  'Synastry': {
    icon: '⊗',
    summary: 'The astrology of relationships. Synastry overlays two natal charts to reveal attraction, tension, growth, and healing potential between two people. Includes aspect analysis, composite charts, and compatibility scoring across multiple frameworks.',
    origin: 'Synastry has been practiced since Hellenistic astrology (c. 200 BCE). The composite chart method was developed by Robert Hand in the 1970s. GOLEM extends classical synastry with Human Design, Gene Keys, and Enneagram compatibility analysis.',
  },
}

export { SYSTEM_INFO }

export default function AboutSystemButton({ systemName }) {
  const [show, setShow] = useState(false)
  const info = SYSTEM_INFO[systemName]
  if (!info) return null

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{
          padding: '6px 14px', borderRadius: 8, cursor: 'help',
          background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)',
          color: 'var(--foreground)', fontSize: 10,
          fontFamily: "'Cinzel', serif", letterSpacing: '.08em',
          textTransform: 'uppercase', transition: 'all .2s',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontWeight: 500,
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        <span style={{ fontSize: 13, color: 'rgba(201,168,76,0.8)' }}>ⓘ</span>
        About {systemName}
      </button>
      {show && (
        <div style={{
          position: 'absolute', top: '110%', left: 0,
          zIndex: 9999, width: 340, padding: '14px 16px',
          background: 'var(--popover)', border: '1px solid rgba(201,168,76,.2)',
          borderRadius: 12, backdropFilter: 'blur(24px)',
          boxShadow: '0 12px 48px rgba(0,0,0,.7), 0 0 20px rgba(201,168,76,.06)',
          pointerEvents: 'none',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            paddingBottom: 8, borderBottom: '1px solid rgba(201,168,76,.12)',
          }}>
            <span style={{ fontSize: 18 }}>{info.icon}</span>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: '.1em',
              color: 'var(--foreground)',
            }}>{systemName}</span>
          </div>

          {/* Summary */}
          <div style={{
            fontSize: 11, lineHeight: 1.65, color: 'var(--muted-foreground)',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            marginBottom: 10,
          }}>
            {info.summary}
          </div>

          {/* Origin */}
          <div style={{
            padding: '8px 10px', borderRadius: 8,
            background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.08)',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 7, letterSpacing: '.2em',
              textTransform: 'uppercase', color: 'rgba(201,168,76,.5)', marginBottom: 4,
            }}>Origin</div>
            <div style={{
              fontSize: 10, lineHeight: 1.55, color: 'var(--muted-foreground)',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
            }}>
              {info.origin}
            </div>
          </div>

          {/* Arrow pointer */}
          <div style={{
            position: 'absolute', top: -5, left: 20,
            transform: 'rotate(-135deg)',
            width: 10, height: 10, background: 'var(--popover)',
            borderRight: '1px solid rgba(201,168,76,.2)',
            borderBottom: '1px solid rgba(201,168,76,.2)',
          }} />
        </div>
      )}
    </div>
  )
}
