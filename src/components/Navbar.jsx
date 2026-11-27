import { useEffect, useRef, useState } from 'react'
import './Navbar.css'

const SITE = 'https://tasharuky.com'
const LINKS = [
  { label: 'الرئيسية', href: '/', current: true },
  { label: 'من نحن', href: `${SITE}/ar/about` },
  { label: 'آلية العمل', href: `${SITE}/ar/use-guide` },
  { label: 'المشاريع', href: `${SITE}/ar/projects` },
  { label: 'القطاعات', href: `${SITE}/ar/sectors` },
  { label: 'تواصل معنا', href: `${SITE}/ar/contact` },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const bar = useRef(null)

  // condense once the page moves; slip away on the way down, return on the way up
  useEffect(() => {
    let last = window.scrollY, ticking = false
    const update = () => {
      const y = window.scrollY
      const el = bar.current
      if (!el) return
      el.toggleAttribute('data-scrolled', y > 4)
      if (Math.abs(y - last) > 6) {
        el.toggleAttribute('data-hidden', y > last && y > 160 && !el.hasAttribute('data-open'))
        last = y
      }
      ticking = false
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header className="nav" ref={bar} data-open={open || undefined}>
        <div className="nav__bar wrap">
          <a className="nav__logo" href="/" aria-label="تشاركي — الرئيسية">
            <img src="/brand/logo.png" alt="تشاركي" width="152" height="40" />
          </a>

          <nav className="nav__links" aria-label="القائمة الرئيسية">
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} aria-current={l.current ? 'page' : undefined}>{l.label}</a>
            ))}
          </nav>

          <div className="nav__end">
            <a className="nav__quiet" href={`${SITE}/en`} lang="en" hrefLang="en">EN</a>
            <a className="nav__quiet nav__signin" href={`${SITE}/sign-in`}>دخول</a>
            <a className="btn btn--sm" href={`${SITE}/ar/projects`}>تبرع الآن</a>
            <button
              type="button" className="nav__toggle" aria-expanded={open} aria-controls="nav-sheet"
              aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'} onClick={() => setOpen((v) => !v)}
            >
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* outside the header: a transformed parent would trap a fixed child */}
      <div className="nav__sheet" id="nav-sheet" hidden={!open}>
        <nav className="wrap" aria-label="القائمة">
          {LINKS.map((l, i) => (
            <a key={l.label} href={l.href} style={{ '--i': i }} aria-current={l.current ? 'page' : undefined} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="nav__sheet-end" style={{ '--i': LINKS.length }}>
            <a href={`${SITE}/sign-in`}>دخول</a>
            <span aria-hidden="true">·</span>
            <a href={`${SITE}/sign-up`}>إنشاء حساب</a>
            <span aria-hidden="true">·</span>
            <a href={`${SITE}/en`} lang="en">EN</a>
          </div>
        </nav>
      </div>
    </>
  )
}
