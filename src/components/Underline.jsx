import { useEffect, useRef, useState } from 'react'
import './Underline.css'

/*
 * The second emphasis of the identity: a single brush stroke under the key words,
 * heavier in the middle and thinning at both ends, with a dry, uneven edge.
 * It is drawn in from the right (the Arabic reading start) as it comes into view.
 * Use it in turn with <Highlight>, so a page never leans on one mark.
 */
export default function Underline({ children, delay = 0 }) {
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
    <span className="ul" ref={el} data-on={on || undefined} style={{ '--ul-delay': `${delay}ms` }}>
      {children}
      <svg className="ul__stroke" viewBox="0 0 200 18" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="ul-rough" x="-4%" y="-40%" width="108%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7 0.08" numOctaves="2" seed="11" />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
        </defs>
        <g filter="url(#ul-rough)">
          <path d="M3 10.5C28 8.4 60 7.2 98 6.6C134 6.1 168 6.4 197 5.2L198.5 7.2C176 9.4 142 10.6 104 11.6C66 12.6 34 13.6 5 14.8C2.6 14.4 1.6 11.6 3 10.5Z" />
          <path d="M22 15.6C56 14.9 98 14.4 132 13.6" fill="none" strokeWidth="1.1" opacity=".55" />
        </g>
      </svg>
    </span>
  )
}
