import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Piece, { S } from '../components/Piece'
import Hand from '../components/Hand'
import BrandShapes from '../components/BrandShapes'
import { scrollToTarget } from '../lib/smooth'
import './Unity.css'

gsap.registerPlugin(ScrollTrigger)

// Final puzzle layout (viewBox units)
const GX = 400, GY = 35
const POS = { A: [GX, GY], B: [GX + S, GY], C: [GX, GY + S], D: [GX + S, GY + S] }
const JOIN = [GX + S, GY + S / 2]          // where the two hands meet

const COLORS = { A: '#2f9597', B: '#832e24', C: '#a64536', D: '#1d7f81' }

const STEPS = [
  { n: '٠١', t: 'كل عطاء يبدأ بيد', p: 'قرارٌ صغير منك… يبدأ رحلة طويلة من الأمل.' },
  { n: '٠٢', t: 'ويد أخرى تمتدّ إليها', p: 'أسرة تنتظر، وشريك ميداني يحمل الدعم إلى بابها.' },
  { n: '٠٣', t: 'فيتّصل العطاء بالأثر', p: 'نربط المتبرّع بالمشروع، ونوثّق كل خطوة حتى تصل.' },
  { n: '٠٤', t: 'معًا… يكتمل المشهد', p: 'كل مشاركة جديدة تضيف قطعة، وتغيّر قصة.' },
]

