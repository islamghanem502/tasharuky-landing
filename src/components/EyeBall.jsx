import { useEffect, useId, useRef } from 'react'

/* ══ خيري's face ═══════════════════════════════════════════
   Adapted from Bencho's "Eye tracker" (MIT, bencho.dev/licence),
   redrawn for Tasharuky: a teal ball with paper eyes, a little
   blush, and a sprout on top — the same sprout that grows out of
   the impact card.

   ── THE EYES ARE ON THE BALL, NOT IN FRONT OF IT ───────────
   The easy version slides two shapes toward the pointer, and it
   reads as stickers on a disc. Here each eye is a point on the
   sphere's surface: looking left turns the ball, so an eye
   travels along the curve, and the one heading for the rim
   moves less and narrows as it turns away from you while the
   other swings wide. That foreshortening is the whole trick —
   it is what makes a flat circle read as something round.

   One turn (yaw and pitch) is the state, sprung toward where
   the pointer is; both eyes (and both cheeks) are read off it,
   so they can never disagree. It relaxes back to facing you when
   the pointer leaves the window, and it blinks on its own now
   and then.

   Written straight to the DOM every frame, never through state:
   a pointer move is not a render. And the loop parks itself the
   moment the turn has settled; a pointer move or a blink wakes it. */

const R = 50 // the ball's radius, in the 100-unit viewBox
// the eyes: two rounded rectangles, the same size as each other; any difference
// in SIZE between the two is depth, worked out from the turn, never drawn in
const EYE = { w: 10.5, h: 17, r: 5.25 }
// half the gap between the eyes, as a fraction of the radius
const GAP = 0.2
// the eye line sits a touch above the middle, the cheeks below it
const EYE_Y = -0.08
const CHEEK = { x: 0.46, y: 0.3, rx: 7.5, ry: 4.4 }
// how far a look to a corner tilts the pair, in degrees at the rim —
// a glance up and right leans them back
const TILT = 64

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
// read once: a preference, not a live input
const stillness = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function EyeBall({
  size = 64,
  // how far the ball turns toward the pointer, 0..100
  follow = 60,
  // how much the turn overshoots and settles, 0..100
  bounce = 30,
  // a face rather than a toy: it ignores the pointer, looks where `gaze` says
  // (or straight ahead), glances somewhere now and then and blinks on its own
  idle = false,
  gaze = null,
}) {
  const box = useRef(null)
  const eyes = useRef([])
  const cheeks = useRef([])
  const sprout = useRef(null)
  const wake = useRef(() => {})
  const target = useRef({ x: 0, y: 0 })
  const rested = useRef({ x: 0, y: 0 }) // where an idle face looks between glances
  const id = useId().replace(/:/g, '')
  const gx = gaze ? gaze.x : 0
  const gy = gaze ? gaze.y : 0

  // a new gaze is a new target, not a new loop
  useEffect(() => {
    if (!idle) return
    rested.current = { x: gx, y: gy }
    target.current = { x: gx, y: gy }
    wake.current()
  }, [idle, gx, gy])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const still = stillness()
    const t = { x: 0, y: 0, vx: 0, vy: 0 }
    let raf = 0
    let prev = 0
    let blink = -1e9
    let seen = true

    // a point on the unit sphere at (x0, y0) on its face, turned with the ball
    const turned = (x0, y0, cy, sy, cp, sp) => {
      const z0 = Math.sqrt(Math.max(0, 1 - x0 * x0 - y0 * y0))
      const x1 = x0 * cy + z0 * sy // yaw, about the vertical
      const z1 = -x0 * sy + z0 * cy
      const y2 = y0 * cp - z1 * sp // pitch, about the horizontal
      const z2 = y0 * sp + z1 * cp
      return [x1, y2, z2]
    }

    const draw = (now) => {
      // a blink is 160ms down and up, as a squash on each eye
      const since = now - blink
      const lid = since < 160 ? 1 - 0.9 * Math.sin((since / 160) * Math.PI) : 1

      // the turn that brings the front of the ball to the face's spot
      const as = (v) => Math.asin(clamp(v, -0.92, 0.92))
      const yaw = as(t.x)
      const pitch = -as(t.y)
      const cy = Math.cos(yaw), sy = Math.sin(yaw)
      const cp = Math.cos(pitch), sp = Math.sin(pitch)
      // the pair leans with a diagonal look and stands level on the axes
      const tilt = TILT * t.x * t.y

      ;[-GAP, GAP].forEach((x0, i) => {
        const g = eyes.current[i]
        if (!g) return
        const [x1, y2, z2] = turned(x0, EYE_Y, cy, sy, cp, sp)
        // depth: the eye nearer the rim is further from you, so it is smaller
        // all over and narrower still across the turn
        const near = clamp(z2, 0, 1)
        const k = 0.45 + 0.55 * near
        const sx = k * (0.7 + 0.3 * near)
        /* ── the size is written as a size, never as a scale ──
           A scale stretches the corner with the shape: an eye narrowed for
           depth or squashed by a blink had elliptical corners. Writing the
           width and height directly keeps every corner the same radius,
           clamped so it never exceeds half a side. */
        const w = EYE.w * sx
        const h = Math.max(0.6, EYE.h * k * lid)
        const rect = g.firstElementChild
        rect.setAttribute('x', (-w / 2).toFixed(2))
        rect.setAttribute('y', (-h / 2).toFixed(2))
        rect.setAttribute('width', w.toFixed(2))
        rect.setAttribute('height', h.toFixed(2))
        rect.setAttribute('rx', Math.min(EYE.r, w / 2, h / 2).toFixed(2))
        g.setAttribute('transform', `translate(${(50 + x1 * R).toFixed(2)} ${(50 + y2 * R).toFixed(2)}) rotate(${tilt.toFixed(2)})`)
        g.style.opacity = z2 < 0.05 ? '0' : '1'
      })

      // the cheeks ride the same sphere, a little lower and wider
      ;[-CHEEK.x, CHEEK.x].forEach((x0, i) => {
        const c = cheeks.current[i]
        if (!c) return
        const [x1, y2, z2] = turned(x0, CHEEK.y, cy, sy, cp, sp)
        const near = clamp(z2, 0, 1)
        c.setAttribute('cx', (50 + x1 * R).toFixed(2))
        c.setAttribute('cy', (50 + y2 * R).toFixed(2))
        c.setAttribute('rx', (CHEEK.rx * (0.35 + 0.65 * near)).toFixed(2))
        c.setAttribute('ry', (CHEEK.ry * (0.6 + 0.4 * near)).toFixed(2))
        c.style.opacity = (0.92 * near).toFixed(3) // full strength: a pale pink over teal goes grey
      })

      // the sprout stands on the crown and leans with the turn
      sprout.current?.setAttribute('transform', `rotate(${(yaw * 22).toFixed(2)} 50 3)`)
    }

    const tick = (now) => {
      // off screen or in a background tab the loop stops
      if (!seen || document.hidden) {
        raf = 0
        prev = 0
        return
      }
      const dt = prev ? Math.min(2.5, Math.max(0, now - prev) / 16.67) : 1
      prev = now
      const { x: tx, y: ty } = target.current
      if (still) {
        t.x = tx
        t.y = ty
        t.vx = t.vy = 0
      } else {
        /* one spring for both axes; Bounce loosens the damping. Frames, not
           milliseconds: dt is in sixtieths of a second, so a dropped frame
           moves the same distance as the two frames it replaced */
        const k = 0.06
        const d = 0.34 - (clamp(bounce, 0, 100) / 100) * 0.22
        t.vx += ((tx - t.x) * k - t.vx * d) * dt
        t.vy += ((ty - t.y) * k - t.vy * d) * dt
        t.x += t.vx * dt
        t.y += t.vy * dt
      }
      draw(now)
      // settled, and not mid-blink: park until something wakes it
      const calm = Math.abs(tx - t.x) < 0.0008 && Math.abs(ty - t.y) < 0.0008 && Math.abs(t.vx) < 0.0008 && Math.abs(t.vy) < 0.0008
      if (calm && now - blink > 170) {
        t.x = tx
        t.y = ty
        draw(now)
        raf = 0
        prev = 0
        return
      }
      raf = requestAnimationFrame(tick)
    }
    const start = () => {
      if (!raf && seen && !document.hidden) raf = requestAnimationFrame(tick)
    }
    wake.current = start
    start()

    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting
      start()
    })
    io.observe(el)
    document.addEventListener('visibilitychange', start)

    // it blinks on its own, now and then
    let blinkTimer = 0
    const nextBlink = () => {
      blinkTimer = window.setTimeout(() => {
        blink = performance.now()
        start()
        nextBlink()
      }, idle ? 2400 + Math.random() * 1600 : 2600 + Math.random() * 3200)
    }
    if (!still) nextBlink()

    // ── idle: where it is told to look, and now and then a glance ──
    let glance = 0
    if (idle && !still) {
      const look = () => {
        const a = Math.random() * Math.PI * 2
        const far = 0.35 + Math.random() * 0.2
        target.current = { x: Math.cos(a) * far, y: Math.sin(a) * far }
        start()
        glance = window.setTimeout(() => {
          target.current = { ...rested.current }
          start()
          glance = window.setTimeout(look, 5200)
        }, 900)
      }
      glance = window.setTimeout(look, 5200)
    }

    /* ── the face goes where you are ──────────────────────────
       A spot out along the pointer's direction, further the further
       away you are — so on top of it the face is dead centre, and off
       in a corner it is out by that corner's rim, turned, one eye
       smaller and the pair leaning. A floating helper watches the
       whole window, so the reach is measured against the window. */
    const aim = (e) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const d = Math.hypot(dx, dy) || 1
      const reach = Math.max(80, Math.min(window.innerWidth, window.innerHeight) * 0.3)
      const far = Math.min(0.85, Math.tanh(d / reach) * (clamp(follow, 0, 100) / 100) * 1.5)
      target.current = { x: (dx / d) * far, y: (dy / d) * far }
      start()
    }
    const rest = () => {
      target.current = { x: 0, y: 0 }
      start()
    }
    if (!idle) {
      window.addEventListener('pointermove', aim, { passive: true })
      document.documentElement.addEventListener('pointerleave', rest)
    }

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener('visibilitychange', start)
      window.clearTimeout(blinkTimer)
      window.clearTimeout(glance)
      window.removeEventListener('pointermove', aim)
      document.documentElement.removeEventListener('pointerleave', rest)
      wake.current = () => {}
    }
  }, [idle, follow, bounce])

  return (
    <span className="eyeball" ref={box} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="-4 -18 108 122" width="100%" height="100%" overflow="visible">
        <defs>
          <clipPath id={`${id}-clip`}>
            <circle cx="50" cy="50" r="50" />
          </clipPath>
          {/* light from the upper left, so the ball reads as round before it moves */}
          <radialGradient id={`${id}-body`} cx="34%" cy="28%" r="78%">
            <stop offset="0" stopColor="#4fb0ad" />
            <stop offset=".55" stopColor="#2e8c8a" />
            <stop offset="1" stopColor="#226f6d" />
          </radialGradient>
        </defs>
        <g ref={sprout}>
          <path d="M50 4C50 -2 49 -6 51 -11" fill="none" stroke="#1c5d5c" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M51 -9C55 -16 63 -18 70 -15C65 -9 57 -7 51 -9Z" fill="#5aafac" />
          <path d="M50 -6C46 -12 39 -13 33 -10C37 -5 44 -4 50 -6Z" fill="#3e9e9b" />
        </g>
        <circle cx="50" cy="50" r="50" fill={`url(#${id}-body)`} />
        <g clipPath={`url(#${id}-clip)`}>
          {[0, 1].map((i) => (
            <ellipse key={`c${i}`} ref={(n) => (cheeks.current[i] = n)} cx="50" cy="65" rx="7" ry="4" fill="#f4a08e" style={{ opacity: 0 }} />
          ))}
          {[0, 1].map((i) => (
            <g key={`e${i}`} ref={(n) => (eyes.current[i] = n)} transform="translate(50 46)">
              <rect x="-5.25" y="-8.5" width="10.5" height="17" rx="5.25" fill="#fbf9f4" />
            </g>
          ))}
        </g>
      </svg>
    </span>
  )
}
