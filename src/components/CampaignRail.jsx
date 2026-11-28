import { useEffect, useRef, useState } from 'react'
import { money } from '@/data/campaigns'
import './CampaignRail.css'

/*
 * A rail of campaigns: each card is the field photo, edge to edge, with the words set
 * on a deep gradient at its foot. Drag it, swipe it, or use the arrows. A campaign that
 * reached its goal carries the stamp — proof that the files do close.
 */

const Arrow = ({ flip }) => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={flip ? { transform: 'scaleX(-1)' } : undefined} aria-hidden="true">
    <path d="M13 8H3M7 4 3 8l4 4" />
  </svg>
)

function Card({ c }) {
  const done = c.pct >= 100
  return (
    <a className="cc" href={c.href} draggable="false" data-done={done || undefined}>
      <img className="cc__img" src={c.img} alt="" loading="lazy" draggable="false" />
      <span className="cc__sector">{c.sector}</span>
      {done && (
        <span className="cc__stamp" aria-label="اكتملت الحملة">
          <b>اكتملت</b>
          <span dir="ltr">100%</span>
        </span>
      )}
      <div className="cc__body">
        <h4>{c.name}</h4>
        <p>{c.desc}</p>
        <div className="cc__meter" aria-hidden="true">
          <i style={{ width: `${Math.min(100, c.pct)}%` }} />
        </div>
        <div className="cc__nums">
          <span dir="ltr" className="cc__mono">
            {money(c.raised)}
          </span>
          <span>من</span>
          <span dir="ltr" className="cc__mono cc__goal">
            {money(c.goal)}
          </span>
          <span dir="ltr" className="cc__mono cc__pct">
            {c.pct}%
          </span>
        </div>
        <span className="cc__go">
          {done ? 'شاهد الأثر' : 'ادخل الحملة'}
          <Arrow />
        </span>
      </div>
    </a>
  )
}

export default function CampaignRail({ items, title }) {
  const rail = useRef(null)
  const [pos, setPos] = useState(0) // 0 … 1 along the rail
  const drag = useRef(null)

  useEffect(() => {
    const el = rail.current
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      setPos(max > 0 ? Math.abs(el.scrollLeft) / max : 0)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  // in Arabic the rail runs right to left: "next" moves towards negative scrollLeft
  const go = (dir) => {
    const el = rail.current
    const card = el.querySelector('.cc')
    const step = card ? card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || 0) : el.clientWidth * 0.8
    el.scrollBy({ left: -dir * step, behavior: 'smooth' })
  }

  // drag with a mouse; touch and trackpads scroll natively
  const onDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    drag.current = { x: e.clientX, left: rail.current.scrollLeft, moved: false }
    rail.current.setPointerCapture(e.pointerId)
  }
  const onMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 4 && !d.moved) {
      d.moved = true
      rail.current.dataset.dragging = ''
    }
    if (d.moved) rail.current.scrollLeft = d.left - dx
  }
  const onUp = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    delete rail.current.dataset.dragging
    if (d.moved) {
      // swallow the click that follows a drag
      const stop = (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
      }
      rail.current.addEventListener('click', stop, { capture: true, once: true })
      setTimeout(() => rail.current?.removeEventListener('click', stop, { capture: true }), 0)
    }
  }

  return (
    <div className="rl">
      <div className="rl__head">
        <h3>{title}</h3>
        <div className="rl__nav">
          <button type="button" className="rl__btn" onClick={() => go(-1)} disabled={pos <= 0.01} aria-label="السابق">
            <Arrow flip />
          </button>
          <button type="button" className="rl__btn" onClick={() => go(1)} disabled={pos >= 0.99} aria-label="التالي">
            <Arrow />
          </button>
        </div>
      </div>

      <div className="rl__rail" ref={rail} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        {items.map((c) => (
          <Card key={c.id} c={c} />
        ))}
      </div>

      <div className="rl__track" aria-hidden="true">
        <i style={{ transform: `translateX(${-pos * 300}%)` }} />
      </div>
    </div>
  )
}
