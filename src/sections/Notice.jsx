import { useInView } from 'motion/react'
import { useRef } from 'react'
import Highlight from '@/components/Highlight'
import './Notice.css'

const SITE = 'https://tasharuky.com'

// the sectors as tasharuky.com lists them, each opening its own filter of the projects
const SECTORS = [
  { id: 10, name: 'الطوارئ والأزمات' },
  { id: 9, name: 'الإيواء والإسكان' },
  { id: 8, name: 'التعليم والتدريب' },
  { id: 7, name: 'الحماية' },
  { id: 6, name: 'الصحة' },
  { id: 5, name: 'الأمن الغذائي' },
  { id: 4, name: 'التنمية المستدامة' },
  { id: 3, name: 'البيئة' },
]
// two slips are already gone: someone got there first
const GONE_AFTER = [1, 5]

const SLOTS = SECTORS.flatMap((s, i) => {
  const slip = { ...s, no: String(i + 1).padStart(2, '0') }
  return GONE_AFTER.includes(i) ? [slip, null] : [slip]
})

// a ragged tear, different for each stub
const tear = (seed) => {
  let x = seed * 7919
  const pts = []
  for (let k = 0; k <= 8; k++) {
    x = (x * 9301 + 49297) % 233280
    pts.push(`${(k * 12.5).toFixed(1)}% ${(70 + (x / 233280) * 30).toFixed(1)}%`)
  }
  return `polygon(0 0, 100% 0, ${pts.reverse().join(', ')})`
}

/*
 * The call to act, as a notice pinned to a wall: a photocopied flyer taped up in the
 * street, its foot cut into slips — one for each sector. Take the slip nearest to you
 * and it opens that sector's campaigns. Two slips are already torn away.
 */
export default function Notice() {
  const sheet = useRef(null)
  const seen = useInView(sheet, { once: true, amount: 0.35 })

  return (
    <section className="nt" aria-labelledby="nt-title">
      <div className="nt__sheet" ref={sheet} data-on={seen || undefined}>
        <span className="nt__tape nt__tape--r" aria-hidden="true" />
        <span className="nt__tape nt__tape--l" aria-hidden="true" />

        <div className="nt__body">
          <div className="nt__text">
            <p className="nt__tag">نداء مفتوح</p>
            <h2 id="nt-title">
              خُذ قصاصة، وابدأ <Highlight delay={250}>أثرك</Highlight>
            </h2>
            <p>
              اختر القطاع الأقرب إلى قلبك واقتطع قصاصته؛ خلفها حملات موثّقة تنتظر من يُكملها، وتتابع معها أثر مساهمتك خطوة بخطوة حتى يصل إلى مستحقيه.
            </p>
            <div className="nt__actions">
              <a className="cta" href={`${SITE}/ar/projects`}>
                تبرع الآن
              </a>
              <a className="link" href={`${SITE}/ar/contact`}>
                تواصل للشراكات
              </a>
            </div>
          </div>

          <figure className="nt__photo" aria-hidden="true">
            <img src="/campaigns/safety.webp" alt="" loading="lazy" />
          </figure>
        </div>

        <div className="nt__cut" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M8.6 7.6 21 17M8.6 16.4 21 7M13.5 12h.01" />
          </svg>
        </div>

        <nav className="nt__slips" aria-label="اختر قطاعًا">
          {SLOTS.map((s, i) => {
            if (!s) return <span key={`gone-${i}`} className="nt__slip nt__slip--gone" style={{ clipPath: tear(i + 3) }} aria-hidden="true" />
            return (
              <a key={s.id} className="nt__slip" href={`${SITE}/projects/filter?category=${s.id}`} style={{ '--i': i }}>
                <span className="nt__no" dir="ltr">
                  {s.no}
                </span>
                <span className="nt__name">{s.name}</span>
              </a>
            )
          })}
        </nav>
      </div>
    </section>
  )
}
