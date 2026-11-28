import { animate, useInView } from 'motion/react'
import { useCallback, useEffect, useRef } from 'react'
import Underline from '@/components/Underline'
import { ART_W, GIVER_D, HEART_AT, HEART_D, HEART_REST, RECEIVER_D } from '@/components/hands-art'
import './About.css'

const SITE = 'https://tasharuky.com'

// the part of the drawing on show (the arms run on past it, off-screen)
const VB = { x: 0, y: 330, w: ART_W, h: 500 }

const HEART_PATH = 'M12 21.2s-7.6-4.7-9.7-9.4C.8 8.3 2.7 4.6 6.3 4.6c2.1 0 3.9 1.2 5.7 3.3 1.8-2.1 3.6-3.3 5.7-3.3 3.6 0 5.5 3.7 4 7.2-2.1 4.7-9.7 9.4-9.7 9.4Z'
const TONES = ['#9a2f22', '#2e8c8a', '#f3c75a', '#ef8a6f']
const rand = (a, b) => a + Math.random() * (b - a)

/*
 * One small heart rising from a point, the way reactions float up a live video:
 * it pops in, drifts upward on a gentle sway, turns a little and fades away.
 */
function floatHeart(layer, x, y, { size = rand(16, 30), rise = rand(140, 240), delay = 0 } = {}) {
  const el = document.createElement('span')
  el.className = 'ab__float'
  el.style.left = `${x}px`
  el.style.top = `${y}px`
  el.style.width = el.style.height = `${size}px`
  el.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="${HEART_PATH}" fill="${TONES[Math.floor(Math.random() * TONES.length)]}"/></svg>`
  layer.appendChild(el)
  const sway = rand(14, 34) * (Math.random() < 0.5 ? -1 : 1)
  const spin = rand(-18, 18)
  const anim = el.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', opacity: 0 },
      { transform: `translate(calc(-50% + ${sway * 0.2}px), calc(-50% - ${rise * 0.12}px)) scale(1.18) rotate(${spin * 0.3}deg)`, opacity: 1, offset: 0.12 },
      { transform: `translate(calc(-50% - ${sway * 0.6}px), calc(-50% - ${rise * 0.45}px)) scale(1) rotate(${-spin * 0.5}deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(calc(-50% + ${sway}px), calc(-50% - ${rise}px)) scale(0.82) rotate(${spin}deg)`, opacity: 0 },
    ],
    { duration: rand(1500, 2300), delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' },
  )
  anim.onfinish = () => el.remove()
}

export default function About() {
  const art = useRef(null)
  const layer = useRef(null)
  const giver = useRef(null)
  const receiver = useRef(null)
  const heart = useRef(null)
  const glow = useRef(null)
  const btn = useRef(null)
  const seen = useInView(art, { once: true, amount: 0.45 })

  // a point in the drawing → px inside the overlay
  const toLayer = useCallback((x, y) => {
    const r = layer.current.getBoundingClientRect()
    return [((x - VB.x) / VB.w) * r.width, ((y - VB.y) / VB.h) * r.height]
  }, [])

  const burst = useCallback(
    (x, y, n = 6, spread = 26) => {
      if (!layer.current) return
      for (let i = 0; i < n; i++) floatHeart(layer.current, x + rand(-spread, spread), y + rand(-8, 8), { delay: i * rand(60, 120) })
    },
    [],
  )

  useEffect(() => {
    if (!seen) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (still) return
    let alive = true
    const g = giver.current
    const r = receiver.current
    const h = heart.current
    const ease = [0.22, 1, 0.36, 1]
    const dx = HEART_REST.x - HEART_AT.x
    const dy = HEART_REST.y - HEART_AT.y

    const run = async () => {
      // the two hands reach in from the edges
      await Promise.all([
        animate(g, { x: [-760, 0] }, { duration: 1.9, ease }),
        animate(r, { x: [760, 0] }, { duration: 1.9, ease, delay: 0.12 }),
      ])
      while (alive) {
        // the giving hand lets go: the heart appears at its fingertips…
        animate(g, { rotate: [0, -1.6, 0] }, { duration: 1.2, ease: 'easeInOut' })
        await animate(h, { x: 0, y: -24, scale: [0, 1.12, 1], opacity: [0, 1, 1] }, { duration: 0.55, ease: 'easeOut' })
        if (!alive) break
        // …and drifts down into the open palm
        await animate(h, { x: [0, dx * 0.45, dx], y: [-24, dy * 0.4, dy], rotate: [0, -8, 0], scale: [1, 1, 0.86] }, { duration: 1.35, ease: 'easeInOut' })
        if (!alive) break
        // it lands: the hand gives a little, light rises, and hearts float up
        animate(r, { y: [0, 7, 0] }, { duration: 0.6, ease: 'easeOut' })
        animate(glow.current, { opacity: [0, 0.9, 0], scale: [0.6, 1.25, 1.5] }, { duration: 1.1, ease: 'easeOut' })
        const [px, py] = toLayer(HEART_REST.x, HEART_REST.y - 20)
        burst(px, py, 6)
        await animate(h, { scale: [0.86, 1.05, 0], opacity: [1, 1, 0], y: [dy, dy - 6, dy + 10] }, { duration: 0.7, ease: 'easeIn', delay: 0.15 })
        if (!alive) break
        await new Promise((res) => setTimeout(res, 1800))
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [seen, burst, toLayer])

  // tap anywhere on the drawing to send hearts from that point
  const onArtClick = (e) => {
    const r = layer.current.getBoundingClientRect()
    burst(e.clientX - r.left, e.clientY - r.top, 5, 14)
  }

  // the like button: it pops, and hearts rise from it and from the open palm
  const onLike = () => {
    animate(btn.current.querySelector('svg'), { scale: [1, 1.45, 0.9, 1] }, { duration: 0.55, ease: 'easeOut' })
    const lr = layer.current.getBoundingClientRect()
    const br = btn.current.getBoundingClientRect()
    burst(br.left + br.width / 2 - lr.left, br.top - lr.top, 7, 18)
    const [px, py] = toLayer(HEART_REST.x, HEART_REST.y - 20)
    burst(px, py, 5)
  }

  return (
    <section className="ab" id="about">
      <div className="ab__text">
        <div className="ab__lead">
          <p className="ab__eyebrow">عن تشاركي</p>
          <h2>
            منصة رقمية <Underline>للعمل الإنساني</Underline>
          </h2>
          <p>
            تشاركي توظّف التقنية والشراكات لتحويل العطاء والتكافل إلى مشاريع إنسانية فاعلة وموثوقة، بهدف الوصول إلى المجتمعات المستهدفة والإسهام في إحداث أثر حقيقي ومستدام، وفق نهج يقوم على المسؤولية والشفافية.
          </p>
        </div>

        <ol className="ab__points">
          <li>
            <span className="ab__n" dir="ltr">
              01
            </span>
            <h3>فرصة للمشاركة وصناعة الأثر</h3>
            <p>نعرض فكرة المشروع وهدفه والفئات المستفيدة منه بصورة واضحة، ليتمكن الداعم من فهم أثر مساهمته واتخاذ قراره بوعي.</p>
          </li>
          <li>
            <span className="ab__n" dir="ltr">
              02
            </span>
            <h3>ثقة تُبنى بالشفافية والمتابعة</h3>
            <p>نتابع كل مرحلة من إطلاق المشروع حتى اكتمال تنفيذه، ونشارك المستجدات والنتائج أولًا بأول.</p>
          </li>
          <li className="ab__legal">
            <p>تعمل تشاركي من خلال كيانات قانونية غير ربحية مسجّلة في الولايات المتحدة الأمريكية والمملكة المتحدة.</p>
            <a className="link" href={`${SITE}/ar/about`}>
              اعرف أكثر عن تشاركي
            </a>
          </li>
        </ol>
      </div>

      <div className="ab__art" ref={art}>
        <svg className="ab__svg" viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} role="img" aria-label="يدٌ تُعطي قلبًا ويدٌ تستقبله" onClick={onArtClick}>
          <defs>
            <radialGradient id="ab-glow">
              <stop offset="0" stopColor="#f3c75a" stopOpacity=".7" />
              <stop offset="1" stopColor="#f3c75a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle ref={glow} cx={HEART_REST.x} cy={HEART_REST.y} r="120" fill="url(#ab-glow)" opacity="0" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
          <g ref={receiver} style={{ transform: seen ? undefined : 'translateX(760px)' }}>
            <path d={RECEIVER_D} fillRule="evenodd" fill="var(--teal)" />
          </g>
          <g ref={giver} style={{ transform: seen ? undefined : 'translateX(-760px)', transformBox: 'view-box', transformOrigin: '420px 470px' }}>
            <path d={GIVER_D} fillRule="evenodd" fill="var(--brick)" />
          </g>
          {/* hidden until the giving hand lets it go (shown as drawn if motion is reduced) */}
          <g ref={heart} className="ab__heart" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <path d={HEART_D} fill="var(--mark)" />
          </g>
        </svg>

        <div className="ab__layer" ref={layer} aria-hidden="true" />

        <button type="button" className="ab__like" ref={btn} onClick={onLike}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d={HEART_PATH} fill="currentColor" />
          </svg>
          أرسل قلبًا
        </button>
      </div>
    </section>
  )
}
