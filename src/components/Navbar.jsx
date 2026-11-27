import { useEffect, useRef, useState } from 'react'
import Hand from './Hand'
import './Navbar.css'

const SITE = 'https://tasharuky.com'
const LINKS = [
  { label: 'الرئيسية', href: '/' },
  { label: 'من نحن', href: `${SITE}/ar/about` },
  { label: 'آلية العمل', href: `${SITE}/ar/use-guide` },
  { label: 'المشاريع', href: `${SITE}/ar/projects` },
  { label: 'القطاعات', href: `${SITE}/ar/sectors` },
  { label: 'تواصل معنا', href: `${SITE}/ar/contact` },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const bar = useRef(null)
  const btn = useRef(null)
  const menu = useRef(null)

  // the bar steps aside on the way down and comes back on the way up
  useEffect(() => {
    let last = window.scrollY, ticking = false
    const update = () => {
      const y = window.scrollY
      if (Math.abs(y - last) > 8) {
        bar.current?.toggleAttribute('data-away', y > last && y > 120)
        last = y
      }
      ticking = false
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // the menu opens as a circle growing out of the button
  useEffect(() => {
    const r = btn.current.getBoundingClientRect()
    menu.current.style.setProperty('--ox', `${r.left + r.width / 2}px`)
    menu.current.style.setProperty('--oy', `${r.top + r.height / 2}px`)
    document.documentElement.style.overflow = open ? 'hidden' : ''
    if (open) bar.current.removeAttribute('data-away')
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header className="bar" ref={bar} data-open={open || undefined}>
        <a className="bar__logo" href="/" aria-label="تشاركي — الرئيسية"><span /></a>
        <button
          ref={btn} type="button" className="bar__menu"
          aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((v) => !v)}
        >
          <span className="bar__label">{open ? 'إغلاق' : 'القائمة'}</span>
          <span className="bar__dot" aria-hidden="true"><i /><i /></span>
        </button>
      </header>

      <div className="menu" id="site-menu" ref={menu} data-open={open || undefined} inert={!open || undefined}>
        <nav className="menu__links" aria-label="القائمة الرئيسية">
          {LINKS.map((l, i) => (
            <a key={l.label} href={l.href} style={{ '--i': i }} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </nav>
        <div className="menu__foot">
          <a href={`${SITE}/sign-in`}>دخول</a>
          <a href={`${SITE}/sign-up`}>إنشاء حساب</a>
          <a href={`${SITE}/en`} lang="en">English</a>
        </div>
        <svg className="menu__hand" viewBox="0 250 655 250" aria-hidden="true">
          <g transform="translate(655 0) scale(-1 1)">
            <Hand color="var(--teal)" ground="var(--brick)" />
          </g>
        </svg>
      </div>
    </>
  )
}
