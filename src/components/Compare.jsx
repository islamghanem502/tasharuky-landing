import { useEffect, useRef, useState } from 'react'
import './Compare.css'

/*
 * Image compare block.
 * "Before" (b/w) is the base layer; "after" (colour) sits on top, clipped to the
 * right of a drawn line, so the colour opens right-to-left — the Arabic reading direction.
 *
 * The line is a curve: the knob follows the target on a stiff spring and the two
 * ends follow the knob on a softer one, so a moving line bows like a rope pulled
 * from its middle and straightens when it stops.
 */

const OPEN = 0.84   // line near the right edge: mostly "before"
const SHUT = 0.16   // line near the left edge: mostly "after"
const T_RETURN = 1400, T_WAIT = 600, T_SWEEP = 2800, CYCLE = 7600
const IDLE_RESUME = 5000

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export default function Compare({ pairs, caption }) {
  const root = useRef(null)
  const after = useRef(null)
  const path = useRef(null)
  const svg = useRef(null)
  const grip = useRef(null)
  const knob = useRef(null)
  const [index, setIndex] = useState(0)
  const [auto, setAuto] = useState(true)
  const [held, setHeld] = useState(false)
  const [cycle, setCycle] = useState(0)
  const st = useRef(null)

  useEffect(() => {
    const el = root.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const s = (st.current = {
      W: 1, H: 1, K: 0, E: 0, vK: 0, vE: 0,
      target: reduce ? 0.5 : OPEN, from: OPEN, auto: !reduce, cycleStart: performance.now(),
      dragging: false, visible: true, raf: 0, idle: 0, index: 0, first: true,
    })

    const draw = () => {
      const { W, H, K, E } = s
      const C = 2 * K - E // control point so the curve passes through the knob at mid-height
      const curve = `${E.toFixed(1)},0 Q${C.toFixed(1)},${(H / 2).toFixed(1)} ${E.toFixed(1)},${H.toFixed(1)}`
      path.current.setAttribute('d', `M${curve}`)
      after.current.style.clipPath = `path('M${W + 40},-40 L${E.toFixed(1)},-40 L${curve} L${E.toFixed(1)},${H + 40} L${W + 40},${H + 40} Z')`
      grip.current.style.transform = `translate3d(${K.toFixed(2)}px,0,0)`
      knob.current.setAttribute('aria-valuenow', String(Math.round((1 - K / W) * 100)))
    }

    const measure = () => {
      // layout size, not getBoundingClientRect: an entrance transform must not shrink the mask
      const ratio = s.W > 1 ? s.K / s.W : s.target
      s.W = el.offsetWidth; s.H = el.offsetHeight
      s.K = s.E = ratio * s.W; s.vK = s.vE = 0
      svg.current.setAttribute('viewBox', `0 0 ${s.W} ${s.H}`)
      draw()
    }

    const schedule = (now) => {
      if (!s.auto) return
      const e = now - s.cycleStart
      if (s.first && e < T_RETURN + T_WAIT) { s.target = OPEN; return }
      if (e < T_RETURN) s.target = s.from + (OPEN - s.from) * ease(e / T_RETURN)
      else if (e < T_RETURN + T_WAIT) s.target = OPEN
      else if (e < T_RETURN + T_WAIT + T_SWEEP) s.target = OPEN + (SHUT - OPEN) * ease((e - T_RETURN - T_WAIT) / T_SWEEP)
      else if (e < CYCLE) s.target = SHUT
      else {
        s.first = false
        s.from = SHUT
        s.cycleStart = now
        s.index = (s.index + 1) % pairs.length
        setIndex(s.index); setCycle((c) => c + 1)
      }
    }

    const frame = (now) => {
      schedule(now)
      const tx = s.target * s.W
      s.vK = (s.vK + (tx - s.K) * 0.14) * 0.7
      s.K += s.vK
      s.vE = (s.vE + (s.K - s.E) * 0.05) * 0.8
      s.E += s.vE
      const lag = s.W * 0.14 // keep the bow tasteful
      s.E = clamp(s.E, s.K - lag, s.K + lag)
      draw()
      const settled = !s.auto && Math.abs(tx - s.K) < 0.2 && Math.abs(s.K - s.E) < 0.2 && Math.abs(s.vK) + Math.abs(s.vE) < 0.05
      s.raf = settled || !s.visible ? 0 : requestAnimationFrame(frame)
    }
    const wake = () => { if (!s.raf && s.visible) s.raf = requestAnimationFrame(frame) }
    s.wake = wake

    const pause = () => {
      s.auto = false; setAuto(false)
      clearTimeout(s.idle)
      if (reduce) return
      s.idle = setTimeout(() => {
        s.auto = true; s.first = false; s.from = s.target; s.cycleStart = performance.now()
        setAuto(true); setCycle((c) => c + 1); wake()
      }, IDLE_RESUME)
    }

    // pointer
    const at = (x) => { const r = el.getBoundingClientRect(); return clamp((x - r.left) / r.width, 0.02, 0.98) }
    const down = (e) => {
      if (e.button !== undefined && e.button !== 0) return
      s.dragging = true; setHeld(true)
      el.setPointerCapture?.(e.pointerId)
      s.target = at(e.clientX); pause(); wake()
    }
    const move = (e) => { if (s.dragging) { s.target = at(e.clientX); clearTimeout(s.idle); wake() } }
    const up = () => { if (!s.dragging) return; s.dragging = false; setHeld(false); pause() }
    // keyboard on the knob
    const key = (e) => {
      const step = e.shiftKey ? 0.1 : 0.04
      if (e.key === 'ArrowLeft') s.target = clamp(s.target - step, 0.02, 0.98)
      else if (e.key === 'ArrowRight') s.target = clamp(s.target + step, 0.02, 0.98)
      else if (e.key === 'Home') s.target = 0.98
      else if (e.key === 'End') s.target = 0.02
      else return
      e.preventDefault(); pause(); wake()
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    knob.current.addEventListener('keydown', key)

    const ro = new ResizeObserver(measure)
    ro.observe(el)
    const io = new IntersectionObserver(([en]) => { s.visible = en.isIntersecting; if (s.visible) { s.cycleStart = performance.now() - (s.pausedAt || 0); wake() } else { s.pausedAt = performance.now() - s.cycleStart } })
    io.observe(el)
    const vis = () => { if (document.hidden) { s.pausedAt = performance.now() - s.cycleStart; s.visible = false } else { s.visible = true; s.cycleStart = performance.now() - (s.pausedAt || 0); wake() } }
    document.addEventListener('visibilitychange', vis)

    measure(); wake()
    return () => {
      cancelAnimationFrame(s.raf); clearTimeout(s.idle); ro.disconnect(); io.disconnect()
      document.removeEventListener('visibilitychange', vis)
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up)
    }
  }, [pairs.length])

  // jump to a case from the step buttons
  const go = (i) => {
    const s = st.current
    clearTimeout(s.idle)
    s.index = i; s.first = false; s.from = s.target; s.cycleStart = performance.now(); s.auto = true
    setIndex(i); setAuto(true); setCycle((c) => c + 1)
    s.wake()
  }

  return (
    <div className="cmp-wrap">
      <div className="cmp" ref={root} data-held={held || undefined} role="group" aria-roledescription="مقارنة صور" aria-label={pairs[index].label}>
        <div className="cmp-layer">
          {pairs.map((p, i) => (
            <img key={p.before} className="cmp-img" data-on={i === index || undefined} src={p.before} alt={i === index ? p.label : ''} draggable="false" decoding="async" />
          ))}
        </div>
        <div className="cmp-layer cmp-after" ref={after} aria-hidden="true">
          {pairs.map((p, i) => (
            <img key={p.after} className="cmp-img" data-on={i === index || undefined} src={p.after} alt="" draggable="false" decoding="async" />
          ))}
        </div>
        <svg className="cmp-line" ref={svg} aria-hidden="true"><path ref={path} /></svg>
        <div className="cmp-grip" ref={grip}>
          <button
            type="button" className="cmp-knob" ref={knob} role="slider"
            aria-label="اسحب للمقارنة" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 4 2.5 8 6 12M10 4l3.5 4-3.5 4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="cmp-foot">
        {caption && <p className="cmp-caption">{caption}</p>}
        <div className="cmp-steps" role="tablist" aria-label="الحالات">
          {pairs.map((p, i) => (
            <button
              key={p.after} type="button" role="tab" aria-selected={i === index} aria-label={`الحالة ${i + 1}`}
              className="cmp-step" data-on={i === index || undefined} data-paused={!auto || undefined}
              onClick={() => go(i)}
            >
              <span key={i === index ? `on-${cycle}` : 'off'} style={{ animationDuration: `${CYCLE}ms` }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
