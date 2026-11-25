import './BrandShapes.css'

/**
 * Decorative background built from the logo's own vocabulary:
 * thick round-capped strokes (the "T" and the "U"), and dots.
 * Each shape carries data-depth so sections can parallax them.
 */
const PRESETS = {
  hero: [
    { k: 'T', x: '-4%', y: '8%', s: 340, c: 'brick', o: 0.1, r: -8, d: 0.35 },
    { k: 'U', x: '38%', y: '58%', s: 300, c: 'teal', o: 0.14, r: 12, d: 0.6 },
    { k: 'dots', x: '47%', y: '10%', s: 120, c: 'teal', o: 0.35, r: 0, d: 0.9 },
    { k: 'ring', x: '28%', y: '78%', s: 160, c: 'brick', o: 0.12, r: 0, d: 0.5 },
  ],
  unity: [
    { k: 'T', x: '-6%', y: '62%', s: 420, c: 'teal', o: 0.09, r: 190, d: 0.3 },
    { k: 'U', x: '80%', y: '-6%', s: 380, c: 'brick', o: 0.1, r: 170, d: 0.5 },
    { k: 'dots', x: '8%', y: '14%', s: 130, c: 'brick', o: 0.3, r: 0, d: 0.8 },
    { k: 'dots', x: '86%', y: '72%', s: 130, c: 'teal', o: 0.35, r: 0, d: 0.7 },
    { k: 'ring', x: '70%', y: '60%', s: 220, c: 'teal', o: 0.1, r: 0, d: 0.4 },
  ],
}

function Shape({ k, c, s }) {
  const id = `g-${k}-${c}-${s}`
  const from = c === 'brick' ? 'var(--brick-500)' : 'var(--teal)'
  const to = c === 'brick' ? 'var(--brick-700)' : 'var(--teal-900)'
  const grad = (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={from} />
        <stop offset="1" stopColor={to} />
      </linearGradient>
    </defs>
  )
  const stroke = { stroke: `url(#${id})`, strokeWidth: 46, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }
  if (k === 'T')
    return (
      <svg viewBox="0 0 300 300" width={s} height={s}>
        {grad}
        <path d="M30 30 H270 V150" {...stroke} />
        <path d="M150 30 V250" {...stroke} />
      </svg>
    )
  if (k === 'U')
    return (
      <svg viewBox="0 0 300 300" width={s} height={s}>
        {grad}
        <path d="M30 40 V150 A120 120 0 0 0 270 150 V40" {...stroke} />
      </svg>
    )
  if (k === 'ring')
    return (
      <svg viewBox="0 0 200 200" width={s} height={s}>
        {grad}
        <circle cx="100" cy="100" r="70" {...stroke} strokeWidth="30" />
      </svg>
    )
  return (
    <svg viewBox="0 0 120 120" width={s} height={s}>
      {grad}
      {[[20, 20], [60, 20], [100, 20], [20, 60], [60, 60], [100, 60], [20, 100], [60, 100], [100, 100]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="8" fill={`url(#${id})`} />
      ))}
    </svg>
  )
}

export default function BrandShapes({ variant = 'hero' }) {
  return (
    <div className="brand-shapes" aria-hidden="true">
      {PRESETS[variant].map((p, i) => (
        <div
          key={i}
          className="brand-shapes__item"
          data-depth={p.d}
          style={{ left: p.x, top: p.y, opacity: p.o, transform: `rotate(${p.r}deg)` }}
        >
          <Shape {...p} />
        </div>
      ))}
    </div>
  )
}
