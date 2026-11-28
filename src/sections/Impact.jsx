import { animate, useInView } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import Underline from '@/components/Underline'
import './Impact.css'

const SITE = 'https://tasharuky.com'

// the figures as published on tasharuky.com, under "أثر تشاركي"
const FIGURES = {
  countries: 18,
  active: 100,
  done: 18,
  backers: 11667,
}

const fmt = (n) => n.toLocaleString('en-US')
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// seeded, so every mark keeps the same wobble from one visit to the next
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const f = (v) => v.toFixed(2)

// a circle drawn in one go by hand: never quite round, and the pen runs past where it began
function ring(seed) {
  const R = rng(seed)
  const n = 10
  const a0 = R() * Math.PI * 2
  const turn = Math.PI * 2 * (1.07 + R() * 0.08)
  const pts = []
  for (let k = 0; k <= n; k++) {
    const a = a0 + (turn * k) / n
    const r = 9 * (0.9 + R() * 0.16)
    pts.push([14 + Math.cos(a) * r, 14 + Math.sin(a) * r])
  }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let k = 1; k < n; k++) {
    const [x, y] = pts[k]
    const [nx, ny] = pts[k + 1]
    d += ` Q${f(x)} ${f(y)} ${f((x + nx) / 2)} ${f((y + ny) / 2)}`
  }
  return d + ` L${f(pts[n][0])} ${f(pts[n][1])}`
}

// five to a gate: four strokes and one across
function gate(seed) {
  const R = rng(seed)
  const j = (s) => (R() - 0.5) * s
  const strokes = [0, 1, 2, 3].map((k) => {
    const x = 7 + k * 8 + j(1.6)
    return `M${f(x + j(1.2))} ${f(6 + j(2))} L${f(x + j(2.4))} ${f(38 + j(2))}`
  })
  strokes.push(`M${f(2 + j(2))} ${f(31 + j(3))} L${f(40 + j(2))} ${f(12 + j(3))}`)
  return strokes
}

// a box ticked by hand
function box(seed) {
  const R = rng(seed)
  const j = (s) => (R() - 0.5) * s
  const c = [
    [4 + j(1.5), 5 + j(1.5)],
    [24 + j(1.5), 4 + j(1.5)],
    [25 + j(1.5), 24 + j(1.5)],
    [5 + j(1.5), 25 + j(1.5)],
  ]
  const sq = `M${f(c[0][0])} ${f(c[0][1])} L${f(c[1][0])} ${f(c[1][1])} L${f(c[2][0])} ${f(c[2][1])} L${f(c[3][0])} ${f(c[3][1])} Z`
  const tick = `M${f(8 + j(1.5))} ${f(15 + j(1.5))} L${f(13 + j(1.5))} ${f(20 + j(1.2))} L${f(23 + j(2))} ${f(7 + j(2))}`
  return [sq, tick]
}

const RINGS = Array.from({ length: FIGURES.countries }, (_, i) => ring(i * 31 + 7))
const GATES = Array.from({ length: FIGURES.active / 5 }, (_, i) => gate(i * 17 + 3))
const BOXES = Array.from({ length: FIGURES.done }, (_, i) => box(i * 13 + 5))

// timings, in ms: when each mark starts, and how long the pen takes over it
const PACE = {
  rings: { step: 80, draw: 520 },
  gates: { step: 22, draw: 240 },
  boxes: { step: 95, draw: 420 },
  crowd: 3000,
}
const LEAD = 250 // after a row comes into view

// counts up alongside the marks, so the figure is always the marks drawn so far
function useCount(show, on, to, ms) {
  useLayoutEffect(() => {
    if (!reduced()) show(0)
  }, [show])
  useEffect(() => {
    if (!on) return
    if (reduced()) {
      show(to)
      return
    }
    const a = animate(0, to, {
      duration: ms / 1000,
      delay: LEAD / 1000,
      ease: 'linear',
      onUpdate: (v) => show(Math.round(v)),
    })
    return () => a.stop()
  }, [on, show, to, ms])
}

