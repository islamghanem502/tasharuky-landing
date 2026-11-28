import { useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import Roll from '@/components/Roll'
import './Impact.css'

// the figures as published on tasharuky.com, under "أثر تشاركي"
const FIGURES = { countries: 18, active: 100, done: 18, backers: 11667 }

const fmt = (n) => n.toLocaleString('en-US')
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const LEAD = 500 // ms after the card comes into view
const STEP = 120 // ms per click of the wheels: slow enough to read each one
const STAGGER = 2 // clicks between one wheel starting and the next

/*
 * An odometer: the figure is set at its full length from the start, all zeros
 * (00,000), and each wheel counts quietly up to its digit — no spinning past it —
 * the leftmost first. Nothing changes width, so the sentence around it never reflows.
 */
function useOdometer(value, on, order) {
  const target = fmt(value)
  const digits = target.replace(/\D/g, '').split('').map(Number)
  const last = Math.max(...digits.map((d, j) => j * STAGGER + d))
  const [k, setK] = useState(() => (reduced() ? last : 0))
  useEffect(() => {
    if (!on || reduced()) return
    let step = 0
    let id
    const click = () => {
      step += 1
      setK(step)
      if (step < last) id = setTimeout(click, STEP)
    }
    id = setTimeout(click, LEAD + order * 260)
    return () => clearTimeout(id)
  }, [on, order, last])
  // each digit's place among the digits, from the left (the comma is not a wheel)
  const chars = target.split('')
  const place = chars.map((_, i) => chars.slice(0, i).filter((c) => /\d/.test(c)).length)
  return chars
    .map((c, i) => {
      if (!/\d/.test(c)) return c
      const r = k - place[i] * STAGGER // clicks this wheel has made
      return String(Math.max(0, Math.min(+c, r)))
    })
    .join('')
}

function Figure({ value, order, on }) {
  const text = useOdometer(value, on, order)
  return (
    <b className="im__n">
      <span className="sr-only">{fmt(value)}</span>
      <Roll text={text} />
    </b>
  )
}

// a leaf drawn from its stalk outwards; it opens from that point
function Leaf({ x, y, r, s = 1, flip, tone, d }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${flip ? -s : s} ${s})`}>
      <g className="im__leaf" style={{ '--d': `${d}ms` }}>
        <path d="M0 0C7 -11 22 -16 40 -10C31 2 15 7 0 0Z" fill={tone} />
        <path d="M3 -1.2C14 -5 25 -8.2 35 -9" fill="none" stroke="#f3ede4" strokeOpacity=".45" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </g>
  )
}

/*
 * A sprout growing up from the foot of the card while the numbers count:
 * the stem draws upwards, the leaves open one by one as it passes them, a bud last.
 * Then it only sways a little. Transform and stroke only, so it costs nothing to draw.
 */
function Plant() {
  return (
    <svg className="im__plant" viewBox="0 0 120 190" aria-hidden="true">
      <g className="im__sway">
        <path className="im__stem" d="M58 190C58 160 54 134 60 108C65 86 56 68 62 46" pathLength="1" />
        <Leaf x={58} y={156} r={-16} s={1.08} tone="#2e8c8a" d={520} />
        <Leaf x={57} y={130} r={14} s={0.98} flip tone="#3e9e9b" d={760} />
        <Leaf x={61} y={102} r={-28} s={0.84} tone="#2e8c8a" d={1000} />
        <Leaf x={60} y={78} r={24} s={0.7} flip tone="#5aafac" d={1200} />
        <Leaf x={62} y={50} r={-58} s={0.46} tone="#3e9e9b" d={1380} />
        <Leaf x={62} y={50} r={58} s={0.46} flip tone="#3e9e9b" d={1420} />
        <g className="im__bud" style={{ '--d': '1560ms' }}>
          <path d="M62 47C56.5 41 56.5 33 62 26C67.5 33 67.5 41 62 47Z" fill="var(--brick)" />
          <path d="M62 44C60 39.5 60 35 62 30.5" fill="none" stroke="#f3ede4" strokeOpacity=".4" strokeWidth="1.1" strokeLinecap="round" />
        </g>
      </g>
      {/* and a smaller one beside it, a moment later */}
      <g className="im__sway im__sway--small">
        <path className="im__stem im__stem--small" d="M92 190C92 176 90 166 93 154" pathLength="1" />
        <Leaf x={93} y={160} r={-34} s={0.56} tone="#5aafac" d={1500} />
        <Leaf x={93} y={156} r={30} s={0.5} flip tone="#3e9e9b" d={1600} />
      </g>
    </svg>
  )
}

/*
 * The four figures, said rather than tabulated: one sentence in one small card,
 * each number rolling into place where it falls in the line, and a sprout growing
 * in the corner as they settle.
 */
export default function Impact() {
  const card = useRef(null)
  const on = useInView(card, { once: true, amount: 0.5 })

  return (
    <section className="im" id="impact" aria-labelledby="im-title">
      <div className="im__card" ref={card} data-on={on || undefined}>
        <div className="im__text">
          <h2 id="im-title">أثر تشاركي</h2>
          <p>
            نعمل في <Figure value={FIGURES.countries} order={0} on={on} /> دولة، ولدينا <Figure value={FIGURES.active} order={1} on={on} /> حملة نشطة،
            وأنجزنا <Figure value={FIGURES.done} order={2} on={on} /> مشروعًا، وكل ذلك بفضل <Figure value={FIGURES.backers} order={3} on={on} /> داعمًا.
          </p>
        </div>
        <Plant />
      </div>
    </section>
  )
}