const Icon = ({ k }) => {
  const p = { fill: 'none', stroke: '#fff', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return (
    <g transform="translate(-18 -18) scale(1.5)">
      {k === 'heart' && <path {...p} d="M12 20s-7-4.4-8.9-8.6C1.700 8.200 3.400 5 6.600 5c1.900 0 3.500 1.100 5.400 3 1.900-1.900 3.500-3 5.400-3 3.200 0 4.900 3.200 3.500 6.400C19 15.600 12 20 12 20Z" />}
      {k === 'home' && <path {...p} d="M4 11.500 12 5l8 6.500M6 10v9h12v-9M10 19v-5h4v5" />}
      {k === 'link' && <><path {...p} d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1" /><path {...p} d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1" /></>}
      {k === 'spark' && <path {...p} d="M12 3 4.500 6v5.500c0 4.600 3 8 7.500 9.500 4.500-1.500 7.500-4.900 7.500-9.500V6L12 3ZM8.800 12.200l2.200 2.200 4.200-4.400" />}
    </g>
  )
}

const Label = ({ k, icon, text }) => (
  <g className={`piece__label piece__label--${k}`} transform={`translate(${S / 2} ${S / 2})`} opacity="0">
    <g transform="translate(0 -22)"><Icon k={icon} /></g>
    <text y="44" textAnchor="middle">{text}</text>
  </g>
)

export default function Unity() {
  const root = useRef(null)
  const stage = useRef(null)

  // tighter crop on phones — set on the element so the scroll timeline is never rebuilt
  useLayoutEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)')
    const set = () => stage.current?.setAttribute('viewBox', mq.matches ? '270 0 660 470' : '0 0 1200 470')
    set(); mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ---- initial states ----
    gsap.set(q('.u-L'), { x: -620 })
    gsap.set(q('.u-R'), { x: 620 })
    gsap.set(q('.u-C'), { x: -130, y: 170, rotation: -18, svgOrigin: `${POS.C[0] + S / 2} ${POS.C[1] + S / 2}`, opacity: 0 })
    gsap.set(q('.u-D'), { y: 230, opacity: 0 })
    gsap.set(q('.u-ring'), { scale: 0.2, opacity: 0, transformOrigin: '50% 50%' })
    gsap.set(q('.u-burst .h'), { scale: 0, opacity: 0, transformOrigin: '50% 50%' })
    gsap.set(q('.u-rays'), { opacity: 0, scale: 0.7, transformOrigin: '50% 50%' })
    gsap.set(q('.u-glow'), { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' })
    gsap.set(q('.u-cap'), { opacity: 0, y: 36 })
    gsap.set(q('.u-cap--1'), { opacity: 1, y: 0 })
    gsap.set(q('.u-dot'), { opacity: 0.25 })
    gsap.set(q('.u-dot--1'), { opacity: 1 })

    const showFinal = () => {
      gsap.set(q('.u-L, .u-R, .u-C, .u-D'), { x: 0, y: 0, rotation: 0, opacity: 1 })
      gsap.set(q('.hand-L, .hand-R'), { opacity: 0 })
      gsap.set(q('.piece__label'), { opacity: 1 })
      gsap.set(q('.u-glow, .u-rays'), { opacity: 1, scale: 1 })
      gsap.set(q('.u-cap'), { opacity: 0 }); gsap.set(q('.u-cap--4'), { opacity: 1, y: 0 })
    }
    if (reduce) { showFinal(); return }

    const burst = q('.u-burst .h')
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root.current, start: 'top top', end: '+=430%', pin: true, scrub: 1.1, anticipatePin: 1, invalidateOnRefresh: true },
    })

    // 1) two hands approach
    tl.to(q('.u-L'), { x: -58, duration: 3.2, ease: 'power2.inOut' }, 0)
      .to(q('.u-R'), { x: 58, duration: 3.2, ease: 'power2.inOut' }, 0)
      .to(q('.u-bar'), { scaleX: 1, duration: 10.6, ease: 'none' }, 0)
      .to(q('.u-bg'), { yPercent: -12, duration: 10.6 }, 0)
    // caption 1 → 2 while hands close in
    tl.to(q('.u-cap--1'), { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in' }, 2.2)
      .fromTo(q('.u-cap--2'), { opacity: 0, y: 36, immediateRender: false }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 2.6)
      .to(q('.u-dot'), { opacity: 0.25, duration: 0.2 }, 2.6).to(q('.u-dot--2'), { opacity: 1, duration: 0.2 }, 2.6)

    // 2) the push — impact
    tl.to(q('.u-L'), { x: 0, duration: 0.7, ease: 'expo.in' }, 3.3)
      .to(q('.u-R'), { x: 0, duration: 0.7, ease: 'expo.in' }, 3.3)
      .to(q('.u-pieces'), { x: -5, duration: 0.07, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 4.0)
      .fromTo(q('.u-ring'), { scale: 0.2, opacity: 0.9, immediateRender: false }, { scale: 3.2, opacity: 0, duration: 1.1, ease: 'power3.out' }, 4.0)
      .to(q('.u-glow'), { opacity: 0.55, scale: 0.9, duration: 1.2, ease: 'power2.out' }, 4.0)
      
    burst.forEach((h, i) => {
      const a = (i / burst.length) * Math.PI * 2 + 0.3
      const r = 150 + (i % 3) * 55
      tl.fromTo(h, { x: 0, y: 0, scale: 0, opacity: 1, immediateRender: false }, { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.85 - 30, scale: 0.8 + (i % 3) * 0.35, rotation: (i % 2 ? 1 : -1) * 40, opacity: 0, duration: 1.3, ease: 'power3.out' }, 4.0 + i * 0.03)
    })

    // caption 2 → 3
    tl.to(q('.u-cap--2'), { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in' }, 4.6)
      .fromTo(q('.u-cap--3'), { opacity: 0, y: 36, immediateRender: false }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 5.0)
      .to(q('.u-dot'), { opacity: 0.25, duration: 0.2 }, 5.0).to(q('.u-dot--3'), { opacity: 1, duration: 0.2 }, 5.0)

    // 3) hands let go
    tl.to(q('.piece__label--A, .piece__label--B'), { opacity: 1, duration: 0.5, ease: 'power2.out' }, 6.1)
    tl.to(q('.hand-L'), { x: -760, duration: 1.4, ease: 'power3.in' }, 5.2)
      .to(q('.hand-R'), { x: 760, duration: 1.4, ease: 'power3.in' }, 5.2)
      .to(q('.hand-L, .hand-R'), { opacity: 0, duration: 0.3 }, 6.35)

    // 4) the community completes the picture: D rises, C slides in diagonally
    tl.to(q('.u-D'), { opacity: 1, duration: 0.3, ease: 'none' }, 6.0)
      .to(q('.u-D'), { y: 64, duration: 0.9, ease: 'power2.out' }, 6.0)
      .to(q('.u-D'), { y: 0, duration: 0.45, ease: 'expo.in' }, 6.95)
      .to(q('.piece__label--D'), { opacity: 1, duration: 0.5 }, 7.4)
      .to(q('.u-C'), { opacity: 1, duration: 0.3 }, 7.1)
      .to(q('.u-C'), { x: -62, y: 62, rotation: -6, duration: 0.9, ease: 'power2.out' }, 7.1)
      .to(q('.u-C'), { x: 0, y: 0, rotation: 0, duration: 0.45, ease: 'expo.in' }, 8.05)
      .to(q('.piece__label--C'), { opacity: 1, duration: 0.5 }, 8.5)
      .to(q('.u-pieces'), { x: 4, duration: 0.07, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 8.5)
      .fromTo(q('.u-ring'), { scale: 0.3, opacity: 0.8, immediateRender: false }, { scale: 3.4, opacity: 0, duration: 1.2, ease: 'power3.out' }, 8.5)
      .to(q('.u-glow'), { opacity: 1, scale: 1.15, duration: 1.4, ease: 'power2.out' }, 8.5)
      .to(q('.u-rays'), { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 8.6)
      .to(q('.u-rays'), { rotation: 60, duration: 2.2, transformOrigin: '50% 50%' }, 8.6)
    tl.to(q('.u-cap--3'), { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in' }, 8.5)
      .fromTo(q('.u-cap--4'), { opacity: 0, y: 36, immediateRender: false }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 8.9)
      .to(q('.u-dot'), { opacity: 0.25, duration: 0.2 }, 8.9).to(q('.u-dot--4'), { opacity: 1, duration: 0.2 }, 8.9)
    tl.to({}, { duration: 1.6 }, 9.0) // linger on the finished picture

    // shapes drift
    gsap.to(q('.brand-shapes__item'), { yPercent: (i) => (i % 2 ? -20 : 20), ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: '+=500%', scrub: 1 } })
  }, { scope: root })

  const hearts = Array.from({ length: 14 })

  return (
    <section id="unity" className="unity" ref={root}>
      <div className="u-bg"><BrandShapes variant="unity" /></div>

      <div className="unity__inner">
        <header className="unity__head">
          <p className="unity__eyebrow"><i />فلسفتنا</p>
          <div className="unity__caps">
            {STEPS.map((s, i) => (
              <div key={s.n} className={`u-cap u-cap--${i + 1}`}>
                <h2>{s.t}</h2>
                <p>{s.p}</p>
                {i === 3 && (
                  <a className="btn" href="#projects" onClick={(e) => { e.preventDefault(); scrollToTarget('#projects') }}>
                    <span className="btn__icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>
                    </span>
                    كن القطعة التالية
                  </a>
                )}
              </div>
            ))}
          </div>
        </header>

        <svg className="unity__stage" ref={stage} viewBox="0 0 1200 470" preserveAspectRatio="xMidYMid meet" role="img" aria-label="يدان تتشاركان قطع أحجية فتكتمل الصورة">
          <defs>
            <radialGradient id="uGlow">
              <stop offset="0" stopColor="#2f9597" stopOpacity=".38" />
              <stop offset=".5" stopColor="#832e24" stopOpacity=".14" />
              <stop offset="1" stopColor="#832e24" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle className="u-glow" cx="600" cy={GY + S} r="330" fill="url(#uGlow)" />
          <g className="u-rays" stroke="#832e24" strokeOpacity=".22" strokeWidth="3" strokeLinecap="round">
            {Array.from({ length: 16 }).map((_, i) => {
              const a = (i / 16) * Math.PI * 2
              return <line key={i} x1={600 + Math.cos(a) * 330} y1={GY + S + Math.sin(a) * 235} x2={600 + Math.cos(a) * (i % 2 ? 372 : 410)} y2={GY + S + Math.sin(a) * (i % 2 ? 262 : 285)} />
            })}
          </g>

          <g className="u-pieces">
            {/* bottom row first: they sit beneath the top row so knobs read correctly */}
            <g className="u-C"><g transform={`translate(${POS.C})`}>
              <Piece id="C" fill={COLORS.C} sides={{ t: 1, r: 1 }}><Label k="C" icon="link" text="شريك التنفيذ" /></Piece>
            </g></g>
            <g className="u-D"><g transform={`translate(${POS.D})`}>
              <Piece id="D" fill={COLORS.D} sides={{ t: -1, l: -1 }}><Label k="D" icon="spark" text="أثر موثّق" /></Piece>
            </g></g>

            <g className="u-L">
              <g transform={`translate(${POS.A})`}>
                <Piece id="A" fill={COLORS.A} sides={{ r: 1, b: -1 }}><Label k="A" icon="heart" text="متبرّع" /></Piece>
              </g>
              <g className="hand-L">
                <g transform={`translate(${POS.A[0] + 70} ${POS.A[1] + S / 2})`}>
                  <Hand cuff="#832e24" cuffDeep="#69251d" />
                </g>
              </g>
            </g>
            <g className="u-R">
              <g transform={`translate(${POS.B})`}>
                <Piece id="B" fill={COLORS.B} sides={{ l: -1, b: 1 }}><Label k="B" icon="home" text="مشروع إنساني" /></Piece>
              </g>
              <g className="hand-R">
                <g transform={`translate(${POS.B[0] + S - 70} ${POS.B[1] + S / 2}) scale(-1 1)`}>
                  <Hand cuff="#2f9597" cuffDeep="#0c7776" />
                </g>
              </g>
            </g>
          </g>

          <circle className="u-ring" cx={JOIN[0]} cy={JOIN[1]} r="90" fill="none" stroke="#2f9597" strokeWidth="6" />
          <g className="u-burst" transform={`translate(${JOIN[0]} ${JOIN[1]})`}>
            {hearts.map((_, i) => (
              <g key={i} className="h" style={{ color: ['#2f9597', '#832e24', '#86c6c7', '#cf8576'][i % 4] }}>
                <path transform="translate(-12 -12)" fill="currentColor" d="M12 21s-7.500-4.600-9.600-9.300C.900 8.200 2.800 4.500 6.300 4.500c2.100 0 3.900 1.200 5.700 3.300 1.800-2.100 3.600-3.300 5.700-3.300 3.500 0 5.400 3.700 3.900 7.200C19.500 16.400 12 21 12 21Z" />
              </g>
            ))}
          </g>
        </svg>

        <div className="unity__progress" aria-hidden="true">
          <ol>{STEPS.map((s, i) => <li key={s.n} className={`u-dot u-dot--${i + 1}`}>{s.n}</li>)}</ol>
          <div className="unity__track"><span className="u-bar" /></div>
        </div>
      </div>
    </section>
  )
}