function Rings({ on, show }) {
  useCount(show, on, RINGS.length, (RINGS.length - 1) * PACE.rings.step + PACE.rings.draw * 0.6)
  return (
    <div className="im__marks im__marks--rings">
      {RINGS.map((d, i) => (
        <svg key={i} viewBox="0 0 28 28" style={{ '--d': `${LEAD + i * PACE.rings.step}ms`, '--t': `${PACE.rings.draw}ms` }}>
          <path d={d} pathLength="1" />
          <circle cx="14" cy="14" r="3.4" />
        </svg>
      ))}
    </div>
  )
}

function Gates({ on, show }) {
  useCount(show, on, FIGURES.active, (FIGURES.active - 1) * PACE.gates.step + PACE.gates.draw)
  return (
    <div className="im__marks im__marks--gates">
      {GATES.map((strokes, g) => (
        <svg key={g} viewBox="0 0 42 44">
          {strokes.map((d, s) => (
            <path key={s} d={d} pathLength="1" style={{ '--d': `${LEAD + (g * 5 + s) * PACE.gates.step}ms`, '--t': `${PACE.gates.draw}ms` }} />
          ))}
        </svg>
      ))}
    </div>
  )
}

function Boxes({ on, show }) {
  useCount(show, on, BOXES.length, (BOXES.length - 1) * PACE.boxes.step + PACE.boxes.draw)
  return (
    <div className="im__marks im__marks--boxes">
      {BOXES.map(([sq, tick], i) => (
        <svg key={i} viewBox="0 0 29 29">
          <path d={sq} pathLength="1" style={{ '--d': `${LEAD + i * PACE.boxes.step}ms`, '--t': `${PACE.boxes.draw}ms` }} />
          <path className="im__tick" d={tick} pathLength="1" style={{ '--d': `${LEAD + i * PACE.boxes.step + PACE.boxes.draw * 0.6}ms`, '--t': '260ms' }} />
        </svg>
      ))}
    </div>
  )
}

/*
 * The backers: one dot for each, 11,667 of them, gathering in no particular order
 * the way people do — and one place left open at the end of the line.
 */
function Crowd({ on, show }) {
  const count = FIGURES.backers
  const wrap = useRef(null)
  const cvs = useRef(null)
  const seat = useRef(null)
  const api = useRef(null)

  useLayoutEffect(() => {
    const c = cvs.current
    const ctx = c.getContext('2d')
    const color = getComputedStyle(c).color
    // the order they arrive in
    const R = rng(11667)
    const order = new Uint16Array(count)
    for (let k = 0; k < count; k++) order[k] = k
    for (let k = count - 1; k > 0; k--) {
      const r = Math.floor(R() * (k + 1))
      const t = order[k]
      order[k] = order[r]
      order[r] = t
    }

    // nobody stands exactly in line: each place is nudged a little, and no two are the same size
    const nudge = new Float32Array(count * 3)
    for (let k = 0; k < count * 3; k++) nudge[k] = R() - 0.5

    let L = null
    let shown = 0
    let want = reduced() ? count : 0
    const at = (k) => {
      const col = k % L.cols
      const row = (k / L.cols) | 0
      return [L.w - (col + 0.5) * L.pitch, (row + 0.5) * L.pitch] // from the right, as the page reads
    }
    const draw = (n) => {
      if (n <= shown) return
      ctx.fillStyle = color
      ctx.beginPath()
      for (let k = shown; k < n; k++) {
        const i = order[k]
        const [x0, y0] = at(i)
        const x = x0 + nudge[i * 3] * L.pitch * 0.32
        const y = y0 + nudge[i * 3 + 1] * L.pitch * 0.32
        const r = L.r * (1 + nudge[i * 3 + 2] * 0.4)
        ctx.moveTo(x + r, y)
        ctx.arc(x, y, r, 0, Math.PI * 2)
      }
      ctx.fill()
      shown = n
    }
    const layout = () => {
      const w = wrap.current.clientWidth
      if (!w || (L && L.w === w)) return
      const pitch = Math.min(4.6, Math.max(3, w / 140))
      const cols = Math.floor(w / pitch)
      const rows = Math.ceil((count + 1) / cols)
      const h = rows * pitch
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
      c.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      L = { w, pitch, cols, r: pitch * 0.31 }
      const [x, y] = at(count)
      seat.current.style.left = `${x}px`
      seat.current.style.top = `${y}px`
      shown = 0
      draw(want)
    }
    api.current = (n) => {
      want = n
      draw(n)
    }
    const ro = new ResizeObserver(layout)
    ro.observe(wrap.current)
    layout()
    show(want)
    return () => ro.disconnect()
  }, [count, show])

  useEffect(() => {
    if (!on) return
    const done = () => wrap.current?.toggleAttribute('data-done', true)
    if (reduced()) {
      api.current(count)
      done()
      return
    }
    const a = animate(0, count, {
      duration: PACE.crowd / 1000,
      delay: LEAD / 1000,
      ease: [0.3, 0, 0.25, 1],
      onUpdate: (v) => {
        const n = Math.round(v)
        api.current(n)
        show(n)
      },
      onComplete: done,
    })
    return () => a.stop()
  }, [on, count, show])

  return (
    <div className="im__marks im__marks--crowd">
      <div className="im__field" ref={wrap}>
        <canvas ref={cvs} aria-hidden="true" />
        <a ref={seat} className="im__seat" href={`${SITE}/ar/projects`} tabIndex={-1} aria-hidden="true" />
      </div>
      <div className="im__legend">
        <span>
          <i className="im__key im__key--dot" aria-hidden="true" /> داعم واحد
        </span>
        <a href={`${SITE}/ar/projects`}>
          <i className="im__key im__key--seat" aria-hidden="true" /> النقطة التالية قد تكون أنت
        </a>
      </div>
    </div>
  )
}

