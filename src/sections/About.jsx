import { animate, useInView } from 'motion/react'
import { useEffect, useRef } from 'react'
import Underline from '@/components/Underline'
import { ART_W, LEFT_D, RIGHT_D, WINDOW_BOX, WINDOW_D } from '@/components/hands-art'
import './About.css'

const SITE = 'https://tasharuky.com'

// the band of the drawing on show (the arms run on past it, off-screen)
const VB = { x: 0, y: 360, w: ART_W, h: 420 }
const REACH = 820 // how far off each hand starts
const EASE = [0.16, 1, 0.3, 1]

/*
 * Two hands reach in from opposite edges and meet; together they make a heart, and
 * only then does the space between them open onto a face from the field — first in
 * black and white, then in colour. Neither hand makes the heart alone.
 */
export default function About() {
  const art = useRef(null)
  const left = useRef(null)
  const right = useRef(null)
  const inside = useRef(null)
  // the drawing is wider than a phone screen, so only part of it can ever be in view
  const seen = useInView(art, { once: true, amount: 0.2 })

  useEffect(() => {
    if (!seen) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      left.current.style.transform = right.current.style.transform = 'none'
      inside.current.style.opacity = 1
      inside.current.style.filter = 'none'
      return
    }
    const meet = 2.4
    animate(left.current, { x: [-REACH, 0] }, { duration: meet, ease: EASE })
    animate(right.current, { x: [REACH, 0] }, { duration: meet, ease: EASE })
    // the heart opens only once they have met
    animate(inside.current, { opacity: [0, 1] }, { duration: 1.2, delay: meet - 0.6, ease: 'easeOut' })
    animate(inside.current, { filter: ['grayscale(1)', 'grayscale(0)'] }, { duration: 1.8, delay: meet + 0.4, ease: 'easeInOut' })
  }, [seen])

  return (
    <section className="ab" id="about">
      <header className="ab__head">
        <p className="ab__eyebrow">عن تشاركي</p>
        <h2>
          منصة رقمية <Underline>للعمل الإنساني</Underline>
        </h2>
        <p>
          تشاركي توظّف التقنية والشراكات لتحويل العطاء والتكافل إلى مشاريع إنسانية فاعلة وموثوقة، بهدف الوصول إلى المجتمعات المستهدفة والإسهام في إحداث أثر حقيقي ومستدام، وفق نهج يقوم على المسؤولية والشفافية.
        </p>
      </header>

      <div className="ab__art" ref={art}>
        <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} role="img" aria-label="يدان تلتقيان فتصنعان قلبًا، وفي داخله وجه طفلة من الميدان">
          <defs>
            <clipPath id="ab-window">
              <path d={WINDOW_D} />
            </clipPath>
          </defs>
          <image
            ref={inside}
            href="/about/inside.webp"
            x={WINDOW_BOX.x}
            y={WINDOW_BOX.y}
            width={WINDOW_BOX.w}
            height={WINDOW_BOX.h}
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#ab-window)"
            style={{ opacity: 0, filter: 'grayscale(1)' }}
          />
          <g ref={left} style={{ transform: `translateX(${-REACH}px)` }}>
            <path d={LEFT_D} fillRule="evenodd" fill="var(--brick)" />
          </g>
          <g ref={right} style={{ transform: `translateX(${REACH}px)` }}>
            <path d={RIGHT_D} fillRule="evenodd" fill="var(--teal)" />
          </g>
        </svg>
      </div>

      <p className="ab__foot">
        تعمل تشاركي من خلال كيانات قانونية غير ربحية مسجّلة في الولايات المتحدة الأمريكية والمملكة المتحدة.{' '}
        <a className="link" href={`${SITE}/ar/about`}>
          اعرف أكثر
        </a>
      </p>
    </section>
  )
}
