import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import Highlight from '@/components/Highlight'
import Underline from '@/components/Underline'
import { Progress } from '@/components/ui/progress'
import FeatureCarousel from '@/components/feature-carousel'
import { FEATURED, MORE, money } from '@/data/campaigns'
import './Campaigns.css'

const SITE = 'https://tasharuky.com'

// the four files on the desk
const CAMPAIGNS = FEATURED.filter((c) => [293, 316, 51, 66].includes(c.id))

const spring = { type: 'spring', stiffness: 170, damping: 22, mass: 0.9 }

// where each paper sits, closed (tucked in) and open (fanned out of the folder)
const PAPERS = {
  photo: { closed: { x: '-14%', y: '30%', rotate: -4 }, open: { x: '-20%', y: '-36%', rotate: -7 } },
  slip: { closed: { x: '0%', y: '34%', rotate: 1 }, open: { x: '18%', y: '-24%', rotate: 5 } },
  note: { closed: { x: '15%', y: '32%', rotate: 4 }, open: { x: '30%', y: '-8%', rotate: 11 } },
}

function Folder({ c, i, open, onOpen, onClose }) {
  const pct = Math.round((c.raised / c.goal) * 1000) / 10
  const left = c.goal - c.raised
  const state = open ? 'open' : 'closed'

  return (
    <article
      className="fd"
      data-open={open || undefined}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onOpen()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onClose()}
      onFocus={onOpen}
      onClick={(e) => {
        if (e.target.closest('a')) return
        if (open) onClose()
        else onOpen()
      }}
    >
      <div className="fd__tab" aria-hidden="true">
        <span className="fd__mono">{String(i + 1).padStart(2, '0')}</span>
      </div>
      <div className="fd__back" aria-hidden="true" />

      <div className="fd__papers" aria-hidden="true">
        <motion.div className="fd__paper fd__paper--photo" initial={false} animate={PAPERS.photo[state]} transition={{ ...spring, delay: open ? 0.04 : 0 }}>
          <img src={c.img} alt="" loading="lazy" />
          <span>من الميدان</span>
        </motion.div>
        <motion.div className="fd__paper fd__paper--slip" initial={false} animate={PAPERS.slip[state]} transition={spring}>
          <b>كشف الحملة</b>
          <div className="fd__line">
            <span>تم جمعه</span>
            <i />
            <span className="fd__mono">{money(c.raised)}</span>
          </div>
          <div className="fd__line">
            <span>الهدف</span>
            <i />
            <span className="fd__mono">{money(c.goal)}</span>
          </div>
          <div className="fd__line">
            <span>الداعمون</span>
            <i />
            <span className="fd__mono">{c.backers.toLocaleString('en-US')}</span>
          </div>
        </motion.div>
        <motion.div className="fd__paper fd__paper--note" initial={false} animate={PAPERS.note[state]} transition={{ ...spring, delay: open ? 0.08 : 0 }}>
          <b>تقرير ميداني</b>
          <i />
          <i />
          <i />
          <span className="fd__stamp">موثّق</span>
        </motion.div>
      </div>

      <motion.div
        className="fd__front"
        initial={false}
        animate={{ rotateX: open ? -26 : 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 20 }}
      >
        <span className="fd__sector">{c.sector}</span>
        <h3>{c.name}</h3>
        <p>{c.desc}</p>
        <div className="fd__bar">
          <Progress value={pct} className="fd__progress" indicatorClassName="fd__indicator" aria-label={`نسبة ما تم جمعه ${pct}%`} />
          <span className="fd__mono" dir="ltr">
            {pct}%
          </span>
        </div>
        <p className="fd__left">
          باقي{' '}
          <b className="fd__mono" dir="ltr">
            {money(left)}
          </b>{' '}
          للوصول إلى الهدف
        </p>
        <a className="fd__cta" href={c.href}>
          ادعم الآن
        </a>
      </motion.div>
    </article>
  )
}

export default function Campaigns() {
  // the campaign closest to its goal opens first, to show the files can be opened
  const first = CAMPAIGNS.reduce((best, c, i) => (c.raised / c.goal > CAMPAIGNS[best].raised / CAMPAIGNS[best].goal ? i : best), 0)
  const [open, setOpen] = useState(null)
  const grid = useRef(null)

  useEffect(() => {
    const row = grid.current
    const items = [...row.children]
    const phone = window.matchMedia('(max-width: 680px)').matches
    const touch = window.matchMedia('(hover: none)').matches
    let io
    if (phone) {
      // phones: the folders sit in a row you swipe through; the one in the middle opens
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) setOpen(items.indexOf(e.target))
        },
        { root: row, rootMargin: '0px -42% 0px -42%' },
      )
    } else {
      // larger touch screens: the folder in the middle of the screen; mouse: the closest to its goal
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) setOpen(touch ? items.indexOf(e.target) : (o) => (o === null ? first : o))
        },
        touch ? { rootMargin: '-45% 0px -45% 0px' } : { threshold: 0.6 },
      )
    }
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [first])

  return (
    <section className="cp" id="projects">
      <header className="cp__head">
        <h2>
          ملفات مفتوحة <Underline>تنتظر من يُكملها</Underline>
        </h2>
        <p>كل حملة ملف موثّق: صور من الميدان، وما تم جمعه، وما تبقّى للوصول إلى الهدف. افتح الملف، وكن من يُكمله.</p>
      </header>

      <div className="cp__grid" ref={grid}>
        {CAMPAIGNS.map((c, i) => (
          <Folder key={c.name} c={c} i={i} open={open === i} onOpen={() => setOpen(i)} onClose={() => setOpen((o) => (o === i ? null : o))} />
        ))}
      </div>

      <div className="cp__more">
        <h3>
          حملات أخرى <Highlight tone="dark">تحتاجك</Highlight>
        </h3>
        <FeatureCarousel items={MORE} />
      </div>

      <a className="cp__all" href={`${SITE}/ar/projects`}>
        كل الحملات
      </a>
    </section>
  )
}
