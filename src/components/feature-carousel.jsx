import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { money } from '@/data/campaigns'
import './feature-carousel.css'

/*
 * Feature carousel — from @uselayouts/feature-carousel, kept to its own layout:
 * a wheel of chips beside a stack of cards, the active card in front and its
 * neighbours tilted and dimmed behind it. Here the chips name the campaigns, and each
 * card is the campaign's field photo with its words, meter and button on a gradient.
 *
 * Every card is placed from one continuous position, so autoplay, taps and a finger
 * dragging the stack all move through the same spring: the card follows the finger,
 * and a flick carries on to the next one.
 */

const AUTO_PLAY_INTERVAL = 3400
const ITEM_HEIGHT = 68
const GAP_X = 110 // how far a neighbour sits from the centre, px
const DRAG_W = 200 // px of finger travel for one card
const SPRING = { type: 'spring', stiffness: 240, damping: 30, mass: 0.9 }

const wrap = (d, len) => {
  let v = ((d % len) + len) % len
  if (v > len / 2) v -= len
  return v
}

const chipTween = { type: 'tween', duration: 0.36, ease: [0.4, 0, 0.2, 1] }

function Chip({ c, index, current, total, reduce, onSelect, onPause, onResume }) {
  const offset = wrap(index - current, total)
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

function Card({ c, i, len, pos, active, onSelect }) {
  // signed distance from the centre: 0 = in front, +1 = next (on the left in Arabic), -1 = previous
  const d = useTransform(pos, (p) => wrap(i - p, len))
  const a = useTransform(d, (v) => Math.min(Math.abs(v), 2))
  const x = useTransform(d, (v) => -v * GAP_X)
  const rotate = useTransform(d, (v) => -Math.max(-1, Math.min(1, v)) * 4)
  const scale = useTransform(a, (v) => (v <= 1 ? 1 - v * 0.14 : 0.86 - (v - 1) * 0.14))
  // neighbours stay solid (dimmed by the filter below) so a dragged card never ghosts over the next
  const opacity = useTransform(a, (v) => (v <= 1 ? 1 : 2 - v))
  const zIndex = useTransform(a, (v) => 20 - Math.round(v * 10))
  const shade = useTransform(a, (v) => {
    const k = Math.min(v, 1)
    return `grayscale(${k}) brightness(${1 - 0.4 * k})`
  })
  const footOpacity = useTransform(a, (v) => Math.max(0, 1 - v * 2.4))
  const footY = useTransform(a, (v) => Math.min(v, 1) * 14)
  const done = c.pct >= 100

  return (
    <motion.article style={{ x, rotate, scale, opacity, zIndex }} className={cn('fc__card', active && 'is-active')} aria-hidden={!active} onClick={() => !active && onSelect()}>
      <motion.img src={c.img} alt="" loading="lazy" draggable="false" className="fc__img" style={{ filter: shade }} />
      <span className="fc__sector">{c.sector}</span>
      {done && (
        <span className="fc__stamp">
          <b>اكتملت</b>
          <span dir="ltr">100%</span>
        </span>
      )}
      <motion.div className="fc__foot" style={{ opacity: footOpacity, y: footY }}>
        <h4>{c.name}</h4>
        <p>{c.desc}</p>
        <div className="fc__meter" aria-hidden="true">
          <i style={{ width: `${Math.min(100, c.pct)}%` }} />
        </div>
        <div className="fc__row">
          <span className="fc__nums">
            <b dir="ltr">{money(c.raised)}</b> من <span dir="ltr">{money(c.goal)}</span>
          </span>
          <a className="fc__go" href={c.href} tabIndex={active ? 0 : -1} draggable="false">
            {done ? 'شاهد الأثر' : 'ادخل الحملة'}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M13 8H3M7 4 3 8l4 4" />
            </svg>
          </a>
        </div>
      </motion.div>
    </motion.article>
  )
}

export default function FeatureCarousel({ items }) {
  const len = items.length
  const reduce = useReducedMotion()
  const pos = useMotionValue(0) // continuous position along the campaigns
  const [target, setTarget] = useState(0)
  const targetRef = useRef(0)
  const [paused, setPaused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [inView, setInView] = useState(false)
  const root = useRef(null)
  const drag = useRef({ start: 0, moved: false })
  const current = ((target % len) + len) % len

  const goTo = useCallback(
    (t) => {
      targetRef.current = t
      setTarget(t)
      animate(pos, t, reduce ? { duration: 0 } : SPRING)
    },
    [pos, reduce],
  )

  useEffect(() => {
    if (paused || dragging || !inView || reduce) return
    const id = setInterval(() => goTo(targetRef.current + 1), AUTO_PLAY_INTERVAL)
    return () => clearInterval(id)
  }, [paused, dragging, inView, reduce, goTo])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(root.current)
    return () => io.disconnect()
  }, [])

  const select = (i) => {
    const d = wrap(i - current, len)
    if (d !== 0) goTo(targetRef.current + d)
  }

  // drag the stack: right brings the next campaign in (it waits on the left in Arabic)
  const onPanStart = () => {
    pos.stop()
    drag.current = { start: pos.get(), moved: true }
    setDragging(true)
  }
  const onPan = (_, info) => pos.set(drag.current.start + info.offset.x / DRAG_W)
  const onPanEnd = (_, info) => {
    setDragging(false)
    const travel = (info.offset.x + info.velocity.x * 0.18) / DRAG_W
    let steps = Math.round(travel)
    if (steps === 0 && Math.abs(travel) > 0.22) steps = Math.sign(travel)
    steps = Math.max(-2, Math.min(2, steps))
    goTo(Math.round(drag.current.start) + steps)
  }
  // a drag must not also count as a tap on a card or its button
  const onPointerDownCapture = () => {
    drag.current.moved = false
  }
  const onClickCapture = (e) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
    }
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

      <motion.div
        className="fc__stage"
        data-dragging={dragging || undefined}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
        onPointerDownCapture={onPointerDownCapture}
        onClickCapture={onClickCapture}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
      >
        <div className="fc__stack">
          {items.map((c, i) => (
            <Card key={c.id} c={c} i={i} len={len} pos={pos} active={i === current} onSelect={() => select(i)} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
