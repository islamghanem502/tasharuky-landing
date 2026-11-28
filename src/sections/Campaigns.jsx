import { useEffect, useRef, useState } from 'react'
import Highlight from '@/components/Highlight'
import { Progress } from '@/components/ui/progress'
import './Campaigns.css'

const SITE = 'https://tasharuky.com'

// live campaigns and figures as published on tasharuky.com
const CAMPAIGNS = [
  { img: 'water', sector: 'الطوارئ والأزمات', name: 'سقيا وحياة', desc: 'تأمين مياه الشرب للأسر النازحة في غزة', goal: 55000, raised: 50722, backers: 1252 },
  { img: 'safety', sector: 'الأمن الغذائي', name: 'عطاء وأمان', desc: 'لنواصل الدعم للأسر النازحة في غزة', goal: 150000, raised: 113490, backers: 2010 },
  { img: 'winter', sector: 'الطوارئ والأزمات', name: 'معًا لشتاء أكثر دفئًا', desc: 'إغاثة الأطفال والأسر النازحة في غزة', goal: 30000, raised: 21855, backers: 607 },
  { img: 'orphans', sector: 'الحماية (المرأة والطفل)', name: 'إكفلني', desc: 'دعم وكفالة 500 يتيم في غزة', goal: 30000, raised: 10787, backers: 98 },
]

const money = (n) => `$${n.toLocaleString('en-US')}`

function Row({ c, i }) {
  const el = useRef(null)
  const [seen, setSeen] = useState(false)
  const pct = Math.round((c.raised / c.goal) * 1000) / 10

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.6 },
    )
    io.observe(el.current)
    return () => io.disconnect()
  }, [])

  return (
    <li className="cp__row" ref={el} data-seen={seen || undefined} style={{ '--i': i }}>
      <a className="cp__link" href={`${SITE}/ar/projects`} aria-label={`ادعم حملة ${c.name}`} />
      <img className="cp__photo" src={`/campaigns/${c.img}.webp`} alt="" width="96" height="96" loading="lazy" />

      <div className="cp__what">
        <span className="cp__sector">{c.sector}</span>
        <h3>{c.name}</h3>
        <p>{c.desc}</p>
      </div>

      <dl className="cp__nums">
        <div>
          <dt>تم جمعه</dt>
          <dd className="cp__mono" dir="ltr">
            {money(c.raised)}
          </dd>
        </div>
        <div>
          <dt>الهدف</dt>
          <dd className="cp__mono" dir="ltr">
            {money(c.goal)}
          </dd>
        </div>
        <div>
          <dt>داعم</dt>
          <dd className="cp__mono" dir="ltr">
            {c.backers.toLocaleString('en-US')}
          </dd>
        </div>
      </dl>

      <div className="cp__bar">
        <Progress value={seen ? pct : 0} className="cp__progress" indicatorClassName="cp__indicator" aria-label={`نسبة ما تم جمعه ${pct}%`} />
        <span className="cp__mono" dir="ltr">
          {pct}%
        </span>
      </div>

      <span className="cp__cta" aria-hidden="true">
        ادعم الآن
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 8H3M7 4 3 8l4 4" />
        </svg>
      </span>
    </li>
  )
}

export default function Campaigns() {
  return (
    <section className="cp" id="projects">
      <header className="cp__head">
        <h2>
          مشاريع <Highlight>موثوقة</Highlight> تنتظر دعمك
        </h2>
        <p>استكشف حملات إنسانية وتنموية موثقة، وتابع ما تم جمعه والأثر المتوقع قبل التبرع.</p>
      </header>

      <ul className="cp__list">
        {CAMPAIGNS.map((c, i) => (
          <Row key={c.name} c={c} i={i} />
        ))}
      </ul>

      <a className="link cp__all" href={`${SITE}/ar/projects`}>
        كل المشاريع
      </a>
    </section>
  )
}
