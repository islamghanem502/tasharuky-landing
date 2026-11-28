import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { money } from '@/data/campaigns'
import './feature-carousel.css'

/*
 * Feature carousel — from @uselayouts/feature-carousel, kept to its own layout and
 * motion: a wheel of chips beside a stack of cards, the active card in front and its
 * neighbours tilted, dimmed and blurred behind it. Here the chips name the campaigns,
 * and each card is the campaign's field photo with its words, its meter and a button
 * set on a gradient at the foot.
 */

const AUTO_PLAY_INTERVAL = 4200
const ITEM_HEIGHT = 68

function shortestOffset(index, current, len) {
  let d = (((index - current) % len) + len) % len
  if (d > len / 2) d -= len
  return d
}

const chipTween = { type: 'tween', duration: 0.42, ease: [0.4, 0, 0.2, 1] }
const cardTween = { type: 'tween', duration: 0.38, ease: [0.4, 0, 0.2, 1] }

function Chip({ c, index, current, total, reduce, onSelect, onPause, onResume }) {
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
      className="fc__slot"
      style={{ height: ITEM_HEIGHT }}
      animate={{ y: offset * ITEM_HEIGHT, opacity: Math.max(0, 1 - Math.abs(offset) * 0.22) }}
      transition={reduce || jumped ? { duration: 0 } : chipTween}
    >
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={onPause}
        onMouseLeave={onResume}
        tabIndex={Math.abs(offset) > 2 ? -1 : 0}
        aria-pressed={active}
        className={cn('fc__chip', active && 'is-active')}
      >
        <span className="fc__num" dir="ltr">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span>{c.name}</span>
      </button>
    </motion.div>
  )
}

export default function FeatureCarousel({ items }) {
  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(false)
  const [inView, setInView] = useState(false)
  const reduce = useReducedMotion()
  const root = useRef(null)
  const len = items.length
  const current = ((step % len) + len) % len

  const next = useCallback(() => setStep((s) => s + 1), [])
  useEffect(() => {
    if (paused || !inView || reduce) return
    const id = setInterval(next, AUTO_PLAY_INTERVAL)
    return () => clearInterval(id)
  }, [next, paused, inView, reduce])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(root.current)
    return () => io.disconnect()
  }, [])

  const select = (i) => {
    const d = shortestOffset(i, current, len)
    if (d !== 0) setStep((s) => s + d)
  }

  const status = (i) => {
    const d = shortestOffset(i, current, len)
    if (d === 0) return 'active'
    if (d === -1) return 'prev'
    if (d === 1) return 'next'
    return 'hidden'
  }

  return (
    <div className="fc" ref={root}>
      <div className="fc__panel">
        <div className="fc__fade fc__fade--top" aria-hidden="true" />
        <div className="fc__fade fc__fade--bottom" aria-hidden="true" />
        <div className="fc__chips">
          {items.map((c, i) => (
            <Chip
              key={c.id}
              c={c}
              index={i}
              current={current}
              total={len}
              reduce={!!reduce}
              onSelect={() => select(i)}
              onPause={() => setPaused(true)}
              onResume={() => setPaused(false)}
            />
          ))}
        </div>
      </div>

      <div className="fc__stage" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
        <div className="fc__stack">
          {items.map((c, i) => {
            const s = status(i)
            const active = s === 'active'
            const side = s === 'prev' || s === 'next'
            const done = c.pct >= 100
            return (
              <motion.article
                key={c.id}
                initial={false}
                animate={{
                  x: active ? 0 : s === 'prev' ? 110 : s === 'next' ? -110 : 0,
                  scale: active ? 1 : side ? 0.86 : 0.72,
                  opacity: active ? 1 : side ? 0.5 : 0,
                  rotate: s === 'prev' ? 4 : s === 'next' ? -4 : 0,
                  zIndex: active ? 20 : side ? 10 : 0,
                }}
                transition={reduce ? { duration: 0 } : cardTween}
                className={cn('fc__card', active && 'is-active')}
                aria-hidden={!active}
                onClick={() => !active && select(i)}
              >
                <img src={c.img} alt="" loading="lazy" draggable="false" className="fc__img" />
                <span className="fc__sector">{c.sector}</span>
                {done && (
                  <span className="fc__stamp">
                    <b>اكتملت</b>
                    <span dir="ltr">100%</span>
                  </span>
                )}

                <AnimatePresence initial={false}>
                  {active && (
                    <motion.div
                      className="fc__foot"
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={reduce ? { duration: 0 } : { duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
                    >
                      <h4>{c.name}</h4>
                      <p>{c.desc}</p>
                      <div className="fc__meter" aria-hidden="true">
                        <i style={{ width: `${Math.min(100, c.pct)}%` }} />
                      </div>
                      <div className="fc__row">
                        <span className="fc__nums">
                          <b dir="ltr">{money(c.raised)}</b> من <span dir="ltr">{money(c.goal)}</span>
                        </span>
                        <a className="fc__go" href={c.href}>
                          {done ? 'شاهد الأثر' : 'ادخل الحملة'}
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M13 8H3M7 4 3 8l4 4" />
                          </svg>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
