import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Piece, { S } from '../components/Piece'
import Hand from '../components/Hand'
import './Unity.css'

gsap.registerPlugin(ScrollTrigger)

const GX = 400, GY = 35
const POS = { A: [GX, GY], B: [GX + S, GY], C: [GX, GY + S], D: [GX + S, GY + S] }
const COLORS = { A: '#2f9597', B: '#832e24', C: '#a64536', D: '#1d7f81' }

const Icon = ({ k }) => {
  const p = { fill: 'none', stroke: '#fff', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return (
    <g transform="translate(-18 -18) scale(1.5)">
      {k === 'heart' && <path {...p} d="M12 20s-7-4.4-8.9-8.6C1.700 8.200 3.400 5 6.600 5c1.900 0 3.500 1.100 5.400 3 1.900-1.900 3.500-3 5.400-3 3.200 0 4.900 3.200 3.500 6.400C19 15.600 12 20 12 20Z" />}
      {k === 'home' && <path {...p} d="M4 11.500 12 5l8 6.500M6 10v9h12v-9M10 19v-5h4v5" />}
      {k === 'link' && <><path {...p} d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1" /><path {...p} d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1" /></>}
      {k === 'check' && <path {...p} d="M12 3 4.500 6v5.500c0 4.600 3 8 7.500 9.500 4.500-1.500 7.500-4.900 7.500-9.500V6L12 3ZM8.800 12.200l2.200 2.200 4.200-4.400" />}
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

  // tighter crop on phones
  useLayoutEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)')
    const set = () => stage.current?.setAttribute('viewBox', mq.matches ? '270 0 660 470' : '0 0 1200 470')
    set(); mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])

  // Plays once when the section comes into view. No pinning, no scroll scrubbing.
  useGSAP(() => {
    const q = gsap.utils.selector(root)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { gsap.set(q('.hand-L, .hand-R'), { opacity: 0 }); gsap.set(q('.piece__label'), { opacity: 1 }); return }

    gsap.set(q('.u-L'), { x: -620 })
    gsap.set(q('.u-R'), { x: 620 })
    gsap.set(q('.u-C'), { x: -130, y: 170, rotation: -18, svgOrigin: `${POS.C[0] + S / 2} ${POS.C[1] + S / 2}`, opacity: 0 })
    gsap.set(q('.u-D'), { y: 230, opacity: 0 })

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })
    tl.to(q('.u-L'), { x: -58, duration: 1.9 }, 0)
      .to(q('.u-R'), { x: 58, duration: 1.9 }, 0)
      .to(q('.u-L, .u-R'), { x: 0, duration: 0.4, ease: 'expo.in' }, 1.9)
      .to(q('.u-pieces'), { x: -4, duration: 0.06, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 2.3)
      .to(q('.hand-L'), { x: -760, duration: 1.1, ease: 'power3.in' }, 2.7)
      .to(q('.hand-R'), { x: 760, duration: 1.1, ease: 'power3.in' }, 2.7)
      .to(q('.hand-L, .hand-R'), { opacity: 0, duration: 0.3 }, 3.5)
      .to(q('.piece__label--A, .piece__label--B'), { opacity: 1, duration: 0.5, ease: 'power2.out' }, 3.0)
      .to(q('.u-D'), { opacity: 1, duration: 0.3, ease: 'none' }, 3.5)
      .to(q('.u-D'), { y: 64, duration: 0.7, ease: 'power2.out' }, 3.5)
      .to(q('.u-D'), { y: 0, duration: 0.35, ease: 'expo.in' }, 4.2)
      .to(q('.piece__label--D'), { opacity: 1, duration: 0.4 }, 4.5)
      .to(q('.u-C'), { opacity: 1, duration: 0.3, ease: 'none' }, 4.6)
      .to(q('.u-C'), { x: -62, y: 62, rotation: -6, duration: 0.7, ease: 'power2.out' }, 4.6)
      .to(q('.u-C'), { x: 0, y: 0, rotation: 0, duration: 0.35, ease: 'expo.in' }, 5.3)
      .to(q('.piece__label--C'), { opacity: 1, duration: 0.4 }, 5.65)
      .to(q('.u-pieces'), { x: 3, duration: 0.06, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 5.65)

    ScrollTrigger.create({ trigger: root.current, start: 'top 60%', once: true, onEnter: () => tl.play() })
  }, { scope: root })

  return (
    <section id="unity" className="unity" ref={root}>
      <div className="container unity__inner">
        <header className="unity__head">
          <p className="unity__eyebrow">عن تشاركي</p>
          <h2>منصة رقمية للعمل الإنساني</h2>
          <p>
            تشاركي توظّف التقنية والشراكات لتحويل العطاء والتكافل إلى مشاريع إنسانية فاعلة وموثّقة، بهدف الوصول إلى المجتمعات المستهدفة والإسهام في إحداث أثر حقيقي ومستدام، وفق نهج يقوم على المسؤولية والشفافية.
          </p>
        </header>

        <svg className="unity__stage" ref={stage} viewBox="0 0 1200 470" preserveAspectRatio="xMidYMid meet" role="img" aria-label="يدان تتشاركان قطع أحجية فتكتمل الصورة">
          <g className="u-pieces">
            <g className="u-C"><g transform={`translate(${POS.C})`}>
              <Piece id="C" fill={COLORS.C} sides={{ t: 1, r: 1 }}><Label k="C" icon="link" text="شريك التنفيذ" /></Piece>
            </g></g>
            <g className="u-D"><g transform={`translate(${POS.D})`}>
              <Piece id="D" fill={COLORS.D} sides={{ t: -1, l: -1 }}><Label k="D" icon="check" text="أثر موثّق" /></Piece>
            </g></g>
            <g className="u-L">
              <g transform={`translate(${POS.A})`}>
                <Piece id="A" fill={COLORS.A} sides={{ r: 1, b: -1 }}><Label k="A" icon="heart" text="متبرّع" /></Piece>
              </g>
              <g className="hand-L"><g transform={`translate(${POS.A[0] + 70} ${POS.A[1] + S / 2})`}>
                <Hand cuff="#832e24" cuffDeep="#69251d" />
              </g></g>
            </g>
            <g className="u-R">
              <g transform={`translate(${POS.B})`}>
                <Piece id="B" fill={COLORS.B} sides={{ l: -1, b: 1 }}><Label k="B" icon="home" text="مشروع إنساني" /></Piece>
              </g>
              <g className="hand-R"><g transform={`translate(${POS.B[0] + S - 70} ${POS.B[1] + S / 2}) scale(-1 1)`}>
                <Hand cuff="#2f9597" cuffDeep="#0c7776" />
              </g></g>
            </g>
          </g>
        </svg>
      </div>
    </section>
  )
}
