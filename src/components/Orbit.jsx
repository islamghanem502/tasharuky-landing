import { useEffect, useRef } from 'react'
import './Orbit.css'

/*
 * A slow circular carousel.
 * One case sits large in the centre; the others wait as small circles on an orbit
 * that turns very slowly. Each turn, the next case travels in and grows, the queue
 * slides one place along the arc, and the old one shrinks back out to the end of it.
 * A photo arrives in black and white and only then takes on its colour.
 */

const HOLD = 7200          // time a case stays in the centre
const TRAVEL = 2800        // time a swap takes
const TURN = 150000        // one full revolution of the orbit
const LIGHT_AFTER = 350    // pause before the colour comes in

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function Orbit({ cases }) {
  const stage = useRef(null)
  const els = useRef([])

  useEffect(() => {
    const N = cases.length
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const s = {
      size: 0, raf: 0, visible: true,
      clock: 0, last: performance.now(),
      queue: cases.map((_, i) => i).slice(1), // orbit order, next one first
      focus: 0, out: null, swapAt: -Infinity, arrivedAt: 0,
    }
    const STEP = (2 * Math.PI) / N
    const PHI0 = (200 / 180) * Math.PI       // where the next case waits, left of centre

    const measure = () => {
      s.size = stage.current.offsetWidth
      stage.current.style.setProperty('--D', `${s.size * 0.64}px`)
    }

    const place = (i, r, ang, scale) => {
      const el = els.current[i]
      el.style.transform = `translate3d(${(r * Math.cos(ang)).toFixed(2)}px, ${(r * Math.sin(ang)).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
    }

    const frame = (now) => {
      const dt = Math.min(now - s.last, 64)
      s.last = now
      if (!reduce) s.clock += dt

      // time for the next case?
      if (!reduce && s.clock - s.swapAt >= HOLD + TRAVEL) {
        s.out = s.focus
        s.focus = s.queue.shift()
        s.queue.push(s.out)
        s.swapAt = s.clock
        els.current.forEach((el) => el.removeAttribute('data-lit'))
      }

      const R = s.size * 0.4
      const small = 0.2 / 0.64
      const phi = PHI0 + (2 * Math.PI * s.clock) / TURN
      const p = Math.min(1, (s.clock - s.swapAt) / TRAVEL)
      const e = ease(Math.max(0, p))
      const moving = p < 1

      // centre
      if (moving) place(s.focus, R * (1 - e), phi, small + (1 - small) * e)
      else place(s.focus, 0, phi, 1)
      // queue on the orbit; during a swap everyone slides one slot along the arc
      s.queue.forEach((i, k) => {
        if (moving && i === s.out) place(i, R * e, phi + STEP * k, 1 - (1 - small) * e)
        else place(i, R, phi + STEP * (moving ? k + 1 - e : k), small)
      })

      if (!moving && s.clock - s.swapAt - TRAVEL > LIGHT_AFTER) els.current[s.focus].setAttribute('data-lit', '')
      els.current.forEach((el, i) => {
        el.style.zIndex = i === s.focus ? 1 : 2
        el.toggleAttribute('data-focus', i === s.focus)
      })

      s.raf = s.visible ? requestAnimationFrame(frame) : 0
    }

    const ro = new ResizeObserver(measure)
    ro.observe(stage.current)
    const io = new IntersectionObserver(([en]) => {
      s.visible = en.isIntersecting && !document.hidden
      if (s.visible && !s.raf) { s.last = performance.now(); s.raf = requestAnimationFrame(frame) }
    })
    io.observe(stage.current)
    const vis = () => {
      s.visible = !document.hidden
      if (s.visible && !s.raf) { s.last = performance.now(); s.raf = requestAnimationFrame(frame) }
    }
    document.addEventListener('visibilitychange', vis)

    measure()
    s.swapAt = -TRAVEL // start settled
    s.raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(s.raf); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', vis) }
  }, [cases])

  return (
    <div className="orbit" ref={stage} role="img" aria-label={cases.map((c) => c.label).join('، ')}>
      <span className="orbit__track" aria-hidden="true" />
      {cases.map((c, i) => (
        <div key={c.src} className="orbit__item" ref={(el) => (els.current[i] = el)} aria-hidden="true">
          <img src={c.src} alt="" className="orbit__dim" draggable="false" />
          <img src={c.src} alt="" className="orbit__lit" draggable="false" />
        </div>
      ))}
    </div>
  )
}
