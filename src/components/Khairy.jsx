import { useCallback, useEffect, useRef, useState } from 'react'
import EyeBall from './EyeBall'
import { DONE, DONE_LINK, GREETING, QUESTIONS } from '@/data/khairy'
import './Khairy.css'

/*
 * خيري — a small helper in the corner of the page. Its eyes follow you around the
 * screen; press it and it opens a chat with the questions it knows the answers to.
 * For now the questions are fixed, and so are the answers: every one is taken from
 * the site's own pages and ends with a link to that page.
 *
 * It types like a person: a moment of "…", then the answer a word at a time.
 * The words are only for the eye; a screen reader is handed each answer whole.
 */

const THINK_MS = 650 // the "…" before an answer
const WORD_MS = 34 // one word of an answer appearing
const HELLO = 'عندك سؤال؟ أنا خيري'
const HELLO_AFTER = 6000
const HELLO_KEY_MS = 55
const HELLO_HOLD = 3800
const LOOK_DOWN = { x: -0.12, y: 0.5 } // at the words it is writing

const said = () => {
  try {
    return sessionStorage.getItem('khairy-hello') === '1'
  } catch {
    return false
  }
}
const remember = () => {
  try {
    sessionStorage.setItem('khairy-hello', '1')
  } catch {
    /* private window: it may say hello again, which is fine */
  }
}

let nextId = 0

export default function Khairy() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [asked, setAsked] = useState([])
  const [busy, setBusy] = useState(null) // 'thinking' | 'writing' | null
  const [shown, setShown] = useState(0) // words of the newest answer on screen
  const [live, setLive] = useState('')
  const [hello, setHello] = useState('')
  const timers = useRef([])
  const log = useRef(null)
  const panel = useRef(null)
  const launch = useRef(null)
  const opened = useRef(false) // once he has been opened, the hello is no longer needed

  const later = (fn, ms) => {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Khairy says something: "…", then the words, then it is free again (and may go on)
  const say = useCallback((text, link, then) => {
    setBusy('thinking')
    later(() => {
      const words = text.split(' ')
      const id = ++nextId
      setMessages((m) => [...m, { id, who: 'kh', text, words, link }])
      setLive(text)
      setShown(0)
      setBusy('writing')
      words.forEach((_, i) => later(() => setShown(i + 1), (i + 1) * WORD_MS))
      later(() => {
        setBusy(null)
        then?.()
      }, words.length * WORD_MS + 40)
    }, THINK_MS)
  }, [])

  const ask = (i) => {
    if (busy) return
    const now = [...asked, i]
    setMessages((m) => [...m, { id: ++nextId, who: 'me', text: QUESTIONS[i].q }])
    setAsked(now)
    // the last question answered, it says that was all it knows
    say(QUESTIONS[i].a, QUESTIONS[i].link, now.length === QUESTIONS.length ? () => say(DONE, DONE_LINK) : undefined)
  }
  const restart = () => {
    if (busy) return
    setAsked([])
    say('بكل سرور، هذه الأسئلة من جديد.')
  }

  // the chip that was pressed is gone once it is answered: hand focus to the next one
  useEffect(() => {
    if (open && !busy && document.activeElement === document.body) panel.current?.querySelector('.kh__chip')?.focus({ preventScroll: true })
  }, [open, busy])

  // keep the newest line in view
  useEffect(() => {
    const el = log.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, shown, busy])

  // open: focus goes into the chat; Escape closes it and brings focus back
  useEffect(() => {
    if (!open) return
    const first = panel.current?.querySelector('.kh__chip, .kh__close')
    const id = window.setTimeout(() => first?.focus({ preventScroll: true }), 320)
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        launch.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // a hello, once a visit, typed into a small bubble beside it and then folded away
  useEffect(() => {
    if (said()) return
    const ids = []
    ids.push(
      window.setTimeout(() => {
        if (opened.current) return
        remember()
        for (let k = 1; k <= HELLO.length; k++) ids.push(window.setTimeout(() => !opened.current && setHello(HELLO.slice(0, k)), k * HELLO_KEY_MS))
        ids.push(window.setTimeout(() => setHello(''), HELLO.length * HELLO_KEY_MS + HELLO_HOLD))
      }, HELLO_AFTER),
    )
    return () => ids.forEach(clearTimeout)
  }, [])

  const toggle = () => {
    opened.current = true
    setHello('')
    // the first time it is opened, it says hello
    if (!open && messages.length === 0 && !busy) say(GREETING)
    setOpen(!open)
  }
  const left = QUESTIONS.map((_, i) => i).filter((i) => !asked.includes(i))
  const newest = messages.length ? messages[messages.length - 1].id : -1

  return (
    <div className="kh" data-open={open || undefined}>
      <div className="kh__panel" id="kh-panel" ref={panel} role="dialog" aria-label="محادثة مع خيري" inert={!open || undefined}>
        <header className="kh__head">
          <EyeBall size={42} idle gaze={busy ? LOOK_DOWN : null} />
          <div className="kh__who">
            <b>خيري</b>
            <span>{busy ? 'يكتب…' : 'يجيب عن الأسئلة الشائعة'}</span>
          </div>
          <button type="button" className="kh__close" aria-label="إغلاق المحادثة" onClick={toggle}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </header>

        <div className="kh__log" ref={log}>
          {messages.map((m) => {
            const writing = m.who === 'kh' && m.id === newest && busy === 'writing'
            return (
              <div key={m.id} className={`kh__msg kh__msg--${m.who}`}>
                <p>{writing ? m.words.slice(0, shown).join(' ') : m.text}</p>
                {m.link && !writing && (
                  <a className="kh__link" href={m.link.href}>
                    {m.link.label}
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M13 8H3M7 4 3 8l4 4" />
                    </svg>
                  </a>
                )}
              </div>
            )
          })}
          {busy === 'thinking' && (
            <div className="kh__msg kh__msg--kh kh__dots">
              <i />
              <i />
              <i />
            </div>
          )}
        </div>
        {/* what a screen reader hears: each answer whole, once, not word by word */}
        <div className="sr-only" aria-live="polite">
          {live}
        </div>

        <div className="kh__ask">
          {left.length > 0 && <p>اختر سؤالًا</p>}
          <div className="kh__chips">
            {left.map((i) => (
              <button key={i} type="button" className="kh__chip" disabled={!!busy} onClick={() => ask(i)}>
                {QUESTIONS[i].q}
              </button>
            ))}
            {left.length === 0 && (
              <button type="button" className="kh__chip kh__chip--again" disabled={!!busy} onClick={restart}>
                ابدأ من جديد
              </button>
            )}
          </div>
        </div>
      </div>

      {hello && !open && (
        <button type="button" className="kh__hello" onClick={toggle} tabIndex={-1} aria-hidden="true">
          {hello}
        </button>
      )}

      <button ref={launch} type="button" className="kh__launch" aria-expanded={open} aria-controls="kh-panel" onClick={toggle}>
        <EyeBall size={60} />
        <span className="sr-only">{open ? 'إغلاق محادثة خيري' : 'تحدّث مع خيري، مساعد تشاركي'}</span>
      </button>
    </div>
  )
}
