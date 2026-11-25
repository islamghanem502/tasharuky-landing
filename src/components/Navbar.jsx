import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { onScroll, scrollToTarget } from '../lib/smooth'
import './Navbar.css'

const LINKS = [
  { label: 'الرئيسية', to: '#hero' },
  { label: 'فلسفتنا', to: '#unity' },
  { label: 'القطاعات', to: '#sectors' },
  { label: 'آلية العمل', to: '#how' },
  { label: 'المشاريع', to: '#projects' },
  { label: 'تواصل معنا', to: '#contact' },
]

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

export default function Navbar() {
  const root = useRef(null)
  const hl = useRef(null)
  const list = useRef(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  // entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(root.current, { yPercent: -160, opacity: 0, duration: 1.2, ease: 'expo.out', delay: 0.15 })
      gsap.from('.nav__link, .nav__cta, .nav__logo', { y: -14, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out', delay: 0.5 })
    }, root)
    return () => ctx.revert()
  }, [])

  // hide on scroll down, show on scroll up
  useEffect(() => {
    let hidden = false
    const off = onScroll(({ scroll, direction }) => {
      root.current?.classList.toggle('is-scrolled', scroll > 20)
      const shouldHide = direction === 1 && scroll > 320
      if (shouldHide !== hidden && !open) {
        hidden = shouldHide
        gsap.to(root.current, { yPercent: hidden ? -170 : 0, duration: 0.7, ease: 'expo.out', overwrite: true })
      }
    })
    return off
  }, [open])

  // sliding highlight
  const moveHl = (i, instant) => {
    const el = list.current?.children[i]
    if (!el || !hl.current) return
    gsap.to(hl.current, { x: el.offsetLeft, width: el.offsetWidth, opacity: 1, duration: instant ? 0 : 0.5, ease: 'expo.out' })
  }
  useEffect(() => {
    const t = setTimeout(() => moveHl(active, true), 60)
    const rs = () => moveHl(active, true)
    window.addEventListener('resize', rs)
    document.fonts?.ready.then(rs)
    return () => { clearTimeout(t); window.removeEventListener('resize', rs) }
  }, [active])

  // lock scroll when mobile menu open
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (open) gsap.fromTo('.menu__link', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.8, ease: 'expo.out', delay: 0.15 })
  }, [open])

  const go = (e, to, i) => {
    e.preventDefault()
    setActive(i)
    setOpen(false)
    scrollToTarget(to)
  }

  return (
    <header className="nav" ref={root}>
      <div className="nav__bar">
        <a href="#hero" className="nav__logo" onClick={(e) => go(e, '#hero', 0)} aria-label="تشاركي">
          <img src="/brand/logo.png" alt="تشاركي Tasharuky" width="160" height="42" />
        </a>

        <nav className="nav__links" aria-label="الرئيسية">
          <ul ref={list} onMouseLeave={() => moveHl(active)}>
            <span className="nav__hl" ref={hl} />
            {LINKS.map((l, i) => (
              <li key={l.to} className="nav__link">
                <a href={l.to} onClick={(e) => go(e, l.to, i)} onMouseEnter={() => moveHl(i)} className={active === i ? 'is-active' : ''}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav__actions">
          <button className="nav__lang" aria-label="English">EN</button>
          <a href="#projects" className="nav__cta" onClick={(e) => go(e, '#projects', 4)}>
            <span>تبرّع الآن</span>
            <i><Arrow /></i>
          </a>
          <button className={`nav__burger ${open ? 'is-open' : ''}`} aria-label="القائمة" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <span /><span />
          </button>
        </div>
      </div>

      <div className={`menu ${open ? 'is-open' : ''}`}>
        <ul>
          {LINKS.map((l, i) => (
            <li key={l.to}>
              <a className="menu__link" href={l.to} onClick={(e) => go(e, l.to, i)}>
                <small>0{i + 1}</small>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
