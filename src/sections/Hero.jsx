import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import BrandShapes from '../components/BrandShapes'
import { scrollToTarget } from '../lib/smooth'
import './Hero.css'

// TODO: replace with live data from the API
const SUPPORTERS = 11664

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

const Heart = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 2.8 4.5 6.3 4.5c2.1 0 3.9 1.2 5.7 3.3 1.8-2.1 3.6-3.3 5.7-3.3 3.5 0 5.4 3.7 3.9 7.2C19.5 16.4 12 21 12 21Z" fill="currentColor" />
  </svg>
)

/** Temporary flat illustration shown until /images/hero-child.png exists. */
function ChildPlaceholder() {
  return (
    <svg className="hero__child hero__child--ph" viewBox="0 0 400 520" aria-label="placeholder">
      <defs>
        <linearGradient id="phShirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f9597" /><stop offset="1" stopColor="#0c7776" /></linearGradient>
      </defs>
      <path d="M20 520c0-92 62-140 180-140s180 48 180 140Z" fill="url(#phShirt)" />
      <path d="M150 380c10 38 36 52 50 52s40-14 50-52c-30 14-70 14-100 0Z" fill="#e7b48f" />
      <path d="M118 405 200 470l82-65-18-28c-14 20-40 30-64 30s-50-10-64-30Z" fill="#fff" opacity=".92" />
      <path d="M118 405 200 470l82-65" fill="none" stroke="#1b2234" strokeWidth="5" strokeLinejoin="round" strokeDasharray="2 14" strokeLinecap="round" />
      <ellipse cx="200" cy="250" rx="108" ry="124" fill="#f0c19b" />
      <path d="M90 232c-6-90 54-140 112-140s118 46 108 140c-20-44-52-66-110-66s-84 24-110 66Z" fill="#241a17" />
      <ellipse cx="94" cy="262" rx="15" ry="24" fill="#f0c19b" /><ellipse cx="306" cy="262" rx="15" ry="24" fill="#f0c19b" />
      <ellipse cx="158" cy="252" rx="10" ry="13" fill="#241a17" /><ellipse cx="242" cy="252" rx="10" ry="13" fill="#241a17" />
      <circle cx="161" cy="247" r="3.4" fill="#fff" /><circle cx="245" cy="247" r="3.4" fill="#fff" />
      <path d="M140 220q18-14 36-4M224 216q18-10 36 4" stroke="#241a17" strokeWidth="6" strokeLinecap="round" fill="none" />
      <ellipse cx="132" cy="292" rx="20" ry="12" fill="#e98f7a" opacity=".55" /><ellipse cx="268" cy="292" rx="20" ry="12" fill="#e98f7a" opacity=".55" />
      <path d="M150 300q50 56 100 0q-50 14-100 0Z" fill="#7a2a22" /><path d="M162 303q38 12 76 0q-8 22-38 22t-38-22Z" fill="#fff" />
    </svg>
  )
}

