import { useEffect, useRef, useState } from 'react'
import './Navbar.css'

const SITE = 'https://tasharuky.com'
const LINKS = [
  { label: 'من نحن', href: `${SITE}/ar/about` },
  { label: 'آلية العمل', href: `${SITE}/ar/use-guide` },
  { label: 'المشاريع', href: `${SITE}/ar/projects` },
  { label: 'القطاعات', href: `${SITE}/ar/sectors` },
  { label: 'تواصل معنا', href: `${SITE}/ar/contact` },
]

/*
 * The bar: open across the top of the hero, and once you scroll it gathers into a
 * floating strip of paper, so it sits as lightly on the teal and brick sections as on
 * the paper ones. It steps aside on the way down and comes back on the way up.
 * On a wide screen the links sit in it; on a narrow one they live in the menu.
 * Its state is written to attributes, never through React: a scroll is not a render.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const bar = useRef(null)
  const btn = useRef(null)
  const menu = useRef(null)

  useEffect(() => {
    let last = window.scrollY
    let ticking = false
    const update = () => {
      const y = window.scrollY
      bar.current?.toggleAttribute('data-scrolled', y > 16)
      if (Math.abs(y - last) > 8) {
        bar.current?.toggleAttribute('data-away', y > last && y > 160)
        last = y
      }
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
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
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    // the menu is for narrow screens: widening the window past it closes it
    const wide = window.matchMedia('(min-width: 1080px)')
    const onWide = () => wide.matches && setOpen(false)
    window.addEventListener('keydown', onKey)
    wide.addEventListener('change', onWide)
    return () => {
      window.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', onWide)
    }
  }, [open])

  return (
    <>
      <header className="bar" ref={bar} data-open={open || undefined}>
        <div className="bar__inner">
          <a className="bar__logo" href="/" aria-label="تشاركي — الرئيسية">
            <span />
          </a>

          <nav className="bar__links" aria-label="الرئيسية">
            {LINKS.map((l) => (
              <a key={l.label} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className="bar__end">
            <a className="bar__lang" href={`${SITE}/en`} lang="en">
              EN
            </a>
            <a className="bar__give" href={`${SITE}/ar/projects`}>
              تبرع الآن
            </a>
            <button
              ref={btn}
              type="button"
              className="bar__menu"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
              onClick={() => setOpen((v) => !v)}
            >
              <i />
              <i />
            </button>
          </div>
        </div>
      </header>

      <div className="menu" id="site-menu" ref={menu} data-open={open || undefined} inert={!open || undefined}>
        <nav className="menu__links" aria-label="القائمة">
          {[{ label: 'الرئيسية', href: '/' }, ...LINKS].map((l, i) => (
            <a key={l.label} href={l.href} style={{ '--i': i }} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="menu__foot">
          <a className="menu__give" href={`${SITE}/ar/projects`}>
            تبرع الآن
          </a>
          <a className="menu__orphan" href={`${SITE}/orphan/ar`}>
            اكفل يتيمًا في غزة
          </a>
          <div className="menu__small">
            <a href={`${SITE}/sign-in`}>دخول</a>
            <a href={`${SITE}/sign-up`}>إنشاء حساب</a>
            <a href={`${SITE}/en`} lang="en">
              English
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
