import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './Hero.css'

/* Real campaigns & figures taken from tasharuky.com — swap for API data later */
const CASES = [
  { img: 'safety', n: '2,010', t: 'داعم لحملة «عطاء وأمان»' },
  { img: 'water', n: '92%', t: 'تحقّق من هدف «سقيا وحياة»' },
  { img: 'orphans', n: '500', t: 'يتيم في حملة «إكفلني»' },
  { img: 'quran', n: '64', t: 'داعمًا لـ «بقاء النور»' },
  { img: 'winter', n: '607', t: 'داعم لـ «معًا لشتاء أكثر دفئًا»' },
  { img: 'inclusion', n: '76', t: 'داعمًا لـ «ننتمي معًا»' },
]
const GRADS = ['teal', 'brick', 'deep', 'rust']

// Vertical layout of the stack, derived from the real pill height so it scales on any screen.
// slot 0 = focused card; negative = above, positive = below.
const SCALE = { 0: 1, 1: 0.88, 2: 0.74, 3: 0.6 }
const OPACITY = { 0: 1, 1: 0.95, 2: 0.55, 3: 0 }
const GAP = 8
const makeLook = (h) => {
  const y = [0]
  for (let k = 1; k <= 3; k++) y[k] = y[k - 1] + (h * SCALE[k - 1]) / 2 + (h * SCALE[k]) / 2 + GAP
  return (s) => {
    const k = Math.abs(s)
    return { y: Math.sign(s) * y[k], scale: SCALE[k], opacity: OPACITY[k], zIndex: 10 - k }
  }
}

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
)

export default function Hero() {
  const root = useRef(null)

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const items = gsap.utils.toArray('.case')
    const slots = [0, 1, 2, 3, -2, -1] // case 0 starts focused; slot 3 waits invisibly below
    let look = makeLook(items[0].offsetHeight)
    items.forEach((el, i) => gsap.set(el, look(slots[i])))
    const onResize = () => {
      look = makeLook(items[0].offsetHeight)
      items.forEach((el, i) => gsap.set(el, look(slots[i])))
    }
    window.addEventListener('resize', onResize)

    if (!reduce) {
      gsap.from('.hero__copy > *', { opacity: 0, y: 22, duration: 1.1, stagger: 0.09, ease: 'power3.out', delay: 0.2 })
      gsap.from('.case', { opacity: 0, y: (i) => look(slots[i]).y + 30, duration: 1.3, stagger: 0.06, ease: 'power3.out', delay: 0.3 })
    }
    if (reduce) return () => window.removeEventListener('resize', onResize)

    let paused = false
    const tick = () => {
      if (paused) return
      items.forEach((el, i) => {
        const next = slots[i] - 1
        if (next < -2) {
          // leaves through the top, then waits invisibly below
          slots[i] = 3
          gsap.timeline()
            .to(el, { ...look(-3), duration: 1.3, ease: 'power3.inOut' })
            .set(el, look(3))
        } else {
          slots[i] = next
          gsap.to(el, { ...look(next), duration: 1.3, ease: 'power3.inOut' })
        }
      })
    }
    const call = gsap.delayedCall(3.6, function loop() { tick(); call.restart(true) })
    const stage = root.current.querySelector('.hero__stack')
    const hold = () => { paused = true }
    const go = () => { paused = false }
    stage.addEventListener('mouseenter', hold); stage.addEventListener('mouseleave', go)
    return () => { window.removeEventListener('resize', onResize); stage.removeEventListener('mouseenter', hold); stage.removeEventListener('mouseleave', go); call.kill() }
  }, { scope: root })

  return (
    <section id="hero" className="hero" ref={root}>
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="hero__eyebrow">كل مساهمة منك تصنع أثرًا يمكن تتبعه بوضوح</p>
          <h1 className="hero__title">نعزز أثر العطاء الإنساني<br />ونبني جسور الثقة</h1>
          <p className="hero__lead">
            نعمل على دعم المجتمعات من خلال مبادرات إنسانية وتنموية تسهم في تحسين جودة الحياة وتعزيز الاستقرار المجتمعي.
          </p>
          <div className="hero__ctas">
            <a className="btn" href="https://tasharuky.com/ar/projects">
              اكتشف المشاريع
              <Arrow />
            </a>
            <a className="btn btn--outline" href="https://tasharuky.com/orphan/ar">
              اكفل يتيمًا في غزة
            </a>
          </div>
        </div>

        <ul className="hero__stack" aria-label="حالات إنسانية من حملاتنا">
          {CASES.map((c, i) => (
            <li key={c.img} className={`case case--${GRADS[i % GRADS.length]}`}>
              <img className="case__photo" src={`/images/cases/${c.img}.webp`} alt="" width="64" height="64" loading="eager" />
              <div className="case__text">
                <b>{c.n}</b>
                <span>{c.t}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