export default function Hero() {
  const root = useRef(null)
  const numRef = useRef(null)
  const [hasImg, setHasImg] = useState(true)

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const counter = { v: 0 }
    const setNum = () => { if (numRef.current) numRef.current.textContent = Math.round(counter.v).toLocaleString('en-US') }

    if (reduce) { counter.v = SUPPORTERS; setNum(); return }

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.25 })
    tl.from('.hero__panel', { xPercent: -100, duration: 1.6, ease: 'expo.inOut' }, 0)
      .from('.hero__eyebrow', { opacity: 0, x: 30, duration: 1 }, 0.5)
      .from('.hero__title .w > span', { yPercent: 115, rotate: 4, duration: 1.3, stagger: 0.08 }, 0.55)
      .from('.hero__lead', { opacity: 0, y: 24, duration: 1 }, 1)
      .from('.hero__ctas > *', { opacity: 0, y: 24, duration: 1, stagger: 0.1 }, 1.1)
      .from('.hero__trust li', { opacity: 0, y: 14, duration: 0.9, stagger: 0.08 }, 1.3)
      .from('.hero__blob', { scale: 0, rotate: -40, opacity: 0, duration: 1.6, stagger: 0.14, ease: 'elastic.out(1,0.8)' }, 0.8)
      .from('.hero__child', { yPercent: 18, opacity: 0, scale: 0.92, duration: 1.5 }, 1.05)
      .from('.hero__stat', { yPercent: 40, opacity: 0, duration: 1.2 }, 1.5)
      .from('.hero__banner', { clipPath: 'inset(0 0 0 100%)', duration: 1.1, ease: 'power4.out' }, 1.75)
      .from('.hero__heart', { scale: 0, rotate: -60, duration: 1.1, stagger: 0.08, ease: 'back.out(2.2)' }, 1.9)
      .from('.hero__scroll', { opacity: 0, y: -10, duration: 1 }, 2.2)
      .to(counter, { v: SUPPORTERS, duration: 2.6, ease: 'power3.out', onUpdate: setNum }, 1.5)
      // underline stroke of the highlighted word
      .from('.hero__mark path', { strokeDashoffset: 320, duration: 1.4, ease: 'power3.inOut' }, 1.6)

    // idle motion
    gsap.to('.hero__blob--a', { rotate: 14, scale: 1.04, duration: 6, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    gsap.to('.hero__blob--b', { rotate: -12, scale: 1.06, duration: 7, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    gsap.utils.toArray('.hero__heart').forEach((h, i) => {
      gsap.to(h, { y: gsap.utils.random(-18, -34), x: gsap.utils.random(-10, 10), rotate: gsap.utils.random(-18, 18), duration: gsap.utils.random(2.4, 4), yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.2 })
    })
    gsap.to('.hero__scroll i', { y: 14, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' })

    // mouse parallax
    const mq = gsap.matchMedia()
    mq.add('(hover: hover) and (min-width: 900px)', () => {
      const move = (e) => {
        const nx = e.clientX / window.innerWidth - 0.5
        const ny = e.clientY / window.innerHeight - 0.5
        gsap.to('.hero__child', { x: nx * -22, y: ny * -14, duration: 1.2, ease: 'power3.out', overwrite: 'auto' })
        gsap.to('.hero__blob--a', { x: nx * 40, y: ny * 26, duration: 1.4, ease: 'power3.out', overwrite: 'auto' })
        gsap.to('.hero__blob--b', { x: nx * -34, y: ny * -22, duration: 1.4, ease: 'power3.out', overwrite: 'auto' })
        gsap.to('.hero__stat', { x: nx * 18, duration: 1.4, ease: 'power3.out', overwrite: 'auto' })
        gsap.to('.hero .brand-shapes__item', { x: (i, el) => nx * -60 * el.dataset.depth, y: (i, el) => ny * -40 * el.dataset.depth, duration: 1.8, ease: 'power3.out', overwrite: 'auto' })
      }
      window.addEventListener('mousemove', move)
      return () => window.removeEventListener('mousemove', move)
    })
  }, { scope: root })

  const words = (txt) => txt.split(' ').map((w, i) => (
    <span className="w" key={i}><span>{w}</span></span>
  ))

  return (
    <section id="hero" className="hero" ref={root}>
      <BrandShapes variant="hero" />
      <div className="hero__panel" aria-hidden="true" />

      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="hero__eyebrow"><i />منصة تشاركي للعمل الإنساني</p>
          <h1 className="hero__title">
            <span className="line">{words('ابتسامة طفل')}</span>
            <span className="line">
              {words('تبدأ')}
              <span className="w hero__hl">
                <span>بمشاركة</span>
                <svg className="hero__mark" viewBox="0 0 220 24" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M4 16C50 4 120 4 216 12" fill="none" stroke="var(--teal)" strokeWidth="9" strokeLinecap="round" strokeDasharray="320" />
                </svg>
              </span>
              {words('منك')}
            </span>
          </h1>
          <p className="hero__lead">
            تبرّعك يصل موثّقًا إلى الأسر في غزة، وتتابع أثره خطوة بخطوة، من لحظة العطاء حتى تصل البسمة.
          </p>
          <div className="hero__ctas">
            <a className="btn" href="#projects" onClick={(e) => { e.preventDefault(); scrollToTarget('#projects') }}>
              <span className="btn__icon"><Arrow /></span>
              ابدأ العطاء الآن
            </a>
            <a className="btn btn--ghost" href="#unity" onClick={(e) => { e.preventDefault(); scrollToTarget('#unity') }}>
              اعرف كيف نعمل
            </a>
          </div>
          <ul className="hero__trust">
            <li><b>موثّق</b> بالصور والتقارير</li>
            <li><b>شفاف</b> في كل خطوة</li>
            <li><b>مباشر</b> إلى المستحقين</li>
          </ul>
        </div>

        <div className="hero__visual">
          <div className="hero__blob hero__blob--a"><svg viewBox="0 0 500 500"><path d="M410 90c60 70 70 190 20 280s-170 130-260 90S10 330 40 220 150 30 250 30s100 10 160 60Z" fill="var(--teal)" /></svg></div>
          <div className="hero__blob hero__blob--b"><svg viewBox="0 0 500 500"><path d="M430 140c40 80 30 180-30 250s-170 100-250 50S30 320 50 220 160 40 260 50s130 10 170 90Z" fill="var(--brick)" /></svg></div>

          {hasImg ? (
            <img className="hero__child" src="/images/hero-child.png" alt="طفل فلسطيني مبتسم" onError={() => setHasImg(false)} />
          ) : (
            <ChildPlaceholder />
          )}

          <Heart className="hero__heart" style={{ '--c': 'var(--teal-300)', top: '14%', left: '8%', width: 38 }} />
          <Heart className="hero__heart" style={{ '--c': 'var(--brick-300)', top: '8%', right: '12%', width: 30 }} />
          <Heart className="hero__heart" style={{ '--c': 'var(--teal)', top: '40%', left: '2%', width: 24 }} />
          <Heart className="hero__heart" style={{ '--c': '#fff', top: '30%', right: '2%', width: 26 }} />

          <div className="hero__stat">
            <div className="hero__num"><span ref={numRef}>0</span><em>+</em></div>
            <div className="hero__banner"><span>داعم شاركوا في صناعة الأثر</span></div>
          </div>
        </div>
      </div>

      <button className="hero__scroll" onClick={() => scrollToTarget('#unity')} aria-label="مرر للأسفل">
        <span>مرّر</span><i />
      </button>
    </section>
  )
}
