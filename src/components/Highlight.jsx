import { useEffect, useRef, useState } from 'react'
import './Highlight.css'

/*
 * The marker stroke behind the key words of a heading — part of the identity.
 * A dry-brush shape (ragged ends, uneven edges, a few bristle streaks), stretched to the
 * words, and painted in from the right (the Arabic reading start) as it comes into view.
 */
export default function Highlight({ children, delay = 0, tone }) {
  const el = useRef(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold: 0.8 },
    )
    io.observe(el.current)
    return () => io.disconnect()
  }, [])

  return (
    <span className={tone === 'dark' ? 'hl hl--dark' : 'hl'} ref={el} data-on={on || undefined} style={{ '--hl-delay': `${delay}ms` }}>
      <svg className="hl__stroke" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="hl-rough" x="-5%" y="-20%" width="110%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9 0.06" numOctaves="2" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="3.2" />
          </filter>
        </defs>
        <g filter="url(#hl-rough)">
          <path d="M5 11C32 7 66 10 104 8C138 6 168 9 195 6L198 11L193 15L199 20L194 26L198 31C172 33 136 35 96 34C64 33 34 36 7 34L2 29L7 24L1 18L6 14Z" />
          <path d="M14 5.5C52 3.8 98 4.6 150 3.6L186 3.2" fill="none" strokeWidth="1.6" opacity=".55" />
          <path d="M22 37.5C70 38.6 122 37.4 178 37.6" fill="none" strokeWidth="1.4" opacity=".45" />
          <path d="M40 36.2C82 36.8 120 36 152 36.4" fill="none" strokeWidth="1" opacity=".5" />
        </g>
      </svg>
      <span className="hl__text">{children}</span>
    </span>
  )
}