const ROWS = [
  { key: 'countries', label: 'دولة نعمل بها', desc: 'نوسع أثر العطاء ليصل إلى مجتمعات أكثر حول العالم.', Marks: Rings },
  { key: 'active', label: 'حملة نشطة', desc: 'حملات إنسانية وتنموية مصممة لإحداث أثر مستدام.', Marks: Gates },
  { key: 'done', label: 'مشاريع مكتملة', desc: 'مشاريع أُنجزت بنجاح وأسهمت في تحقيق أثر ملموس للمستفيدين.', Marks: Boxes },
  { key: 'backers', label: 'داعم', desc: 'أفراد ومؤسسات يساهمون في حملات ذات أثر حقيقي.', Marks: Crowd },
]

function Row({ i, row }) {
  const el = useRef(null)
  const num = useRef(null)
  const on = useInView(el, { once: true, amount: 0.45 })
  const show = useCallback((n) => {
    if (num.current) num.current.textContent = fmt(n)
  }, [])
  const { Marks } = row
  return (
    <li className={`im__row im__row--${row.key}`} ref={el} data-on={on || undefined}>
      <div className="im__fig">
        <span className="im__idx" dir="ltr" aria-hidden="true">
          {String(i + 1).padStart(2, '0')}
        </span>
        <b className="im__num" dir="ltr" aria-hidden="true" ref={num}>
          {fmt(FIGURES[row.key])}
        </b>
      </div>
      <div className="im__what">
        <h3>
          <span className="sr-only">{fmt(FIGURES[row.key])} </span>
          {row.label}
        </h3>
        <p>{row.desc}</p>
      </div>
      <Marks on={on} show={show} />
    </li>
  )
}

export default function Impact() {
  return (
    <section className="im" id="impact" aria-labelledby="im-title">
      <header className="im__head">
        <p className="im__eyebrow">أثر تشاركي</p>
        <h2 id="im-title">
          أرقام تعبّر عن <Underline>أثرٍ مستمر</Underline>
        </h2>
        <p>نقيس اتساع عملنا من خلال المجتمعات التي نصل إليها، والحملات التي ندعمها، والأشخاص الذين يشاركون في صناعة الأثر.</p>
      </header>

      <div className="im__book">
        <div className="im__cols" aria-hidden="true">
          <span>العدد</span>
          <span>البند</span>
          <span>كل علامة هنا واحدٌ بعينه</span>
        </div>
        <ol className="im__ledger">
          {ROWS.map((row, i) => (
            <Row key={row.key} i={i} row={row} />
          ))}
        </ol>
      </div>
    </section>
  )
}
