import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { money } from '@/data/campaigns'
import './feature-carousel.css'

/*
 * Feature carousel — from @uselayouts/feature-carousel, rebuilt for Tasharuky.
 * The registry's chip wheel is kept (same offset maths, same tween), listing the
 * campaigns. Its card stack becomes one large open file: when the wheel turns, the
 * papers slip back into the folder, the folder closes, and it opens again on the
 * next campaign — its field photo, its ledger and its stamped report.
 */

const AUTO_PLAY_INTERVAL = 6500
const ITEM_HEIGHT = 74
const SWAP_MS = 520

function shortestOffset(index, current, len) {
  let d = (((index - current) % len) + len) % len
  if (d > len / 2) d -= len
  return d
}

const chipTween = { type: 'tween', duration: 0.5, ease: [0.4, 0, 0.2, 1] }
const spring = { type: 'spring', stiffness: 170, damping: 22, mass: 0.9 }

// where each paper sits, tucked in and fanned out of the folder
const PAPERS = {
  photo: { closed: { x: '12%', y: '34%', rotate: 3 }, open: { x: '24%', y: '-30%', rotate: 6 } },
  slip: { closed: { x: '0%', y: '38%', rotate: -1 }, open: { x: '-18%', y: '-20%', rotate: -4 } },
  note: { closed: { x: '-12%', y: '36%', rotate: -3 }, open: { x: '-34%', y: '-2%', rotate: -10 } },
}

function Chip({ c, index, current, total, reduce, onSelect }) {
  const offset = shortestOffset(index, current, total)
  const prev = useRef(offset)
  // a chip wrapping from one end of the wheel to the other jumps instead of sliding (registry behaviour)
  // eslint-disable-next-line react-hooks/refs
  const jumped = Math.abs(offset - prev.current) > 1
  useLayoutEffect(() => {
    prev.current = offset
  }, [offset])
  const active = offset === 0

  return (
    <motion.div
      initial={false}
      className="fc__chip-slot"
      style={{ height: ITEM_HEIGHT }}
      animate={{ y: offset * ITEM_HEIGHT, opacity: Math.max(0, 1 - Math.abs(offset) * 0.28) }}
      transition={reduce || jumped ? { duration: 0 } : chipTween}
    >
      <button type="button" className={cn('fc__chip', active && 'is-active')} aria-pressed={active} onClick={onSelect} tabIndex={Math.abs(offset) > 2 ? -1 : 0}>
        <span className="fc__chip-name">{c.name}</span>
        <span className="fc__chip-pct" dir="ltr">
          {c.pct}%
        </span>
      </button>
    </motion.div>
  )
}

function OpenFile({ c, open }) {
  const state = open ? 'open' : 'closed'
  const left = c.goal - c.raised
  return (
    <div className="fd fd--big" data-open={open || undefined}>
      <div className="fd__tab" aria-hidden="true">
        <span className="fd__mono" dir="ltr">
          #{c.id}
        </span>
      </div>
      <div className="fd__back" aria-hidden="true" />

      <div className="fd__papers" aria-hidden="true">
        <motion.div className="fd__paper fd__paper--photo" initial={false} animate={PAPERS.photo[state]} transition={{ ...spring, delay: open ? 0.05 : 0 }}>
          <img src={c.img} alt="" />
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
        <motion.div className="fd__paper fd__paper--note" initial={false} animate={PAPERS.note[state]} transition={{ ...spring, delay: open ? 0.1 : 0 }}>
          <b>تقرير ميداني</b>
          <i />
          <i />
          <i />
          <span className="fd__stamp">موثّق</span>
        </motion.div>
      </div>

      <motion.div className="fd__front" initial={false} animate={{ rotateX: open ? -22 : 0 }} transition={{ type: 'spring', stiffness: 160, damping: 20 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={c.id}
            className="fd__face"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            <span className="fd__sector">{c.sector}</span>
            <h3>{c.name}</h3>
            <p className="fd__desc">{c.desc}</p>
            <div className="fd__bar">
              <Progress value={c.pct} className="fd__progress" indicatorClassName="fd__indicator" aria-label={`نسبة ما تم جمعه ${c.pct}%`} />
              <span className="fd__mono" dir="ltr">
                {c.pct}%
              </span>
            </div>
            <div className="fd__foot">
              <p className="fd__left">
                باقي{' '}
                <b className="fd__mono" dir="ltr">
                  {money(left)}
                </b>{' '}
                للوصول إلى الهدف
              </p>
              <a className="fd__cta" href={c.href}>
                ادعم هذه الحملة
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default function FeatureCarousel({ items }) {
  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(false)
  const [inView, setInView] = useState(false)
  const reduce = useReducedMotion()
  const len = items.length
  const current = ((step % len) + len) % len

  // the folder lags the wheel: it closes on the old campaign, then opens on the new one
  const [shown, setShown] = useState(0)
  const [open, setOpen] = useState(true)
  const root = useRef(null)
  const strip = useRef(null)

  useEffect(() => {
    if (current === shown) {
      const t = setTimeout(() => setOpen(true), reduce ? 0 : 90)
      return () => clearTimeout(t)
    }
    const close = setTimeout(() => setOpen(false), 0)
    const t = setTimeout(() => setShown(current), reduce ? 0 : SWAP_MS)
    return () => {
      clearTimeout(close)
      clearTimeout(t)
    }
  }, [current, shown, reduce])

  const next = useCallback(() => setStep((s) => s + 1), [])
  useEffect(() => {
    if (paused || !inView || reduce) return
    const id = setInterval(next, AUTO_PLAY_INTERVAL)
    return () => clearInterval(id)
  }, [next, paused, inView, reduce])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 })
    io.observe(root.current)
    return () => io.disconnect()
  }, [])

  // phones: keep the active chip in view in the horizontal strip
  useEffect(() => {
    const el = strip.current?.children[current]
    if (el && strip.current.scrollWidth > strip.current.clientWidth) {
      strip.current.scrollTo({ left: el.offsetLeft - (strip.current.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' })
    }
  }, [current])

  const select = (i) => {
    const d = shortestOffset(i, current, len)
    if (d !== 0) setStep((s) => s + d)
  }

  return (
    <div className="fc" ref={root} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <div className="fc__wheel" aria-label="الحملات">
        <div className="fc__fade fc__fade--top" aria-hidden="true" />
        <div className="fc__fade fc__fade--bottom" aria-hidden="true" />
        {items.map((c, i) => (
          <Chip key={c.id} c={c} index={i} current={current} total={len} reduce={!!reduce} onSelect={() => select(i)} />
        ))}
      </div>

      <div className="fc__strip" ref={strip} aria-label="الحملات">
        {items.map((c, i) => (
          <button key={c.id} type="button" className={cn('fc__chip', i === current && 'is-active')} aria-pressed={i === current} onClick={() => select(i)}>
            <span className="fc__chip-name">{c.name}</span>
            <span className="fc__chip-pct" dir="ltr">
              {c.pct}%
            </span>
          </button>
        ))}
      </div>

      <div className="fc__stage">
        <OpenFile c={items[shown]} open={open} />
      </div>
    </div>
  )
}
